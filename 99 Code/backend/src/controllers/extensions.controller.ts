import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { ApiError } from '../middleware/errorHandler';
import { logger } from '../config/logger';

// Validation schemas
const approveExtensionSchema = z.object({
  paymentIntentId: z.string().min(1, 'Payment intent ID is required'),
});

const declineExtensionSchema = z.object({
  reason: z.string().optional(),
});

/**
 * Approve Extension
 * POST /api/extensions/:id/approve
 */
export async function approveExtension(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Authentication required');
    }

    const id = req.params.id as string;
    const { paymentIntentId } = approveExtensionSchema.parse(req.body);

    // Get extension with booking details
    const extension = await prisma.extension.findUnique({
      where: { id },
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
    if ((extension as any).booking.customerId !== req.user.userId as string) {
      throw new ApiError(
        403,
        'You do not have permission to approve this extension'
      );
    }

    // Check if extension is in pending status
    if (extension.status !== 'PENDING') {
      throw new ApiError(
        400,
        `Extension cannot be approved. Current status: ${extension.status}`
      );
    }

    const bookingCustomerId = (extension as any).booking.customerId;
    const bookingNumber = (extension as any).booking.bookingNumber;

    // Update extension status
    const updatedExtension = await prisma.extension.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
        paymentIntentId: paymentIntentId,
      },
    });

    // Update booking total price (add extension amount)
    const extensionAmountInDecimal = extension.totalAmount / 100;
    await prisma.booking.update({
      where: { id: (extension as any).bookingId },
      data: {
        totalPrice: {
          increment: extensionAmountInDecimal,
        },
      },
    });

    // Create notification for workshop
    // Note: In a real implementation, you would get the workshop user ID from the booking
    // For now, we'll create a notification log without a specific user
    await prisma.notificationLog.create({
      data: {
        userId: bookingCustomerId, // Placeholder - should be workshop user
        type: 'SERVICE_EXTENSION',
        status: 'PENDING',
        title: 'Erweiterung genehmigt',
        body: `Der Kunde hat die Auftragserweiterung für Buchung ${bookingNumber} genehmigt (${(extension.totalAmount / 100).toFixed(2)} €)`,
        bookingId: (extension as any).bookingId,
        data: {
          extensionId: extension.id,
          bookingId: (extension as any).bookingId,
          totalAmount: extension.totalAmount,
          paymentIntentId,
        },
      },
    });

    logger.info('Extension approved', {
      extensionId: id,
      bookingId: (extension as any).bookingId,
      customerId: req.user.userId as string,
      totalAmount: extension.totalAmount,
      paymentIntentId,
    });

    res.status(200).json({
      success: true,
      data: {
        extension: updatedExtension,
      },
      message: 'Extension approved successfully',
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
 * Decline Extension
 * POST /api/extensions/:id/decline
 */
export async function declineExtension(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Authentication required');
    }

    const id = req.params.id as string;
    const { reason } = declineExtensionSchema.parse(req.body);

    // Get extension with booking details
    const extension = await prisma.extension.findUnique({
      where: { id },
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
    if ((extension as any).booking.customerId !== req.user.userId as string) {
      throw new ApiError(
        403,
        'You do not have permission to decline this extension'
      );
    }

    // Check if extension is in pending status
    if (extension.status !== 'PENDING') {
      throw new ApiError(
        400,
        `Extension cannot be declined. Current status: ${extension.status}`
      );
    }

    const bookingCustomerId = (extension as any).booking.customerId;
    const bookingNumber = (extension as any).booking.bookingNumber;

    // Update extension status
    const updatedExtension = await prisma.extension.update({
      where: { id },
      data: {
        status: 'DECLINED',
        declinedAt: new Date(),
        declineReason: reason || null,
      },
    });

    // Create notification for workshop
    await prisma.notificationLog.create({
      data: {
        userId: bookingCustomerId, // Placeholder - should be workshop user
        type: 'SERVICE_EXTENSION',
        status: 'PENDING',
        title: 'Erweiterung abgelehnt',
        body: `Der Kunde hat die Auftragserweiterung für Buchung ${bookingNumber} abgelehnt${reason ? `: ${reason}` : ''}`,
        bookingId: (extension as any).bookingId,
        data: {
          extensionId: extension.id,
          bookingId: (extension as any).bookingId,
          declineReason: reason || null,
        },
      },
    });

    logger.info('Extension declined', {
      extensionId: id,
      bookingId: (extension as any).bookingId,
      customerId: req.user.userId as string,
      reason: reason || 'No reason provided',
    });

    res.status(200).json({
      success: true,
      data: {
        extension: updatedExtension,
      },
      message: 'Extension declined successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new ApiError(400, error.errors[0].message));
    } else {
      next(error);
    }
  }
}
