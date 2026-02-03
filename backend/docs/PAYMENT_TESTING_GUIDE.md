# Payment Integration Testing Guide

Step-by-step guide to test the Stripe payment integration.

## Prerequisites

1. **Stripe Account**: Sign up at [stripe.com](https://stripe.com)
2. **Test Mode Keys**: Get from [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
3. **Backend Running**: `npm run dev` in backend directory
4. **Frontend Running**: `npm run dev` in frontend directory

## Setup

### 1. Configure Backend Environment

Edit `/backend/.env`:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_51H... # Your test secret key
STRIPE_PUBLISHABLE_KEY=pk_test_51H... # Your test publishable key
STRIPE_WEBHOOK_SECRET=whsec_... # Leave empty for now
```

### 2. Configure Frontend Environment

Edit `/frontend/.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:5001
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51H... # Your test publishable key
```

### 3. Start Both Servers

Backend:
```bash
cd backend
npm run dev
```

Frontend:
```bash
cd frontend
npm run dev
```

## Testing Scenarios

### Scenario 1: Successful Payment Flow

**Step 1: Create a Customer Account**

1. Navigate to `http://localhost:3000/customer/login`
2. Enter email: `test@example.com`
3. Complete magic link login or registration

**Step 2: Add a Vehicle**

1. Navigate to vehicles section
2. Add vehicle:
   - Brand: VW
   - Model: Golf 7
   - Year: 2015
   - Mileage: 50000
   - License Plate: B-AB 1234

**Step 3: Create a Booking**

1. Select service type: INSPECTION
2. Choose pickup date: Tomorrow
3. Select time slot: 08:00-10:00
4. Enter pickup address:
   - Street: Hauptstraße 123
   - Postal Code: 10115
   - City: Berlin
5. Submit booking

**Step 4: Navigate to Payment**

1. Click "Complete Payment" or navigate to:
   `/customer/booking/payment?bookingId=<bookingId>`

**Step 5: Complete Payment**

Use Stripe test card:
```
Card Number: 4242 4242 4242 4242
Expiry: 12/25
CVC: 123
ZIP: 12345
Name: Test Customer
```

**Expected Result:**
- ✅ Payment succeeds
- ✅ Redirected to confirmation page
- ✅ Booking status changes to CONFIRMED
- ✅ Payment status shows "succeeded"

---

### Scenario 2: Declined Payment

**Use this test card:**
```
Card Number: 4000 0000 0000 0002
Expiry: 12/25
CVC: 123
ZIP: 12345
```

**Expected Result:**
- ❌ Payment fails
- ❌ Error message: "Your card was declined"
- ❌ Booking status remains PENDING_PAYMENT
- ❌ User can retry with different card

---

### Scenario 3: 3D Secure Authentication

**Use this test card:**
```
Card Number: 4000 0027 6000 3184
Expiry: 12/25
CVC: 123
ZIP: 12345
```

**Expected Result:**
- ⏳ 3D Secure modal appears
- ✅ Click "Complete" in test modal
- ✅ Payment succeeds after authentication
- ✅ Booking confirmed

---

### Scenario 4: Insufficient Funds

**Use this test card:**
```
Card Number: 4000 0000 0000 9995
Expiry: 12/25
CVC: 123
ZIP: 12345
```

**Expected Result:**
- ❌ Payment fails
- ❌ Error: "Your card has insufficient funds"

---

### Scenario 5: SEPA Direct Debit

**In payment form, select "SEPA Direct Debit" tab**

Use test IBAN:
```
IBAN: DE89370400440532013000
Account Holder: Test Customer
```

**Expected Result:**
- ✅ Payment intent created
- ⏳ Payment shows as "processing"
- ✅ Manual confirmation in Stripe Dashboard needed for test

---

### Scenario 6: Payment Already Completed

**Steps:**
1. Complete a successful payment
2. Try to access payment page again with same bookingId

**Expected Result:**
- ❌ Error: "Booking has already been paid"
- ℹ️ Cannot create duplicate payment intent

---

## Webhook Testing

### Setup Stripe CLI

1. **Install Stripe CLI:**
```bash
# macOS
brew install stripe/stripe-cli/stripe

# Windows
scoop install stripe

# Linux
wget https://github.com/stripe/stripe-cli/releases/download/v1.17.0/stripe_1.17.0_linux_x86_64.tar.gz
tar -xvf stripe_1.17.0_linux_x86_64.tar.gz
```

2. **Login to Stripe:**
```bash
stripe login
```

3. **Forward webhooks to local server:**
```bash
stripe listen --forward-to localhost:5001/api/payment/webhook
```

4. **Copy webhook secret:**
The CLI will output a webhook signing secret like:
```
whsec_1234567890abcdef...
```

5. **Update backend .env:**
```bash
STRIPE_WEBHOOK_SECRET=whsec_1234567890abcdef...
```

6. **Restart backend server**

### Test Webhook Events

**In a new terminal, trigger events:**

```bash
# Successful payment
stripe trigger payment_intent.succeeded

# Failed payment
stripe trigger payment_intent.payment_failed

# Refund
stripe trigger charge.refunded
```

**Check backend logs for:**
```
Webhook received { type: 'payment_intent.succeeded', eventId: 'evt_...' }
Booking payment confirmed { bookingId: '...', amount: 249.99 }
```

---

## API Testing with cURL

### 1. Create Payment Intent

```bash
# First, create a booking and get the bookingId
BOOKING_ID="clxx1234567890"
TOKEN="your-jwt-token"

curl -X POST http://localhost:5001/api/payment/create-intent \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "bookingId": "'$BOOKING_ID'"
  }'
```

**Expected Response:**
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

### 2. Check Payment Status

```bash
PAYMENT_INTENT_ID="pi_xxx"

curl http://localhost:5001/api/payment/status/$PAYMENT_INTENT_ID \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
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

### 3. Webhook Test (Manual)

```bash
# This would normally be called by Stripe
curl -X POST http://localhost:5001/api/payment/webhook \
  -H "Content-Type: application/json" \
  -H "stripe-signature: xxx" \
  -d '{
    "type": "payment_intent.succeeded",
    "data": {
      "object": {
        "id": "pi_xxx",
        "amount": 24999,
        "status": "succeeded"
      }
    }
  }'
```

---

## Frontend Component Testing

### Test StripeCheckout Component

Create test page `/app/test/payment/page.tsx`:

```tsx
"use client";

import { StripeCheckout } from "@/components/payment/stripe-checkout";

export default function TestPayment() {
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-8">Payment Test</h1>
      <StripeCheckout
        bookingId="clxx1234567890"
        onSuccess={() => alert("Payment successful!")}
        onError={(error) => alert(`Payment failed: ${error}`)}
      />
    </div>
  );
}
```

Navigate to `http://localhost:3000/test/payment`

