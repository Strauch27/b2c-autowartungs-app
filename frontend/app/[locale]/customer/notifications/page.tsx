"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Bell,
  CheckCircle,
  Clock,
  AlertCircle,
  Package,
  Truck,
  Wrench,
  BellOff,
  ChevronLeft,
} from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { useLanguage } from "@/lib/i18n/useLovableTranslation";

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
  BOOKING_CONFIRMATION: "bg-green-100 text-green-600",
  STATUS_UPDATE: "bg-blue-100 text-blue-600",
  PICKUP_REMINDER: "bg-yellow-100 text-yellow-600",
  IN_WORKSHOP: "bg-purple-100 text-purple-600",
  SERVICE_COMPLETE: "bg-green-100 text-green-600",
  DELIVERY_REMINDER: "bg-blue-100 text-blue-600",
  DELIVERED: "bg-green-100 text-green-600",
  PAYMENT_CONFIRMATION: "bg-green-100 text-green-600",
  SERVICE_EXTENSION: "bg-orange-100 text-orange-600",
  GENERAL: "bg-gray-100 text-gray-600",
};

export default function NotificationsPage() {
  const { language } = useLanguage();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const t = {
    de: {
      title: "Benachrichtigungen",
      back: "Zurück",
      noNotifications: "Keine Benachrichtigungen",
      noNotificationsDesc: "Sie haben noch keine Benachrichtigungen erhalten.",
      markAllRead: "Alle als gelesen markieren",
      previous: "Zurück",
      next: "Weiter",
      page: "Seite",
      of: "von",
    },
    en: {
      title: "Notifications",
      back: "Back",
      noNotifications: "No notifications",
      noNotificationsDesc: "You haven't received any notifications yet.",
      markAllRead: "Mark all as read",
      previous: "Previous",
      next: "Next",
      page: "Page",
      of: "of",
    },
  };

  const texts = t[language];

  useEffect(() => {
    fetchNotifications();
  }, [page]);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get<{
        success: boolean;
        data: {
          notifications: Notification[];
          pagination: {
            page: number;
            totalPages: number;
          };
        };
      }>(`/api/notifications/history?page=${page}&limit=20`);

      setNotifications(response.data.notifications);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await apiClient.patch(`/api/notifications/${notificationId}/read`);

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId
            ? { ...n, readAt: new Date().toISOString() }
            : n
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiClient.patch("/api/notifications/read-all");

      const now = new Date().toISOString();
      setNotifications((prev) => prev.map((n) => ({ ...n, readAt: now })));
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.readAt) {
      markAsRead(notification.id);
    }

    if (notification.bookingId) {
      router.push(`/${language}/customer/bookings/${notification.bookingId}`);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return language === "de" ? "Gerade eben" : "Just now";
    if (diffMins < 60)
      return language === "de" ? `vor ${diffMins} Min.` : `${diffMins}m ago`;
    if (diffHours < 24)
      return language === "de" ? `vor ${diffHours} Std.` : `${diffHours}h ago`;
    if (diffDays < 7)
      return language === "de"
        ? `vor ${diffDays} Tag${diffDays > 1 ? "en" : ""}`
        : `${diffDays}d ago`;

    return date.toLocaleDateString(language === "de" ? "de-DE" : "en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push(`/${language}/customer/dashboard`)}
            className="mb-4"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            {texts.back}
          </Button>

          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">{texts.title}</h1>
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={markAllAsRead}>
                {texts.markAllRead}
              </Button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && notifications.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : notifications.length === 0 ? (
          /* Empty State */
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <BellOff className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                {texts.noNotifications}
              </h3>
              <p className="text-sm text-muted-foreground">
                {texts.noNotificationsDesc}
              </p>
            </CardContent>
          </Card>
        ) : (
          /* Notification List */
          <>
            <div className="space-y-3">
              {notifications.map((notification) => {
                const Icon = notificationIcons[notification.type] || Bell;
                const colorClass =
                  notificationColors[notification.type] ||
                  "bg-gray-100 text-gray-600";
                const isUnread = !notification.readAt;

                return (
                  <Card
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      isUnread ? "border-blue-300 bg-blue-50/30" : ""
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}
                        >
                          <Icon className="w-6 h-6" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3
                              className={`font-medium ${
                                isUnread
                                  ? "text-foreground"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {notification.title}
                            </h3>
                            {isUnread && (
                              <span className="flex-shrink-0 w-2.5 h-2.5 bg-blue-600 rounded-full mt-1.5"></span>
                            )}
                          </div>

                          <p className="text-sm text-muted-foreground mb-3">
                            {notification.body}
                          </p>

                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>{formatDate(notification.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  {texts.previous}
                </Button>

                <span className="text-sm text-muted-foreground px-4">
                  {texts.page} {page} {texts.of} {totalPages}
                </span>

                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  {texts.next}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
