/**
 * Demo Controller
 *
 * This controller provides endpoints for demo/development mode.
 * These endpoints simulate payment confirmations and other actions
 * that would normally be handled by external services like Stripe.
 *
 * Only active when DEMO_MODE=true
 */

import { Request, Response, NextFunction } from 'express';
import { demoPaymentService } from '../services/demo-payment.service';
import { prisma } from '../config/database';
import { ApiError } from '../middleware/errorHandler';
import { BookingStatus } from '@prisma/client';
import { logger } from '../config/logger';
import { z } from 'zod';

// Validation schemas
const confirmPaymentSchema = z.object({
  bookingId: z.string().cuid('Invalid booking ID')
});

const authorizeExtensionSchema = z.object({
  extensionId: z.string().cuid('Invalid extension ID')
});

const capturePaymentSchema = z.object({
  paymentIntentId: z.string().min(1, 'Payment intent ID is required'),
  extensionId: z.string().cuid('Invalid extension ID')
});

const declineExtensionSchema = z.object({
  extensionId: z.string().cuid('Invalid extension ID'),
  reason: z.string().optional()
});

/**
 * Confirm a booking payment (simulates Stripe webhook)
 * POST /api/demo/payment/confirm
 */
export async function confirmBookingPayment(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Only allow in demo mode
    if (process.env.DEMO_MODE !== 'true') {
      throw new ApiError(403, 'Demo endpoints are only available in demo mode');
    }

    const validatedData = confirmPaymentSchema.parse(req.body);
    const { bookingId } = validatedData;

    // Get booking with paymentIntentId
    const existingBooking = await prisma.booking.findUnique({
      where: { id: bookingId }
    });

    if (!existingBooking) {
      throw new ApiError(404, 'Booking not found');
    }

    if (!existingBooking.paymentIntentId) {
      throw new ApiError(400, 'No payment intent found for this booking');
    }

    // Confirm the payment in demo service
    const paymentResult = await demoPaymentService.confirmPayment(existingBooking.paymentIntentId);

    // Update booking status to CONFIRMED
    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.CONFIRMED,
        paidAt: new Date()
      },
      include: {
        customer: true,
        vehicle: true
      }
    });

    // Create pickup assignment after successful payment
    await createPickupAssignmentForBooking(booking);

    logger.info('[DEMO] Booking payment confirmed', {
      bookingId,
      paymentIntentId: existingBooking.paymentIntentId,
      status: paymentResult.status
    });

    res.status(200).json({
      success: true,
      data: {
        booking,
        payment: paymentResult
      },
      message: 'Payment confirmed successfully'
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
 * Helper function to create pickup assignment
 */
async function createPickupAssignmentForBooking(booking: any): Promise<void> {
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

      // Update booking status to PICKUP_ASSIGNED
      await prisma.booking.update({
        where: { id: booking.id },
        data: { status: BookingStatus.PICKUP_ASSIGNED }
      });

      logger.info('[DEMO] Pickup assignment created', {
        bookingId: booking.id,
        jockeyId: jockey.id
      });
    }
  } catch (error) {
    logger.error('[DEMO] Failed to create pickup assignment', {
      bookingId: booking.id,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Authorize an extension payment (simulates customer approving extension)
 * POST /api/demo/extension/authorize
 */
export async function authorizeExtensionPayment(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Only allow in demo mode
    if (process.env.DEMO_MODE !== 'true') {
      throw new ApiError(403, 'Demo endpoints are only available in demo mode');
    }

    const validatedData = authorizeExtensionSchema.parse(req.body);
    const { extensionId } = validatedData;

    // Get the extension
    const extension = await prisma.extension.findUnique({
      where: { id: extensionId },
      include: {
        booking: {
          include: {
            customer: true
          }
        }
      }
    });

    if (!extension) {
      throw new ApiError(404, 'Extension not found');
    }

    const bookingId = extension.bookingId;

    // Get total amount (already in cents)
    const totalAmountInCents = extension.totalAmount;

    // Create payment intent with manual capture
    const paymentIntent = await demoPaymentService.authorizeExtensionPayment({
      amount: totalAmountInCents,
      extensionId: extension.id,
      bookingId: bookingId,
      customerId: extension.booking.customerId,
      customerEmail: extension.booking.customer.email
    });

    // Update extension with payment intent
    await prisma.extension.update({
      where: { id: extensionId },
      data: {
        paymentIntentId: paymentIntent.id,
        status: 'APPROVED',
        approvedAt: new Date()
      }
    });

    logger.info('[DEMO] Extension payment authorized', {
      extensionId,
      bookingId,
      paymentIntentId: paymentIntent.id,
      amount: totalAmountInCents / 100
    });

    res.status(200).json({
      success: true,
      data: {
        extension,
        paymentIntent: {
          id: paymentIntent.id,
          clientSecret: paymentIntent.client_secret,
          amount: paymentIntent.amount,
          status: paymentIntent.status
        }
      },
      message: 'Extension payment authorized'
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
 * Capture an extension payment (simulates workshop completing work)
 * POST /api/demo/extension/capture
 */
export async function captureExtensionPayment(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Only allow in demo mode
    if (process.env.DEMO_MODE !== 'true') {
      throw new ApiError(403, 'Demo endpoints are only available in demo mode');
    }

    const validatedData = capturePaymentSchema.parse(req.body);
    const { paymentIntentId, extensionId } = validatedData;

    // Capture the payment
    const paymentResult = await demoPaymentService.capturePayment(paymentIntentId);

    // Update extension with payment timestamp
    // Note: Extension status remains APPROVED - the extension is complete when paid
    const extension = await prisma.extension.update({
      where: { id: extensionId },
      data: {
        paidAt: new Date()
      },
      include: {
        booking: true
      }
    });

    logger.info('[DEMO] Extension payment captured', {
      extensionId,
      paymentIntentId,
      status: paymentResult.status
    });

    res.status(200).json({
      success: true,
      data: {
        extension,
        payment: paymentResult
      },
      message: 'Extension payment captured successfully'
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
 * Decline an extension (simulates customer declining extension)
 * POST /api/demo/extension/decline
 */
export async function declineExtensionPayment(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Only allow in demo mode
    if (process.env.DEMO_MODE !== 'true') {
      throw new ApiError(403, 'Demo endpoints are only available in demo mode');
    }

    const validatedData = declineExtensionSchema.parse(req.body);
    const { extensionId, reason } = validatedData;

    // Get the extension
    const extension = await prisma.extension.findUnique({
      where: { id: extensionId },
    });

    if (!extension) {
      throw new ApiError(404, 'Extension not found');
    }

    // Cancel payment intent if exists
    if (extension.paymentIntentId) {
      try {
        await demoPaymentService.cancelPayment(extension.paymentIntentId);
      } catch (error) {
        logger.warn('[DEMO] Failed to cancel payment intent', {
          extensionId,
          paymentIntentId: extension.paymentIntentId,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        // Continue with decline even if payment cancellation fails
      }
    }

    // Update extension to DECLINED
    const updatedExtension = await prisma.extension.update({
      where: { id: extensionId },
      data: {
        status: 'DECLINED',
        declinedAt: new Date(),
        declineReason: reason || 'Customer declined extension'
      }
    });

    logger.info('[DEMO] Extension declined', {
      extensionId,
      reason: reason || 'No reason provided'
    });

    res.status(200).json({
      success: true,
      data: updatedExtension,
      message: 'Extension declined successfully'
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
 * Get payment intent status (for debugging)
 * GET /api/demo/payment/:paymentIntentId
 */
export async function getPaymentStatus(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Only allow in demo mode
    if (process.env.DEMO_MODE !== 'true') {
      throw new ApiError(403, 'Demo endpoints are only available in demo mode');
    }

    const paymentIntentId = req.params.paymentIntentId as string;

    const status = await demoPaymentService.getPaymentStatus(paymentIntentId);

    res.status(200).json({
      success: true,
      data: status
    });
  } catch (error) {
    next(error);
  }
}
