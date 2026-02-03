---
name: payment-integration
description: Payment provider integration patterns and PCI-DSS compliance guidelines. Reference when implementing payment features.
user-invocable: false
---

# Payment Integration

Payment processing guidelines for the B2C Autowartungs-App.

## Provider Selection

**Recommended**: Stripe
- Excellent documentation
- Strong fraud detection
- PCI-DSS compliant
- German market support
- Good webhook system

**Alternative**: PayPal
- High customer trust in Germany
- One-click payments
- Buyer protection

## Integration Architecture

```
User Browser → Frontend → Backend API → Payment Provider
                              ↓
                         Database
                              ↓
                    Odoo Accounting
```

### Frontend Flow

```typescript
// 1. Load Stripe Elements
import { loadStripe } from '@stripe/stripe-js';

const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY);

// 2. Create Payment Intent on backend
const { clientSecret } = await fetch('/api/payment/create-intent', {
  method: 'POST',
  body: JSON.stringify({
    bookingId: 'booking_123',
    amount: 27000, // 270.00 EUR in cents
  })
});

// 3. Confirm payment on frontend
const { error, paymentIntent } = await stripe.confirmPayment({
  elements,
  clientSecret,
  confirmParams: {
    return_url: 'https://app.domain.com/booking/confirmation',
  },
});

if (error) {
  // Handle error
  setError(error.message);
} else if (paymentIntent.status === 'succeeded') {
  // Payment successful
  router.push('/booking/confirmation');
}
```

### Backend Flow

```typescript
// api/payment/create-intent.ts
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function createPaymentIntent(req, res) {
  const { bookingId, amount } = req.body;

  // 1. Validate booking exists and not paid
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId }
  });

  if (!booking) {
    return res.status(404).json({
      error: { code: 'BOOKING_NOT_FOUND' }
    });
  }

  if (booking.paymentStatus === 'paid') {
    return res.status(400).json({
      error: { code: 'ALREADY_PAID' }
    });
  }

  // 2. Create payment intent
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: 'eur',
    metadata: {
      bookingId,
      userId: booking.userId,
    },
    automatic_payment_methods: {
      enabled: true,
    },
  });

  // 3. Store payment intent ID
  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      stripePaymentIntentId: paymentIntent.id,
      paymentStatus: 'pending'
    }
  });

  return res.json({
    success: true,
    data: {
      clientSecret: paymentIntent.client_secret
    }
  });
}
```

## Webhook Handling

Critical for reliable payment confirmation.

```typescript
// api/webhooks/stripe.ts
import { buffer } from 'micro';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export const config = {
  api: {
    bodyParser: false, // Must use raw body for signature verification
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle event
  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentSuccess(event.data.object);
      break;

    case 'payment_intent.payment_failed':
      await handlePaymentFailure(event.data.object);
      break;

    case 'charge.refunded':
      await handleRefund(event.data.object);
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return res.json({ received: true });
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const bookingId = paymentIntent.metadata.bookingId;

  // 1. Update booking status
  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      paymentStatus: 'paid',
      paidAt: new Date(),
    }
  });

  // 2. Create invoice in Odoo
  await odoo.createInvoice({
    bookingId,
    amount: paymentIntent.amount,
    paymentIntentId: paymentIntent.id,
  });

  // 3. Send confirmation email
  await sendEmail({
    to: booking.user.email,
    template: 'booking-confirmation',
    data: { booking }
  });

  // 4. Trigger concierge scheduling
  await scheduleConciergeFetch({
    bookingId,
    pickupTime: booking.pickupTime,
  });
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  const bookingId = paymentIntent.metadata.bookingId;

  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      paymentStatus: 'failed',
      paymentError: paymentIntent.last_payment_error?.message,
    }
  });

  // Notify user
  await sendEmail({
    to: booking.user.email,
    template: 'payment-failed',
    data: {
      booking,
      errorMessage: paymentIntent.last_payment_error?.message
    }
  });
}
```

## Auftragserweiterung (Extension Approval)

Key differentiator: Digital approval of additional work.

```typescript
// api/bookings/[id]/extensions.ts
export async function createExtension(req, res) {
  const { bookingId } = req.query;
  const { items, description, images } = req.body;

  // 1. Calculate additional cost
  const totalAmount = items.reduce((sum, item) => sum + item.price, 0);

  // 2. Create extension request
  const extension = await prisma.extension.create({
    data: {
      bookingId,
      items,
      description,
      images,
      totalAmount,
      status: 'pending',
    }
  });

  // 3. Create payment intent for extension
  const paymentIntent = await stripe.paymentIntents.create({
    amount: totalAmount,
    currency: 'eur',
    metadata: {
      bookingId,
      extensionId: extension.id,
      type: 'extension',
    },
    capture_method: 'manual', // Authorize but don't capture yet
  });

  // 4. Send push notification to user
  await sendPushNotification({
    userId: booking.userId,
    title: 'Auftragserweiterung vorgeschlagen',
    body: `${totalAmount / 100} € - ${description}`,
    data: {
      extensionId: extension.id,
      bookingId,
    }
  });

  return res.json({
    success: true,
    data: {
      extension,
      clientSecret: paymentIntent.client_secret,
    }
  });
}

// api/extensions/[id]/approve.ts
export async function approveExtension(req, res) {
  const { extensionId } = req.query;

  const extension = await prisma.extension.findUnique({
    where: { id: extensionId },
    include: { booking: true }
  });

  // 1. Capture the payment
  await stripe.paymentIntents.capture(
    extension.stripePaymentIntentId
  );

  // 2. Update extension status
  await prisma.extension.update({
    where: { id: extensionId },
    data: {
      status: 'approved',
      approvedAt: new Date(),
    }
  });

  // 3. Notify workshop to proceed
  await notifyWorkshop({
    bookingId: extension.bookingId,
    message: 'Auftragserweiterung wurde vom Kunden freigegeben',
    extensionId,
  });

  return res.json({ success: true });
}
```

