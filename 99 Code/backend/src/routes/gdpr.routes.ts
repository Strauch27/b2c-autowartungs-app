/**
 * GDPR Routes
 * Data subject rights endpoints
 */

import { Router } from 'express';
import {
  exportUserData,
  deleteUserData,
  exportPortableData,
  restrictProcessing,
  getComplianceSummary,
} from '../controllers/gdpr.controller';
import { authenticate } from '../middleware/auth';
import { createRateLimiter } from '../utils/rateLimiter';

const router = Router();

// Stricter rate limiting for GDPR endpoints
const gdprLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 requests per hour
  message: 'Too many GDPR requests. Please contact support if you need assistance.',
});

/**
 * All GDPR routes require authentication
 */
router.use(authenticate);

/**
 * GET /api/gdpr/export
 * GDPR Article 15: Right of Access
 * Download all personal data
 */
router.get('/export', gdprLimiter, exportUserData);

/**
 * GET /api/gdpr/portable
 * GDPR Article 20: Right to Data Portability
 * Download data in portable format
 */
router.get('/portable', gdprLimiter, exportPortableData);

/**
 * GET /api/gdpr/summary
 * Get compliance summary (what data is stored, retention policies)
 */
router.get('/summary', getComplianceSummary);

/**
 * POST /api/gdpr/delete
 * GDPR Article 17: Right to Erasure (Right to be Forgotten)
 * Delete all personal data
 *
 * Body:
 * - confirmEmail: string (required) - must match user's email
 * - reason: string (optional) - reason for deletion
 */
router.post('/delete', gdprLimiter, deleteUserData);

/**
 * POST /api/gdpr/restrict
 * GDPR Article 18: Right to Restriction of Processing
 * Restrict processing (e.g., during dispute)
 *
 * Body:
 * - reason: string (required) - reason for restriction
 */
router.post('/restrict', gdprLimiter, restrictProcessing);

export default router;
