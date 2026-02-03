/**
 * Notification Service
 * Handles push notifications via Firebase Cloud Messaging (FCM)
 */

import { PrismaClient, NotificationType, NotificationStatus } from '@prisma/client';
import { getMessaging, isFirebaseConfigured } from '../config/firebase';
import { logger } from '../config/logger';

const prisma = new PrismaClient();

interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

interface SendNotificationOptions {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, any>;
  bookingId?: string;
}

/**
 * Send push notification to a specific user
 */
export const sendNotification = async (options: SendNotificationOptions): Promise<void> => {
  const { userId, type, title, body, data, bookingId } = options;

  try {
    // Create notification log entry
    const notificationLog = await prisma.notificationLog.create({
      data: {
        userId,
        bookingId,
        type,
        title,
        body,
        data: data || {},
        status: NotificationStatus.PENDING,
      },
    });

    // Check if Firebase is configured
    if (!isFirebaseConfigured()) {
      logger.warn('Firebase not configured. Skipping push notification.');
      await prisma.notificationLog.update({
        where: { id: notificationLog.id },
        data: {
          status: NotificationStatus.FAILED,
          errorMessage: 'Firebase not configured',
        },
      });
      return;
    }

    // Get user's FCM token
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { fcmToken: true },
    });

    if (!user?.fcmToken) {
      logger.info(`User ${userId} has no FCM token. Skipping push notification.`);
      await prisma.notificationLog.update({
        where: { id: notificationLog.id },
        data: {
          status: NotificationStatus.FAILED,
          errorMessage: 'No FCM token registered',
        },
      });
      return;
    }

    // Convert data to string values (FCM requirement)
    const stringData: Record<string, string> = {};
    if (data) {
      Object.keys(data).forEach((key) => {
        stringData[key] = String(data[key]);
      });
    }

    // Send push notification
    const message = {
      token: user.fcmToken,
      notification: {
        title,
        body,
      },
      data: {
        type,
        notificationId: notificationLog.id,
        ...stringData,
      },
      android: {
        priority: 'high' as const,
        notification: {
          sound: 'default',
          channelId: 'booking_updates',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
    };

    const messaging = getMessaging();
    const response = await messaging.send(message);

    // Update notification log
    await prisma.notificationLog.update({
      where: { id: notificationLog.id },
      data: {
        status: NotificationStatus.SENT,
        fcmMessageId: response,
        sentAt: new Date(),
      },
    });

    logger.info(`Push notification sent to user ${userId}: ${response}`);
  } catch (error: any) {
    logger.error('Error sending push notification:', error);

    // Update notification log with error
    await prisma.notificationLog.updateMany({
      where: {
        userId,
        status: NotificationStatus.PENDING,
        createdAt: {
          gte: new Date(Date.now() - 10000), // Last 10 seconds
        },
      },
      data: {
        status: NotificationStatus.FAILED,
        errorMessage: error.message || 'Unknown error',
      },
    });

    throw error;
  }
};

/**
 * Send push notification to a specific device token
 */
export const sendToDevice = async (
  token: string,
  notification: NotificationPayload
): Promise<string> => {
  try {
    if (!isFirebaseConfigured()) {
      throw new Error('Firebase not configured');
    }

    const message = {
      token,
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: notification.data || {},
    };

    const messaging = getMessaging();
    const response = await messaging.send(message);

    logger.info(`Push notification sent to device: ${response}`);
    return response;
  } catch (error) {
    logger.error('Error sending push notification to device:', error);
    throw error;
  }
};

/**
 * Send push notification to a topic
 */
export const sendToTopic = async (
  topic: string,
  notification: NotificationPayload
): Promise<string> => {
  try {
    if (!isFirebaseConfigured()) {
      throw new Error('Firebase not configured');
    }

    const message = {
      topic,
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: notification.data || {},
    };

    const messaging = getMessaging();
    const response = await messaging.send(message);

    logger.info(`Push notification sent to topic ${topic}: ${response}`);
    return response;
  } catch (error) {
    logger.error(`Error sending push notification to topic ${topic}:`, error);
    throw error;
  }
};

