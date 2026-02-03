# Demo Payment System Documentation
## Fake Payment Provider for Development & Demo Mode

**Version:** 1.0
**Date:** February 3, 2026
**Status:** ACTIVE

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [API Endpoints](#api-endpoints)
4. [Extension Payment Flow](#extension-payment-flow)
5. [Usage Examples](#usage-examples)
6. [Testing](#testing)
7. [Production Migration](#production-migration)

---

## Overview

### Purpose
The Demo Payment Service provides a complete in-memory payment provider that mimics Stripe's PaymentIntent API without making external API calls or requiring Stripe API keys. This enables:

- **Development:** Work without Stripe credentials
- **Demos:** Show payment flow without real charges
- **Testing:** Automated E2E tests without Stripe Test Mode
- **CI/CD:** Run tests without environment secrets

### Key Features
- ✅ In-memory storage (no database, no external APIs)
- ✅ Supports automatic and manual capture (like Stripe)
- ✅ Extension payment authorization and capture flow
- ✅ Same API interface as real Stripe service
- ✅ Detailed logging with `[DEMO]` prefix
- ✅ Instant payment confirmation (no webhooks needed)

### When to Use
- `DEMO_MODE=true` in environment variables
- Local development without Stripe keys
- Automated testing (Playwright E2E tests)
- Investor/stakeholder demos

### When NOT to Use
- Production environment (use real Stripe)
- Staging with real payment testing
- Any environment handling real money

---

## Architecture

### Component Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Application Layer                        │
│  (bookings.controller.ts, demo.controller.ts)               │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ├─ DEMO_MODE=true ? ───> DemoPaymentService
                 │                         (In-Memory)
                 │
                 └─ DEMO_MODE=false ──> StripePaymentService
                                          (External API)
```

### Service Interface

Both `DemoPaymentService` and `StripePaymentService` implement the same interface:

```typescript
interface PaymentService {
  createPaymentIntent(params: CreatePaymentIntentParams): Promise<PaymentIntent>;
  confirmPayment(paymentIntentId: string): Promise<PaymentIntent>;
  capturePayment(paymentIntentId: string): Promise<PaymentIntent>;
  cancelPayment(paymentIntentId: string): Promise<PaymentIntent>;
  getPaymentStatus(paymentIntentId: string): Promise<PaymentStatus>;
}
```

This allows the application to switch between demo and production mode with a single environment variable.

---

## API Endpoints

### 1. Create Payment Intent

**Service Method:** `demoPaymentService.createPaymentIntent()`

**Parameters:**
```typescript
{
  amount: number;           // Amount in cents (e.g., 17135 = 171.35 EUR)
  bookingId: string;        // Booking ID
  customerId: string;       // Customer user ID
  customerEmail: string;    // Customer email
  metadata?: Record<string, string>;  // Additional metadata
  captureMethod?: 'automatic' | 'manual';  // Capture method (default: 'automatic')
}
```

**Returns:**
```typescript
{
  id: string;               // Payment intent ID (e.g., "demo_pi_1234567890_abc123")
  client_secret: string;    // Client secret for frontend
  amount: number;           // Amount in cents
  status: string;           // "requires_payment_method" | "succeeded"
}
```

**Example:**
```typescript
const paymentIntent = await demoPaymentService.createPaymentIntent({
  amount: 17135,  // 171.35 EUR
  bookingId: 'ck123456',
  customerId: 'usr_abc123',
  customerEmail: 'customer@example.com',
  metadata: {
    bookingNumber: 'BK-2026-001234',
    serviceType: 'INSPECTION'
  },
  captureMethod: 'automatic'  // Charge immediately when confirmed
});

console.log(paymentIntent.id);  // "demo_pi_1738582800123_xyz789"
```

**Storage:**
Payment intent is stored in-memory in `Map<string, DemoPaymentIntent>`.

---

### 2. Confirm Payment

**Service Method:** `demoPaymentService.confirmPayment(paymentIntentId)`

**Purpose:** Simulates customer completing payment (e.g., entering card details and clicking "Pay").

**Parameters:**
```typescript
paymentIntentId: string  // Payment intent ID from createPaymentIntent
```

**Returns:**
```typescript
{
  id: string;
  status: string;  // "succeeded" (automatic) | "requires_action" (manual)
  amount: number;
}
```

**Behavior:**
- **Automatic capture:** Status changes to `succeeded`, payment is complete
- **Manual capture:** Status changes to `requires_action`, funds authorized but not captured

**Example:**
```typescript
const result = await demoPaymentService.confirmPayment('demo_pi_1738582800123_xyz789');

console.log(result.status);  // "succeeded" (if automatic capture)
```

---

### 3. Authorize Extension Payment

**Service Method:** `demoPaymentService.authorizeExtensionPayment()`

**Purpose:** Creates a payment intent with manual capture for extensions. This holds the funds (authorization) without charging the customer immediately.

**Parameters:**
```typescript
{
  amount: number;           // Extension amount in cents
  extensionId: string;      // Extension ID
  bookingId: string;        // Booking ID
  customerId: string;       // Customer user ID
  customerEmail: string;    // Customer email
}
```

**Returns:**
```typescript
{
  id: string;               // Payment intent ID
  client_secret: string;    // Client secret for frontend
  amount: number;           // Amount in cents
  status: string;           // "requires_payment_method"
}
```

**Example:**
```typescript
const paymentIntent = await demoPaymentService.authorizeExtensionPayment({
  amount: 103246,  // 1,032.46 EUR
  extensionId: 'ext_abc123',
  bookingId: 'ck123456',
  customerId: 'usr_abc123',
  customerEmail: 'customer@example.com'
});

// Later, customer confirms (enters card details)
await demoPaymentService.confirmPayment(paymentIntent.id);

// Payment is now AUTHORIZED (funds on hold) but not CAPTURED
```

**Why Manual Capture?**
Extensions are authorized but not captured until the workshop completes the work. This provides:
1. Customer protection: Only charged after work is done
2. Workshop flexibility: Can adjust amount if needed
3. Cancellation option: Can cancel authorization if work cannot be done

---

### 4. Capture Payment

**Service Method:** `demoPaymentService.capturePayment(paymentIntentId)`

**Purpose:** Captures a previously authorized payment. Funds are transferred from customer to business.

**Parameters:**
```typescript
paymentIntentId: string  // Payment intent ID with manual capture
```

**Returns:**
```typescript
{
  id: string;
  status: string;  // "succeeded"
  amount: number;
}
```

**Example:**
```typescript
// After workshop completes extension work:
const result = await demoPaymentService.capturePayment('demo_pi_1738582800456_xyz789');

console.log(result.status);  // "succeeded"
console.log(result.amount);  // 103246 (1,032.46 EUR)
```

**Error Handling:**
```typescript
try {
  await demoPaymentService.capturePayment(paymentIntentId);
} catch (error) {
  if (error.message.includes('not found')) {
    // Payment intent doesn't exist
  } else if (error.message.includes('not set for manual capture')) {
    // Trying to capture automatic payment
  }
}
```

---

### 5. Cancel Payment

**Service Method:** `demoPaymentService.cancelPayment(paymentIntentId)`

**Purpose:** Cancels a payment intent (e.g., customer cancels booking or extension is declined).

**Parameters:**
```typescript
paymentIntentId: string
```

**Returns:**
```typescript
{
  id: string;
  status: string;  // "canceled"
}
```

**Example:**
```typescript
await demoPaymentService.cancelPayment('demo_pi_1738582800789_xyz789');
```

---

### 6. Get Payment Status

**Service Method:** `demoPaymentService.getPaymentStatus(paymentIntentId)`

**Purpose:** Retrieves current status of a payment intent (useful for debugging).

**Parameters:**
```typescript
paymentIntentId: string
```

**Returns:**
```typescript
{
  status: string;   // Current status
  amount: number;   // Amount in EUR (not cents!)
  currency: string; // "eur"
  paid: boolean;    // true if status === "succeeded"
}
```

**Example:**
```typescript
const status = await demoPaymentService.getPaymentStatus('demo_pi_1738582800789_xyz789');

console.log(status);
// {
//   status: "succeeded",
//   amount: 171.35,  // Note: in EUR, not cents!
//   currency: "eur",
//   paid: true
// }
```

---

### 7. Clear All (Testing Only)

**Service Method:** `demoPaymentService.clearAll()`

**Purpose:** Clears all stored payment intents (useful for test cleanup).

**Example:**
```typescript
afterEach(() => {
  demoPaymentService.clearAll();
});
```

---

## Extension Payment Flow

### Complete Flow: PENDING → APPROVED → AUTHORIZED → CAPTURED

```
┌──────────────────────────────────────────────────────────────────┐
│ Phase 1: Workshop Creates Extension                             │
└──────────────────────────────────────────────────────────────────┘

Workshop creates extension while booking is IN_SERVICE:
  POST /api/workshops/orders/:bookingId/extensions
  {
    "description": "Bremsbeläge verschlissen",
    "items": [
      { "name": "Bremsbeläge vorne", "price": 189.99, "quantity": 1 }
    ]
  }

Extension Status: PENDING
Payment Status: N/A (no payment intent yet)

┌──────────────────────────────────────────────────────────────────┐
│ Phase 2: Customer Approves Extension                            │
└──────────────────────────────────────────────────────────────────┘

Customer approves in portal:
  POST /api/bookings/:bookingId/extensions/:extensionId/approve

Backend creates payment intent with MANUAL CAPTURE:
  const paymentIntent = await demoPaymentService.authorizeExtensionPayment({
    amount: 18999,  // 189.99 EUR in cents
    extensionId: extension.id,
    bookingId: booking.id,
    customerId: customer.id,
    customerEmail: customer.email
  });

Frontend shows Stripe payment form:
  - Customer enters card details (demo: 4242 4242 4242 4242)
  - Stripe confirms payment (backend receives confirmation)

Backend confirms payment:
  await demoPaymentService.confirmPayment(paymentIntent.id);

Extension Status: APPROVED
Payment Status: AUTHORIZED (funds on hold, not captured yet)

┌──────────────────────────────────────────────────────────────────┐
│ Phase 3: Workshop Completes Work                                │
└──────────────────────────────────────────────────────────────────┘

Workshop completes extension work:
  PATCH /api/workshops/orders/:bookingId/complete

Backend captures authorized payment:
  await demoPaymentService.capturePayment(extension.paymentIntentId);

Backend updates extension:
  await prisma.extension.update({
    where: { id: extension.id },
    data: { paidAt: new Date() }
  });

Extension Status: APPROVED (or COMPLETED - depending on workflow)
Payment Status: CAPTURED (customer charged)
```

### State Transitions

| Step | Extension Status | Payment Intent Status | Payment Intent Action | Customer Charged? |
|------|-----------------|----------------------|----------------------|------------------|
| 1. Workshop creates | `PENDING` | N/A | None | No |
| 2. Customer approves | `APPROVED` | `requires_payment_method` | `createPaymentIntent()` with manual capture | No |
| 3. Customer enters card | `APPROVED` | `requires_action` | `confirmPayment()` | No (authorized only) |
| 4. Workshop completes | `APPROVED` | `succeeded` | `capturePayment()` | ✅ Yes (charged) |

### Error Scenarios

#### Scenario 1: Authorization Fails (Customer Card Declined)
```typescript
// Step 2: Customer tries to approve
try {
  await demoPaymentService.confirmPayment(paymentIntentId);
} catch (error) {
  // Payment declined
  extension.status = 'PAYMENT_FAILED';
  // Notify customer to update payment method
  // Workshop does NOT proceed with work
}
```

#### Scenario 2: Capture Fails (Network Error, Expired Authorization)
```typescript
// Step 4: Workshop tries to complete
try {
  await demoPaymentService.capturePayment(extension.paymentIntentId);
} catch (error) {
  // Capture failed
  logger.error('Failed to capture extension payment', error);

  // Retry 3 times with exponential backoff
  for (let i = 1; i <= 3; i++) {
    await sleep(Math.pow(2, i) * 1000);
    try {
      await demoPaymentService.capturePayment(extension.paymentIntentId);
      break;  // Success
    } catch (retryError) {
      if (i === 3) {
        // Final failure - create manual invoice
        await createManualInvoice(extension.id);
        await notifyAdminPaymentFailed(extension.id);
      }
    }
  }
}
```

#### Scenario 3: Customer Declines Extension
```typescript
// Customer declines instead of approving
POST /api/bookings/:bookingId/extensions/:extensionId/decline
{
  "reason": "Too expensive"
}

// NO payment intent is created
// NO authorization is made
// Extension status: DECLINED
```

---

## Usage Examples

### Example 1: Basic Booking Payment (Automatic Capture)

```typescript
// backend/src/controllers/bookings.controller.ts

export async function createBooking(req: Request, res: Response) {
  // 1. Create booking
  const booking = await bookingsService.createBooking(req.body);

  // 2. Create payment intent
  const isDemoMode = process.env.DEMO_MODE === 'true';
  const paymentService = isDemoMode ? demoPaymentService : stripePaymentService;

  const paymentIntent = await paymentService.createPaymentIntent({
    amount: Math.round(booking.totalPrice * 100),  // Convert EUR to cents
    bookingId: booking.id,
    customerId: booking.customerId,
    customerEmail: booking.customer.email,
    metadata: {
      bookingNumber: booking.bookingNumber,
      serviceType: booking.serviceType
    },
    captureMethod: 'automatic'  // Charge immediately
  });

  // 3. In demo mode, auto-confirm payment
  if (isDemoMode) {
    await demoPaymentService.confirmPayment(paymentIntent.id);

    // Update booking status
    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: 'CONFIRMED',
        paidAt: new Date(),
        paymentIntentId: paymentIntent.id
      }
    });
  }

  // 4. Return to frontend
  res.json({
    success: true,
    data: {
      booking,
      paymentIntent: {
        id: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        amount: paymentIntent.amount
      }
    }
  });
}
```

---

### Example 2: Extension Approval with Manual Capture

```typescript
// backend/src/controllers/bookings.controller.ts

export async function approveExtension(req: Request, res: Response) {
  const { bookingId, extensionId } = req.params;

  // 1. Get extension
  const extension = await prisma.extension.findUnique({
    where: { id: extensionId },
    include: { booking: { include: { customer: true } } }
  });

  if (extension.status !== 'PENDING') {
    throw new ApiError(400, 'Extension is not pending approval');
  }

  // 2. Create payment intent with MANUAL CAPTURE
  const isDemoMode = process.env.DEMO_MODE === 'true';
  const paymentService = isDemoMode ? demoPaymentService : stripePaymentService;

  const paymentIntent = await paymentService.authorizeExtensionPayment({
    amount: extension.totalAmount,  // Already in cents
    extensionId: extension.id,
    bookingId: bookingId,
    customerId: extension.booking.customerId,
    customerEmail: extension.booking.customer.email
  });

  // 3. Update extension status
  await prisma.extension.update({
    where: { id: extensionId },
    data: {
      status: 'APPROVED',
      approvedAt: new Date(),
      paymentIntentId: paymentIntent.id
    }
  });

  // 4. Return payment intent to frontend
  res.json({
    success: true,
    data: {
      extension,
      paymentIntent: {
        id: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        amount: paymentIntent.amount,
        status: paymentIntent.status
      }
    },
    message: 'Extension approved. Please complete payment.'
  });
}
```

---

### Example 3: Workshop Completes Service (Capture Payment)

```typescript
// backend/src/controllers/workshops.controller.ts

export async function completeService(req: Request, res: Response) {
  const { bookingId } = req.params;

  // 1. Get booking with extensions
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      extensions: {
        where: {
          status: 'APPROVED',
          paidAt: null  // Not captured yet
        }
      }
    }
  });

  if (booking.status !== 'IN_SERVICE') {
    throw new ApiError(400, 'Booking is not in service');
  }

  // 2. Capture all approved extension payments
  const isDemoMode = process.env.DEMO_MODE === 'true';
  const paymentService = isDemoMode ? demoPaymentService : stripePaymentService;

  for (const extension of booking.extensions) {
    try {
      await paymentService.capturePayment(extension.paymentIntentId);

      // Update extension
      await prisma.extension.update({
        where: { id: extension.id },
        data: { paidAt: new Date() }
      });

      logger.info(`Extension payment captured: ${extension.id}`);
    } catch (error) {
      logger.error(`Failed to capture extension payment: ${extension.id}`, error);
      // Don't fail the entire completion - handle separately
      await handlePaymentCaptureFailure(extension.id);
    }
  }

  // 3. Update booking status
  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: 'READY_FOR_RETURN',
      completedAt: new Date()
    }
  });

  // 4. Create return jockey assignment
  await createReturnAssignment(bookingId);

  res.json({
    success: true,
    data: { booking },
    message: 'Service completed successfully'
  });
}
```

---

## Testing

### Unit Tests

```typescript
// backend/src/tests/demo-payment.test.ts

