# Email Service Documentation

## Overview

Der Email Service verwaltet alle transaktionalen E-Mails für die B2C Autowartungs-App. Er unterstützt mehrere Email-Provider und bietet professionelle, responsive HTML-Templates mit Handlebars.

## Features

- **Multiple Email Providers**: Resend, SendGrid, SMTP, Console (Development)
- **Professional Templates**: Responsive HTML-Emails mit Handlebars-Engine
- **Type-Safe**: Vollständig typisiert mit TypeScript
- **Template Caching**: Automatisches Caching für Performance
- **Error Handling**: Umfassendes Error Logging
- **Plain Text Fallback**: Automatische Plain-Text-Versionen
- **Development Mode**: Console-Logging für lokale Entwicklung

## Email Types

### 1. Booking Confirmation (`booking-confirmation.html`)

**Zweck**: Bestätigung einer neuen Buchung

**Trigger**: Nach erfolgreicher Erstellung einer Buchung

**Template-Daten**:
```typescript
{
  customerName: string;
  email: string;
  bookingNumber: string;
  vehicle: {
    brand: string;
    model: string;
    year: number;
    mileage: string;
    licensePlate?: string;
  };
  serviceTypeLabel: string;
  statusLabel: string;
  isPaid: boolean;
  pickupDate: string;
  pickupTimeSlot: string;
  pickupAddress: string;
  pickupPostalCode: string;
  pickupCity: string;
  totalPrice: string;
  customerNotes?: string;
}
```

**Verwendung**:
```typescript
import { sendBookingConfirmation } from './services/email.service';

await sendBookingConfirmation(bookingWithRelations);
```

---

### 2. Payment Receipt (`payment-receipt.html`)

**Zweck**: Zahlungsbestätigung mit detaillierter Rechnung

**Trigger**: Nach erfolgreicher Zahlung (Stripe Webhook)

**Template-Daten**:
```typescript
{
  customerName: string;
  email: string;
  bookingNumber: string;
  serviceTypeLabel: string;
  vehicle: { brand, model, year };
  pickupDate: string;
  pickupTimeSlot: string;
  pickupAddress: string;
  basePrice: string;
  ageMultiplierAmount: string;
  vatAmount: string;
  totalPrice: string;
  paymentMethod: string;
  transactionId: string;
  paymentDate: string;
  priceBreakdown: object;
}
```

**Verwendung**:
```typescript
import { sendPaymentReceipt } from './services/email.service';

await sendPaymentReceipt(bookingWithRelations, {
  paymentIntentId: 'pi_xxx',
  amount: 299.99,
  paymentMethod: 'Kreditkarte',
  paidAt: new Date()
});
```

---

### 3. Extension Request (`extension-request.html`)

**Zweck**: Anfrage zur Terminverschiebung

**Trigger**: Wenn ein Termin verschoben werden muss

**Template-Daten**:
```typescript
{
  customerName: string;
  email: string;
  bookingNumber: string;
  vehicle: { brand, model, year };
  serviceTypeLabel: string;
  currentPickupDate: string;
  currentPickupTimeSlot: string;
  newPickupDate: string;
  newPickupTimeSlot: string;
  estimatedDelivery?: string;
  reason?: string;
  confirmationUrl?: string;
  declineUrl?: string;
}
```

**Verwendung**:
```typescript
import { sendExtensionRequest } from './services/email.service';

await sendExtensionRequest(bookingWithRelations, {
  newPickupDate: new Date('2024-02-01'),
  newPickupTimeSlot: '10:00-12:00',
  reason: 'Werkstatt-Engpass',
  estimatedDelivery: new Date('2024-02-02'),
  confirmationUrl: 'https://app.example.com/confirm-extension/xxx',
  declineUrl: 'https://app.example.com/decline-extension/xxx'
});
```

---

### 4. Status Update (`status-update.html`)

**Zweck**: Status-Updates während des Buchungsprozesses

