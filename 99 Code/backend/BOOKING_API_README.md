# Booking API - Quick Start Guide

## Overview

Die Booking API ist vollständig implementiert und einsatzbereit. Diese Dokumentation bietet einen schnellen Einstieg.

## Implementierte Komponenten

### 1. Backend-Struktur

```
backend/
├── src/
│   ├── routes/
│   │   └── bookings.routes.ts          ✅ Vollständig implementiert
│   ├── controllers/
│   │   └── bookings.controller.ts      ✅ Vollständig implementiert
│   ├── services/
│   │   ├── bookings.service.ts         ✅ Vollständig implementiert
│   │   ├── payment.service.ts          ✅ Integration vorhanden
│   │   ├── email.service.ts            ✅ Integration vorhanden
│   │   └── notification.service.ts     ✅ Integration vorhanden
│   ├── repositories/
│   │   ├── bookings.repository.ts      ✅ Vollständig implementiert
│   │   ├── vehicles.repository.ts      ✅ Vollständig implementiert
│   │   └── price-matrix.repository.ts  ✅ Vollständig implementiert
│   ├── middleware/
│   │   ├── auth.ts                     ✅ Authentication
│   │   └── rbac.ts                     ✅ Authorization
│   ├── tests/
│   │   ├── bookings.test.ts            ✅ Unit Tests
│   │   └── bookings.integration.test.ts ✅ Integration Tests
│   └── examples/
│       └── booking-api-examples.sh      ✅ cURL Examples
├── prisma/
│   └── schema.prisma                    ✅ Booking & Extension Models
├── postman/
│   └── Booking_API.postman_collection.json ✅ Postman Collection
├── BOOKING_API_COMPLETE_GUIDE.md         ✅ Vollständige Dokumentation
└── BOOKING_API_README.md                 ✅ Quick Start Guide
```

## Schnellstart

### 1. Installation

```bash
# Backend installieren
cd backend
npm install

# Datenbank-Schema aktualisieren
npx prisma generate
npx prisma db push
```

### 2. Umgebungsvariablen

Erstellen Sie eine `.env` Datei:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/b2c_db"

# JWT
JWT_SECRET="your-secret-key-min-32-characters"
JWT_EXPIRES_IN="24h"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email (Optional)
EMAIL_PROVIDER="console"  # oder "resend", "smtp"
RESEND_API_KEY="re_..."
EMAIL_FROM="B2C Autowartung <noreply@b2c-autowartung.de>"

# Firebase (Optional für Push-Benachrichtigungen)
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_PRIVATE_KEY="your-private-key"
FIREBASE_CLIENT_EMAIL="your-client-email"

# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"
```

### 3. Server starten

```bash
# Development Mode
npm run dev

# Production Mode
npm run build
npm start
```

### 4. Erste Buchung erstellen

**Mit cURL:**

```bash
curl -X POST http://localhost:5001/api/bookings \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleId": "YOUR_VEHICLE_ID",
    "serviceType": "INSPECTION",
    "pickupDate": "2026-03-15T00:00:00Z",
    "pickupTimeSlot": "09:00-11:00",
    "pickupAddress": "Hauptstraße 1",
    "pickupCity": "Berlin",
    "pickupPostalCode": "10115",
    "customerNotes": "Bitte vorsichtig fahren"
  }'
```

**Mit dem Examples Script:**

```bash
# Script ausführbar machen
chmod +x src/examples/booking-api-examples.sh

# Skript ausführen
./src/examples/booking-api-examples.sh
```

**Mit Postman:**

1. Importieren Sie `postman/Booking_API.postman_collection.json`
2. Setzen Sie die Collection Variables:
   - `base_url`: `http://localhost:5001/api`
   - `jwt_token`: Ihr JWT Token
   - `vehicle_id`: Eine gültige Vehicle ID
3. Führen Sie die Requests aus

## API Endpoints

### Übersicht

| Methode | Endpoint | Beschreibung |
|---------|----------|--------------|
| POST | `/api/bookings` | Neue Buchung erstellen |
| GET | `/api/bookings` | Alle Buchungen auflisten |
| GET | `/api/bookings/:id` | Einzelne Buchung abrufen |
| PUT | `/api/bookings/:id` | Buchung aktualisieren |
| DELETE | `/api/bookings/:id` | Buchung stornieren |
| GET | `/api/bookings/:id/status` | Status abrufen |
| GET | `/api/bookings/:id/extensions` | Erweiterungen abrufen |
| POST | `/api/bookings/:id/extensions/:extensionId/approve` | Erweiterung genehmigen |
| POST | `/api/bookings/:id/extensions/:extensionId/decline` | Erweiterung ablehnen |

### Service Types

