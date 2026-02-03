import { Router } from 'express';
import {
  createPaymentIntent,
  getPaymentStatus,
  handleWebhook,
  refundPayment,
  authorizeExtension,
  captureExtension,
} from '../controllers/payment.controller';
import { authenticate } from '../middleware/auth';
import { createRateLimiter } from '../utils/rateLimiter';

const router = Router();

// Rate limiters
const paymentLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per window
  message: 'Too many payment requests, please try again later',
});

const webhookLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute (Stripe can send many webhooks)
  message: 'Too many webhook requests',
});

/**
 * @route   POST /api/payment/create-intent
 * @desc    Create a payment intent for a booking
 * @access  Private (Customer)
 */
router.post('/create-intent', authenticate, paymentLimiter, createPaymentIntent);

/**
 * @route   GET /api/payment/status/:paymentIntentId
 * @desc    Get payment status
 * @access  Private (Customer)
 */
router.get('/status/:paymentIntentId', authenticate, getPaymentStatus);

/**
 * @route   POST /api/payment/webhook
 * @desc    Handle Stripe webhook events
 * @access  Public (Stripe only - verified by signature)
 * @note    This endpoint receives raw body (not JSON parsed)
 */
router.post('/webhook', webhookLimiter, handleWebhook);

/**
 * @route   POST /api/payment/refund
 * @desc    Process a refund (admin only)
 * @access  Private (Admin)
 */
router.post('/refund', authenticate, paymentLimiter, refundPayment);

/**
 * @route   POST /api/payment/authorize-extension
 * @desc    Create payment authorization for extension (manual capture)
 * @access  Private (Customer)
 */
router.post('/authorize-extension', authenticate, paymentLimiter, authorizeExtension);

/**
 * @route   POST /api/payment/capture-extension
 * @desc    Capture authorized payment for extension
 * @access  Private (Authenticated)
 */
router.post('/capture-extension', authenticate, paymentLimiter, captureExtension);

export default router;
