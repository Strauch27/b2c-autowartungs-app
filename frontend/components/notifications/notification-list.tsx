/**
 * Notification List Component
 * Displays notification history for the user
 */

'use client';

import { useEffect, useState } from 'react';
import { Bell, CheckCircle, Clock, AlertCircle, Package, Truck, Wrench } from 'lucide-react';

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  status: string;
  sentAt: string | null;
  readAt: string | null;
  createdAt: string;
  bookingId?: string | null;
}

interface NotificationListProps {
  apiUrl: string;
  authToken: string | null;
}

const notificationIcons: Record<string, any> = {
  BOOKING_CONFIRMATION: CheckCircle,
  STATUS_UPDATE: Bell,
  PICKUP_REMINDER: Clock,
  IN_WORKSHOP: Wrench,
  SERVICE_COMPLETE: CheckCircle,
  DELIVERY_REMINDER: Truck,
  DELIVERED: Package,
  PAYMENT_CONFIRMATION: CheckCircle,
  SERVICE_EXTENSION: AlertCircle,
  GENERAL: Bell,
};

const notificationColors: Record<string, string> = {
  BOOKING_CONFIRMATION: 'bg-green-100 text-green-600',
  STATUS_UPDATE: 'bg-blue-100 text-blue-600',
  PICKUP_REMINDER: 'bg-yellow-100 text-yellow-600',
  IN_WORKSHOP: 'bg-purple-100 text-purple-600',
  SERVICE_COMPLETE: 'bg-green-100 text-green-600',
  DELIVERY_REMINDER: 'bg-blue-100 text-blue-600',
  DELIVERED: 'bg-green-100 text-green-600',
  PAYMENT_CONFIRMATION: 'bg-green-100 text-green-600',
  SERVICE_EXTENSION: 'bg-orange-100 text-orange-600',
  GENERAL: 'bg-gray-100 text-gray-600',
};

export function NotificationList({ apiUrl, authToken }: NotificationListProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!authToken) {
      setLoading(false);
      return;
    }

    fetchNotifications();
  }, [authToken, page]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${apiUrl}/api/notifications/history?page=${page}&limit=20`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const result = await response.json();
      setNotifications(result.data.notifications);
      setTotalPages(result.data.pagination.totalPages);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    if (!authToken) return;

    try {
      const response = await fetch(`${apiUrl}/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        // Update local state
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, readAt: new Date().toISOString() } : n
          )
        );
      }
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    if (!authToken) return;

    try {
      const response = await fetch(`${apiUrl}/api/notifications/read-all`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        // Update local state
        const now = new Date().toISOString();
        setNotifications((prev) => prev.map((n) => ({ ...n, readAt: now })));
      }
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Gerade eben';
    if (diffMins < 60) return `vor ${diffMins} Min.`;
    if (diffHours < 24) return `vor ${diffHours} Std.`;
    if (diffDays < 7) return `vor ${diffDays} Tag${diffDays > 1 ? 'en' : ''}`;

    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (loading && notifications.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-sm text-red-600">Fehler beim Laden der Benachrichtigungen: {error}</p>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="text-center py-12">
        <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">Keine Benachrichtigungen</h3>
        <p className="text-sm text-gray-500">
          Sie haben noch keine Benachrichtigungen erhalten.
        </p>
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Benachrichtigungen</h2>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Alle als gelesen markieren
          </button>
        )}
      </div>

      {/* Notification List */}
      <div className="space-y-2">
        {notifications.map((notification) => {
          const Icon = notificationIcons[notification.type] || Bell;
          const colorClass = notificationColors[notification.type] || 'bg-gray-100 text-gray-600';
          const isUnread = !notification.readAt;

          return (
            <div
              key={notification.id}
              onClick={() => isUnread && markAsRead(notification.id)}
              className={`bg-white border rounded-lg p-4 transition-colors cursor-pointer hover:border-blue-300 ${
                isUnread ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className={`text-sm font-medium ${isUnread ? 'text-gray-900' : 'text-gray-700'}`}>
                      {notification.title}
                    </h3>
                    {isUnread && (
                      <span className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full"></span>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 mb-2">{notification.body}</p>

                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(notification.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Zurück
          </button>

          <span className="text-sm text-gray-600">
            Seite {page} von {totalPages}
          </span>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Weiter
          </button>
        </div>
      )}
    </div>
  );
}