/**
 * Subscribe device token to a topic
 */
export const subscribeToTopic = async (
  token: string,
  topic: string
): Promise<void> => {
  try {
    if (!isFirebaseConfigured()) {
      throw new Error('Firebase not configured');
    }

    const messaging = getMessaging();
    await messaging.subscribeToTopic([token], topic);

    logger.info(`Device subscribed to topic: ${topic}`);
  } catch (error) {
    logger.error(`Error subscribing to topic ${topic}:`, error);
    throw error;
  }
};

/**
 * Unsubscribe device token from a topic
 */
export const unsubscribeFromTopic = async (
  token: string,
  topic: string
): Promise<void> => {
  try {
    if (!isFirebaseConfigured()) {
      throw new Error('Firebase not configured');
    }

    const messaging = getMessaging();
    await messaging.unsubscribeFromTopic([token], topic);

    logger.info(`Device unsubscribed from topic: ${topic}`);
  } catch (error) {
    logger.error(`Error unsubscribing from topic ${topic}:`, error);
    throw error;
  }
};

/**
 * Update user's FCM token
 */
export const updateFCMToken = async (
  userId: string,
  fcmToken: string
): Promise<void> => {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { fcmToken },
    });

    logger.info(`FCM token updated for user ${userId}`);
  } catch (error) {
    logger.error(`Error updating FCM token for user ${userId}:`, error);
    throw error;
  }
};

/**
 * Remove user's FCM token
 */
export const removeFCMToken = async (userId: string): Promise<void> => {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { fcmToken: null },
    });

    logger.info(`FCM token removed for user ${userId}`);
  } catch (error) {
    logger.error(`Error removing FCM token for user ${userId}:`, error);
    throw error;
  }
};

// ============================================================================
// Notification Templates for Different Booking Events
// ============================================================================

/**
 * Send booking confirmation notification
 */
export const sendBookingConfirmation = async (
  userId: string,
  bookingId: string,
  bookingNumber: string,
  pickupDate: Date
): Promise<void> => {
  const formattedDate = pickupDate.toLocaleDateString('de-DE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  await sendNotification({
    userId,
    bookingId,
    type: NotificationType.BOOKING_CONFIRMATION,
    title: 'Buchung bestätigt',
    body: `Ihre Buchung ${bookingNumber} wurde bestätigt. Abholtermin: ${formattedDate}`,
    data: {
      bookingId,
      bookingNumber,
      pickupDate: pickupDate.toISOString(),
    },
  });
};

/**
 * Send jockey assigned notification
 */
export const sendJockeyAssigned = async (
  userId: string,
  bookingId: string,
  bookingNumber: string,
  jockeyName: string
): Promise<void> => {
  await sendNotification({
    userId,
    bookingId,
    type: NotificationType.STATUS_UPDATE,
    title: 'Fahrer zugewiesen',
    body: `${jockeyName} wurde Ihrer Buchung ${bookingNumber} zugewiesen.`,
    data: {
      bookingId,
      bookingNumber,
      jockeyName,
    },
  });
};

/**
 * Send pickup reminder notification
 */
export const sendPickupReminder = async (
  userId: string,
  bookingId: string,
  bookingNumber: string,
  pickupTime: string
): Promise<void> => {
  await sendNotification({
    userId,
    bookingId,
    type: NotificationType.PICKUP_REMINDER,
    title: 'Erinnerung: Abholung heute',
    body: `Ihr Fahrzeug wird heute um ${pickupTime} abgeholt. Buchung: ${bookingNumber}`,
    data: {
      bookingId,
      bookingNumber,
      pickupTime,
    },
  });
};

/**
 * Send vehicle in transit to workshop notification
 */