import { demoPaymentService } from '../services/demo-payment.service';

describe('DemoPaymentService', () => {
  beforeEach(() => {
    demoPaymentService.clearAll();
  });

  describe('createPaymentIntent', () => {
    test('creates payment intent with automatic capture', async () => {
      const result = await demoPaymentService.createPaymentIntent({
        amount: 10000,
        bookingId: 'test-booking',
        customerId: 'test-customer',
        customerEmail: 'test@example.com'
      });

      expect(result.id).toMatch(/^demo_pi_/);
      expect(result.amount).toBe(10000);
      expect(result.status).toBe('requires_payment_method');
    });

    test('creates payment intent with manual capture', async () => {
      const result = await demoPaymentService.createPaymentIntent({
        amount: 10000,
        bookingId: 'test-booking',
        customerId: 'test-customer',
        customerEmail: 'test@example.com',
        captureMethod: 'manual'
      });

      expect(result.status).toBe('requires_payment_method');
    });
  });

  describe('confirmPayment', () => {
    test('confirms payment with automatic capture', async () => {
      const paymentIntent = await demoPaymentService.createPaymentIntent({
        amount: 10000,
        bookingId: 'test-booking',
        customerId: 'test-customer',
        customerEmail: 'test@example.com',
        captureMethod: 'automatic'
      });

      const result = await demoPaymentService.confirmPayment(paymentIntent.id);

      expect(result.status).toBe('succeeded');
    });

    test('confirms payment with manual capture', async () => {
      const paymentIntent = await demoPaymentService.createPaymentIntent({
        amount: 10000,
        bookingId: 'test-booking',
        customerId: 'test-customer',
        customerEmail: 'test@example.com',
        captureMethod: 'manual'
      });

      const result = await demoPaymentService.confirmPayment(paymentIntent.id);

      expect(result.status).toBe('requires_action');  // Authorized, not captured
    });

    test('throws error if payment intent not found', async () => {
      await expect(
        demoPaymentService.confirmPayment('invalid-id')
      ).rejects.toThrow('Payment intent invalid-id not found');
    });
  });

  describe('capturePayment', () => {
    test('captures authorized payment', async () => {
      const paymentIntent = await demoPaymentService.createPaymentIntent({
        amount: 10000,
        bookingId: 'test-booking',
        customerId: 'test-customer',
        customerEmail: 'test@example.com',
        captureMethod: 'manual'
      });

      await demoPaymentService.confirmPayment(paymentIntent.id);

      const result = await demoPaymentService.capturePayment(paymentIntent.id);

      expect(result.status).toBe('succeeded');
    });

    test('throws error if not set for manual capture', async () => {
      const paymentIntent = await demoPaymentService.createPaymentIntent({
        amount: 10000,
        bookingId: 'test-booking',
        customerId: 'test-customer',
        customerEmail: 'test@example.com',
        captureMethod: 'automatic'
      });

      await expect(
        demoPaymentService.capturePayment(paymentIntent.id)
      ).rejects.toThrow('not set for manual capture');
    });
  });

  describe('authorizeExtensionPayment', () => {
    test('creates extension payment with manual capture', async () => {
      const result = await demoPaymentService.authorizeExtensionPayment({
        amount: 20000,
        extensionId: 'ext-123',
        bookingId: 'booking-123',
        customerId: 'customer-123',
        customerEmail: 'customer@example.com'
      });

      expect(result.id).toMatch(/^demo_pi_/);
      expect(result.amount).toBe(20000);
      expect(result.status).toBe('requires_payment_method');

      // Verify manual capture is set
      const paymentIntent = await demoPaymentService.getPaymentIntent(result.id);
      expect(paymentIntent.captureMethod).toBe('manual');
      expect(paymentIntent.metadata.type).toBe('extension');
    });
  });

  describe('getPaymentStatus', () => {
    test('returns payment status', async () => {
      const paymentIntent = await demoPaymentService.createPaymentIntent({
        amount: 10000,
        bookingId: 'test-booking',
        customerId: 'test-customer',
        customerEmail: 'test@example.com'
      });

      await demoPaymentService.confirmPayment(paymentIntent.id);

      const status = await demoPaymentService.getPaymentStatus(paymentIntent.id);

      expect(status.status).toBe('succeeded');
      expect(status.amount).toBe(100);  // In EUR, not cents!
      expect(status.currency).toBe('eur');
      expect(status.paid).toBe(true);
    });
  });
});
```

---

### Integration Tests

```typescript
// backend/src/tests/extension-payment-flow.integration.test.ts