**Trigger**: Bei Statusänderungen (CONFIRMED, JOCKEY_ASSIGNED, IN_WORKSHOP, etc.)

**Template-Daten**:
```typescript
{
  customerName: string;
  email: string;
  bookingNumber: string;
  currentStatus: BookingStatus;
  statusLabel: string;
  statusClass: string;
  statusIcon: string;
  statusTitle: string;
  statusDescription: string;
  progressPercent: number;
  vehicle: { brand, model, year };
  serviceTypeLabel: string;
  pickupDate?: string;
  deliveryDate?: string;
  jockey?: { name, phone, rating };
  timeline: object;
  nextSteps: string[];
  additionalNotes?: string;
}
```

**Verwendung**:
```typescript
import { sendStatusUpdate } from './services/email.service';

await sendStatusUpdate(
  bookingWithRelations,
  BookingStatus.JOCKEY_ASSIGNED,
  'Ihr Jockey wird Sie in Kürze kontaktieren'
);
```

**Status-Typen**:
- `PENDING_PAYMENT`: Zahlung ausstehend
- `CONFIRMED`: Buchung bestätigt
- `JOCKEY_ASSIGNED`: Jockey zugewiesen
- `IN_TRANSIT_TO_WORKSHOP`: Auf dem Weg zur Werkstatt
- `IN_WORKSHOP`: In der Werkstatt
- `COMPLETED`: Service abgeschlossen
- `IN_TRANSIT_TO_CUSTOMER`: Auf dem Rückweg
- `DELIVERED`: Fahrzeug übergeben
- `CANCELLED`: Storniert

---

### 5. Magic Link Email

**Zweck**: Passwordless Login (Magic Link Authentication)

**Trigger**: Bei Login-Anfrage

**Verwendung**:
```typescript
import { sendMagicLinkEmail } from './services/email.service';

await sendMagicLinkEmail(
  'customer@example.com',
  'https://app.example.com/auth/verify?token=xxx'
);
```

---

## Email Provider Setup

### 1. Console Mode (Development)

**Konfiguration**:
```env
EMAIL_PROVIDER=console
```

Emails werden in der Konsole ausgegeben - ideal für lokale Entwicklung.

---

### 2. Resend (Empfohlen)

**Vorteile**:
- Modern und entwicklerfreundlich
- Einfaches Setup
- Günstiges Pricing
- Gute Zustellbarkeit
- TypeScript-Support

**Setup**:
1. Account erstellen: https://resend.com
2. API Key generieren
3. Domain verifizieren (für Produktion)

**Konfiguration**:
```env
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_your_api_key
EMAIL_FROM=B2C Autowartung <noreply@b2c-autowartung.de>
```

**Installation** (bereits installiert):
```bash
npm install resend
```

---

### 3. SendGrid

**Vorteile**:
- Etablierter Provider
- Hohe Zustellbarkeit
- Umfangreiche Features

**Setup**:
1. Account erstellen: https://sendgrid.com
2. API Key generieren
3. Sender Identity verifizieren

**Konfiguration**:
```env
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.your_api_key
EMAIL_FROM=B2C Autowartung <noreply@b2c-autowartung.de>
```

**Installation**:
```bash
npm install @sendgrid/mail
```

---

### 4. SMTP (Mailtrap für Testing)

**Vorteile**:
- Standard-Protokoll
- Funktioniert mit jedem SMTP-Server
- Ideal für lokales Testing mit Mailtrap

**Setup (Mailtrap)**:
1. Account erstellen: https://mailtrap.io
2. SMTP-Credentials kopieren

**Konfiguration**:
```env
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_mailtrap_username
SMTP_PASS=your_mailtrap_password
EMAIL_FROM=B2C Autowartung <noreply@b2c-autowartung.de>
```

**Mailtrap Features**:
- Email Preview
- Spam Score Analyse
- HTML/CSS Validierung
- Responsive Testing

---

## Template Development

### Template-Struktur

