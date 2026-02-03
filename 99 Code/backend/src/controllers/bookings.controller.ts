import { Request, Response, NextFunction } from 'express';
import { BookingsService } from '../services/bookings.service';
import { BookingsRepository } from '../repositories/bookings.repository';
import { VehiclesRepository } from '../repositories/vehicles.repository';
import { VehiclesService } from '../services/vehicles.service';
import { PricingService } from '../services/pricing.service';
import { PriceMatrixRepository } from '../repositories/price-matrix.repository';
import { paymentService } from '../services/payment.service';
import { sendNotification } from '../services/notification.service';
import { NotificationType } from '@prisma/client';
import { prisma } from '../config/database';
import { ApiError } from '../middleware/errorHandler';
import { BookingStatus, ServiceType } from '@prisma/client';
import { z } from 'zod';
import { CreateBookingDto } from '../types/booking.types';
import { logger } from '../config/logger';

// Validation schemas

// New DTO schema for frontend booking flow
const createBookingDtoSchema = z.object({
  customer: z.object({
    email: z.string().email('Valid email is required'),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    phone: z.string().min(1, 'Phone number is required')
  }).optional(), // Optional if user is authenticated
  vehicle: z.object({
    brand: z.string().min(1, 'Brand is required'),
    model: z.string().min(1, 'Model is required'),
    year: z.number().int().min(1994).max(new Date().getFullYear() + 1),
    mileage: z.number().int().min(0).max(1000000),
    saveVehicle: z.boolean().optional()
  }),
  services: z.array(z.string()).min(1, 'At least one service must be selected'),
  pickup: z.object({
    date: z.string().min(1, 'Pickup date is required'),
    timeSlot: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (expected HH:MM)'),
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    postalCode: z.string().min(1, 'Postal code is required')
  }),
  delivery: z.object({
    date: z.string().min(1, 'Delivery date is required'),
    timeSlot: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (expected HH:MM)')
  }),
  customerNotes: z.string().optional()
});

// Legacy schema for backward compatibility
const createBookingSchema = z.object({
  vehicleId: z.string().cuid('Invalid vehicle ID'),
  serviceType: z.nativeEnum(ServiceType),
  pickupDate: z.string().datetime('Invalid date format'),
  pickupTimeSlot: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (expected HH:MM)'),
  pickupAddress: z.string().min(1, 'Pickup address is required'),
  pickupCity: z.string().min(1, 'Pickup city is required'),
  pickupPostalCode: z.string().min(1, 'Pickup postal code is required'),
  customerNotes: z.string().optional()
});

const updateBookingSchema = z.object({
  status: z.nativeEnum(BookingStatus).optional(),
  customerNotes: z.string().optional(),
  internalNotes: z.string().optional(),
  jockeyId: z.string().cuid().optional(),
  deliveryDate: z.string().datetime().optional(),
  deliveryTimeSlot: z.string().optional(),
  paymentIntentId: z.string().optional(),
  paidAt: z.string().datetime().optional()
});

const cancelBookingSchema = z.object({
  reason: z.string().optional()
});

const createExtensionSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  items: z.array(z.object({
    name: z.string().min(1, 'Item name is required'),
    price: z.number().positive('Price must be positive'),
    quantity: z.number().int().positive('Quantity must be a positive integer')
  })).min(1, 'At least one item is required'),
  images: z.array(z.string().url()).optional(),
  videos: z.array(z.string().url()).optional()
});

const declineExtensionSchema = z.object({
  reason: z.string().optional()
});

// Initialize services
const bookingsRepository = new BookingsRepository(prisma);
const vehiclesRepository = new VehiclesRepository(prisma);
const priceMatrixRepository = new PriceMatrixRepository(prisma);
const pricingService = new PricingService(priceMatrixRepository);
const vehiclesService = new VehiclesService(vehiclesRepository, priceMatrixRepository);
const bookingsService = new BookingsService(
  bookingsRepository,
  vehiclesRepository,
  pricingService,
  vehiclesService
);

