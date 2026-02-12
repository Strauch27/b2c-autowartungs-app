import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { logger } from '../config/logger';
import { z } from 'zod';
import { paymentService } from '../services/payment.service';
import { demoPaymentService } from '../services/demo-payment.service';
import { assertTransition, Actor } from '../domain/bookingFsm';
import { BookingStatus } from '@prisma/client';
import { sendServiceExtension } from '../services/notification.service';

/**
 * Get all bookings/orders for the workshop
 */
export async function getWorkshopOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    // NOTE: The Booking model does not have a direct workshopId FK, so we cannot
    // filter by workshop assignment yet. As a practical workaround, we filter by
    // statuses that are relevant to workshop operations (i.e., bookings that have
    // progressed past payment/confirmation and have not been cancelled before
    // reaching the workshop). When a workshopId column is added to Booking,
    // this filter should be combined with a workshop-specific WHERE clause.
    const workshopRelevantStatuses: BookingStatus[] = [
      BookingStatus.PICKUP_ASSIGNED,
      BookingStatus.PICKED_UP,
      BookingStatus.AT_WORKSHOP,
      BookingStatus.IN_WORKSHOP,
      BookingStatus.IN_SERVICE,
      BookingStatus.READY_FOR_RETURN,
      BookingStatus.RETURN_ASSIGNED,
      BookingStatus.COMPLETED,
      BookingStatus.RETURNED,
      BookingStatus.DELIVERED,
    ];

    const statusFilter = { status: { in: workshopRelevantStatuses } };

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where: statusFilter,
        skip,
        take: limit,
        include: {
          customer: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phone: true
            }
          },
          vehicle: {
            select: {
              id: true,
              brand: true,
              model: true,
              year: true,
              mileage: true,
              licensePlate: true
            }
          },
          jockey: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          },
          extensions: {
            select: {
              id: true,
              status: true,
              description: true,
              totalAmount: true,
            }
          },
          jockeyAssignments: {
            select: {
              id: true,
              type: true,
              status: true,
              scheduledTime: true,
              departedAt: true,
              arrivedAt: true,
              completedAt: true,
              jockey: { select: { id: true, firstName: true, lastName: true } }
            },
            orderBy: { createdAt: 'asc' }
          }
        },
        orderBy: {
          pickupDate: 'desc'
        }
      }),
      prisma.booking.count({ where: statusFilter })
    ]);

    res.json({
      success: true,
      data: bookings.map(booking => ({
        ...booking,
        totalPrice: booking.totalPrice.toString()
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Failed to fetch workshop orders:', error);
    next(error);
  }
}

/**
 * Get a single booking/order by ID
 */
export async function getWorkshopOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;

    // Support lookup by either UUID or bookingNumber (Kanban navigates with bookingNumber)
    const booking = await prisma.booking.findFirst({
      where: {
        OR: [
          { id },
          { bookingNumber: id }
        ]
      },
      include: {
        customer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true
          }
        },
        vehicle: {
          select: {
            id: true,
            brand: true,
            model: true,
            year: true,
            mileage: true,
            licensePlate: true
          }
        },
        jockey: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        jockeyAssignments: {
          select: {
            id: true,
            type: true,
            status: true,
            scheduledTime: true,
            departedAt: true,
            arrivedAt: true,
            completedAt: true,
            jockey: { select: { id: true, firstName: true, lastName: true } }
          },
          orderBy: { createdAt: 'asc' }
        },
        extensions: {
          select: {
            id: true,
            status: true,
            description: true,
            totalAmount: true,
            items: true,
            createdAt: true,
            approvedAt: true,
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!booking) {
      res.status(404).json({
        success: false,
        error: {
          code: 'BOOKING_NOT_FOUND',
          message: 'Booking not found'
        }
      });
      return;
    }

    res.json({
      success: true,
      data: {
        ...booking,
        totalPrice: booking.totalPrice.toString()
      }
    });
  } catch (error) {
    logger.error('Failed to fetch workshop order:', error);
    next(error);
  }
}

/**
 * Create extension for a booking
 */
const createExtensionSchema = z.object({
  description: z.string().min(1),
  items: z.array(z.object({
    name: z.string().min(1),
    price: z.number().positive(), // In cents
    quantity: z.number().int().positive(),
    mediaUrl: z.string().optional(),
    mediaType: z.enum(['image', 'video']).optional()
  })).min(1),
  images: z.array(z.string()).optional().default([]),
  videos: z.array(z.string()).optional().default([])
});

export async function createExtension(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const bookingId = req.params.bookingId as string;
    const validatedData = createExtensionSchema.parse(req.body);

    // Check if booking exists
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        customer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    if (!booking) {
      res.status(404).json({
        success: false,
        error: {
          code: 'BOOKING_NOT_FOUND',
          message: 'Booking not found'
        }
      });
      return;
    }

    // Calculate total amount
    const totalAmount = validatedData.items.reduce(
      (sum, item) => sum + (item.price * item.quantity),
      0
    );

    // Create extension
    const extension = await prisma.extension.create({
      data: {
        bookingId,
        description: validatedData.description,
        items: validatedData.items,
        totalAmount,
        images: validatedData.images,
        videos: validatedData.videos,
        status: 'PENDING'
      }
    });

    logger.info('Extension created:', {
      extensionId: extension.id,
      bookingId,
      totalAmount
    });

    // Send notification to customer about the new extension
    try {
      await sendServiceExtension(
        booking.customer.id,
        booking.id,
        booking.bookingNumber,
        validatedData.description,
        totalAmount / 100 // Convert cents to EUR for display
      );
    } catch (notificationError) {
      // Log but don't fail the extension creation if notification fails
      logger.error('Failed to send extension notification to customer:', {
        extensionId: extension.id,
        bookingId,
        customerId: booking.customer.id,
        error: notificationError instanceof Error ? notificationError.message : 'Unknown error'
      });
    }

    res.status(201).json({
      success: true,
      data: extension,
      message: 'Extension created successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid extension data',
          details: error.errors
        }
      });
      return;
    }

    logger.error('Failed to create extension:', error);
    next(error);
  }
}

