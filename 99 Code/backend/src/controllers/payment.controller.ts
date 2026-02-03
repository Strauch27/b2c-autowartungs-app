import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { paymentService } from '../services/payment.service';
import { BookingsRepository } from '../repositories/bookings.repository';
import { prisma } from '../config/database';
import { ApiError } from '../middleware/errorHandler';
import { logger } from '../config/logger';
import { BookingStatus } from '@prisma/client';
import Stripe from 'stripe';

// Initialize repository
const bookingsRepository = new BookingsRepository(prisma);

// Validation schemas
const createPaymentIntentSchema = z.object({
  bookingId: z.string().cuid('Invalid booking ID'),
});

const webhookEventSchema = z.object({
  type: z.string(),
  data: z.object({
    object: z.any(),
  }),
});

/**
 * Create Payment Intent for a booking
 * POST /api/payment/create-intent
 */
export async function createPaymentIntent(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Authentication required');
    }

    // Validate request body
    const { bookingId } = createPaymentIntentSchema.parse(req.body);

    // Get booking
    const booking = await bookingsRepository.findById(bookingId);

    if (!booking) {
      throw new ApiError(404, 'Booking not found');
    }

    // Verify booking belongs to customer
    if (booking.customerId !== req.user.userId) {
      throw new ApiError(403, 'You do not have permission to pay for this booking');
    }

    // Check if booking is in correct status
    if (booking.status !== BookingStatus.PENDING_PAYMENT) {
      throw new ApiError(
        400,
        `Booking cannot be paid in current status: ${booking.status}`
      );
    }

    // Check if payment intent already exists
    if (booking.paymentIntentId) {
      // Retrieve existing payment intent
      const existingIntent = await paymentService.getPaymentIntent(
        booking.paymentIntentId
      );

      // If payment is already successful, update booking
      if (existingIntent.status === 'succeeded') {
        throw new ApiError(400, 'Booking has already been paid');
      }

      // If payment is cancelled, create a new one
      if (
        existingIntent.status !== 'canceled' &&
        existingIntent.status !== 'requires_payment_method'
      ) {
        // Return existing payment intent client secret
        res.status(200).json({
          success: true,
          data: {
            clientSecret: existingIntent.client_secret,
            paymentIntentId: existingIntent.id,
            amount: existingIntent.amount / 100,
          },
        });
        return;
      }
    }

    // Get customer email
    const customerEmail = booking.customer.email;

    // Convert decimal to cents
    const amountInCents = Math.round(Number(booking.totalPrice) * 100);

    // Create payment intent
    const paymentIntent = await paymentService.createPaymentIntent({
      amount: amountInCents,
      bookingId: booking.id,
      customerId: req.user.userId,
      customerEmail,
      metadata: {
        bookingNumber: booking.bookingNumber,
        serviceType: booking.serviceType,
      },
    });

    // Update booking with payment intent ID
    await bookingsRepository.update(booking.id, {
      paymentIntentId: paymentIntent.id,
    });

    logger.info({
      message: 'Payment intent created for booking',
      bookingId: booking.id,
      paymentIntentId: paymentIntent.id,
      amount: amountInCents / 100,
    });

    res.status(200).json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount / 100,
      },
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
 * Get payment status
 * GET /api/payment/status/:paymentIntentId
 */
