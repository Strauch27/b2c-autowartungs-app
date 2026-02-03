/**
 * Firebase Cloud Messaging Service
 * Handles push notification registration and handling
 */

import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';
import { getFirebaseApp, isFirebaseConfigured } from './config';

let messaging: Messaging | null = null;

/**
 * Initialize Firebase Messaging
 * Only works in browser environment
 */
export const initializeMessaging = (): Messaging | null => {
  if (typeof window === 'undefined') {
    console.warn('Firebase Messaging can only be initialized in browser');
    return null;
  }

  if (!isFirebaseConfigured()) {
    console.warn('Firebase not configured. Push notifications disabled.');
    return null;
  }

  if (!messaging) {
    try {
      const app = getFirebaseApp();
      messaging = getMessaging(app);
    } catch (error) {
      console.error('Failed to initialize Firebase Messaging:', error);
      return null;
    }
  }

  return messaging;
};

/**
 * Request notification permission from user
 */
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    console.warn('Notifications not supported in this browser');
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return 'denied';
  }
};

/**
 * Get FCM token for push notifications
 */
export const getFCMToken = async (): Promise<string | null> => {
  if (typeof window === 'undefined') {
    return null;
  }

  const messagingInstance = initializeMessaging();
  if (!messagingInstance) {
    return null;
  }

  try {
    // Check if permission is granted
    if (Notification.permission !== 'granted') {
      console.warn('Notification permission not granted');
      return null;
    }

    // Get VAPID key from environment
    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    if (!vapidKey) {
      console.error('VAPID key not configured');
      return null;
    }

    // Get FCM token
    const token = await getToken(messagingInstance, {
      vapidKey,
    });

    return token;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
};

/**
 * Register FCM token with backend
 */
export const registerFCMToken = async (apiUrl: string, authToken: string): Promise<boolean> => {
  try {
    const fcmToken = await getFCMToken();
    if (!fcmToken) {
      console.warn('No FCM token available');
      return false;
    }

    // Send token to backend
    const response = await fetch(`${apiUrl}/api/notifications/register-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ fcmToken }),
    });

    if (!response.ok) {
      throw new Error('Failed to register FCM token');
    }

    console.log('FCM token registered successfully');
    return true;
  } catch (error) {
    console.error('Error registering FCM token:', error);
    return false;
  }
};

/**
 * Unregister FCM token from backend
 */
export const unregisterFCMToken = async (apiUrl: string, authToken: string): Promise<boolean> => {
  try {
    const response = await fetch(`${apiUrl}/api/notifications/register-token`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to unregister FCM token');
    }

    console.log('FCM token unregistered successfully');
    return true;
  } catch (error) {
    console.error('Error unregistering FCM token:', error);
    return false;
  }
};

/**
 * Setup foreground message handler
 * Handles messages when app is in foreground
 */
export const setupForegroundMessageHandler = (
  onMessageReceived: (payload: any) => void
): (() => void) | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const messagingInstance = initializeMessaging();
  if (!messagingInstance) {
    return null;
  }

  // Listen for foreground messages
  const unsubscribe = onMessage(messagingInstance, (payload) => {
    console.log('Foreground message received:', payload);
    onMessageReceived(payload);
  });

  return unsubscribe;
};

/**
 * Check if notifications are supported
 */
export const isNotificationSupported = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  return 'Notification' in window && 'serviceWorker' in navigator;
};

/**
 * Check if notification permission is granted
 */
export const isNotificationPermissionGranted = (): boolean => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  return Notification.permission === 'granted';
};