/**
 * Get all bookings for authenticated customer
 * GET /api/bookings
 */
export async function listBookings(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Authentication required');
    }

    // Parse query parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as BookingStatus | undefined;

    // Get bookings
    const result = await bookingsService.getCustomerBookings(req.user.userId, page, limit);

    // Filter by status if provided
    let filteredResult = result;
    if (status) {
      const statusFiltered = await bookingsService.getBookings(
        { customerId: req.user.userId, status },
        page,
        limit
      );
      filteredResult = statusFiltered;
    }

    res.status(200).json({
      success: true,
      data: filteredResult.bookings,
      pagination: {
        page: filteredResult.page,
        limit: filteredResult.limit,
        total: filteredResult.total,
        totalPages: filteredResult.totalPages
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get single booking by ID
 * GET /api/bookings/:id
 */
export async function getBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Authentication required');
    }

    const { id } = req.params;
    const booking = await bookingsService.getBookingById(id, req.user.userId);

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Create new booking
 * POST /api/bookings
 * Supports both authenticated users and guest checkout
 */
export async function createBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    let customerId: string;
    let isNewUser = false;

    // Check if this is the new DTO format or legacy format
    if (req.body.vehicle && req.body.services) {
      // New DTO format from frontend
      const validatedDto = createBookingDtoSchema.parse(req.body);

      // Determine customer ID
      if (req.user) {
        // Authenticated user
        customerId = req.user.userId;
      } else if (validatedDto.customer) {
        // Guest checkout - find or create user
        const { email, firstName, lastName, phone } = validatedDto.customer;

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: { email }
        });

        if (existingUser) {
          customerId = existingUser.id;
        } else {
          // Create new user account
          const crypto = await import('crypto');
          const bcrypt = await import('bcrypt');
          const temporaryPassword = crypto.randomBytes(12).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 12);
          const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

          const newUser = await prisma.user.create({
            data: {
              email,
              firstName,
              lastName,
              phone,
              passwordHash: hashedPassword,
              role: 'CUSTOMER'
            }
          });

          customerId = newUser.id;
          isNewUser = true;

          // TODO: Send welcome email with login credentials
          console.log(`New user created: ${email}, temporary password: ${temporaryPassword}`);
        }
      } else {
        // Neither authenticated nor customer data provided
        throw new ApiError(400, 'Customer information is required for guest checkout');
      }

      // Create booking
      const booking = await bookingsService.createBookingFromDto(customerId, validatedDto);

      // Continue with payment and notifications...
      await handleBookingPaymentAndNotifications(booking, customerId, req, res);
    } else {
      // Legacy format - requires authentication
      if (!req.user) {
        throw new ApiError(401, 'Authentication required for legacy booking format');
      }

      const validatedData = createBookingSchema.parse(req.body);
      const booking = await bookingsService.createBooking({
        ...validatedData,
        customerId: req.user.userId
      });

      await handleBookingPaymentAndNotifications(booking, req.user.userId, req, res);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new ApiError(400, error.errors[0].message));
    } else {
      next(error);
    }
  }
}

/**
 * Helper function to handle payment and notifications after booking creation
 */