Templates befinden sich in `/emails/templates/`:
```
emails/
├── templates/
│   ├── booking-confirmation.html
│   ├── payment-receipt.html
│   ├── extension-request.html
│   └── status-update.html
└── README.md
```

### Handlebars Helpers

**Verfügbare Helper**:

```handlebars
{{!-- Equality Check --}}
{{#if (eq status 'CONFIRMED')}}
  Bestätigt
{{/if}}

{{!-- Greater Than --}}
{{#if (gt priceBreakdown.ageMultiplier 1)}}
  Alterszuschlag
{{/if}}

{{!-- Format Date (deprecated - use in data preparation) --}}
{{formatDate pickupDate}}

{{!-- Format Price (deprecated - use in data preparation) --}}
{{formatPrice totalPrice}}
```

### Template-Best-Practices

1. **Responsive Design**: Alle Templates sind mobil-optimiert
2. **Plain Text Fallback**: Immer Plain-Text-Version bereitstellen
3. **Inline CSS**: Für maximale Email-Client-Kompatibilität
4. **Safe Colors**: Web-sichere Farbpalette verwenden
5. **Alt-Text**: Für alle Bilder (falls später hinzugefügt)

### Template Testing

**Lokales Testing**:
```bash
# 1. Console Mode
EMAIL_PROVIDER=console npm run dev

# 2. Mailtrap
EMAIL_PROVIDER=smtp npm run dev

# 3. Resend (Test Mode)
EMAIL_PROVIDER=resend npm run dev
```

