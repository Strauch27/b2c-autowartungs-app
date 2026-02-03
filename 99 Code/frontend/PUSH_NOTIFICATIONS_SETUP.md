# Push Notifications Setup - Frontend

## Quick Start Guide

### 1. Environment Variables konfigurieren

Kopieren Sie `.env.example` zu `.env.local` und fügen Sie Ihre Firebase-Konfiguration ein:

```env
# Firebase Configuration (for Push Notifications)
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your-vapid-key
```

### 2. Service Worker konfigurieren

Bearbeiten Sie `/public/firebase-messaging-sw.js` und fügen Sie Ihre Firebase Config ein:

```javascript
firebase.initializeApp({
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_AUTH_DOMAIN',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_STORAGE_BUCKET',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
  appId: 'YOUR_APP_ID',
});
```

### 3. Service Worker registrieren

Fügen Sie dies in Ihr Root Layout (`app/layout.tsx`) ein:

```typescript
'use client';

import { useEffect } from 'react';

export default function RootLayout({ children }) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/firebase-messaging-sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration);
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }, []);

  return <html>{children}</html>;
}
```

## Integration in Components

### Dashboard Integration (Permission Prompt)

```tsx
// app/[locale]/customer/dashboard/page.tsx
'use client';

import { NotificationPermission } from '@/components/notifications/notification-permission';
import { useAuth } from '@/lib/auth-hooks';

export default function CustomerDashboard() {
  const { user, token } = useAuth();

  return (
    <div>
      {/* Your dashboard content */}

      {/* Notification Permission Prompt */}
      {user && (
        <NotificationPermission
          apiUrl={process.env.NEXT_PUBLIC_API_URL!}
          authToken={token}
        />
      )}
    </div>
  );
}
```

### Settings Page Integration

```tsx
// app/[locale]/customer/settings/page.tsx
'use client';

import { NotificationSettings } from '@/components/notifications/notification-permission';
import { useAuth } from '@/lib/auth-hooks';

export default function SettingsPage() {
  const { token } = useAuth();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Einstellungen</h1>

      <div className="space-y-6">
        {/* Other settings */}

        {/* Notification Settings */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Benachrichtigungen</h2>
          <NotificationSettings
            apiUrl={process.env.NEXT_PUBLIC_API_URL!}
            authToken={token}
          />
        </section>
      </div>
    </div>
  );
}
```

### Notifications Page

```tsx
// app/[locale]/customer/notifications/page.tsx
'use client';

import { NotificationList } from '@/components/notifications/notification-list';
import { useAuth } from '@/lib/auth-hooks';

export default function NotificationsPage() {
  const { token } = useAuth();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <NotificationList
        apiUrl={process.env.NEXT_PUBLIC_API_URL!}
        authToken={token}
      />
    </div>
  );
}
```

### Auto-Register on Login

Fügen Sie dies in Ihren Login-Flow ein:

```tsx
// lib/auth-context.tsx oder Login-Component
import { registerFCMToken, requestNotificationPermission } from '@/lib/firebase/messaging';

async function handleLoginSuccess(token: string) {
  // ... existing login logic

  // Auto-register for push notifications if permission granted
  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'granted') {
      await registerFCMToken(
        process.env.NEXT_PUBLIC_API_URL!,
        token
      );
    } else if (Notification.permission === 'default') {
      // Optional: Prompt user after successful login
      const permission = await requestNotificationPermission();
      if (permission === 'granted') {
        await registerFCMToken(
          process.env.NEXT_PUBLIC_API_URL!,
          token
        );
      }
    }
  }
}
```

### Custom Hook Usage

