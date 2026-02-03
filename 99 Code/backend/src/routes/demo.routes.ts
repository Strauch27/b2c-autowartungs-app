/**
 * Demo Routes
 *
 * These routes are only available when DEMO_MODE=true
 * They allow simulating payment confirmations and other actions
 * that would normally be handled by external services.
 */

import { Router } from 'express';
import {
  confirmBookingPayment,
  authorizeExtensionPayment,
  captureExtensionPayment,
  declineExtensionPayment,
  getPaymentStatus
} from '../controllers/demo.controller';

const router = Router();

/**
 * POST /api/demo/payment/confirm
 * Confirm a booking payment (simulates Stripe webhook)
 * Body:
 * - paymentIntentId: string (required)
 * - bookingId: string (required)
 */
router.post('/payment/confirm', confirmBookingPayment);

/**
 * POST /api/demo/extension/authorize
 * Authorize an extension payment (simulates customer approval)
 * Body:
 * - extensionId: string (required)
 * - bookingId: string (required)
 */
router.post('/extension/authorize', authorizeExtensionPayment);

/**
 * POST /api/demo/extension/capture
 * Capture an extension payment (simulates workshop completing work)
 * Body:
 * - paymentIntentId: string (required)
 * - extensionId: string (required)
 */
router.post('/extension/capture', captureExtensionPayment);

/**
 * POST /api/demo/extension/decline
 * Decline an extension (simulates customer declining)
 * Body:
 * - extensionId: string (required)
 * - reason: string (optional)
 */
router.post('/extension/decline', declineExtensionPayment);

/**
 * GET /api/demo/payment/:paymentIntentId
 * Get payment intent status (for debugging)
 */
router.get('/payment/:paymentIntentId', getPaymentStatus);

export default router;
