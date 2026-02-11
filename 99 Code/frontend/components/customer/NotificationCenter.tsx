"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bell,
  CheckCircle,
  Clock,
  AlertCircle,
  Package,
  Truck,
  Wrench,
  BellOff,
} from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { useLanguage } from "@/lib/i18n/useLovableTranslation";
import { useRouter } from "next/navigation";

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
  BOOKING_CONFIRMATION: "text-green-600",
  STATUS_UPDATE: "text-blue-600",
  PICKUP_REMINDER: "text-yellow-600",
  IN_WORKSHOP: "text-purple-600",
  SERVICE_COMPLETE: "text-green-600",
  DELIVERY_REMINDER: "text-blue-600",
  DELIVERED: "text-green-600",
  PAYMENT_CONFIRMATION: "text-green-600",
  SERVICE_EXTENSION: "text-orange-600",
  GENERAL: "text-gray-600",
};

export function NotificationCenter() {
  const { language } = useLanguage();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const t = {
    de: {
      notifications: "Benachrichtigungen",
      noNotifications: "Keine Benachrichtigungen",
      noNotificationsDesc: "Sie haben noch keine Benachrichtigungen erhalten.",
      markAllRead: "Alle als gelesen",
      viewAll: "Alle anzeigen",
    },
    en: {
      notifications: "Notifications",
      noNotifications: "No notifications",
      noNotificationsDesc: "You haven't received any notifications yet.",
      markAllRead: "Mark all read",
      viewAll: "View all",
    },
  };

  const texts = t[language];

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    } else {
      // Fetch unread count even when closed
      fetchUnreadCount();
    }

    // Poll for unread count every 30 seconds
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get<{
        success: boolean;
        data: {
          notifications: Notification[];
          pagination: any;
        };
      }>("/api/notifications/history?page=1&limit=10");

      setNotifications(response.data.notifications);
      setUnreadCount(
        response.data.notifications.filter((n) => !n.readAt).length
      );
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: { count: number };
      }>("/api/notifications/unread-count");

      setUnreadCount(response.data.count);
    } catch (error) {
      console.error("Error fetching unread count:", error);
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
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiClient.patch("/api/notifications/read-all");

      const now = new Date().toISOString();
      setNotifications((prev) => prev.map((n) => ({ ...n, readAt: now })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.readAt) {
      markAsRead(notification.id);
    }

    // Navigate to booking if bookingId is present
    if (notification.bookingId) {
      router.push(`/${language}/customer/bookings/${notification.bookingId}`);
      setIsOpen(false);
    }

    // Handle extension notifications
    if (notification.type === "SERVICE_EXTENSION" && notification.data?.extensionId) {
      router.push(
        `/${language}/customer/bookings/${notification.bookingId}?tab=extensions`
      );
      setIsOpen(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
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

    return date.toLocaleDateString(language === "de" ? "de-DE" : "en-US");
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label={texts.notifications}>
          <Bell className="h-5 w-5" aria-hidden="true" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[calc(100vw-2rem)] sm:w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">{texts.notifications}</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs"
            >
              {texts.markAllRead}
            </Button>
          )}
        </div>

        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <BellOff className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="font-medium text-muted-foreground">
                {texts.noNotifications}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {texts.noNotificationsDesc}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => {
                const Icon =
                  notificationIcons[notification.type] || Bell;
                const colorClass =
                  notificationColors[notification.type] ||
                  "text-gray-600";
                const isUnread = !notification.readAt;

                return (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 hover:bg-muted cursor-pointer transition-colors ${
                      isUnread ? "bg-blue-50/50" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex-shrink-0 ${colorClass}`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p
                            className={`text-sm font-medium ${
                              isUnread
                                ? "text-foreground"
                                : "text-muted-foreground"
                            }`}
                          >
                            {notification.title}
                          </p>
                          {isUnread && (
                            <span className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-1"></span>
                          )}
                        </div>

                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                          {notification.body}
                        </p>

                        <p className="text-xs text-muted-foreground">
                          {formatTimeAgo(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <div className="p-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => {
                router.push(`/${language}/customer/notifications`);
                setIsOpen(false);
              }}
            >
              {texts.viewAll}
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