```tsx
'use client';

import { useNotifications } from '@/lib/hooks/useNotifications';
import { useToast } from '@/hooks/use-toast';

export function MyComponent() {
  const { toast } = useToast();

  const {
    isSupported,
    hasPermission,
    isRegistering,
    requestPermission,
    registerToken,
  } = useNotifications({
    apiUrl: process.env.NEXT_PUBLIC_API_URL!,
    authToken: 'your-auth-token',
    onMessageReceived: (notification) => {
      // Show toast notification
      toast({
        title: notification.title,
        description: notification.body,
      });
    },
  });

  return (
    <div>
      {isSupported && !hasPermission && (
        <button
          onClick={async () => {
            const granted = await requestPermission();
            if (granted) {
              await registerToken();
            }
          }}
          disabled={isRegistering}
        >
          {isRegistering ? 'Aktiviere...' : 'Benachrichtigungen aktivieren'}
        </button>
      )}
    </div>
  );
}
```

## Notification Badge (Unread Count)

```tsx
'use client';

import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import Link from 'next/link';

export function NotificationBadge({ apiUrl, authToken }: { apiUrl: string; authToken: string | null }) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!authToken) return;

    const fetchUnreadCount = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/notifications/unread-count`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUnreadCount(data.data.count);
        }
      } catch (error) {
        console.error('Failed to fetch unread count:', error);
      }
    };

    fetchUnreadCount();

    // Poll every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);

    return () => clearInterval(interval);
  }, [apiUrl, authToken]);

  return (
    <Link href="/customer/notifications" className="relative">
      <Bell className="w-6 h-6 text-gray-600 hover:text-gray-900" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </Link>
  );
}
```

## Testing

### Local Testing

1. Start dev server: `npm run dev`
2. Open DevTools > Application > Service Workers
3. Verify service worker is registered
4. Go to Application > Notifications
5. Request notification permission
6. Send test notification from backend

### Test Notification from Browser Console

```javascript
// In browser console
if ('Notification' in window && Notification.permission === 'granted') {
  new Notification('Test Notification', {
    body: 'This is a test notification',
    icon: '/icons/icon-192x192.png',
  });
}
```

### Backend Test Request

```bash
curl -X POST http://localhost:5000/api/notifications/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "userId": "USER_ID",
    "type": "GENERAL",
    "title": "Test",
    "body": "Test notification"
  }'
```

## Troubleshooting

### Service Worker not registering

- Check that file is at `/public/firebase-messaging-sw.js`
- Verify HTTPS or localhost (required for Service Workers)
- Clear browser cache and reload

### Notifications not showing

- Check browser permission: `Notification.permission`
- Verify FCM token is registered: Check Network tab
- Check service worker console for errors
- Verify Firebase config is correct

### Token not being sent to backend

- Check that user is authenticated
- Verify API URL is correct
- Check Network tab for failed requests
- Ensure CORS is configured correctly on backend

## Browser Support

| Browser | Push Notifications | Background Notifications |
|---------|-------------------|-------------------------|
| Chrome  | ✅ Yes             | ✅ Yes                   |
| Firefox | ✅ Yes             | ✅ Yes                   |
| Safari  | ✅ Yes (16.4+)     | ✅ Yes (16.4+)           |
| Edge    | ✅ Yes             | ✅ Yes                   |
| Opera   | ✅ Yes             | ✅ Yes                   |
| iOS     | ✅ Yes (16.4+)     | ✅ Yes (16.4+)           |
| Android | ✅ Yes             | ✅ Yes                   |

## Best Practices

### 1. Timing
- Request permission after user has logged in
- Don't prompt immediately on first page load
- Show value proposition before requesting permission

### 2. User Experience
- Provide clear opt-in/opt-out options
- Show notification preview before enabling
- Allow granular control (notification types)

### 3. Performance
- Don't poll notification history too frequently
- Use WebSocket for real-time updates (future enhancement)
- Cache notification list client-side

### 4. Privacy
- Never send sensitive data in notifications
- Allow users to disable notifications easily
- Respect "Do Not Disturb" settings

## Next Steps

1. Add notification icons to `/public/icons/`
2. Customize notification sounds (optional)
3. Implement notification grouping
4. Add rich notifications with actions
5. Implement notification scheduling
