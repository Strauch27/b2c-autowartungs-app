/**
 * Notifications Controller
 * Handles notification-related HTTP requests
 */

import { Request, Response } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import {
  sendNotification,
  updateFCMToken,
  removeFCMToken,
  subscribeToTopic,
  unsubscribeFromTopic,
} from '../services/notification.service';
import { logger } from '../config/logger';

const prisma = new PrismaClient();

// ============================================================================
// Validation Schemas
// ============================================================================

const registerTokenSchema = z.object({
  fcmToken: z.string().min(1, 'FCM token is required'),
});

const sendNotificationSchema = z.object({
  userId: z.string().cuid('Invalid user ID'),
  type: z.enum([
    'BOOKING_CONFIRMATION',
    'STATUS_UPDATE',
    'PICKUP_REMINDER',
    'IN_WORKSHOP',
    'SERVICE_COMPLETE',
    'DELIVERY_REMINDER',
    'DELIVERED',
    'PAYMENT_CONFIRMATION',
    'SERVICE_EXTENSION',
    'GENERAL',
  ]),
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  body: z.string().min(1, 'Body is required').max(500, 'Body too long'),
  data: z.record(z.any()).optional(),
  bookingId: z.string().cuid('Invalid booking ID').optional(),
});

const subscribeTopicSchema = z.object({
  topic: z.string().min(1, 'Topic is required'),
});

// ============================================================================
// Controller Functions
// ============================================================================

/**
 * Register FCM token for current user
 * POST /api/notifications/register-token
 */
export const registerToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req.user as any)?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    // Validate request body
    const validation = registerTokenSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: 'Invalid request data',
        errors: validation.error.errors,
      });
      return;
    }

    const { fcmToken } = validation.data;

    // Update user's FCM token
    await updateFCMToken(userId, fcmToken);

    res.status(200).json({
      success: true,
      message: 'FCM token registered successfully',
    });
  } catch (error: any) {
    logger.error('Error registering FCM token:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register FCM token',
      error: error.message,
    });
  }
};

/**
 * Unregister FCM token for current user
 * DELETE /api/notifications/register-token
 */
export const unregisterToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req.user as any)?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    // Remove user's FCM token
    await removeFCMToken(userId);

    res.status(200).json({
      success: true,
      message: 'FCM token unregistered successfully',
    });
  } catch (error: any) {
    logger.error('Error unregistering FCM token:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unregister FCM token',
      error: error.message,
    });
  }
};

/**
 * Send push notification (Admin only)
 * POST /api/notifications/send
 */
export const sendPushNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const currentUser = req.user;

    // Check if user is admin
    if (!currentUser || currentUser.role !== 'ADMIN') {
      res.status(403).json({
        success: false,
        message: 'Forbidden: Admin access required',
      });
      return;
    }

    // Validate request body
    const validation = sendNotificationSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: 'Invalid request data',
        errors: validation.error.errors,
      });
      return;
    }

    const { userId, type, title, body, data, bookingId } = validation.data;

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Send notification
    await sendNotification({
      userId,
      type: type as any,
      title,
      body,
      data,
      bookingId,
    });

    res.status(200).json({
      success: true,
      message: 'Notification sent successfully',
    });
  } catch (error: any) {
    logger.error('Error sending push notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send notification',
      error: error.message,
    });
  }
};

/**
 * Get notification history for current user
 * GET /api/notifications/history
 */
export const getNotificationHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req.user as any)?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    // Parse query parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // Get notification logs
    const [notifications, total] = await Promise.all([
      prisma.notificationLog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          type: true,
          title: true,
          body: true,
          data: true,
          status: true,
          sentAt: true,
          readAt: true,
          createdAt: true,
          bookingId: true,
        },
      }),
      prisma.notificationLog.count({
        where: { userId },
      }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        notifications,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error: any) {
    logger.error('Error fetching notification history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notification history',
      error: error.message,
    });
  }
};

/**
 * Mark notification as read
 * PATCH /api/notifications/:id/read
 */
export const markAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req.user as any)?.id;
    const notificationId = req.params.id as string;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    // Verify notification belongs to user
    const notification = await prisma.notificationLog.findFirst({
      where: {
        id: notificationId,
        userId,
      },
    });

    if (!notification) {
      res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
      return;
    }

    // Update notification
    await prisma.notificationLog.update({
      where: { id: notificationId },
      data: {
        readAt: new Date(),
      },
    });

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
    });
  } catch (error: any) {
    logger.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message,
    });
  }
};

/**
 * Mark all notifications as read
 * PATCH /api/notifications/read-all
 */
export const markAllAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req.user as any)?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    // Update all unread notifications
    await prisma.notificationLog.updateMany({
      where: {
        userId,
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error: any) {
    logger.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
      error: error.message,
    });
  }
};

/**
 * Get unread notification count
 * GET /api/notifications/unread-count
 */
export const getUnreadCount = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req.user as any)?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    // Count unread notifications
    const count = await prisma.notificationLog.count({
      where: {
        userId,
        readAt: null,
      },
    });

    res.status(200).json({
      success: true,
      data: { count },
    });
  } catch (error: any) {
    logger.error('Error fetching unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch unread count',
      error: error.message,
    });
  }
};

/**
 * Subscribe to topic
 * POST /api/notifications/topics/subscribe
 */
export const subscribeToTopicHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req.user as any)?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    // Validate request body
    const validation = subscribeTopicSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: 'Invalid request data',
        errors: validation.error.errors,
      });
      return;
    }

    const { topic } = validation.data;

    // Get user's FCM token
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { fcmToken: true },
    });

    if (!user?.fcmToken) {
      res.status(400).json({
        success: false,
        message: 'No FCM token registered',
      });
      return;
    }

    // Subscribe to topic
    await subscribeToTopic(user.fcmToken, topic);

    res.status(200).json({
      success: true,
      message: `Subscribed to topic: ${topic}`,
    });
  } catch (error: any) {
    logger.error('Error subscribing to topic:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to subscribe to topic',
      error: error.message,
    });
  }
};

/**
 * Unsubscribe from topic
 * POST /api/notifications/topics/unsubscribe
 */
export const unsubscribeFromTopicHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req.user as any)?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    // Validate request body
    const validation = subscribeTopicSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: 'Invalid request data',
        errors: validation.error.errors,
      });
      return;
    }

    const { topic } = validation.data;

    // Get user's FCM token
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { fcmToken: true },
    });

    if (!user?.fcmToken) {
      res.status(400).json({
        success: false,
        message: 'No FCM token registered',
      });
      return;
    }

    // Unsubscribe from topic
    await unsubscribeFromTopic(user.fcmToken, topic);

    res.status(200).json({
      success: true,
      message: `Unsubscribed from topic: ${topic}`,
    });
  } catch (error: any) {
    logger.error('Error unsubscribing from topic:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unsubscribe from topic',
      error: error.message,
    });
  }
};