- `INSPECTION` - Inspektion
- `OIL_SERVICE` - Ölwechsel
- `BRAKE_SERVICE` - Bremsenwartung
- `TUV` - TÜV/HU
- `CLIMATE_SERVICE` - Klimaservice
- `CUSTOM` - Individueller Service

### Booking Status Flow

```
PENDING_PAYMENT
    ↓
CONFIRMED
    ↓
JOCKEY_ASSIGNED
    ↓
IN_TRANSIT_TO_WORKSHOP
    ↓
IN_WORKSHOP
    ↓
COMPLETED
    ↓
IN_TRANSIT_TO_CUSTOMER
    ↓
DELIVERED
```

## Testing

### Unit Tests

```bash
# Alle Tests
npm test

# Nur Booking Tests
npm test -- bookings.test.ts

# Watch Mode
npm run test:watch
```

### Integration Tests

```bash
# Integration Tests (benötigt laufende Datenbank)
npm test -- bookings.integration.test.ts
```

### Test Coverage

```bash
npm test -- --coverage
```

## Datenbank-Schema

### Booking Model

```prisma
model Booking {
  id               String        @id @default(cuid())
  bookingNumber    String        @unique
  customerId       String
  vehicleId        String
  serviceType      ServiceType
  mileageAtBooking Int
  status           BookingStatus @default(PENDING_PAYMENT)
  totalPrice       Decimal       @db.Decimal(10, 2)
  priceBreakdown   Json?
  pickupDate       DateTime
  pickupTimeSlot   String
  deliveryDate     DateTime?
  deliveryTimeSlot String?
  pickupAddress    String
  pickupCity       String
  pickupPostalCode String
  jockeyId         String?
  paymentIntentId  String?
  paidAt           DateTime?
  customerNotes    String?       @db.Text
  internalNotes    String?       @db.Text
  extensions       Extension[]
  createdAt        DateTime      @default(now())
  updatedAt        DateTime      @updatedAt
}
```

### Extension Model

```prisma
model Extension {
  id              String          @id @default(cuid())
  bookingId       String
  booking         Booking         @relation(fields: [bookingId], references: [id])
  description     String          @db.Text
  items           Json
  totalAmount     Int
  images          String[]
  videos          String[]
  status          ExtensionStatus @default(PENDING)
  paymentIntentId String?
  paidAt          DateTime?
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  approvedAt      DateTime?
  declinedAt      DateTime?
}
```

## Business Logic

### 1. Preisberechnung

Die Preisberechnung erfolgt automatisch basierend auf:

- **Fahrzeugmarke & Modell**: Aus der PriceMatrix
- **Baujahr**: Age Multiplier (ältere Fahrzeuge = höherer Preis)
- **Kilometerstand**: Mileage Interval (höhere Laufleistung = höherer Preis)
- **Service-Typ**: Unterschiedliche Basis-Preise

```typescript
// Beispiel: VW Golf 7 (2015, 80.000 km)
{
  basePrice: 250.00,
  ageMultiplier: 1.2,  // 20% Aufschlag für 9 Jahre altes Fahrzeug
  finalPrice: 299.99,
  mileageInterval: "60000-100000"
}
```

### 2. Zahlungsfluss

1. **Booking Creation**: Payment Intent wird erstellt
2. **Client-Side Payment**: Frontend nutzt Stripe.js
3. **Webhook Verification**: Backend verarbeitet `payment_intent.succeeded`
4. **Status Update**: Booking → `CONFIRMED`
5. **Email & Notification**: Kunde wird benachrichtigt

### 3. Stornierung & Refund

Stornierbar in folgenden Status:
- `PENDING_PAYMENT`
- `CONFIRMED`
- `JOCKEY_ASSIGNED`

Automatische Rückerstattung bei bereits bezahlten Buchungen.

### 4. Service Extensions

Workflow:
1. Werkstatt identifiziert zusätzliche Arbeiten
2. Extension Request wird erstellt
3. Kunde erhält Push + Email Benachrichtigung
4. Kunde genehmigt oder lehnt ab
5. Bei Genehmigung: Neuer Payment Intent
6. Kunde zahlt zusätzliche Kosten
7. Werkstatt führt Arbeit aus

## Integration mit anderen Services

### Payment Service (Stripe)

```typescript
// Automatisch bei Booking Creation
const paymentIntent = await paymentService.createPaymentIntent({
  amount: totalPriceInCents,
  bookingId: booking.id,
  customerId: user.userId,
  customerEmail: user.email,
  metadata: {
    bookingNumber: booking.bookingNumber,
    serviceType: booking.serviceType
  }
});
```

### Email Service

```typescript
// Automatisch nach Buchung
await sendBookingConfirmation(booking);

// Bei Status-Änderung
await sendStatusUpdate(booking, newStatus);

// Bei Extension Request
await sendExtensionRequest(booking, extension);
```

