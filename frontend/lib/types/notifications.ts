/**
 * Notification Type Definitions
 * Shared types for notification handling across the application
 */

export enum NotificationType {
  BOOKING_CONFIRMATION = 'BOOKING_CONFIRMATION',
  STATUS_UPDATE = 'STATUS_UPDATE',
  PICKUP_REMINDER = 'PICKUP_REMINDER',
  IN_WORKSHOP = 'IN_WORKSHOP',
  SERVICE_COMPLETE = 'SERVICE_COMPLETE',
  DELIVERY_REMINDER = 'DELIVERY_REMINDER',
  DELIVERED = 'DELIVERED',
  PAYMENT_CONFIRMATION = 'PAYMENT_CONFIRMATION',
  SERVICE_EXTENSION = 'SERVICE_EXTENSION',
  GENERAL = 'GENERAL',
}

export enum NotificationStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
  READ = 'READ',
}

export interface Notification {
  id: string;
  userId: string;
  bookingId?: string | null;
  type: NotificationType;
  status: NotificationStatus;
  title: string;
  body: string;
  data?: Record<string, any>;
  fcmMessageId?: string | null;
  errorMessage?: string | null;
  sentAt?: string | null;
  deliveredAt?: string | null;
  readAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationListResponse {
  success: boolean;
  data: {
    notifications: Notification[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface UnreadCountResponse {
  success: boolean;
  data: {
    count: number;
  };
}

export interface RegisterTokenRequest {
  fcmToken: string;
}

export interface SendNotificationRequest {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, any>;
  bookingId?: string;
}

export interface SubscribeTopicRequest {
  topic: string;
}

export interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Firebase Cloud Messaging Payload
 */
export interface FCMPayload {
  notification?: {
    title: string;
    body: string;
    image?: string;
  };
  data?: Record<string, string>;
}

/**
 * Notification Display Config
 */
export interface NotificationConfig {
  type: NotificationType;
  icon: string;
  color: string;
  priority: 'high' | 'default' | 'low';
  sound: boolean;
  vibrate: boolean;
}

/**
 * Notification Preferences (for future use)
 */
export interface NotificationPreferences {
  enabled: boolean;
  types: {
    [key in NotificationType]: boolean;
  };
  quietHours?: {
    enabled: boolean;
    start: string; // HH:mm format
    end: string; // HH:mm format
  };
  sound: boolean;
  vibrate: boolean;
}

/**
 * Default notification configurations
 */
export const NOTIFICATION_CONFIGS: Record<NotificationType, NotificationConfig> = {
  [NotificationType.BOOKING_CONFIRMATION]: {
    type: NotificationType.BOOKING_CONFIRMATION,
    icon: '✅',
    color: 'green',
    priority: 'high',
    sound: true,
    vibrate: true,
  },
  [NotificationType.STATUS_UPDATE]: {
    type: NotificationType.STATUS_UPDATE,
    icon: '🔔',
    color: 'blue',
    priority: 'default',
    sound: true,
    vibrate: false,
  },
  [NotificationType.PICKUP_REMINDER]: {
    type: NotificationType.PICKUP_REMINDER,
    icon: '⏰',
    color: 'yellow',
    priority: 'high',
    sound: true,
    vibrate: true,
  },
  [NotificationType.IN_WORKSHOP]: {
    type: NotificationType.IN_WORKSHOP,
    icon: '🔧',
    color: 'purple',
    priority: 'default',
    sound: false,
    vibrate: false,
  },
  [NotificationType.SERVICE_COMPLETE]: {
    type: NotificationType.SERVICE_COMPLETE,
    icon: '✅',
    color: 'green',
    priority: 'high',
    sound: true,
    vibrate: true,
  },
  [NotificationType.DELIVERY_REMINDER]: {
    type: NotificationType.DELIVERY_REMINDER,
    icon: '🚗',
    color: 'blue',
    priority: 'high',
    sound: true,
    vibrate: true,
  },
  [NotificationType.DELIVERED]: {
    type: NotificationType.DELIVERED,
    icon: '📦',
    color: 'green',
    priority: 'high',
    sound: true,
    vibrate: true,
  },
  [NotificationType.PAYMENT_CONFIRMATION]: {
    type: NotificationType.PAYMENT_CONFIRMATION,
    icon: '💳',
    color: 'green',
    priority: 'default',
    sound: false,
    vibrate: false,
  },
  [NotificationType.SERVICE_EXTENSION]: {
    type: NotificationType.SERVICE_EXTENSION,
    icon: '⚠️',
    color: 'orange',
    priority: 'high',
    sound: true,
    vibrate: true,
  },
  [NotificationType.GENERAL]: {
    type: NotificationType.GENERAL,
    icon: '📢',
    color: 'gray',
    priority: 'default',
    sound: false,
    vibrate: false,
  },
};
