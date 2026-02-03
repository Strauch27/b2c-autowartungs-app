# Payment API Documentation

Complete documentation for the Stripe Payment Integration.

## Table of Contents

- [Overview](#overview)
- [Setup](#setup)
- [API Endpoints](#api-endpoints)
- [Webhook Events](#webhook-events)
- [Error Handling](#error-handling)
- [Testing](#testing)

## Overview

The payment system uses Stripe for secure payment processing. It supports:

- Credit/Debit Cards
- SEPA Direct Debit
- Sofort Banking
- Automatic payment methods based on customer location

## Setup

### 1. Environment Variables

Add the following to your `.env` file:

```bash
# Stripe API Keys (Test Mode)
STRIPE_SECRET_KEY=sk_test_51...
STRIPE_PUBLISHABLE_KEY=pk_test_51...
STRIPE_WEBHOOK_SECRET=whsec_...

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### 2. Get Your Stripe Keys

1. Visit [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
2. Copy your **Test Mode** API keys
3. Create a webhook endpoint at `/api/payment/webhook`
4. Copy the webhook signing secret

### 3. Configure Webhook

1. Go to [Stripe Webhooks](https://dashboard.stripe.com/test/webhooks)
2. Click "Add endpoint"
3. Enter URL: `https://your-domain.com/api/payment/webhook`
4. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
   - `charge.refunded`
5. Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`

## API Endpoints

### 1. Create Payment Intent

Creates a payment intent for a booking.

**Endpoint:** `POST /api/payment/create-intent`

**Authentication:** Required (Customer)

**Request Body:**
```json
{
  "bookingId": "clxx1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "clientSecret": "pi_xxx_secret_xxx",
    "paymentIntentId": "pi_xxx",
    "amount": 249.99
  }
}
```

**Error Responses:**

- `400 Bad Request` - Invalid booking ID or booking already paid
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Not authorized to pay for this booking
- `404 Not Found` - Booking not found

**Example:**
```javascript
const response = await fetch('/api/payment/create-intent', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ bookingId: 'clxx1234567890' })
});

const { data } = await response.json();
console.log(data.clientSecret); // Use with Stripe Elements
```

---

### 2. Get Payment Status

Retrieves the current status of a payment.

**Endpoint:** `GET /api/payment/status/:paymentIntentId`

**Authentication:** Required (Customer)

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "succeeded",
    "amount": 249.99,
    "currency": "eur",
    "paid": true
  }
}
```

**Payment Statuses:**
- `requires_payment_method` - Awaiting payment
- `requires_confirmation` - Payment method provided, awaiting confirmation
- `processing` - Payment is being processed
- `succeeded` - Payment successful
- `canceled` - Payment canceled
- `requires_action` - Additional action required (e.g., 3D Secure)

**Example:**
```javascript
const response = await fetch(`/api/payment/status/${paymentIntentId}`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const { data } = await response.json();
console.log(data.status); // "succeeded"
```

---

### 3. Webhook Handler

Handles Stripe webhook events.

**Endpoint:** `POST /api/payment/webhook`

**Authentication:** Webhook signature verification

**Request:** Raw body with Stripe signature header

**Events Handled:**
- `payment_intent.succeeded` - Updates booking to CONFIRMED
- `payment_intent.payment_failed` - Logs failure, notifies customer
- `payment_intent.canceled` - Logs cancellation
- `charge.refunded` - Logs refund

**Response:**
```json
{
  "received": true
}
```

**Note:** This endpoint is called by Stripe, not your frontend.

---

### 4. Refund Payment (Admin)

Process a full or partial refund.

**Endpoint:** `POST /api/payment/refund`

**Authentication:** Required (Admin only)

**Request Body:**
```json
{
  "paymentIntentId": "pi_xxx",
  "amount": 100.00,  // Optional - omit for full refund
  "reason": "requested_by_customer"  // Optional
}
```

**Refund Reasons:**
- `duplicate`
- `fraudulent`
- `requested_by_customer`

**Response:**
```json
{
  "success": true,
  "data": {
    "refundId": "re_xxx",
    "amount": 100.00,
    "status": "succeeded"
  },
  "message": "Refund processed successfully"
}
```

**Example:**
```javascript
const response = await fetch('/api/payment/refund', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminToken}`
  },
  body: JSON.stringify({
    paymentIntentId: 'pi_xxx',
    amount: 100.00,
    reason: 'requested_by_customer'
  })
});
```

## Webhook Events

### payment_intent.succeeded

Triggered when a payment is successful.

**Actions:**
1. Updates booking status to `CONFIRMED`
2. Sets `paidAt` timestamp
3. Sends confirmation email (TODO)
4. Notifies workshop/jockey system (TODO)

### payment_intent.payment_failed

Triggered when a payment fails.

**Actions:**
1. Logs the failure
2. Sends notification to customer (TODO)

### payment_intent.canceled

Triggered when a payment is canceled.

**Actions:**
1. Logs the cancellation

### charge.refunded

Triggered when a charge is refunded.

**Actions:**
1. Logs the refund
2. Sends refund confirmation email (TODO)

## Error Handling

### Common Error Codes

```json
{
  "success": false,
  "error": "Error message",
  "statusCode": 400
}
```

**Status Codes:**
- `400` - Bad Request (invalid data)
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (not authorized for this action)
- `404` - Not Found (resource doesn't exist)
- `409` - Conflict (e.g., booking already paid)
- `500` - Internal Server Error

### Stripe Errors

Stripe errors are caught and transformed into API errors:

```json
{
  "success": false,
  "error": "Payment error: Your card was declined"
}
```

## Testing

### Test Cards

Use these test cards in **Test Mode**:

**Successful Payment:**
```
Card Number: 4242 4242 4242 4242
Expiry: Any future date (e.g., 12/25)
CVC: Any 3 digits (e.g., 123)
ZIP: Any 5 digits (e.g., 12345)
```

**Requires Authentication (3D Secure):**
```
Card Number: 4000 0027 6000 3184
Expiry: Any future date
CVC: Any 3 digits
ZIP: Any 5 digits
```

**Declined Payment:**
```
Card Number: 4000 0000 0000 0002
Expiry: Any future date
CVC: Any 3 digits
ZIP: Any 5 digits
```

**Insufficient Funds:**
```
Card Number: 4000 0000 0000 9995
Expiry: Any future date
CVC: Any 3 digits
ZIP: Any 5 digits
```

**More Test Cards:** [Stripe Testing Cards](https://stripe.com/docs/testing)

### SEPA Direct Debit Test

```
Account Number (IBAN): DE89370400440532013000
Account Holder: Any name
```

### Testing Webhooks Locally

#### Option 1: Stripe CLI (Recommended)

1. Install Stripe CLI:
```bash
brew install stripe/stripe-cli/stripe
```

2. Login:
```bash
stripe login
```

3. Forward webhooks to local server:
```bash
stripe listen --forward-to localhost:5000/api/payment/webhook
```

4. Copy the webhook signing secret to `.env`:
```bash
STRIPE_WEBHOOK_SECRET=whsec_...
```

5. Trigger test events:
```bash
stripe trigger payment_intent.succeeded
```

#### Option 2: Expose Local Server

Use ngrok or similar to expose your local server:

```bash
ngrok http 5000
```

Then configure the webhook URL in Stripe Dashboard.

### Testing Flow

1. **Create a Booking:**
```bash
POST /api/bookings
```

2. **Create Payment Intent:**
```bash
POST /api/payment/create-intent
Body: { "bookingId": "clxx..." }
```

3. **Complete Payment on Frontend:**
Use Stripe Elements with test card `4242 4242 4242 4242`

4. **Verify Webhook Received:**
Check server logs for webhook event

5. **Check Booking Status:**
```bash
GET /api/bookings/:bookingId
```

Status should be `CONFIRMED` and `paidAt` should be set.

## Security Best Practices

### 1. Never expose Secret Keys

- ✅ Use `STRIPE_SECRET_KEY` on backend only
- ✅ Use `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` on frontend
- ❌ Never commit keys to git
- ❌ Never expose secret key on frontend

### 2. Webhook Signature Verification

Always verify webhook signatures:

```typescript
const event = stripe.webhooks.constructEvent(
  payload,
  signature,
  webhookSecret
);
```

### 3. Amount Validation

Always calculate prices on the backend:

```typescript
// ✅ Good - Backend calculates price
const price = calculatePrice(booking);
const paymentIntent = await stripe.paymentIntents.create({
  amount: price * 100,
  // ...
});

