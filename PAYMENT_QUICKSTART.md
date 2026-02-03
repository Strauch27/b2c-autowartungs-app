# Payment Integration - Quick Start Guide

Get the payment system running in 5 minutes.

## Prerequisites

- Stripe account (free at [stripe.com](https://stripe.com))
- Backend and frontend setup completed
- Node.js and npm installed

## Step 1: Install Dependencies (2 minutes)

### Backend
```bash
cd backend
npm install stripe
```

### Frontend
```bash
cd frontend
npm install @stripe/stripe-js @stripe/react-stripe-js
```

## Step 2: Get Stripe API Keys (1 minute)

1. Go to [Stripe Dashboard - API Keys](https://dashboard.stripe.com/test/apikeys)
2. Copy your **Test Mode** keys:
   - **Secret key**: `sk_test_51...`
   - **Publishable key**: `pk_test_51...`

## Step 3: Configure Environment Variables (1 minute)

### Backend `.env`
```bash
STRIPE_SECRET_KEY=sk_test_51HqK... # Paste your secret key
STRIPE_PUBLISHABLE_KEY=pk_test_51HqK... # Paste your publishable key
STRIPE_WEBHOOK_SECRET= # Leave empty for now
```

### Frontend `.env.local`
```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51HqK... # Paste your publishable key
```

## Step 4: Start Development Servers (1 minute)

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

### Terminal 3 - Stripe Webhooks (Optional)
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login and forward webhooks
stripe login
stripe listen --forward-to localhost:5001/api/payment/webhook
```

Copy the webhook secret (`whsec_...`) to backend `.env` and restart backend.

## Step 5: Test Payment (1 minute)

### Option A: Via UI

1. **Open browser:** http://localhost:3000/customer/login
2. **Login** as customer
3. **Create a booking** (or use existing booking ID)
4. **Navigate to:** http://localhost:3000/customer/booking/payment?bookingId=YOUR_BOOKING_ID
5. **Enter test card:**
   ```
   Card Number: 4242 4242 4242 4242
   Expiry: 12/25
   CVC: 123
   ZIP: 12345
   ```
6. **Click "Pay"**
7. **Success!** You should be redirected to confirmation page

### Option B: Via API

```bash
# 1. Login and get token
TOKEN=$(curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}' | jq -r '.token')

# 2. Create booking
BOOKING_ID=$(curl -X POST http://localhost:5001/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "vehicleId": "your-vehicle-id",
    "serviceType": "INSPECTION",
    "pickupDate": "2024-02-15T09:00:00Z",
    "pickupTimeSlot": "08:00-10:00",
    "pickupAddress": "Hauptstraße 1",
    "pickupCity": "Berlin",
    "pickupPostalCode": "10115"
  }' | jq -r '.data.id')

# 3. Create payment intent
CLIENT_SECRET=$(curl -X POST http://localhost:5001/api/payment/create-intent \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"bookingId\":\"$BOOKING_ID\"}" | jq -r '.data.clientSecret')

echo "Booking ID: $BOOKING_ID"
echo "Client Secret: $CLIENT_SECRET"

# 4. Complete payment in UI with booking ID
open "http://localhost:3000/customer/booking/payment?bookingId=$BOOKING_ID"
```

## Verification Checklist

After successful payment:

- [ ] Booking status changed to `CONFIRMED`
- [ ] `paidAt` field is set in database
- [ ] Payment shows in [Stripe Dashboard - Payments](https://dashboard.stripe.com/test/payments)
- [ ] Webhook event logged in terminal (if Stripe CLI running)
- [ ] Redirected to confirmation page
- [ ] Payment status shows "succeeded"

## Test Cards Reference

| Scenario | Card Number | Result |
|----------|-------------|--------|
| Success | 4242 4242 4242 4242 | ✅ Payment succeeds |
| 3D Secure | 4000 0027 6000 3184 | ✅ Requires authentication |
| Declined | 4000 0000 0000 0002 | ❌ Card declined |
| Insufficient Funds | 4000 0000 0000 9995 | ❌ Insufficient funds |

**All test cards:**
- Expiry: Any future date (e.g., 12/25)
- CVC: Any 3 digits (e.g., 123)
- ZIP: Any 5 digits (e.g., 12345)

## Common Issues

### "Stripe publishable key is not defined"
**Fix:** Add `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` to frontend `.env.local`

### "STRIPE_SECRET_KEY is not defined"
**Fix:** Add `STRIPE_SECRET_KEY` to backend `.env`

### Payment form not rendering
**Fix:** Ensure StripeProvider wraps your app (should be in root layout)

### Webhook not updating booking
**Fix:**
1. Start Stripe CLI: `stripe listen --forward-to localhost:5001/api/payment/webhook`
2. Copy webhook secret to `.env`
3. Restart backend

### "Booking not found"
**Fix:** Ensure booking exists and belongs to authenticated user

## Next Steps

### For Development
1. Read [Full Testing Guide](backend/docs/PAYMENT_TESTING_GUIDE.md)
2. Test all payment scenarios
3. Integrate into your booking flow
4. Add email notifications

### For Production
1. Get live Stripe keys
2. Set up production webhook
3. Test with real (small) transactions
4. Review [Production Checklist](PAYMENT_INTEGRATION_README.md#production-deployment)

## Resources

- **Complete Documentation:** [PAYMENT_INTEGRATION_README.md](PAYMENT_INTEGRATION_README.md)
- **API Reference:** [backend/docs/PAYMENT_API.md](backend/docs/PAYMENT_API.md)
- **Testing Guide:** [backend/docs/PAYMENT_TESTING_GUIDE.md](backend/docs/PAYMENT_TESTING_GUIDE.md)
- **Integration Examples:** [frontend/docs/PAYMENT_INTEGRATION_EXAMPLE.md](frontend/docs/PAYMENT_INTEGRATION_EXAMPLE.md)
- **Stripe Dashboard:** https://dashboard.stripe.com/test
- **Stripe Docs:** https://stripe.com/docs

## Quick Commands Cheat Sheet

```bash
# Start backend
cd backend && npm run dev

# Start frontend
cd frontend && npm run dev

# Start Stripe webhooks
stripe listen --forward-to localhost:5001/api/payment/webhook

# Trigger test webhook
stripe trigger payment_intent.succeeded

# View Stripe logs
stripe logs tail

# Test payment endpoint
curl -X POST http://localhost:5001/api/payment/create-intent \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"bookingId":"xxx"}'
```

## Support

- **Stripe Support:** https://support.stripe.com
- **Stripe Docs:** https://stripe.com/docs
- **Test Dashboard:** https://dashboard.stripe.com/test

---

**Ready to integrate?** See [PAYMENT_INTEGRATION_EXAMPLE.md](frontend/docs/PAYMENT_INTEGRATION_EXAMPLE.md) for integration examples.

**Need help?** Check [PAYMENT_TESTING_GUIDE.md](backend/docs/PAYMENT_TESTING_GUIDE.md) for troubleshooting.