**Email Preview Tools**:
- [Mailtrap](https://mailtrap.io) - Email Testing Service
- [Litmus](https://litmus.com) - Professional Email Testing
- [Email on Acid](https://www.emailonacid.com) - Email Testing Platform

---

## Integration Examples

### Booking Flow Integration

```typescript
// In bookings.service.ts
import { sendBookingConfirmation, sendPaymentReceipt } from './email.service';

async createBooking(input: CreateBookingInput) {
  const booking = await this.bookingsRepository.create(bookingParams);

  // Send booking confirmation
  await sendBookingConfirmation(booking);

  return booking;
}

async handlePaymentSuccess(bookingId: string, payment: Payment) {
  const booking = await this.bookingsRepository.findById(bookingId);

  // Send payment receipt
  await sendPaymentReceipt(booking, {
    paymentIntentId: payment.id,
    amount: payment.amount,
    paymentMethod: 'Kreditkarte',
    paidAt: new Date()
  });
}
```

### Status Update Flow

```typescript
// In bookings.service.ts
async updateBookingStatus(bookingId: string, newStatus: BookingStatus) {
  const booking = await this.bookingsRepository.update(bookingId, {
    status: newStatus
  });

  // Send status update email for important status changes
  const notifiableStatuses = [
    BookingStatus.CONFIRMED,
    BookingStatus.JOCKEY_ASSIGNED,
    BookingStatus.IN_WORKSHOP,
    BookingStatus.COMPLETED,
    BookingStatus.DELIVERED
  ];

  if (notifiableStatuses.includes(newStatus)) {
    await sendStatusUpdate(booking, newStatus);
  }

  return booking;
}
```

---

## Error Handling

Der Email Service implementiert umfassendes Error Handling:

```typescript
try {
  await sendBookingConfirmation(booking);
} catch (error) {
  // Error wird geloggt, aber nicht geworfen
  // Die Buchung wird trotzdem erstellt
  logger.error({
    message: 'Failed to send booking confirmation email',
    bookingId: booking.id,
    error: error.message
  });
}
```

**Best Practice**: Email-Fehler sollten die Hauptfunktionalität nicht blockieren.

---

## Performance

### Template Caching

Templates werden nach dem ersten Laden gecached:
```typescript
const templateCache = new Map<string, HandlebarsTemplateDelegate>();
```

**Vorteile**:
- Keine wiederholten Dateisystem-Zugriffe
- Schnellere Email-Generierung
- Reduzierte Server-Last

### Asynchrones Versenden

Für produktive Umgebungen empfehlen wir eine Queue (z.B. BullMQ):

```typescript
// Optional: Email Queue Setup
import { Queue } from 'bullmq';

const emailQueue = new Queue('emails', {
  connection: {
    host: 'localhost',
    port: 6379
  }
});

// Enqueue email
await emailQueue.add('send-booking-confirmation', {
  bookingId: booking.id
});
```

---

## Monitoring & Logging

Alle Email-Operationen werden geloggt:

```typescript
// Success
logger.info({
  message: 'Email sent successfully',
  provider: EMAIL_PROVIDER,
  to: options.to,
  subject: options.subject
});

// Error
logger.error({
  message: 'Failed to send email',
  provider: EMAIL_PROVIDER,
  to: options.to,
  subject: options.subject,
  error: error.message
});
```

**Log-Analyse**:
- Erfolgsrate tracken
- Fehlerhafte Adressen identifizieren
- Provider-Performance vergleichen

---

## Localization (Future)

Aktuell sind alle Templates auf Deutsch. Für Multi-Language-Support:

```typescript
// Future Implementation
interface EmailLocale {
  de: HandlebarsTemplateDelegate;
  en: HandlebarsTemplateDelegate;
  // ...
}

async function loadLocalizedTemplate(
  templateName: string,
  locale: string
): Promise<HandlebarsTemplateDelegate> {
  const templatePath = path.join(
    __dirname,
    '../../emails/templates',
    locale,
    `${templateName}.html`
  );
  // ...
}
```

---

## Testing

### Unit Tests

```typescript
// __tests__/email.service.test.ts
describe('Email Service', () => {
  describe('sendBookingConfirmation', () => {
    it('should send booking confirmation email', async () => {
      const mockBooking = createMockBooking();
      await expect(sendBookingConfirmation(mockBooking))
        .resolves.not.toThrow();
    });

    it('should handle template errors gracefully', async () => {
      // Test error scenarios
    });
  });
});
```

### Integration Tests

```typescript
describe('Email Integration', () => {
  it('should send email via Resend', async () => {
    process.env.EMAIL_PROVIDER = 'resend';
    process.env.RESEND_API_KEY = 'test_key';

    // Test actual sending
  });
});
```

---

## Security

### Email Address Validation

Emails werden über Express Validator validiert:
```typescript
body('email').isEmail().normalizeEmail()
```

### Rate Limiting

Email-Versand sollte rate-limited sein:
```typescript
const emailRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 emails per 15 minutes
  message: 'Too many emails sent'
});
```

### Spam Prevention

- Double-Opt-In für Newsletter (future)
- Unsubscribe-Links (future)
- SPF/DKIM/DMARC Setup (provider-abhängig)

---

## Troubleshooting

### Email kommt nicht an

1. **Provider-Logs prüfen** (Resend Dashboard, etc.)
2. **Spam-Ordner prüfen**
3. **Domain-Verifizierung prüfen**
4. **Rate Limits prüfen**

### Template wird nicht geladen

1. **Pfad prüfen**: `/emails/templates/{name}.html`
2. **Dateiberechtigung prüfen**
3. **Template-Syntax validieren**

### SMTP-Fehler

1. **Credentials prüfen**
2. **Port/Host prüfen**
3. **Firewall-Regeln prüfen**
4. **TLS/SSL Settings prüfen**

---

## Roadmap

### Geplante Features

- [ ] Email-Queue mit BullMQ
- [ ] Multi-Language Support
- [ ] Email-Attachments (PDFs, Invoices)
- [ ] Newsletter-System
- [ ] Email-Tracking (Open Rate, Click Rate)
- [ ] A/B Testing für Templates
- [ ] Automated Template Testing
- [ ] Webhook-basierte Delivery-Tracking

---

## Support

Bei Fragen oder Problemen:
- **Dokumentation**: Siehe dieses README
- **Code**: `/src/services/email.service.ts`
- **Templates**: `/emails/templates/`

---

**Version**: 1.0.0
**Letzte Aktualisierung**: 2024-02-01