describe('Extension Payment Flow', () => {
  test('complete extension flow with demo payments', async () => {
    // Setup: Create booking and complete to IN_SERVICE
    const booking = await createTestBooking();
    await transitionToInService(booking.id);

    // 1. Workshop creates extension
    const extension = await request(app)
      .post(`/api/workshops/orders/${booking.id}/extensions`)
      .set('Authorization', `Bearer ${workshopToken}`)
      .send({
        description: 'Brake pads worn',
        items: [
          { name: 'Brake pads front', price: 189.99, quantity: 1 }
        ]
      })
      .expect(201);

    expect(extension.body.data.status).toBe('PENDING');

    // 2. Customer approves extension
    const approval = await request(app)
      .post(`/api/bookings/${booking.id}/extensions/${extension.body.data.id}/approve`)
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(200);

    const paymentIntentId = approval.body.data.paymentIntent.id;
    expect(paymentIntentId).toMatch(/^demo_pi_/);

    // 3. Simulate customer confirming payment
    await demoPaymentService.confirmPayment(paymentIntentId);

    // Verify extension is approved
    const extensionStatus = await getExtension(extension.body.data.id);
    expect(extensionStatus.status).toBe('APPROVED');
    expect(extensionStatus.paymentIntentId).toBe(paymentIntentId);

    // 4. Workshop completes service
    await request(app)
      .patch(`/api/workshops/orders/${booking.id}/complete`)
      .set('Authorization', `Bearer ${workshopToken}`)
      .expect(200);

    // Verify payment was captured
    const paymentStatus = await demoPaymentService.getPaymentStatus(paymentIntentId);
    expect(paymentStatus.status).toBe('succeeded');
    expect(paymentStatus.paid).toBe(true);

    // Verify extension payment timestamp
    const finalExtension = await getExtension(extension.body.data.id);
    expect(finalExtension.paidAt).not.toBeNull();
  });
});
```

---

## Production Migration

### Switching from Demo to Production

When ready to go live with real Stripe payments:

#### 1. Update Environment Variables

```bash
# .env (Backend)
DEMO_MODE=false  # Switch to production mode
STRIPE_SECRET_KEY=sk_live_...  # Live secret key
STRIPE_WEBHOOK_SECRET=whsec_...  # Live webhook secret
```

```bash
# .env.local (Frontend)
NEXT_PUBLIC_DEMO_MODE=false
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

