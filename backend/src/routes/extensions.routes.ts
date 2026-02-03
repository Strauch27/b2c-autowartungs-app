import { Router } from 'express';
import {
  approveExtension,
  declineExtension,
} from '../controllers/extensions.controller';
import { authenticate } from '../middleware/auth';
import { createRateLimiter } from '../utils/rateLimiter';

const router = Router();

// Rate limiter for extension operations
const extensionLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per window
  message: 'Too many extension requests, please try again later',
});

/**
 * @route   POST /api/extensions/:id/approve
 * @desc    Approve an extension with payment authorization
 * @access  Private (Customer)
 */
router.post('/:id/approve', authenticate, extensionLimiter, approveExtension);

/**
 * @route   POST /api/extensions/:id/decline
 * @desc    Decline an extension with optional reason
 * @access  Private (Customer)
 */
router.post('/:id/decline', authenticate, extensionLimiter, declineExtension);

export default router;
