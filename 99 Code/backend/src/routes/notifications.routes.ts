/**
 * Notification Routes
 * Defines all notification-related endpoints
 */

import { Router } from 'express';
import {
  registerToken,
  unregisterToken,
  sendPushNotification,
  getNotificationHistory,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  subscribeToTopicHandler,
  unsubscribeFromTopicHandler,
} from '../controllers/notifications.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All notification routes require authentication
router.use(authenticate);

/**
 * FCM Token Management
 */

// Register FCM token for push notifications
// POST /api/notifications/register-token
router.post('/register-token', registerToken);

// Unregister FCM token
// DELETE /api/notifications/register-token
router.delete('/register-token', unregisterToken);

/**
 * Send Notifications (Admin only)
 */

// Send push notification to specific user
// POST /api/notifications/send
router.post('/send', sendPushNotification);

/**
 * Notification History
 */

// Get notification history for current user
// GET /api/notifications/history
router.get('/history', getNotificationHistory);

// Get unread notification count
// GET /api/notifications/unread-count
router.get('/unread-count', getUnreadCount);

// Mark specific notification as read
// PATCH /api/notifications/:id/read
router.patch('/:id/read', markAsRead);

// Mark all notifications as read
// PATCH /api/notifications/read-all
router.patch('/read-all', markAllAsRead);

/**
 * Topic Subscription
 */

// Subscribe to notification topic
// POST /api/notifications/topics/subscribe
router.post('/topics/subscribe', subscribeToTopicHandler);

// Unsubscribe from notification topic
// POST /api/notifications/topics/unsubscribe
router.post('/topics/unsubscribe', unsubscribeFromTopicHandler);

export default router;