export const sendInTransitToWorkshop = async (
  userId: string,
  bookingId: string,
  bookingNumber: string
): Promise<void> => {
  await sendNotification({
    userId,
    bookingId,
    type: NotificationType.STATUS_UPDATE,
    title: 'Fahrzeug unterwegs',
    body: `Ihr Fahrzeug ist auf dem Weg zur Werkstatt. Buchung: ${bookingNumber}`,
    data: {
      bookingId,
      bookingNumber,
    },
  });
};

/**
 * Send vehicle in workshop notification
 */
export const sendInWorkshop = async (
  userId: string,
  bookingId: string,
  bookingNumber: string
): Promise<void> => {
  await sendNotification({
    userId,
    bookingId,
    type: NotificationType.IN_WORKSHOP,
    title: 'Wartung gestartet',
    body: `Ihr Fahrzeug wird jetzt gewartet. Buchung: ${bookingNumber}`,
    data: {
      bookingId,
      bookingNumber,
    },
  });
};

/**
 * Send service complete notification
 */
export const sendServiceComplete = async (
  userId: string,
  bookingId: string,
  bookingNumber: string
): Promise<void> => {
  await sendNotification({
    userId,
    bookingId,
    type: NotificationType.SERVICE_COMPLETE,
    title: 'Wartung abgeschlossen',
    body: `Die Wartung Ihres Fahrzeugs ist abgeschlossen. Buchung: ${bookingNumber}`,
    data: {
      bookingId,
      bookingNumber,
    },
  });
};

/**
 * Send vehicle in transit to customer notification
 */
export const sendInTransitToCustomer = async (
  userId: string,
  bookingId: string,
  bookingNumber: string,
  estimatedArrival: Date
): Promise<void> => {
  const formattedTime = estimatedArrival.toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
  });

  await sendNotification({
    userId,
    bookingId,
    type: NotificationType.DELIVERY_REMINDER,
    title: 'Fahrzeug unterwegs zu Ihnen',
    body: `Ihr Fahrzeug ist auf dem Weg zu Ihnen. Voraussichtliche Ankunft: ${formattedTime}`,
    data: {
      bookingId,
      bookingNumber,
      estimatedArrival: estimatedArrival.toISOString(),
    },
  });
};

/**
 * Send vehicle delivered notification
 */
export const sendVehicleDelivered = async (
  userId: string,
  bookingId: string,
  bookingNumber: string
): Promise<void> => {
  await sendNotification({
    userId,
    bookingId,
    type: NotificationType.DELIVERED,
    title: 'Fahrzeug zugestellt',
    body: `Ihr Fahrzeug wurde erfolgreich zugestellt. Buchung: ${bookingNumber}`,
    data: {
      bookingId,
      bookingNumber,
    },
  });
};

/**
 * Send payment confirmation notification
 */
export const sendPaymentConfirmation = async (
  userId: string,
  bookingId: string,
  bookingNumber: string,
  amount: number
): Promise<void> => {
  await sendNotification({
    userId,
    bookingId,
    type: NotificationType.PAYMENT_CONFIRMATION,
    title: 'Zahlung bestätigt',
    body: `Ihre Zahlung von ${amount.toFixed(2)}€ wurde bestätigt. Buchung: ${bookingNumber}`,
    data: {
      bookingId,
      bookingNumber,
      amount: amount.toString(),
    },
  });
};

/**
 * Send service extension notification
 */
export const sendServiceExtension = async (
  userId: string,
  bookingId: string,
  bookingNumber: string,
  additionalServices: string,
  additionalCost: number
): Promise<void> => {
  await sendNotification({
    userId,
    bookingId,
    type: NotificationType.SERVICE_EXTENSION,
    title: 'Zusätzliche Arbeiten erforderlich',
    body: `${additionalServices} - Zusatzkosten: ${additionalCost.toFixed(2)}€. Buchung: ${bookingNumber}`,
    data: {
      bookingId,
      bookingNumber,
      additionalServices,
      additionalCost: additionalCost.toString(),
    },
  });
};