/**
 * Update booking status
 */
const updateStatusSchema = z.object({
  status: z.nativeEnum(BookingStatus)
});

export async function updateBookingStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Note: :id route param is the bookingNumber, not the internal UUID
    const bookingNumber = req.params.id as string;
    const { status } = updateStatusSchema.parse(req.body);

    // Get current booking to validate FSM transition
    const currentBooking = await prisma.booking.findUnique({
      where: { bookingNumber }
    });

    if (!currentBooking) {
      res.status(404).json({
        success: false,
        error: {
          code: 'BOOKING_NOT_FOUND',
          message: 'Booking not found'
        }
      });
      return;
    }

    // Validate FSM transition
    try {
      assertTransition(currentBooking.status, status, Actor.WORKSHOP);
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_TRANSITION',
          message: error.message
        }
      });
      return;
    }

    // Perform status update and fetch full booking data for the response
    const booking = await prisma.booking.update({
      where: { bookingNumber },
      data: { status },
      include: {
        customer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true
          }
        },
        vehicle: true,
        jockey: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    logger.info('Booking status updated:', {
      bookingId: currentBooking.id,
      bookingNumber,
      oldStatus: currentBooking.status,
      newStatus: status
    });

    // When workshop marks service as READY_FOR_RETURN (or legacy COMPLETED),
    // wrap the return assignment creation + RETURN_ASSIGNED update in a transaction.
    if (status === BookingStatus.READY_FOR_RETURN || status === BookingStatus.COMPLETED) {
      try {
        // Find jockey for return assignment (read, before transaction)
        // IMPORTANT: Use booking.id (UUID) for FK relationships, not bookingNumber
        const pickupAssignment = await prisma.jockeyAssignment.findFirst({
          where: {
            bookingId: currentBooking.id,
            type: 'PICKUP',
          }
        });

        let jockeyId = pickupAssignment?.jockeyId;
        if (!jockeyId) {
          const availableJockey = await prisma.user.findFirst({
            where: {
              role: 'JOCKEY',
              isActive: true
            }
          });
          jockeyId = availableJockey?.id;
        }

        if (jockeyId) {
          // Use delivery date or schedule for next day
          const scheduledTime = booking.deliveryDate
            ? new Date(booking.deliveryDate)
            : new Date(); // Same day — visible immediately on jockey dashboard

          // Transaction: create return assignment + update status to RETURN_ASSIGNED
          await prisma.$transaction(async (tx) => {
            // 1. Create return assignment
            await tx.jockeyAssignment.create({
              data: {
                bookingId: currentBooking.id,
                jockeyId: jockeyId!,
                type: 'RETURN',
                status: 'ASSIGNED',
                scheduledTime,

                // Customer info
                customerName: `${booking.customer.firstName || ''} ${booking.customer.lastName || ''}`.trim() || booking.customer.email,
                customerPhone: booking.customer.phone || 'N/A',
                customerAddress: booking.pickupAddress,
                customerCity: booking.pickupCity,
                customerPostalCode: booking.pickupPostalCode,

                // Vehicle info
                vehicleBrand: booking.vehicle.brand,
                vehicleModel: booking.vehicle.model,
                vehicleLicensePlate: booking.vehicle.licensePlate || '',
              }
            });

            // 2. Update booking status to RETURN_ASSIGNED with FSM validation
            assertTransition(status, BookingStatus.RETURN_ASSIGNED, Actor.SYSTEM);
            await tx.booking.update({
              where: { id: currentBooking.id },
              data: { status: BookingStatus.RETURN_ASSIGNED }
            });
          });

          logger.info('Return assignment created and booking status updated to RETURN_ASSIGNED', {
            bookingId: currentBooking.id,
            bookingNumber,
            jockeyId,
            scheduledTime
          });
        } else {
          logger.warn('No available jockey found for return assignment', {
            bookingId: currentBooking.id,
            bookingNumber
          });
        }
      } catch (error: any) {
        // Log error but don't fail the status update (booking is already READY_FOR_RETURN)
        logger.error('Failed to create return assignment:', {
          bookingId: currentBooking.id,
          error: error.message || error
        });
      }

      // Auto-capture approved extensions (best-effort, outside main transaction)
      try {
        const approvedExtensions = await prisma.extension.findMany({
          where: {
            bookingId: currentBooking.id,
            status: 'APPROVED',
            paymentIntentId: { not: null },
          }
        });

        for (const extension of approvedExtensions) {
          try {
            // Capture payment using appropriate service
            const isDemoMode = process.env.DEMO_MODE === 'true';

            if (isDemoMode) {
              await demoPaymentService.capturePayment(extension.paymentIntentId!);
              logger.info('[DEMO] Extension payment auto-captured', {
                extensionId: extension.id,
                bookingNumber,
                amount: extension.totalAmount / 100
              });
            } else {
              await paymentService.capturePayment(extension.paymentIntentId!);
              logger.info('Extension payment auto-captured', {
                extensionId: extension.id,
                bookingNumber,
                amount: extension.totalAmount / 100
              });
            }

            // Update extension status to COMPLETED
            await prisma.extension.update({
              where: { id: extension.id },
              data: {
                status: 'COMPLETED',
                paidAt: new Date(),
              }
            });
          } catch (error) {
            logger.error('Failed to capture extension payment', {
              extensionId: extension.id,
              error: error instanceof Error ? error.message : 'Unknown error'
            });
            // Continue with other extensions even if one fails
          }
        }
      } catch (error) {
        logger.error('Failed to query approved extensions', {
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    res.json({
      success: true,
      data: {
        ...booking,
        totalPrice: booking.totalPrice.toString()
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid status',
          details: error.errors
        }
      });
      return;
    }

    logger.error('Failed to update booking status:', error);
    next(error);
  }
}