#### 2. Update Payment Service Selection

```typescript
// backend/src/controllers/bookings.controller.ts

import { paymentService as stripePaymentService } from '../services/payment.service';
import { demoPaymentService } from '../services/demo-payment.service';

// Select service based on environment
const isDemoMode = process.env.DEMO_MODE === 'true';
const paymentService = isDemoMode ? demoPaymentService : stripePaymentService;

// Use paymentService for all payment operations
const paymentIntent = await paymentService.createPaymentIntent({ ... });
```

#### 3. Configure Stripe Webhooks

In production, Stripe sends webhooks for payment events:

```typescript
// backend/src/routes/webhooks.routes.ts

router.post('/stripe', async (req, res) => {
  const signature = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      webhookSecret
    );

    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object);
        break;
    }

    res.json({ received: true });
  } catch (error) {
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});
```

#### 4. Test in Stripe Test Mode First

Before going live:
1. Use test keys (`sk_test_...`, `pk_test_...`)
2. Test with Stripe test cards
3. Verify webhooks work correctly
4. Run E2E tests

#### 5. Activate Live Mode

1. Activate Stripe account (provide business details)
2. Update to live keys
3. Deploy to production
4. Monitor first few transactions closely

---

## Debugging

### View Payment Intent Details

```typescript
// In demo controller or debugging endpoint
const paymentIntent = await demoPaymentService.getPaymentIntent(paymentIntentId);

console.log(paymentIntent);
// {
//   id: "demo_pi_1738582800123_xyz789",
//   amount: 17135,
//   currency: "eur",
//   status: "succeeded",
//   clientSecret: "demo_pi_1738582800123_xyz789_secret_abc123",
//   metadata: {
//     bookingId: "ck123456",
//     customerId: "usr_abc123",
//     bookingNumber: "BK-2026-001234",
//     serviceType: "INSPECTION"
//   },
//   captureMethod: "automatic",
//   created: "2026-02-03T10:30:00.000Z",
//   customerId: "usr_abc123",
//   customerEmail: "customer@example.com"
// }
```