### Notification Service (Push)

```typescript
// Bei wichtigen Events
await sendNotification({
  userId: customerId,
  type: NotificationType.BOOKING_CONFIRMATION,
  title: 'Buchung erstellt',
  body: `Ihre Buchung ${bookingNumber} wurde erstellt.`,
  bookingId: booking.id,
  data: { /* Additional data */ }
});
```

### Analytics Service

```typescript
// Tracking von Booking Events
analyticsService.trackEvent({
  event: 'booking_created',
  userId: customerId,
  properties: {
    bookingId,
    serviceType,
    totalPrice
  }
});
```

## Fehlerbehandlung

### Validierung

Alle Eingaben werden mit Zod validiert:

```typescript
const createBookingSchema = z.object({
  vehicleId: z.string().cuid(),
  serviceType: z.nativeEnum(ServiceType),
  pickupDate: z.string().datetime(),
  pickupTimeSlot: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]-([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  pickupAddress: z.string().min(1),
  pickupCity: z.string().min(1),
  pickupPostalCode: z.string().min(1),
  customerNotes: z.string().optional()
});
```

### Error Responses

```json
{
  "success": false,
  "error": {
    "message": "Vehicle not found",
    "statusCode": 404
  }
}
```

### Common Errors

| Status | Message | Lösung |
|--------|---------|--------|
| 400 | Invalid time slot format | Format: "HH:MM-HH:MM" |
| 400 | Pickup date must be in the future | Datum in Zukunft wählen |
| 401 | Authentication required | JWT Token prüfen |
| 403 | Vehicle does not belong to customer | Nur eigene Fahrzeuge buchbar |
| 404 | Vehicle not found | Valide Vehicle ID verwenden |
| 409 | Time slot not available | Anderen Zeitslot wählen |

## Performance

### Optimierungen

- **Database Indexing**: Optimiert für häufige Queries
- **Eager Loading**: Relations werden mit geladen
- **Pagination**: Standard 20 Items pro Seite
- **Caching**: Template Caching für Emails

### Monitoring

Logs werden strukturiert mit Winston ausgegeben:

```typescript
logger.info({
  message: 'Booking created',
  bookingId,
  customerId,
  totalPrice
});
```

## Security

### Authentication

- JWT Token erforderlich für alle Endpoints
- Token Expiration: 24 Stunden
- Refresh Token Flow verfügbar

### Authorization

- Customers können nur eigene Bookings sehen/bearbeiten
- RBAC Middleware prüft Berechtigungen
- Status-Transitions werden validiert

### Data Protection

- SQL Injection: Verhindert durch Prisma ORM
- XSS Protection: Input Sanitization
- Rate Limiting: 100 Requests pro 15 Minuten
- GDPR Compliant: Soft Deletes, Datenexport

## Deployment

### Environment-Spezifische Konfiguration

**Development:**
```env
NODE_ENV=development
EMAIL_PROVIDER=console
STRIPE_SECRET_KEY=sk_test_...
```

**Staging:**
```env
NODE_ENV=staging
EMAIL_PROVIDER=resend
STRIPE_SECRET_KEY=sk_test_...
```

**Production:**
```env
NODE_ENV=production
EMAIL_PROVIDER=resend
STRIPE_SECRET_KEY=sk_live_...
```

### Database Migrations

```bash
# Development
npx prisma migrate dev

# Production
npx prisma migrate deploy
```

## Support & Dokumentation

### Ressourcen

- **Complete Guide**: `BOOKING_API_COMPLETE_GUIDE.md`
- **API Reference**: `API_DOCUMENTATION.md`
- **Postman Collection**: `postman/Booking_API.postman_collection.json`
- **Examples**: `src/examples/booking-api-examples.sh`

### Kontakt

- **Development Team**: dev@b2c-autowartung.de
- **GitHub Issues**: github.com/b2c-autowartung/backend/issues
- **Slack Channel**: #api-support

## Changelog

### Version 1.0.0 (2026-02-01)

**Implementiert:**
- ✅ Vollständige CRUD-Operationen für Bookings
- ✅ Service Extension Management
- ✅ Payment Integration (Stripe)
- ✅ Email Notifications
- ✅ Push Notifications
- ✅ Status Tracking mit History
- ✅ Cancellation mit Refund
- ✅ Price Calculation Engine
- ✅ Time Slot Validation
- ✅ Unit & Integration Tests
- ✅ Comprehensive Documentation
- ✅ Postman Collection
- ✅ cURL Examples

**Kommende Features:**
- Webhook für externe Integrationen
- Recurring Bookings
- Batch Operations
- Advanced Analytics
- Multi-Language Support

---

**Status**: ✅ Production Ready

**Letzte Aktualisierung**: 1. Februar 2026
