# Email Service Quick Start Guide

## Setup in 5 Minuten

### 1. Environment Configuration

Wähle einen Email Provider und konfiguriere die `.env` Datei:

#### Option A: Console Mode (Development - Sofort startklar)
```env
EMAIL_PROVIDER=console
EMAIL_FROM=B2C Autowartung <noreply@b2c-autowartung.de>
```

#### Option B: Resend (Empfohlen für Produktion)
```env
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_your_api_key
EMAIL_FROM=B2C Autowartung <noreply@yourdomain.com>
```

1. Account erstellen: https://resend.com
2. API Key kopieren
3. Domain verifizieren (optional für Test)

#### Option C: Mailtrap (Email Testing)
```env
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_username
SMTP_PASS=your_password
EMAIL_FROM=B2C Autowartung <noreply@b2c-autowartung.de>
```

1. Account erstellen: https://mailtrap.io
2. SMTP Credentials kopieren

---

### 2. Test Email Sending

```bash
# Test alle Email-Templates
npm run test:emails

# Test einzelne Templates
npm run test:emails booking-confirmation
npm run test:emails payment-receipt
npm run test:emails status-update
npm run test:emails magic-link
```

---

### 3. Integration in Code

#### Booking Confirmation
```typescript
import { sendBookingConfirmation } from './services/email.service';

// Nach Erstellung einer Buchung
const booking = await bookingsRepository.create(params);
await sendBookingConfirmation(booking);
```

#### Payment Receipt
```typescript
import { sendPaymentReceipt } from './services/email.service';

// Nach erfolgreicher Zahlung
await sendPaymentReceipt(booking, {
  paymentIntentId: 'pi_xxx',
  amount: 299.99,
  paymentMethod: 'Kreditkarte',
  paidAt: new Date()
});
```

#### Status Update
```typescript
import { sendStatusUpdate } from './services/email.service';

// Bei Statusänderung
await sendStatusUpdate(
  booking,
  BookingStatus.JOCKEY_ASSIGNED,
  'Optional: Zusätzliche Notizen'
);
```

#### Extension Request
```typescript
import { sendExtensionRequest } from './services/email.service';

// Bei Terminverschiebung
await sendExtensionRequest(booking, {
  newPickupDate: new Date('2024-02-20'),
  newPickupTimeSlot: '14:00-16:00',
  reason: 'Werkstatt-Engpass',
  estimatedDelivery: new Date('2024-02-21'),
  confirmationUrl: 'https://app.example.com/confirm',
  declineUrl: 'https://app.example.com/decline'
});
```

#### Magic Link (Auth)
```typescript
import { sendMagicLinkEmail } from './services/email.service';

// Login-Link senden
await sendMagicLinkEmail(
  'customer@example.com',
  'https://app.example.com/auth/verify?token=xxx'
);
```

---

### 4. Error Handling Best Practices

```typescript
// Emails sollten Hauptfunktionalität nicht blockieren
try {
  await sendBookingConfirmation(booking);
} catch (error) {
  logger.error('Failed to send booking confirmation', error);
  // Continue - Buchung ist trotzdem erstellt
}
```

---

## Template Customization

### Template Locations
```
emails/templates/
├── booking-confirmation.html
├── payment-receipt.html
├── extension-request.html
└── status-update.html
```

### Änderungen an Templates

1. HTML bearbeiten in `/emails/templates/{name}.html`
2. Handlebars-Syntax verwenden: `{{variableName}}`
3. Server neu starten (Templates werden gecached)
4. Testen mit: `npm run test:emails {template-name}`

### Verfügbare Handlebars Helpers

```handlebars
{{!-- Vergleich --}}
{{#if (eq status 'CONFIRMED')}}Bestätigt{{/if}}

{{!-- Größer als --}}
{{#if (gt price 100)}}Teuer{{/if}}

{{!-- Iteration --}}
{{#each nextSteps}}
  <li>{{this}}</li>
{{/each}}
```

---

## Production Checklist

### Vor dem Go-Live

- [ ] Email Provider konfiguriert (Resend/SendGrid)
- [ ] Domain verifiziert
- [ ] SPF/DKIM/DMARC Records gesetzt
- [ ] Sender Email validiert
- [ ] Templates getestet
- [ ] Error Logging aktiviert
- [ ] Rate Limiting konfiguriert

### Resend Production Setup

```bash
# 1. Domain verifizieren
https://resend.com/domains

# 2. DNS Records hinzufügen
# SPF: v=spf1 include:resend.com ~all
# DKIM: Resend stellt Record bereit

# 3. API Key für Production
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_prod_your_api_key
EMAIL_FROM=noreply@yourdomain.com
```

---

## Monitoring

### Email Logs

Alle Emails werden geloggt:
```
logs/combined.log - Alle Logs
logs/error.log    - Nur Fehler
```

### Check Email Status

**Resend Dashboard**: https://resend.com/emails
**Mailtrap Inbox**: https://mailtrap.io/inboxes

### Metrics zu tracken

- Erfolgsrate
- Durchschnittliche Sendezeit
- Fehlerrate nach Provider
- Bounce Rate
- Open Rate (mit Tracking)

---

## Troubleshooting

### "Template not found"
```bash
# Prüfe ob Template existiert
ls emails/templates/

# Stelle sicher Templates accessible sind
chmod 644 emails/templates/*.html
```

### "Resend API Error"
```bash
# Prüfe API Key
echo $RESEND_API_KEY

# Prüfe Domain Verifizierung
https://resend.com/domains
```

### "SMTP Connection failed"
```bash
# Teste SMTP Verbindung
telnet smtp.mailtrap.io 587

# Prüfe Credentials
echo $SMTP_USER
echo $SMTP_PASS
```

### Emails kommen nicht an

1. Spam-Ordner prüfen
2. Provider-Dashboard prüfen
3. DNS Records validieren (MX-Toolbox)
4. Rate Limits prüfen

---

## FAQ

**Q: Kann ich mehrere Provider gleichzeitig nutzen?**
A: Aktuell nicht, aber du kannst zwischen Providern wechseln über `EMAIL_PROVIDER` ENV.

**Q: Wie kann ich Attachments senden?**
A: Aktuell nicht unterstützt. Geplant für v2.0.

**Q: Unterstützt der Service mehrere Sprachen?**
A: Aktuell nur Deutsch. Multi-Language Support ist geplant.

**Q: Wie teste ich Emails lokal?**
A: Nutze `EMAIL_PROVIDER=console` oder Mailtrap für realistische Tests.

**Q: Können Emails in Queue gestellt werden?**
A: Aktuell synchron. BullMQ Queue-Support ist in Planung.

---

## Support Resources

- **Vollständige Dokumentation**: [README.md](./README.md)
- **Service Code**: `/src/services/email.service.ts`
- **Test Script**: `/src/scripts/test-emails.ts`
- **Templates**: `/emails/templates/`

---

## Next Steps

1. ✅ Email Service konfiguriert
2. ➡️ Templates testen mit `npm run test:emails`
3. ➡️ Integration in Booking Flow
4. ➡️ Integration in Payment Flow
5. ➡️ Status Update Notifications implementieren

---

**Version**: 1.0.0
**Last Updated**: 2024-02-01