### Clear All Payment Intents (Testing)

```typescript
// Useful for test cleanup
demoPaymentService.clearAll();
```

### Logging

All demo payment operations are logged with `[DEMO]` prefix:

```
[DEMO] Payment Intent created { paymentIntentId: 'demo_pi_...', bookingId: '...', amount: 171.35 }
[DEMO] Payment confirmed { paymentIntentId: 'demo_pi_...', status: 'succeeded', amount: 171.35 }
[DEMO] Extension payment authorized { extensionId: 'ext_...', paymentIntentId: 'demo_pi_...', amount: 189.99 }
[DEMO] Payment captured { paymentIntentId: 'demo_pi_...', amount: 189.99 }
```

---

## Security Considerations

### Demo Mode Safety

1. **Never use in production:** Demo mode should NEVER be enabled in production
2. **No real charges:** All payments are simulated, no real money is involved
3. **In-memory only:** Payment intents are lost on server restart
4. **No PCI compliance needed:** Card data never touches our servers (same as production)

### Environment Variable Protection

```typescript
// backend/src/middleware/demo-mode-check.ts

export function requireDemoMode(req: Request, res: Response, next: NextFunction) {
  if (process.env.DEMO_MODE !== 'true') {
    return res.status(403).json({
      success: false,
      error: 'Demo endpoints are only available in demo mode'
    });
  }
  next();
}

// Apply to demo endpoints
router.post('/demo/payment/confirm', requireDemoMode, confirmBookingPayment);
```

---

## Document Control

**Version:** 1.0
**Created:** February 3, 2026
**Author:** Agent 1 (Tech Lead)
**Last Updated:** February 3, 2026

**Related Documents:**
- `prio1-demo-plan.md` - Master implementation plan
- `backend/src/services/demo-payment.service.ts` - Implementation
- `backend/src/controllers/demo.controller.ts` - Demo endpoints

---

**END OF DOCUMENT**