export async function getPaymentStatus(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Authentication required');
    }

    const { paymentIntentId } = req.params;

    // Get payment intent
    const paymentIntent = await paymentService.getPaymentIntent(paymentIntentId);

    // Verify ownership through booking
    const booking = await bookingsRepository.findByPaymentIntentId(paymentIntentId);

    if (!booking) {
      throw new ApiError(404, 'Booking not found for this payment');
    }

    if (booking.customerId !== req.user.userId) {
      throw new ApiError(403, 'You do not have permission to access this payment');
    }

    res.status(200).json({
      success: true,
      data: {
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        paid: paymentIntent.status === 'succeeded',
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Stripe Webhook Handler
 * POST /api/payment/webhook
 */
export async function handleWebhook(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const signature = req.headers['stripe-signature'];

    if (!signature) {
      throw new ApiError(400, 'Missing stripe-signature header');
    }

    // Verify webhook signature
    const event = paymentService.verifyWebhookSignature(
      req.body,
      signature as string
    );

    logger.info({
      message: 'Webhook received',
      type: event.type,
      eventId: event.id,
    });

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.canceled':
        await handlePaymentCanceled(event.data.object as Stripe.PaymentIntent);
        break;

      case 'charge.refunded':
        await handleChargeRefunded(event.data.object as Stripe.Charge);
        break;

      default:
        logger.info({
          message: 'Unhandled webhook event type',
          type: event.type,
        });
    }

    // Return 200 to acknowledge receipt
    res.status(200).json({ received: true });
  } catch (error) {
    logger.error({
      message: 'Webhook processing error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    next(error);
  }
}

/**
 * Handle successful payment
 */
async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  try {
    const bookingId = paymentIntent.metadata.bookingId;

    if (!bookingId) {
      logger.error({
        message: 'Payment succeeded but no bookingId in metadata',
        paymentIntentId: paymentIntent.id,
      });
      return;
    }

    // Update booking status
    await bookingsRepository.update(bookingId, {
      status: BookingStatus.CONFIRMED,
      paidAt: new Date(),
    });

    logger.info({
      message: 'Booking payment confirmed',
      bookingId,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount / 100,
    });

    // TODO: Send confirmation email to customer
    // TODO: Notify workshop/jockey system
  } catch (error) {
    logger.error({
      message: 'Error handling payment succeeded',
      error: error instanceof Error ? error.message : 'Unknown error',
      paymentIntentId: paymentIntent.id,
    });
  }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  try {
    const bookingId = paymentIntent.metadata.bookingId;

    if (!bookingId) {
      logger.error({
        message: 'Payment failed but no bookingId in metadata',
        paymentIntentId: paymentIntent.id,
      });
      return;
    }

    logger.warn({
      message: 'Booking payment failed',
      bookingId,
      paymentIntentId: paymentIntent.id,
    });

    // TODO: Send payment failed notification to customer
  } catch (error) {
    logger.error({
      message: 'Error handling payment failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      paymentIntentId: paymentIntent.id,
    });
  }
}

/**
 * Handle canceled payment
 */
async function handlePaymentCanceled(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  try {
    const bookingId = paymentIntent.metadata.bookingId;

    if (!bookingId) {
      return;
    }

    logger.info({
      message: 'Payment canceled',
      bookingId,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    logger.error({
      message: 'Error handling payment canceled',
      error: error instanceof Error ? error.message : 'Unknown error',
      paymentIntentId: paymentIntent.id,
    });
  }
}

/**
 * Handle charge refunded
 */
async function handleChargeRefunded(charge: Stripe.Charge): Promise<void> {
  try {
    const paymentIntentId = charge.payment_intent as string;

    if (!paymentIntentId) {
      return;
    }

    // Get booking from payment intent
    const booking = await bookingsRepository.findByPaymentIntentId(paymentIntentId);

    if (!booking) {
      logger.error({
        message: 'Refund processed but booking not found',
        paymentIntentId,
      });
      return;
    }

    logger.info({
      message: 'Charge refunded',
      bookingId: booking.id,
      chargeId: charge.id,
      amount: charge.amount_refunded / 100,
    });

    // TODO: Send refund confirmation email
    // TODO: Update booking status if needed
  } catch (error) {
    logger.error({
      message: 'Error handling charge refunded',
      error: error instanceof Error ? error.message : 'Unknown error',
      chargeId: charge.id,
    });
  }
}

/**
 * Refund a payment (admin only)
 * POST /api/payment/refund
 */
export async function refundPayment(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Authentication required');
    }

    // Only admins can refund
    if (req.user.role !== 'ADMIN') {
      throw new ApiError(403, 'Only admins can process refunds');
    }

    const { paymentIntentId, amount, reason } = req.body;

    if (!paymentIntentId) {
      throw new ApiError(400, 'Payment intent ID is required');
    }

    // Process refund
    const refund = await paymentService.refundPayment({
      paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined, // Convert to cents
      reason,
    });

    res.status(200).json({
      success: true,
      data: {
        refundId: refund.id,
        amount: refund.amount / 100,
        status: refund.status,
      },
      message: 'Refund processed successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Authorize Extension Payment
 * POST /api/payment/authorize-extension
 * Creates a PaymentIntent with manual capture for extension payment authorization
 */
const authorizeExtensionSchema = z.object({
  extensionId: z.string().cuid('Invalid extension ID'),
});

export async function authorizeExtension(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Authentication required');
    }

    // Validate request body
    const { extensionId } = authorizeExtensionSchema.parse(req.body);

    // Get extension with booking details
    const extension = await prisma.extension.findUnique({
      where: { id: extensionId },
      include: {
        booking: {
          include: {
            customer: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!extension) {
      throw new ApiError(404, 'Extension not found');
    }

    // Verify customer owns this booking
    if (extension.booking.customerId !== req.user.userId) {
      throw new ApiError(
        403,
        'You do not have permission to authorize payment for this extension'
      );
    }

    // Check if extension is in pending status
    if (extension.status !== 'PENDING') {
      throw new ApiError(
        400,
        `Extension cannot be paid. Current status: ${extension.status}`
      );
    }

    // Get customer email
    const customerEmail = extension.booking.customer.email;

    // Create PaymentIntent with manual capture
    const paymentIntent = await paymentService.createPaymentIntent({
      amount: extension.totalAmount, // Already in cents
      bookingId: extension.bookingId,
      customerId: req.user.userId,
      customerEmail,
      metadata: {
        bookingNumber: extension.booking.bookingNumber,
        extensionId: extension.id,
        type: 'EXTENSION',
      },
      captureMethod: 'manual', // CRITICAL: Don't charge immediately, just authorize
    });

    logger.info({
      message: 'Payment authorization created for extension',
      extensionId: extension.id,
      bookingId: extension.bookingId,
      paymentIntentId: paymentIntent.id,
      amount: extension.totalAmount / 100,
    });

    res.status(200).json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount / 100,
      },
      message: 'Payment authorization created',
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
 * Capture Extension Payment
 * POST /api/payment/capture-extension
 * Captures an authorized payment for an extension
 */
const captureExtensionSchema = z.object({
  extensionId: z.string(),
});

export async function captureExtension(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { extensionId } = captureExtensionSchema.parse(req.body);

    // Get extension
    const extension = await prisma.extension.findUnique({
      where: { id: extensionId },
      include: { booking: true }
    });

    if (!extension) {
      return res.status(404).json({
        success: false,
        error: { code: 'EXTENSION_NOT_FOUND', message: 'Extension not found' }
      });
    }

    if (extension.status !== 'APPROVED') {
      return res.status(400).json({
        success: false,
        error: { code: 'EXTENSION_NOT_APPROVED', message: 'Extension not approved' }
      });
    }

    if (!extension.paymentIntentId) {
      return res.status(400).json({
        success: false,
        error: { code: 'NO_PAYMENT_INTENT', message: 'No payment intent found' }
      });
    }

    // Capture the payment
    const paymentIntent = await paymentService.capturePayment(
      extension.paymentIntentId
    );

    // Update extension
    await prisma.extension.update({
      where: { id: extensionId },
      data: {
        status: 'COMPLETED',
        paidAt: new Date(),
      }
    });

    logger.info('Extension payment captured', {
      extensionId,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount
    });

    return res.json({
      success: true,
      data: {
        paymentIntent: {
          id: paymentIntent.id,
          amount: paymentIntent.amount,
          status: paymentIntent.status,
        }
      },
      message: 'Payment captured successfully'
    });
  } catch (error) {
    logger.error('Failed to capture extension payment', { error });
    next(error);
  }
}