async function handleBookingPaymentAndNotifications(
  booking: any,
  customerId: string,
  req: Request,
  res: Response
): Promise<void> {
  const bookingsRepository = new BookingsRepository(prisma);

  // Create payment intent (Skip if STRIPE is out of scope, but keep code for future)
  const totalPriceInCents = Math.round(parseFloat(booking.totalPrice.toString()) * 100);

  let paymentIntent;
  try {
    paymentIntent = await paymentService.createPaymentIntent({
      amount: totalPriceInCents,
      bookingId: booking.id,
      customerId: customerId,
      customerEmail: booking.customer.email,
      metadata: {
        bookingNumber: booking.bookingNumber,
        serviceType: booking.serviceType
      }
    });

    // Update booking with payment intent
    await bookingsRepository.update(booking.id, {
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    // If payment service is not configured, log and continue
    console.warn('Payment service not available:', error instanceof Error ? error.message : 'Unknown error');

    // For now, mark booking as CONFIRMED instead of PENDING_PAYMENT
    // This allows testing without Stripe integration
    await bookingsRepository.update(booking.id, {
      status: BookingStatus.CONFIRMED
    });
  }

  // Auto-create pickup assignment for jockey
  try {
    // Find first available jockey
    const jockey = await prisma.user.findFirst({
      where: {
        role: 'JOCKEY',
        isActive: true,
      }
    });

    if (jockey && booking.customer && booking.vehicle) {
      // Parse pickup date and time
      const pickupDateTime = new Date(`${booking.pickupDate}T${booking.pickupTimeSlot}:00`);

      await prisma.jockeyAssignment.create({
        data: {
          bookingId: booking.id,
          jockeyId: jockey.id,
          type: 'PICKUP',
          status: 'ASSIGNED',
          scheduledTime: pickupDateTime,

          // Customer info
          customerName: `${booking.customer.firstName} ${booking.customer.lastName}`,
          customerPhone: booking.customer.phone || '',
          customerAddress: booking.pickupAddress,
          customerCity: booking.pickupCity,
          customerPostalCode: booking.pickupPostalCode,

          // Vehicle info
          vehicleBrand: booking.vehicle.brand,
          vehicleModel: booking.vehicle.model,
          vehicleLicensePlate: booking.vehicle.licensePlate || '',
        }
      });

      // Update booking status to JOCKEY_ASSIGNED
      await bookingsRepository.update(booking.id, {
        status: BookingStatus.JOCKEY_ASSIGNED
      });

      console.log(`Pickup assignment created for booking ${booking.bookingNumber}`);
    }
  } catch (error) {
    console.error('Failed to create jockey assignment:', error instanceof Error ? error.message : 'Unknown error');
    // Continue even if assignment creation fails
  }

  // Send booking confirmation notification
  try {
    await sendNotification({
      userId: customerId,
      type: NotificationType.BOOKING_CONFIRMATION,
      title: 'Buchung erstellt',
      body: `Ihre Buchung ${booking.bookingNumber} wurde erfolgreich erstellt.`,
      bookingId: booking.id,
      data: {
        bookingId: booking.id,
        bookingNumber: booking.bookingNumber,
        totalPrice: booking.totalPrice.toString()
      }
    });
  } catch (error) {
    // Log but don't fail the request if notification fails
    console.error('Failed to send notification:', error);
  }

  // Create pickup assignment for jockey
  // For demo: assign to first available jockey
  try {
    const jockey = await prisma.user.findFirst({
      where: {
        role: 'JOCKEY',
        isActive: true,
      }
    });

    if (jockey) {
      // Get customer details for assignment
      const customer = booking.customer || await prisma.user.findUnique({
        where: { id: customerId }
      });

      if (customer) {
        await prisma.jockeyAssignment.create({
          data: {
            bookingId: booking.id,
            jockeyId: jockey.id,
            type: 'PICKUP',
            status: 'ASSIGNED',
            scheduledTime: booking.pickupDate,

            // Customer info
            customerName: `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || customer.email,
            customerPhone: customer.phone || 'N/A',
            customerAddress: booking.pickupAddress,
            customerCity: booking.pickupCity,
            customerPostalCode: booking.pickupPostalCode,

            // Vehicle info
            vehicleBrand: booking.vehicle.brand,
            vehicleModel: booking.vehicle.model,
            vehicleLicensePlate: booking.vehicle.licensePlate || '',
          }
        });

        // Update booking status to JOCKEY_ASSIGNED
        await bookingsRepository.update(booking.id, {
          status: BookingStatus.JOCKEY_ASSIGNED
        });

        logger.info('Pickup assignment created for jockey', {
          bookingId: booking.id,
          jockeyId: jockey.id
        });
      }
    } else {
      logger.warn('No active jockey found for assignment', {
        bookingId: booking.id
      });
    }
  } catch (error) {
    // Log error but don't fail the booking
    logger.error('Failed to create jockey assignment:', error);
  }

  // Fetch updated booking with all relations
  const updatedBooking = await bookingsService.getBookingById(booking.id);

  const responseData: any = {
    ...updatedBooking,
    totalPrice: updatedBooking.totalPrice.toString()
  };

  if (paymentIntent) {
    responseData.paymentIntent = {
      id: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      amount: paymentIntent.amount
    };
  }

  res.status(201).json({
    success: true,
    data: responseData,
    message: paymentIntent
      ? 'Booking created successfully. Please complete payment to confirm.'
      : 'Booking created and confirmed successfully.'
  });
}

/**
 * Update booking
 * PUT /api/bookings/:id
 */
export async function updateBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Authentication required');
    }

    const { id } = req.params;

    // Validate request body
    const validatedData = updateBookingSchema.parse(req.body);

    // Ensure at least one field is being updated
    if (Object.keys(validatedData).length === 0) {
      throw new ApiError(400, 'At least one field must be provided for update');
    }

    // Convert date strings to Date objects
    const updateData: any = { ...validatedData };
    if (updateData.deliveryDate) {
      updateData.deliveryDate = new Date(updateData.deliveryDate);
    }
    if (updateData.paidAt) {
      updateData.paidAt = new Date(updateData.paidAt);
    }

    // Update booking
    const booking = await bookingsService.updateBooking(id, req.user.userId, updateData);

    res.status(200).json({
      success: true,
      data: booking,
      message: 'Booking updated successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new ApiError(400, error.errors[0].message));
    } else {
      next(error);
    }
  }
}

/**
 * Cancel booking
 * DELETE /api/bookings/:id
 */
export async function cancelBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Authentication required');
    }

    const { id } = req.params;

    // Validate request body
    const validatedData = cancelBookingSchema.parse(req.body);

    const booking = await bookingsService.cancelBooking(
      id,
      req.user.userId,
      validatedData.reason
    );

    res.status(200).json({
      success: true,
      data: booking,
      message: 'Booking cancelled successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new ApiError(400, error.errors[0].message));
    } else {
      next(error);
    }
  }
}

/**
 * Get booking status
 * GET /api/bookings/:id/status
 */
export async function getBookingStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Authentication required');
    }

    const { id } = req.params;
    const status = await bookingsService.getBookingStatus(id, req.user.userId);

    res.status(200).json({
      success: true,
      data: status
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get booking extensions
 * GET /api/bookings/:id/extensions
 */
export async function getBookingExtensions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Authentication required');
    }

    const { id } = req.params;
    const extensions = await bookingsService.getBookingExtensions(id, req.user.userId);

    res.status(200).json({
      success: true,
      data: extensions
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Approve extension and create payment
 * POST /api/bookings/:id/extensions/:extensionId/approve
 */
export async function approveExtension(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Authentication required');
    }

    const { id, extensionId } = req.params;

    const result = await bookingsService.approveExtension(
      id,
      extensionId,
      req.user.userId
    );

    res.status(200).json({
      success: true,
      data: result,
      message: 'Extension approved. Please complete payment to proceed.'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Decline extension
 * POST /api/bookings/:id/extensions/:extensionId/decline
 */
export async function declineExtension(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Authentication required');
    }

    const { id, extensionId } = req.params;

    // Validate request body
    const validatedData = declineExtensionSchema.parse(req.body);

    const extension = await bookingsService.declineExtension(
      id,
      extensionId,
      req.user.userId,
      validatedData.reason
    );

    res.status(200).json({
      success: true,
      data: extension,
      message: 'Extension declined'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new ApiError(400, error.errors[0].message));
    } else {
      next(error);
    }
  }
}
