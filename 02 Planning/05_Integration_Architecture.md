# Integration Architecture - B2C Autowartungs-App

**Version:** 1.0  
**Datum:** 2026-02-01  
**Status:** READY FOR IMPLEMENTATION

---

## Executive Summary

Dieses Dokument beschreibt die Integration externer Systeme:
1. **Stripe** - Payment-Processing
2. **Odoo** - Buchhaltung & ERP
3. **Driver-App** - Jockey-Koordination

---

## 1. Stripe Integration (Payment-Processing)

### 1.1 Übersicht

**Zweck:** Sichere Online-Zahlungen für Buchungen und Auftragserweiterungen

**Compliance:** PCI-DSS Level 1 (Stripe hosted)

**Modi:**
- Lokal: Test Mode mit Stripe CLI
- Production: Live Mode mit echten Zahlungen

---

### 1.2 Setup (Lokal)

**Stripe Test-Account erstellen:**
1. https://dashboard.stripe.com/register
2. Test Mode aktivieren (Toggle oben rechts)
3. API Keys kopieren: Developers → API Keys

**Environment Variables:**
\`\`\`bash
STRIPE_SECRET_KEY="your_stripe_secret_key_here"
STRIPE_PUBLISHABLE_KEY="your_stripe_publishable_key_here"
STRIPE_WEBHOOK_SECRET="your_stripe_webhook_secret_here"
\`\`\`

**Stripe CLI für Webhooks:**
\`\`\`bash
stripe login
stripe listen --forward-to localhost:5000/webhooks/stripe
\`\`\`

---

### 1.3 Payment-Flows

#### Flow 1: Buchung bezahlen

\`\`\`typescript
// 1. Payment Intent erstellen (Backend)
const paymentIntent = await stripe.paymentIntents.create({
  amount: 24900, // 249 EUR in Cents
  currency: 'eur',
  metadata: {
    bookingId: booking.id,
    customerId: customer.id,
  },
});

// 2. Client Secret an Frontend senden
return { clientSecret: paymentIntent.client_secret };

// 3. Frontend: Stripe Checkout
const stripe = await loadStripe(STRIPE_PUBLISHABLE_KEY);
const { error } = await stripe.confirmCardPayment(clientSecret, {
  payment_method: {
    card: cardElement,
    billing_details: { email: customer.email },
  },
});

// 4. Webhook: payment_intent.succeeded
app.post('/webhooks/stripe', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const event = stripe.webhooks.constructEvent(req.body, sig, WEBHOOK_SECRET);
  
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    await updateBookingStatus(paymentIntent.metadata.bookingId, 'CONFIRMED');
    await sendConfirmationEmail(paymentIntent.metadata.customerId);
    await syncToOdoo(paymentIntent.metadata.bookingId);
  }
  
  res.json({ received: true });
});
\`\`\`

#### Flow 2: Auftragserweiterung bezahlen

\`\`\`typescript
// Gespeicherte Zahlungsmethode nutzen
const paymentMethod = await prisma.customer.findUnique({
  where: { id: customerId },
  select: { stripePaymentMethodId: true },
});

const paymentIntent = await stripe.paymentIntents.create({
  amount: findingPrice * 100,
  currency: 'eur',
  customer: customer.stripeCustomerId,
  payment_method: paymentMethod,
  off_session: true,
  confirm: true,
  metadata: { findingId: finding.id },
});
\`\`\`

---

### 1.4 Error-Handling

\`\`\`typescript
try {
  const paymentIntent = await stripe.paymentIntents.create({ /* ... */ });
} catch (error) {
  if (error.type === 'StripeCardError') {
    // Karte abgelehnt
    return { error: 'Zahlung fehlgeschlagen: ' + error.message };
  } else if (error.type === 'StripeInvalidRequestError') {
    // Ungültige Parameter
    console.error('Stripe Error:', error);
    return { error: 'Technischer Fehler' };
  }
}
\`\`\`

**Retry-Strategie:**
- Webhook-Fehler: 3 Versuche mit Exponential Backoff
- Payment-Fehler: Kunde erhält E-Mail mit Retry-Link

---

### 1.5 Test-Cards

\`\`\`
Erfolgreiche Zahlung:
  4242 4242 4242 4242
  Datum: beliebig (Zukunft), CVC: beliebig

Abgelehnte Zahlung:
  4000 0000 0000 0002

3D Secure (SCA):
  4000 0027 6000 3184
\`\`\`

---

## 2. Odoo Integration (Buchhaltung)

### 2.1 Übersicht

**Zweck:** Automatische Synchronisation von Buchungen, Rechnungen und Zahlungen

**API:** Odoo XML-RPC API oder REST API (je nach Odoo-Version)

**Modi:**
- Lokal: Mock/Stub (JSON-Logs)
- Production: Echte Odoo-API

---

### 2.2 Setup (Lokal - Mock)

**Mock-Service für MVP:**
\`\`\`typescript
// lib/odoo/odoo-mock.ts
export class OdooMockService {
  async createCustomer(data: CustomerData) {
    const odooId = Math.floor(Math.random() * 10000);
    console.log('[ODOO MOCK] Create Customer:', { ...data, odooId });
    
    // Logs für Debugging
    await fs.appendFile('./logs/odoo-mock.json', JSON.stringify({
      timestamp: new Date(),
      action: 'createCustomer',
      data: { ...data, odooId },
    }) + '\\n');
    
    return { odoo_id: odooId };
  }

  async createInvoice(data: InvoiceData) {
    const invoiceId = \`INV-\${Date.now()}\`;
    console.log('[ODOO MOCK] Create Invoice:', { ...data, invoiceId });
    
    await fs.appendFile('./logs/odoo-mock.json', JSON.stringify({
      timestamp: new Date(),
      action: 'createInvoice',
      data: { ...data, invoiceId },
    }) + '\\n');
    
    return { invoice_id: invoiceId };
  }

  async syncPayment(data: PaymentData) {
    console.log('[ODOO MOCK] Sync Payment:', data);
    return { success: true };
  }
}
\`\`\`

**Umschalten (Production):**
\`\`\`typescript
// lib/odoo/index.ts
const isProduction = process.env.NODE_ENV === 'production';
export const odooService = isProduction
  ? new OdooAPIService()   // Echte API
  : new OdooMockService(); // Mock
\`\`\`

---

### 2.3 Setup (Production - Echte API)

**Odoo XML-RPC API:**
\`\`\`typescript
// lib/odoo/odoo-api.ts
import xmlrpc from 'xmlrpc';

export class OdooAPIService {
  private client: any;
  private uid: number;

  constructor() {
    this.client = xmlrpc.createSecureClient({
      host: process.env.ODOO_HOST,
      port: 443,
      path: '/xmlrpc/2/object',
    });
  }

  async authenticate() {
    const common = xmlrpc.createSecureClient({
      host: process.env.ODOO_HOST,
      port: 443,
      path: '/xmlrpc/2/common',
    });

    return new Promise((resolve, reject) => {
      common.methodCall('authenticate', [
        process.env.ODOO_DB,
        process.env.ODOO_USERNAME,
        process.env.ODOO_PASSWORD,
        {},
      ], (error, uid) => {
        if (error) reject(error);
        else {
          this.uid = uid;
          resolve(uid);
        }
      });
    });
  }

  async createCustomer(customer: Customer) {
    return new Promise((resolve, reject) => {
      this.client.methodCall('execute_kw', [
        process.env.ODOO_DB,
        this.uid,
        process.env.ODOO_PASSWORD,
        'res.partner',
        'create',
        [{
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          street: customer.street,
          zip: customer.zip,
          city: customer.city,
        }],
      ], (error, odooId) => {
        if (error) reject(error);
        else resolve({ odoo_id: odooId });
      });
    });
  }

  async createInvoice(booking: Booking) {
    // Rechnung in Odoo anlegen
    return new Promise((resolve, reject) => {
      this.client.methodCall('execute_kw', [
        process.env.ODOO_DB,
        this.uid,
        process.env.ODOO_PASSWORD,
        'account.move',
        'create',
        [{
          partner_id: booking.customer.odooId,
          move_type: 'out_invoice',
          invoice_line_ids: [[0, 0, {
            name: \`\${booking.serviceType} - \${booking.vehicle.brand} \${booking.vehicle.model}\`,
            quantity: 1,
            price_unit: booking.price,
          }]],
        }],
      ], (error, invoiceId) => {
        if (error) reject(error);
        else resolve({ invoice_id: invoiceId });
      });
    });
  }
}
\`\`\`

---

### 2.4 Sync-Events

**Tabelle: Wann wird was synchronisiert?**

| Event | Odoo-Aktion | Daten |
|-------|-------------|-------|
| Booking erstellt | Kunde anlegen (falls neu) | Customer-Daten |
| Zahlung erfolgreich | Rechnung + Zahlung | Invoice, Payment |
| Auftragserweiterung freigegeben | Ergänzungsrechnung | Additional Invoice Line |
| Stornierung | Storno-Rechnung | Credit Note |

**Beispiel-Flow:**
\`\`\`typescript
// Webhook: payment_intent.succeeded
async function handlePaymentSuccess(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { customer: true, vehicle: true },
  });

  // 1. Kunde in Odoo anlegen (falls noch nicht vorhanden)
  if (!booking.customer.odooId) {
    const { odoo_id } = await odooService.createCustomer(booking.customer);
    await prisma.customer.update({
      where: { id: booking.customer.id },
      data: { odooId: odoo_id },
    });
  }

  // 2. Rechnung in Odoo erstellen
  const { invoice_id } = await odooService.createInvoice(booking);
  
  // 3. Zahlung in Odoo buchen
  await odooService.syncPayment({
    invoiceId: invoice_id,
    amount: booking.price,
    paymentMethod: 'stripe',
    reference: booking.stripePaymentId,
  });

  // 4. Booking-Status aktualisieren
  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: 'CONFIRMED',
      odooInvoiceId: invoice_id,
    },
  });
}
\`\`\`

---

### 2.5 Error-Handling & Retry

**Retry-Logik:**
\`\`\`typescript
async function syncToOdooWithRetry(bookingId: string, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await handlePaymentSuccess(bookingId);
      return { success: true };
    } catch (error) {
      console.error(\`Odoo Sync Attempt \${attempt} failed:\`, error);
      
      if (attempt === maxRetries) {
        // Nach 3 Versuchen: In Queue für manuellen Sync
        await prisma.syncQueue.create({
          data: {
            bookingId,
            type: 'odoo_sync',
            error: error.message,
            retryCount: attempt,
          },
        });
        throw error;
      }
      
      // Exponential Backoff
      await sleep(2 ** attempt * 1000);
    }
  }
}
\`\`\`

**Manual Sync (Admin-Interface):**
\`\`\`typescript
// GET /admin/sync-queue
// Zeigt alle fehlgeschlagenen Syncs

// POST /admin/sync-queue/:id/retry
// Manueller Retry
\`\`\`

---

## 3. Driver-App Integration (Jockey-Koordination)

### 3.1 Übersicht

**Zweck:** Existierende Ronja Driver-App für B2C-Touren nutzen

**Ansatz:** API-Erweiterung (B2C als neuer Tour-Typ)

---

### 3.2 Integration-Pattern

**Option 1: Webhook-basiert (Empfohlen)**

\`\`\`typescript
// B2C Backend → Driver-App Backend
async function notifyDriverApp(booking: Booking) {
  await fetch(process.env.DRIVER_APP_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'b2c_pickup',
      bookingId: booking.id,
      customerId: booking.customer.id,
      customerName: booking.customer.name,
      customerPhone: booking.customer.phone,
      pickupAddress: booking.pickupAddress,
      deliveryAddress: booking.deliveryAddress,
      vehicle: {
        brand: booking.vehicle.brand,
        model: booking.vehicle.model,
        licensePlate: booking.vehicle.licensePlate,
      },
      scheduledPickup: booking.pickupSlotStart,
      notes: booking.notes,
    }),
  });
}
\`\`\`

**Driver-App sendet Status-Updates zurück:**
\`\`\`typescript
// POST /webhooks/driver-app (B2C Backend empfängt)
app.post('/webhooks/driver-app', async (req, res) => {
  const { bookingId, status, timestamp } = req.body;
  
  if (status === 'pickup_completed') {
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'IN_WORKSHOP' },
    });
    
    // Kunde benachrichtigen
    await sendEmail(booking.customer.email, 'Fahrzeug wurde abgeholt');
  }
  
  res.json({ received: true });
});
\`\`\`

---

### 3.3 API-Contract (zu klären mit Driver-App-Team)

**Payload-Format:**
\`\`\`typescript
interface B2CTrip {
  type: 'b2c_pickup' | 'b2c_delivery';
  bookingId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  pickupAddress: {
    street: string;
    zip: string;
    city: string;
    lat?: number;
    lng?: number;
  };
  deliveryAddress?: {
    street: string;
    zip: string;
    city: string;
  };
  vehicle: {
    brand: string;
    model: string;
    licensePlate?: string;
  };
  scheduledPickup: string; // ISO 8601
  notes?: string;
}
\`\`\`

**Status-Updates:**
\`\`\`typescript
enum TripStatus {
  ASSIGNED = 'assigned',           // Jockey zugewiesen
  IN_PROGRESS = 'in_progress',     // Jockey unterwegs
  ARRIVED = 'arrived',             // Vor Ort
  PICKUP_COMPLETED = 'pickup_completed', // Abgeholt
  DELIVERY_COMPLETED = 'delivery_completed', // Zurückgebracht
  FAILED = 'failed',               // Fehlgeschlagen (No-Show)
}
\`\`\`

---

### 3.4 Fallback (ohne Driver-App-Integration)

**Für MVP:** Manuelle Koordination via Jockey-Portal

\`\`\`typescript
// Jockey-Portal: Manuelle Zuweisungen
// Admin weist Jockey manuell zu Buchung zu

// Später: Automatisches Routing + GPS-Tracking
\`\`\`

---

## 4. Integration Testing

### 4.1 Stripe Testing

\`\`\`bash
# Lokale Tests mit Stripe CLI
stripe trigger payment_intent.succeeded

# Backend-Logs prüfen
# Sollte zeigen: [Webhook] Payment successful
\`\`\`

### 4.2 Odoo Testing

\`\`\`bash
# Mock-Logs prüfen
cat logs/odoo-mock.json

# Erwartete Ausgabe:
# {"timestamp":"...","action":"createCustomer","data":{...}}
# {"timestamp":"...","action":"createInvoice","data":{...}}
\`\`\`

### 4.3 Driver-App Testing

\`\`\`bash
# Webhook manuell triggern
curl -X POST http://localhost:5000/webhooks/driver-app \\
  -H 'Content-Type: application/json' \\
  -d '{"bookingId":"abc123","status":"pickup_completed"}'
\`\`\`

---

## 5. Security

### 5.1 Webhook-Signature-Verification

**Stripe:**
\`\`\`typescript
const sig = req.headers['stripe-signature'];
const event = stripe.webhooks.constructEvent(
  req.body,
  sig,
  process.env.STRIPE_WEBHOOK_SECRET
);
// Verhindert Fake-Webhooks
\`\`\`

**Driver-App:**
\`\`\`typescript
const signature = req.headers['x-webhook-signature'];
const expectedSignature = crypto
  .createHmac('sha256', process.env.DRIVER_APP_SECRET)
  .update(req.body)
  .digest('hex');

if (signature !== expectedSignature) {
  return res.status(401).json({ error: 'Invalid signature' });
}
\`\`\`

---

## 6. Monitoring

### 6.1 Integration-Health-Checks

\`\`\`typescript
// GET /api/health
{
  "status": "ok",
  "integrations": {
    "stripe": "connected",
    "odoo": "connected" | "mock",
    "driverApp": "connected" | "unavailable"
  },
  "lastSync": {
    "odoo": "2026-02-01T14:30:00Z",
    "driverApp": "2026-02-01T14:25:00Z"
  }
}
\`\`\`

### 6.2 Alerts

**Azure Application Insights:**
- Webhook-Fehlerrate > 5%
- Odoo-Sync-Failures
- Stripe-Payment-Failures

---

**Status:** READY FOR IMPLEMENTATION

**Letzte Aktualisierung:** 2026-02-01
