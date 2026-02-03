# Push Notification Service - Dokumentation

## Übersicht

Der Push Notification Service nutzt Firebase Cloud Messaging (FCM), um Echtzeit-Benachrichtigungen an Kunden über wichtige Buchungsereignisse zu senden.

## Architektur

### Backend (Node.js/Express)

- **Firebase Admin SDK**: Sendet Push-Benachrichtigungen an registrierte Geräte
- **Notification Service**: Business Logic für verschiedene Benachrichtigungstypen
- **REST API**: Endpunkte für Token-Registrierung und Benachrichtigungsverwaltung
- **Prisma Models**: Speichert FCM-Tokens und Benachrichtigungshistorie

### Frontend (Next.js/React)

- **Firebase SDK**: Client-seitige Integration für Notification-Handling
- **Service Worker**: Empfängt Background-Notifications
- **React Hooks**: `useNotifications` für einfache Integration
- **UI Components**: Permission-Prompt und Notification-List

## Setup und Konfiguration

### 1. Firebase Projekt erstellen

1. Gehen Sie zu [Firebase Console](https://console.firebase.google.com/)
2. Erstellen Sie ein neues Projekt oder wählen Sie ein bestehendes
3. Navigieren Sie zu **Project Settings** > **General**
4. Kopieren Sie die Firebase Config-Werte

### 2. Firebase Cloud Messaging aktivieren

1. Gehen Sie zu **Project Settings** > **Cloud Messaging**
2. Unter **Web Push certificates**, klicken Sie auf **Generate key pair**
3. Kopieren Sie den VAPID-Schlüssel

### 3. Service Account erstellen

1. Gehen Sie zu **Project Settings** > **Service Accounts**
2. Klicken Sie auf **Generate new private key**
3. Speichern Sie die JSON-Datei sicher (wird für Backend benötigt)

### 4. Backend Konfiguration

Fügen Sie folgende Variablen zu `.env` hinzu:

```env
# Firebase Cloud Messaging
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"...","private_key":"..."}
```

**Wichtig**: Der `FIREBASE_SERVICE_ACCOUNT` sollte die komplette JSON-Datei als String enthalten.

### 5. Frontend Konfiguration

Fügen Sie folgende Variablen zu `.env.local` hinzu:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your-vapid-key
```

### 6. Service Worker konfigurieren

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

## Notification Types

### 1. BOOKING_CONFIRMATION
- **Wann**: Nach erfolgreicher Buchung und Zahlung
- **Zweck**: Bestätigung der Buchung
- **Daten**: `bookingNumber`, `pickupDate`

```typescript
await sendBookingConfirmation(
  userId,
  bookingId,
  'BK-2024-001',
  new Date('2024-02-15')
);
```

### 2. STATUS_UPDATE
- **Wann**: Bei jeder Statusänderung der Buchung
- **Zweck**: Kunde über Fortschritt informieren
- **Verwendung**: Fahrer-Zuweisung, Statuswechsel

```typescript
await sendJockeyAssigned(
  userId,
  bookingId,
  'BK-2024-001',
  'Max Mustermann'
);
```

### 3. PICKUP_REMINDER
- **Wann**: Am Tag der Abholung (z.B. 2 Stunden vorher)
- **Zweck**: Erinnerung an bevorstehende Abholung
- **Daten**: `pickupTime`

```typescript
await sendPickupReminder(
  userId,
  bookingId,
  'BK-2024-001',
  '10:00 - 12:00'
);
```

### 4. IN_TRANSIT_TO_WORKSHOP
- **Wann**: Fahrzeug wurde abgeholt und ist unterwegs
- **Zweck**: Statusupdate für Kunden

```typescript
await sendInTransitToWorkshop(userId, bookingId, 'BK-2024-001');
```

### 5. IN_WORKSHOP
- **Wann**: Fahrzeug in Werkstatt angekommen, Wartung beginnt
- **Zweck**: Kunde informieren, dass Arbeit begonnen hat

```typescript
await sendInWorkshop(userId, bookingId, 'BK-2024-001');
```

### 6. SERVICE_COMPLETE
- **Wann**: Wartung abgeschlossen
- **Zweck**: Kunde informieren, dass Fahrzeug fertig ist

```typescript
await sendServiceComplete(userId, bookingId, 'BK-2024-001');
```

### 7. IN_TRANSIT_TO_CUSTOMER
- **Wann**: Fahrzeug ist auf dem Rückweg zum Kunden
- **Zweck**: Kunde auf Lieferung vorbereiten
- **Daten**: `estimatedArrival`

```typescript
await sendInTransitToCustomer(
  userId,
  bookingId,
  'BK-2024-001',
  new Date('2024-02-15T14:30:00')
);
```

### 8. DELIVERED
- **Wann**: Fahrzeug wurde zugestellt
- **Zweck**: Bestätigung der erfolgreichen Zustellung

```typescript
await sendVehicleDelivered(userId, bookingId, 'BK-2024-001');
```

### 9. PAYMENT_CONFIRMATION
- **Wann**: Nach erfolgreicher Zahlung
- **Zweck**: Zahlungsbestätigung
- **Daten**: `amount`

```typescript
await sendPaymentConfirmation(
  userId,
  bookingId,
  'BK-2024-001',
  299.99
);
```

### 10. SERVICE_EXTENSION
- **Wann**: Zusätzliche Arbeiten erforderlich
- **Zweck**: Kunde über Zusatzkosten informieren
- **Daten**: `additionalServices`, `additionalCost`

```typescript
await sendServiceExtension(
  userId,
  bookingId,
  'BK-2024-001',
  'Bremsbeläge vorne ersetzen',
  150.00
);
```

## API Endpunkte

### POST /api/notifications/register-token
Registriert FCM-Token für aktuellen Benutzer

**Request:**
```json
{
  "fcmToken": "firebase-cloud-messaging-token"
}
```

**Response:**
```json
{
  "success": true,
  "message": "FCM token registered successfully"
}
```

### DELETE /api/notifications/register-token
Entfernt FCM-Token des Benutzers

**Response:**
```json
{
  "success": true,
  "message": "FCM token unregistered successfully"
}
```

### POST /api/notifications/send (Admin only)
Sendet Push-Benachrichtigung an spezifischen Benutzer

**Request:**
```json
{
  "userId": "user-id",
  "type": "STATUS_UPDATE",
  "title": "Fahrzeug abgeholt",
  "body": "Ihr Fahrzeug wurde erfolgreich abgeholt.",
  "data": {
    "bookingId": "booking-id"
  },
  "bookingId": "booking-id"
}
```

### GET /api/notifications/history
Lädt Benachrichtigungshistorie

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notif-id",
        "type": "BOOKING_CONFIRMATION",
        "title": "Buchung bestätigt",
        "body": "Ihre Buchung wurde bestätigt",
        "status": "SENT",
        "sentAt": "2024-02-01T10:00:00Z",
        "readAt": null,
        "createdAt": "2024-02-01T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "totalPages": 3
    }
  }
}
```

### PATCH /api/notifications/:id/read
Markiert Benachrichtigung als gelesen

### PATCH /api/notifications/read-all
Markiert alle Benachrichtigungen als gelesen

### GET /api/notifications/unread-count
Gibt Anzahl ungelesener Benachrichtigungen zurück

**Response:**
```json
{
  "success": true,
  "data": {
    "count": 5
  }
}
```

## Frontend Integration

### 1. Notification Permission Component

```tsx
import { NotificationPermission } from '@/components/notifications/notification-permission';

function Dashboard() {
  return (
    <div>
      <NotificationPermission
        apiUrl={process.env.NEXT_PUBLIC_API_URL!}
        authToken={authToken}
      />
    </div>
  );
}
```

### 2. Notification Settings

```tsx
import { NotificationSettings } from '@/components/notifications/notification-permission';

function SettingsPage() {
  return (
    <NotificationSettings
      apiUrl={process.env.NEXT_PUBLIC_API_URL!}
      authToken={authToken}
    />
  );
}
```

### 3. Notification List

```tsx
import { NotificationList } from '@/components/notifications/notification-list';

function NotificationsPage() {
  return (
    <NotificationList
      apiUrl={process.env.NEXT_PUBLIC_API_URL!}
      authToken={authToken}
    />
  );
}
```

### 4. useNotifications Hook

```tsx
import { useNotifications } from '@/lib/hooks/useNotifications';

function MyComponent() {
  const {
    isSupported,
    hasPermission,
    isRegistering,
    requestPermission,
    registerToken,
  } = useNotifications({
    apiUrl: process.env.NEXT_PUBLIC_API_URL!,
    authToken,
    onMessageReceived: (notification) => {
      console.log('Received:', notification);
      // Show toast, update UI, etc.
    },
  });

  return (
    <button onClick={requestPermission}>
      Enable Notifications
    </button>
  );
}
```

## Best Practices

### 1. Token Management
- Token beim Login registrieren
- Token beim Logout entfernen
- Token-Aktualisierung bei Firebase-Token-Refresh

### 2. Notification Timing
- Pickup Reminder: 2 Stunden vor Abholung
- Delivery Reminder: 30 Minuten vor geschätzter Ankunft
- Nicht zu viele Benachrichtigungen senden (max. 3-4 pro Tag)

### 3. Error Handling
- Graceful Degradation wenn FCM nicht verfügbar
- Retry-Logik für fehlgeschlagene Benachrichtigungen
- Logging aller Notification-Events

### 4. Privacy & Compliance
- Nutzer muss explizit zustimmen
- Einfache Opt-out-Möglichkeit
- GDPR-konform: Token-Löschung bei Account-Löschung

### 5. Testing
- Lokales Testing mit Firebase Emulator Suite
- Test-Benachrichtigungen vor Production-Rollout
- Cross-Browser Testing (Chrome, Firefox, Safari)

## Troubleshooting

### Push-Benachrichtigungen werden nicht empfangen

1. **Prüfen Sie die Browser-Permissions**
   - Ist die Notification-Permission granted?
   - Sind Benachrichtigungen im Browser aktiviert?

2. **Prüfen Sie die Service Worker Registrierung**
   - Ist der Service Worker korrekt registriert?
   - Console-Logs im Service Worker überprüfen

3. **Prüfen Sie Firebase-Konfiguration**
   - Sind alle Environment Variables gesetzt?
   - Ist der VAPID-Key korrekt?

4. **Backend-Logs prüfen**
   - Wird die Benachrichtigung gesendet?
   - Gibt es FCM-Fehler?

### Service Worker wird nicht geladen

1. **HTTPS erforderlich**
   - Service Worker funktionieren nur über HTTPS (außer localhost)

2. **Pfad überprüfen**
   - Service Worker muss in `/public` liegen
   - URL: `/firebase-messaging-sw.js`

3. **Browser-Cache leeren**
   - Service Worker werden gecacht

## Monitoring & Analytics

### Notification Metrics

- **Delivery Rate**: Wie viele Benachrichtigungen wurden erfolgreich zugestellt?
- **Open Rate**: Wie viele Benachrichtigungen wurden geöffnet?
- **Opt-in Rate**: Wie viele Nutzer aktivieren Notifications?
- **Opt-out Rate**: Wie viele Nutzer deaktivieren Notifications?

### Database Queries

```sql
-- Delivery Rate
SELECT
  type,
  COUNT(*) as total,
  COUNT(CASE WHEN status = 'SENT' THEN 1 END) as sent,
  COUNT(CASE WHEN status = 'DELIVERED' THEN 1 END) as delivered,
  COUNT(CASE WHEN status = 'FAILED' THEN 1 END) as failed
FROM "NotificationLog"
WHERE "createdAt" >= NOW() - INTERVAL '7 days'
GROUP BY type;

-- Read Rate
SELECT
  COUNT(*) as total,
  COUNT("readAt") as read,
  ROUND(COUNT("readAt")::numeric / COUNT(*)::numeric * 100, 2) as read_rate
FROM "NotificationLog"
WHERE "createdAt" >= NOW() - INTERVAL '7 days';

-- Users with FCM tokens
SELECT COUNT(*) FROM "User" WHERE "fcmToken" IS NOT NULL;
```

## Security Considerations

1. **Token Storage**: FCM-Tokens werden sicher in der Datenbank gespeichert
2. **Authentication**: Alle Notification-Endpunkte erfordern Authentifizierung
3. **Authorization**: Nutzer können nur eigene Benachrichtigungen sehen
4. **Rate Limiting**: API-Endpunkte sind rate-limited
5. **Data Validation**: Alle Inputs werden validiert (Zod-Schemas)

## Zukunft & Erweiterungen

### Geplante Features

1. **Rich Notifications**: Bilder, Aktions-Buttons
2. **Notification Preferences**: Granulare Einstellungen (welche Typen?)
3. **Scheduled Notifications**: Zeit-gesteuerte Benachrichtigungen
4. **A/B Testing**: Verschiedene Notification-Texte testen
5. **Multi-Language**: Benachrichtigungen in mehreren Sprachen
6. **Web Push API**: Alternative zu FCM für mehr Browser-Support

### Mögliche Verbesserungen

1. **Batch Sending**: Mehrere Notifications auf einmal senden
2. **Topic-based Notifications**: Gruppierte Benachrichtigungen
3. **User Segmentation**: Zielgruppen-spezifische Notifications
4. **Analytics Dashboard**: Visual insights in Notification-Performance
