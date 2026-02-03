/**
 * Notifications Hook
 * Provides notification functionality to React components
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  requestNotificationPermission,
  registerFCMToken,
  setupForegroundMessageHandler,
  isNotificationSupported,
  isNotificationPermissionGranted,
} from '../firebase/messaging';

interface NotificationData {
  title: string;
  body: string;
  data?: Record<string, any>;
}

interface UseNotificationsOptions {
  apiUrl: string;
  authToken: string | null;
  onMessageReceived?: (notification: NotificationData) => void;
}

export function useNotifications(options: UseNotificationsOptions) {
  const { apiUrl, authToken, onMessageReceived } = options;

  const [isSupported, setIsSupported] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  // Check if notifications are supported
  useEffect(() => {
    setIsSupported(isNotificationSupported());
    setHasPermission(isNotificationPermissionGranted());
  }, []);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      console.warn('Notifications not supported');
      return false;
    }

    const permission = await requestNotificationPermission();
    const granted = permission === 'granted';
    setHasPermission(granted);

    return granted;
  }, [isSupported]);

  // Register FCM token
  const registerToken = useCallback(async () => {
    if (!authToken) {
      console.warn('No auth token available');
      return false;
    }

    if (!hasPermission) {
      console.warn('Notification permission not granted');
      return false;
    }

    setIsRegistering(true);
    try {
      const success = await registerFCMToken(apiUrl, authToken);
      return success;
    } finally {
      setIsRegistering(false);
    }
  }, [apiUrl, authToken, hasPermission]);

  // Setup foreground message handler
  useEffect(() => {
    if (!hasPermission || !authToken) {
      return;
    }

    const unsubscribe = setupForegroundMessageHandler((payload) => {
      const notification: NotificationData = {
        title: payload.notification?.title || 'Neue Benachrichtigung',
        body: payload.notification?.body || '',
        data: payload.data,
      };

      // Call custom handler if provided
      if (onMessageReceived) {
        onMessageReceived(notification);
      }

      // Show browser notification if supported
      if (isNotificationSupported() && Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.body,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/badge-72x72.png',
          tag: notification.data?.type || 'general',
          data: notification.data,
        });
      }
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [hasPermission, authToken, onMessageReceived]);

  return {
    isSupported,
    hasPermission,
    isRegistering,
    requestPermission,
    registerToken,
  };
}
