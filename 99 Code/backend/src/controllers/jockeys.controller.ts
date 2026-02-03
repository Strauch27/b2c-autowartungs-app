/**
 * Jockeys Controller
 * Handles all jockey-related operations including assignment management
 */

import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { logger } from '../config/logger';
import { z } from 'zod';
import { AssignmentStatus, BookingStatus } from '@prisma/client';
import { assertTransition, Actor } from '../domain/bookingFsm';

// Validation schemas
const updateStatusSchema = z.object({
  status: z.enum(['ASSIGNED', 'EN_ROUTE', 'AT_LOCATION', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
});

const handoverSchema = z.object({
  photos: z.array(z.string()).optional(),
  customerSignature: z.string().optional(),
  ronjaSignature: z.string().optional(),
  notes: z.string().optional(),
});

const completeSchema = z.object({
  handoverData: z.object({
    photos: z.array(z.string()).optional(),
    customerSignature: z.string().optional(),
    ronjaSignature: z.string().optional(),
    notes: z.string().optional(),
  }).optional(),
});

/**
 * Get all assignments for logged-in jockey
 * GET /api/jockeys/assignments
 */
export async function getAssignments(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      });
      return;
    }

    const jockeyId = req.user.userId;

    // Get query params
    const { status, limit = '50' } = req.query;

    const where: any = { jockeyId };

    if (status && status !== 'all') {
      where.status = status;
    }

    const assignments = await prisma.jockeyAssignment.findMany({
      where,
      include: {
        booking: {
          include: {
            customer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true,
                email: true,
              }
            },
            vehicle: {
              select: {
                id: true,
                brand: true,
                model: true,
                licensePlate: true,
                year: true,
                mileage: true,
              }
            }
          }
        }
      },
      orderBy: [
        { scheduledTime: 'asc' },
        { createdAt: 'desc' }
      ],
      take: parseInt(limit as string),
    });

    logger.info('Jockey assignments fetched', {
      jockeyId,
      count: assignments.length
    });

    res.json({
      success: true,
      data: { assignments }
    });
  } catch (error) {
    logger.error('Failed to fetch jockey assignments:', error);
    next(error);
  }
}

/**
 * Get single assignment details
 * GET /api/jockeys/assignments/:id
 */
export async function getAssignment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      });
      return;
    }

    const { id } = req.params;
    const jockeyId = req.user.userId;

    const assignment = await prisma.jockeyAssignment.findFirst({
      where: {
        id,
        jockeyId, // Ensure jockey can only see their own assignments
      },
      include: {
        booking: {
          include: {
            customer: true,
            vehicle: true,
          }
        }
      }
    });

    if (!assignment) {
      res.status(404).json({
        success: false,
        error: { code: 'ASSIGNMENT_NOT_FOUND', message: 'Assignment not found' }
      });
      return;
    }

    res.json({
      success: true,
      data: { assignment }
    });
  } catch (error) {
    logger.error('Failed to fetch assignment:', error);
    next(error);
  }
}

/**
 * Update assignment status
 * PATCH /api/jockeys/assignments/:id/status
 */