## Security Best Practices

### PCI-DSS Compliance

1. **Never store card data**: Use Stripe Elements/PayPal SDK
2. **Use HTTPS everywhere**: All payment pages over TLS
3. **Tokenization**: Card data becomes token before reaching server
4. **Webhook verification**: Always verify webhook signatures
5. **Secure secrets**: Use environment variables, never commit

### Environment Variables

```env
# Never commit these!
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_KEY=pk_live_...

# Test mode for development
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_test_...
NEXT_PUBLIC_STRIPE_KEY=pk_test_...
```

### Rate Limiting

Protect payment endpoints:

```typescript
import rateLimit from 'express-rate-limit';

const paymentLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Zu viele Zahlungsversuche. Bitte warten Sie.'
    }
  },
});

app.use('/api/payment', paymentLimiter);
```

### Fraud Detection

Leverage Stripe Radar:

```typescript
const paymentIntent = await stripe.paymentIntents.create({
  amount,
  currency: 'eur',
  metadata: {
    bookingId,
    risk_score: calculateRiskScore(booking), // Custom scoring
  },
  // Enable advanced fraud detection
  radar_options: {
    session: sessionId, // From Stripe.js
  },
});
```

## Error Handling

Provide user-friendly errors:

```typescript
function translateStripeError(error: Stripe.StripeError): string {
  switch (error.code) {
    case 'card_declined':
      return 'Ihre Karte wurde abgelehnt. Bitte verwenden Sie eine andere Zahlungsmethode.';
    case 'insufficient_funds':
      return 'Nicht ausreichend Deckung. Bitte verwenden Sie eine andere Karte.';
    case 'expired_card':
      return 'Ihre Karte ist abgelaufen. Bitte verwenden Sie eine gültige Karte.';
    case 'incorrect_cvc':
      return 'Die Kartenprüfnummer ist falsch. Bitte überprüfen Sie Ihre Eingabe.';
    case 'processing_error':
      return 'Fehler bei der Zahlungsverarbeitung. Bitte versuchen Sie es erneut.';
    default:
      return 'Zahlung fehlgeschlagen. Bitte versuchen Sie es erneut oder kontaktieren Sie uns.';
  }
}
```

## Testing

### Test Cards (Stripe)

```typescript
// Success
4242 4242 4242 4242

// Decline
4000 0000 0000 0002

// Insufficient funds
4000 0000 0000 9995

// 3D Secure required
4000 0027 6000 3184
```

### Test Mode

Always use test mode in development:

```typescript
const isProduction = process.env.NODE_ENV === 'production';
const stripeKey = isProduction
  ? process.env.STRIPE_SECRET_KEY
  : process.env.STRIPE_TEST_SECRET_KEY;
```

## Monitoring

Track payment metrics:

```typescript
// Log payment events
logger.info('Payment attempt', {
  bookingId,
  amount,
  userId,
  timestamp: new Date(),
});

// Monitor success rate
const successRate = await prisma.booking.aggregate({
  where: {
    createdAt: { gte: last24Hours },
  },
  _count: {
    paymentStatus: true,
  },
});

// Alert on high failure rate
if (successRate.failed / successRate.total > 0.1) {
  await sendAlert('High payment failure rate detected');
}
```

## Refunds

Handle refund requests:

```typescript
export async function processRefund(bookingId: string, reason: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId }
  });

  if (booking.paymentStatus !== 'paid') {
    throw new Error('Cannot refund unpaid booking');
  }

  // Create refund with Stripe
  const refund = await stripe.refunds.create({
    payment_intent: booking.stripePaymentIntentId,
    reason: 'requested_by_customer',
    metadata: {
      bookingId,
      reason,
    },
  });

  // Update booking
  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      paymentStatus: 'refunded',
      refundedAt: new Date(),
      refundReason: reason,
    }
  });

  // Record in Odoo
  await odoo.createCreditNote({
    bookingId,
    amount: booking.totalPrice,
    reason,
  });

  return refund;
}
```

## Idempotency

Prevent duplicate charges:

```typescript
const idempotencyKey = req.headers['idempotency-key'];

if (!idempotencyKey) {
  return res.status(400).json({
    error: { code: 'MISSING_IDEMPOTENCY_KEY' }
  });
}

// Check if request already processed
const existing = await prisma.paymentIntent.findUnique({
  where: { idempotencyKey }
});

if (existing) {
  return res.json({
    success: true,
    data: existing
  });
}

// Process new payment...
```

## Compliance Checklist

- [ ] Never store full card numbers
- [ ] Use Stripe Elements for card input
- [ ] Verify webhook signatures
- [ ] Use HTTPS for all payment pages
- [ ] Implement proper error handling
- [ ] Log payment attempts (not card data)
- [ ] Monitor for fraud
- [ ] Handle refunds properly
- [ ] Test with test cards
- [ ] Document payment flows
- [ ] Implement idempotency
- [ ] Rate limit payment endpoints
- [ ] Encrypt sensitive data at rest
- [ ] Regular security audits