// ❌ Bad - Frontend sends price
const paymentIntent = await stripe.paymentIntents.create({
  amount: req.body.amount, // Never trust client
  // ...
});
```

### 4. Authentication

All payment endpoints (except webhook) require authentication:

```typescript
router.post('/create-intent', authenticate, createPaymentIntent);
```

### 5. Rate Limiting

Payment endpoints are rate-limited:

- Payment creation: 10 requests per 15 minutes
- Webhooks: 100 requests per minute

## PCI Compliance

By using Stripe Elements, your application is PCI compliant because:

1. Card data never touches your server
2. Stripe handles all sensitive data
3. You only receive tokens, not card numbers
4. Stripe is PCI Level 1 certified

## Production Checklist

Before going live:

- [ ] Replace test keys with live keys
- [ ] Update webhook URL to production domain
- [ ] Test all payment flows in live mode with real (small) transactions
- [ ] Set up monitoring for failed payments
- [ ] Configure email notifications
- [ ] Set up refund policies
- [ ] Enable 3D Secure authentication
- [ ] Review Stripe's "Go Live" checklist
- [ ] Test webhook failover handling
- [ ] Set up dispute monitoring

## Support

For issues or questions:

- **Stripe Documentation:** https://stripe.com/docs
- **Stripe Support:** https://support.stripe.com
- **Test Dashboard:** https://dashboard.stripe.com/test
- **Live Dashboard:** https://dashboard.stripe.com