export async function updateAssignmentStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      });
      return;
    }

    const { id } = req.params;
    const jockeyId = req.user.userId;
    const { status } = updateStatusSchema.parse(req.body);

    // Verify ownership
    const assignment = await prisma.jockeyAssignment.findFirst({
      where: { id, jockeyId }
    });

    if (!assignment) {
      res.status(404).json({
        success: false,
        error: { code: 'ASSIGNMENT_NOT_FOUND', message: 'Assignment not found' }
      });
      return;
    }

    // Update assignment
    const updateData: any = { status };

    // Set timestamps based on status
    if (status === 'AT_LOCATION' && !assignment.arrivedAt) {
      updateData.arrivedAt = new Date();
    }
    if (status === 'COMPLETED' && !assignment.completedAt) {
      updateData.completedAt = new Date();
      updateData.departedAt = assignment.departedAt || new Date();
    }

    const updatedAssignment = await prisma.jockeyAssignment.update({
      where: { id },
      data: updateData,
    });

    // Update booking status based on assignment type and status (FSM-aware)
    // FSM Flow:
    // - PICKUP: PICKUP_ASSIGNED -> (EN_ROUTE) -> (AT_LOCATION) -> PICKED_UP -> AT_WORKSHOP
    // - RETURN: RETURN_ASSIGNED -> (EN_ROUTE) -> (AT_LOCATION) -> RETURNED
    if (status === 'COMPLETED') {
      // Get current booking to validate FSM transition
      const currentBooking = await prisma.booking.findUnique({
        where: { id: assignment.bookingId },
        select: { status: true }
      });

      if (!currentBooking) {
        logger.error('Booking not found for assignment', {
          assignmentId: id,
          bookingId: assignment.bookingId
        });
        res.json({
          success: true,
          data: { assignment: updatedAssignment }
        });
        return;
      }

      // Determine target booking status based on assignment type
      const targetStatus: BookingStatus = assignment.type === 'PICKUP'
        ? BookingStatus.PICKED_UP  // Vehicle picked up, in transit to workshop
        : BookingStatus.RETURNED;  // Vehicle returned to customer

      // Validate FSM transition before updating
      try {
        assertTransition(currentBooking.status, targetStatus, Actor.JOCKEY);

        await prisma.booking.update({
          where: { id: assignment.bookingId },
          data: { status: targetStatus }
        });

        logger.info('Assignment completed, booking status updated', {
          assignmentId: id,
          bookingId: assignment.bookingId,
          assignmentType: assignment.type,
          oldStatus: currentBooking.status,
          newStatus: targetStatus
        });
      } catch (fsmError: any) {
        // Log FSM violation but don't fail the assignment update
        logger.warn('FSM transition not allowed for booking status update', {
          assignmentId: id,
          bookingId: assignment.bookingId,
          currentStatus: currentBooking.status,
          targetStatus,
          error: fsmError.message
        });
      }
    }

    res.json({
      success: true,
      data: { assignment: updatedAssignment }
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

    logger.error('Failed to update assignment status:', error);
    next(error);
  }
}

/**
 * Save handover data (photos, signatures, notes)
 * POST /api/jockeys/assignments/:id/handover
 */
export async function saveHandoverData(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      });
      return;
    }

    const { id } = req.params;
    const jockeyId = req.user.userId;
    const handoverData = handoverSchema.parse(req.body);

    // Verify ownership
    const assignment = await prisma.jockeyAssignment.findFirst({
      where: { id, jockeyId }
    });

    if (!assignment) {
      res.status(404).json({
        success: false,
        error: { code: 'ASSIGNMENT_NOT_FOUND', message: 'Assignment not found' }
      });
      return;
    }

    // Merge with existing handover data
    const existingData = (assignment.handoverData as any) || {};
    const mergedData = {
      ...existingData,
      ...handoverData,
    };

    const updatedAssignment = await prisma.jockeyAssignment.update({
      where: { id },
      data: {
        handoverData: mergedData,
      },
    });

    logger.info('Handover data saved', {
      assignmentId: id,
      jockeyId
    });

    res.json({
      success: true,
      data: { assignment: updatedAssignment }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid handover data',
          details: error.errors
        }
      });
      return;
    }

    logger.error('Failed to save handover data:', error);
    next(error);
  }
}

/**
 * Complete assignment (shortcut for status + handover)
 * POST /api/jockeys/assignments/:id/complete
 */
export async function completeAssignment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      });
      return;
    }

    const { id } = req.params;
    const jockeyId = req.user.userId;
    const { handoverData } = completeSchema.parse(req.body);

    // Verify ownership
    const assignment = await prisma.jockeyAssignment.findFirst({
      where: { id, jockeyId }
    });

    if (!assignment) {
      res.status(404).json({
        success: false,
        error: { code: 'ASSIGNMENT_NOT_FOUND', message: 'Assignment not found' }
      });
      return;
    }

    // Merge handover data if provided
    let finalHandoverData = assignment.handoverData;
    if (handoverData) {
      const existingData = (assignment.handoverData as any) || {};
      finalHandoverData = {
        ...existingData,
        ...handoverData,
      };
    }

    // Update assignment
    const updatedAssignment = await prisma.jockeyAssignment.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        departedAt: assignment.departedAt || new Date(),
        handoverData: finalHandoverData,
      },
    });

    // Update booking status using new FSM statuses
    const bookingStatus: BookingStatus = assignment.type === 'PICKUP'
      ? BookingStatus.PICKED_UP
      : BookingStatus.RETURNED;

    await prisma.booking.update({
      where: { id: assignment.bookingId },
      data: { status: bookingStatus }
    });

    logger.info('Assignment completed', {
      assignmentId: id,
      bookingId: assignment.bookingId,
      type: assignment.type,
      newBookingStatus: bookingStatus
    });

    res.json({
      success: true,
      data: { assignment: updatedAssignment },
      message: 'Assignment completed successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid completion data',
          details: error.errors
        }
      });
      return;
    }

    logger.error('Failed to complete assignment:', error);
    next(error);
  }
}
