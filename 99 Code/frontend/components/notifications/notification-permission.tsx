/**
 * Notification Permission Component
 * Prompts users to enable push notifications
 */

'use client';

import { useState } from 'react';
import { Bell, BellOff, X } from 'lucide-react';
import { useNotifications } from '@/lib/hooks/useNotifications';
import { useLanguage } from '@/lib/i18n/useLovableTranslation';

const translations = {
  de: {
    enableTitle: 'Benachrichtigungen aktivieren',
    enableDesc: 'Erhalten Sie Updates zu Ihrer Buchung in Echtzeit direkt auf Ihr Gerät.',
    enabling: 'Aktiviere...',
    enable: 'Aktivieren',
    later: 'Später',
    notAvailableTitle: 'Benachrichtigungen nicht verfügbar',
    notAvailableDesc: 'Ihr Browser unterstützt keine Push-Benachrichtigungen.',
    pushTitle: 'Push-Benachrichtigungen',
    pushEnabled: 'Aktiviert - Sie erhalten Updates zu Ihren Buchungen',
    pushDisabled: 'Deaktiviert - Aktivieren Sie Benachrichtigungen für Updates',
    receiveFor: 'Sie erhalten Benachrichtigungen für:',
    bookingConfirmations: 'Buchungsbestätigungen',
    statusUpdates: 'Status-Updates (Abholung, Wartung, Rückbringung)',
    paymentConfirmations: 'Zahlungsbestätigungen',
    importantMessages: 'Wichtige Mitteilungen',
  },
  en: {
    enableTitle: 'Enable notifications',
    enableDesc: 'Receive real-time updates about your booking directly on your device.',
    enabling: 'Enabling...',
    enable: 'Enable',
    later: 'Later',
    notAvailableTitle: 'Notifications not available',
    notAvailableDesc: 'Your browser does not support push notifications.',
    pushTitle: 'Push notifications',
    pushEnabled: 'Enabled - You will receive updates about your bookings',
    pushDisabled: 'Disabled - Enable notifications for updates',
    receiveFor: 'You will receive notifications for:',
    bookingConfirmations: 'Booking confirmations',
    statusUpdates: 'Status updates (pickup, service, return)',
    paymentConfirmations: 'Payment confirmations',
    importantMessages: 'Important messages',
  },
};

interface NotificationPermissionProps {
  apiUrl: string;
  authToken: string | null;
  onClose?: () => void;
}

export function NotificationPermission({
  apiUrl,
  authToken,
  onClose,
}: NotificationPermissionProps) {
  const { language } = useLanguage();
  const i = translations[language] || translations.de;
  const [dismissed, setDismissed] = useState(false);
  const { isSupported, hasPermission, isRegistering, requestPermission, registerToken } =
    useNotifications({
      apiUrl,
      authToken,
    });

  // Don't show if not supported or already has permission or dismissed
  if (!isSupported || hasPermission || dismissed) {
    return null;
  }

  const handleEnableNotifications = async () => {
    const granted = await requestPermission();
    if (granted && authToken) {
      await registerToken();
      if (onClose) {
        onClose();
      }
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Bell className="w-5 h-5 text-blue-600" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              {i.enableTitle}
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              {i.enableDesc}
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={handleEnableNotifications}
                disabled={isRegistering}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRegistering ? i.enabling : i.enable}
              </button>

              <button
                onClick={handleDismiss}
                className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                {i.later}
              </button>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Notification Settings Card Component
 * Shows current notification status and allows toggling
 */
export function NotificationSettings({
  apiUrl,
  authToken,
}: Omit<NotificationPermissionProps, 'onClose'>) {
  const { language } = useLanguage();
  const i = translations[language] || translations.de;
  const { isSupported, hasPermission, isRegistering, requestPermission, registerToken } =
    useNotifications({
      apiUrl,
      authToken,
    });

  if (!isSupported) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <BellOff className="w-5 h-5 text-gray-400" />
          <div>
            <h3 className="text-sm font-medium text-gray-900">
              {i.notAvailableTitle}
            </h3>
            <p className="text-sm text-gray-500">
              {i.notAvailableDesc}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleToggle = async () => {
    if (!hasPermission) {
      const granted = await requestPermission();
      if (granted && authToken) {
        await registerToken();
      }
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              hasPermission ? 'bg-green-100' : 'bg-gray-100'
            }`}
          >
            {hasPermission ? (
              <Bell className="w-5 h-5 text-green-600" />
            ) : (
              <BellOff className="w-5 h-5 text-gray-400" />
            )}
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-900">{i.pushTitle}</h3>
            <p className="text-sm text-gray-500">
              {hasPermission
                ? i.pushEnabled
                : i.pushDisabled}
            </p>
          </div>
        </div>

        {!hasPermission && (
          <button
            onClick={handleToggle}
            disabled={isRegistering}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRegistering ? i.enabling : i.enable}
          </button>
        )}
      </div>

      {hasPermission && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-xs font-medium text-gray-700 mb-2">
            {i.receiveFor}
          </h4>
          <ul className="space-y-1 text-xs text-gray-600">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
              {i.bookingConfirmations}
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
              {i.statusUpdates}
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
              {i.paymentConfirmations}
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
              {i.importantMessages}
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
