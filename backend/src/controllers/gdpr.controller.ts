/**
 * GDPR Controller
 * Handles data subject rights requests
 */

import { Request, Response, NextFunction } from 'express';
import { GDPRService } from '../services/gdpr.service';
import { prisma } from '../config/database';
import { ApiError } from '../middleware/errorHandler';
import { logger } from '../config/logger';
import { z } from 'zod';

const gdprService = new GDPRService(prisma);

// Validation schemas
const deletionRequestSchema = z.object({
  reason: z
    .string()
    .min(10, 'Please provide a reason (minimum 10 characters)')
    .max(500)
    .optional(),
  confirmEmail: z.string().email('Please confirm your email address'),
});

const restrictionRequestSchema = z.object({
  reason: z.string().min(10, 'Reason is required (minimum 10 characters)').max(500),
});

/**
 * GET /api/gdpr/export
 * GDPR Article 15: Right of Access
 * Export all user data
 */
export async function exportUserData(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Authentication required');
    }

    logger.info('GDPR: Data export request', {
      userId: req.user.userId,
      ip: req.ip,
    });

    const data = await gdprService.exportUserData(req.user.userId);

    // Set headers for file download
    res.setHeader('Content-Type', 'application/json');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="my-data-${new Date().toISOString().split('T')[0]}.json"`
    );

    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/gdpr/delete
 * GDPR Article 17: Right to Erasure
 * Delete all user data
 */
export async function deleteUserData(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Authentication required');
    }

    // Validate request
    const validated = deletionRequestSchema.parse(req.body);

    // Verify email matches
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { email: true },
    });

    if (!user || user.email !== validated.confirmEmail) {
      throw new ApiError(400, 'Email confirmation does not match');
    }

    logger.warn('GDPR: Account deletion request', {
      userId: req.user.userId,
      email: user.email,
      reason: validated.reason,
      ip: req.ip,
    });

    // Check for pending bookings
    const pendingBookings = await prisma.booking.count({
      where: {
        customerId: req.user.userId,
        status: {
          in: [
            'PENDING_PAYMENT',
            'CONFIRMED',
            'JOCKEY_ASSIGNED',
            'IN_TRANSIT_TO_WORKSHOP',
            'IN_WORKSHOP',
            'IN_TRANSIT_TO_CUSTOMER',
          ],
        },
      },
    });

    if (pendingBookings > 0) {
      throw new ApiError(
        400,
        `Cannot delete account with ${pendingBookings} active booking(s). ` +
          'Please complete or cancel all bookings first.'
      );
    }

    // Perform deletion
    const result = await gdprService.deleteUserData(
      req.user.userId,
      validated.reason || 'User requested deletion'
    );

    // Send confirmation email (in production)
    // await emailService.sendAccountDeletionConfirmation(user.email);

    res.status(200).json({
      success: true,
      message: 'Your account and data have been deleted',
      data: result,
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
 * GET /api/gdpr/portable
 * GDPR Article 20: Right to Data Portability
 * Export data in portable JSON format
 */
export async function exportPortableData(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Authentication required');
    }

    const jsonData = await gdprService.exportDataPortable(req.user.userId);

    res.setHeader('Content-Type', 'application/json');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="portable-data-${new Date().toISOString().split('T')[0]}.json"`
    );

    res.status(200).send(jsonData);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/gdpr/restrict
 * GDPR Article 18: Right to Restriction of Processing
 * Restrict processing of user data
 */
export async function restrictProcessing(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Authentication required');
    }

    const validated = restrictionRequestSchema.parse(req.body);

    logger.info('GDPR: Processing restriction request', {
      userId: req.user.userId,
      reason: validated.reason,
    });

    const result = await gdprService.restrictProcessing(
      req.user.userId,
      validated.reason
    );

    res.status(200).json({
      success: true,
      message: 'Processing has been restricted. You will not receive any communications.',
      data: result,
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
 * GET /api/gdpr/summary
 * Get GDPR compliance summary
 */
export async function getComplianceSummary(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Authentication required');
    }

    const summary = await gdprService.getComplianceSummary(req.user.userId);

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
}