---

## Database Verification

### Check Booking Status After Payment

```sql
-- Connect to your database
psql -U postgres -d b2c_autowartung

-- Check booking
SELECT
  "bookingNumber",
  "status",
  "paymentIntentId",
  "paidAt",
  "totalPrice"
FROM "Booking"
WHERE "id" = 'your-booking-id';

-- Should show:
-- status: CONFIRMED
-- paymentIntentId: pi_xxx
-- paidAt: 2024-01-XX XX:XX:XX
```

---

## Stripe Dashboard Verification

### 1. View Payments

1. Go to [Stripe Dashboard - Payments](https://dashboard.stripe.com/test/payments)
2. Find your test payment
3. Verify:
   - Amount matches booking
   - Status is "Succeeded"
   - Metadata contains bookingId

### 2. View Customer

1. Go to [Stripe Dashboard - Customers](https://dashboard.stripe.com/test/customers)
2. Find customer by email
3. Verify:
   - Customer created automatically
   - Payment method saved (if applicable)

### 3. View Events

1. Go to [Stripe Dashboard - Events](https://dashboard.stripe.com/test/events)
2. Find `payment_intent.succeeded` event
3. Verify webhook was sent

---

## Error Scenarios Testing

### 1. Invalid Booking ID

```bash
curl -X POST http://localhost:5001/api/payment/create-intent \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"bookingId": "invalid-id"}'
```

**Expected:** 400 Bad Request

### 2. Missing Authentication

```bash
curl -X POST http://localhost:5001/api/payment/create-intent \
  -H "Content-Type: application/json" \
  -d '{"bookingId": "clxx123"}'
```

**Expected:** 401 Unauthorized

### 3. Wrong Customer

Try to pay for another customer's booking.

**Expected:** 403 Forbidden

### 4. Already Paid Booking

Try to create payment intent for already paid booking.

**Expected:** 400 Bad Request - "Booking has already been paid"

---

## Performance Testing

### Load Test Payment Intent Creation

```bash
# Install Apache Bench
brew install httpd

# Run 100 requests, 10 concurrent
ab -n 100 -c 10 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -p booking.json \
  http://localhost:5001/api/payment/create-intent
```

**Expected:**
- All requests should succeed
- Average response time < 500ms

---

## Refund Testing (Admin Only)

### 1. Create Admin User

Add admin role to user in database:

```sql
UPDATE "User"
SET "role" = 'ADMIN'
WHERE "email" = 'admin@example.com';
```

### 2. Process Full Refund

```bash
PAYMENT_INTENT_ID="pi_xxx"
ADMIN_TOKEN="admin-jwt-token"

curl -X POST http://localhost:5001/api/payment/refund \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "paymentIntentId": "'$PAYMENT_INTENT_ID'",
    "reason": "requested_by_customer"
  }'
```

### 3. Process Partial Refund

```bash
curl -X POST http://localhost:5001/api/payment/refund \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "paymentIntentId": "'$PAYMENT_INTENT_ID'",
    "amount": 50.00,
    "reason": "requested_by_customer"
  }'
```

---

## Troubleshooting

### Payment Intent Creation Fails

**Check:**
- ✅ Stripe secret key is correct
- ✅ Booking exists and status is PENDING_PAYMENT
- ✅ User is authenticated
- ✅ Backend logs for error details

### Webhook Not Receiving Events

**Check:**
- ✅ Stripe CLI is running
- ✅ Webhook secret is correct in .env
- ✅ Backend server is running on correct port
- ✅ Endpoint is accessible: `POST /api/payment/webhook`

### Payment Form Not Rendering

**Check:**
- ✅ Stripe publishable key is correct
- ✅ Stripe.js loaded: Check browser console
- ✅ Client secret is received from backend
- ✅ Elements component properly wrapped

### 3D Secure Not Working

**Check:**
- ✅ Using correct test card: 4000 0027 6000 3184
- ✅ Return URL is configured
- ✅ Stripe.js version is up to date

---

## Test Checklist

### Basic Flow
- [ ] Customer can create booking
- [ ] Payment intent is created successfully
- [ ] Payment form renders with Stripe Elements
- [ ] Successful payment with test card
- [ ] Booking status updates to CONFIRMED
- [ ] Redirect to confirmation page works

### Error Handling
- [ ] Declined card shows error message
- [ ] User can retry with different card
- [ ] Invalid booking ID returns 404
- [ ] Unauthenticated request returns 401
- [ ] Already paid booking returns error

### Webhooks
- [ ] payment_intent.succeeded updates booking
- [ ] payment_intent.failed is logged
- [ ] Webhook signature verification works
- [ ] Invalid signature is rejected

### UI/UX
- [ ] Loading states display correctly
- [ ] Error messages are user-friendly
- [ ] Success confirmation is clear
- [ ] Mobile responsive design works

### Security
- [ ] Secret key never exposed to frontend
- [ ] Webhook signatures verified
- [ ] Prices calculated on backend
- [ ] Authentication required for all endpoints

---

## Support Resources

- **Stripe Testing Docs:** https://stripe.com/docs/testing
- **Test Cards:** https://stripe.com/docs/testing#cards
- **Webhook Testing:** https://stripe.com/docs/webhooks/test
- **Stripe CLI:** https://stripe.com/docs/stripe-cli
- **Dashboard:** https://dashboard.stripe.com/test
