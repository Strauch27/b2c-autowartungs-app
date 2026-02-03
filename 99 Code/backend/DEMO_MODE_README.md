# Demo Mode Documentation

## Overview

Demo Mode allows you to run the B2C Autowartungs App backend without requiring Stripe API keys. It simulates payment processing using an in-memory payment service, making it perfect for development, testing, and demonstrations.

## Features

- **No Stripe Required**: Works without any Stripe API configuration
- **In-Memory Payment Storage**: All payment intents are stored in memory
- **Realistic Payment Flow**: Simulates the same payment lifecycle as Stripe
- **Demo Endpoints**: Special endpoints to trigger payment confirmations
- **Automatic Payment Confirmation**: Bookings are auto-confirmed in demo mode

## Enabling Demo Mode

### Step 1: Set Environment Variable

Add to your `.env` file:

```bash
DEMO_MODE=true
```

### Step 2: Restart the Server

```bash
npm run dev
```

You should see this log message on startup:

```
Demo mode enabled - demo endpoints are active at /api/demo/*
```

## How It Works

### Booking Creation Flow

When `DEMO_MODE=true`:

1. **Customer creates booking** via `POST /api/bookings`
2. **Demo payment intent created** instead of Stripe
   - Uses format: `demo_pi_{timestamp}_{random}`
   - Stored in memory (not persisted to database)
3. **Payment auto-confirmed** immediately
4. **Booking status**: `CONFIRMED` (skips `PENDING_PAYMENT`)
5. **Single pickup assignment** created for first available jockey
6. **Booking status updated**: `JOCKEY_ASSIGNED`

### Normal Flow (DEMO_MODE=false)

1. Customer creates booking
2. Stripe payment intent created
3. Booking status: `PENDING_PAYMENT`
4. Customer completes payment on frontend
5. Stripe webhook confirms payment
6. Booking status: `CONFIRMED`
7. Jockey assignment created
8. Booking status: `JOCKEY_ASSIGNED`

## Demo API Endpoints

All demo endpoints are only available when `DEMO_MODE=true`.

### 1. Confirm Booking Payment

Simulates a Stripe webhook confirming payment.

**Endpoint**: `POST /api/demo/payment/confirm`

**Body**:
```json
{
  "paymentIntentId": "demo_pi_1234567890_abc123",
  "bookingId": "clx1234567890"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "booking": { /* booking object */ },
    "payment": {
      "id": "demo_pi_1234567890_abc123",
      "status": "succeeded",
      "amount": 5000
    }
  },
  "message": "Payment confirmed successfully"
}
```

### 2. Authorize Extension Payment

Simulates customer approving an extension with payment authorization.

**Endpoint**: `POST /api/demo/extension/authorize`

**Body**:
```json
{
  "extensionId": "clx1234567890",
  "bookingId": "clx0987654321"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "extension": { /* extension object */ },
    "paymentIntent": {
      "id": "demo_pi_1234567890_def456",
      "clientSecret": "demo_pi_1234567890_def456_secret_xyz789",
      "amount": 15000,
      "status": "requires_payment_method"
    }
  },
  "message": "Extension payment authorized"
}
```

### 3. Capture Extension Payment

Simulates workshop completing work and capturing the payment.

**Endpoint**: `POST /api/demo/extension/capture`

**Body**:
```json
{
  "paymentIntentId": "demo_pi_1234567890_def456",
  "extensionId": "clx1234567890"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "extension": { /* extension object with paidAt timestamp */ },
    "payment": {
      "id": "demo_pi_1234567890_def456",
      "status": "succeeded",
      "amount": 15000
    }
  },
  "message": "Extension payment captured successfully"
}
```

### 4. Get Payment Status

Debug endpoint to check payment intent status.

**Endpoint**: `GET /api/demo/payment/:paymentIntentId`

**Response**:
```json
{
  "success": true,
  "data": {
    "status": "succeeded",
    "amount": 50.00,
    "currency": "eur",
    "paid": true
  }
}
```

## Payment Intent ID Format

Demo payment intent IDs follow this format:

```
demo_pi_{timestamp}_{random}
```

Example: `demo_pi_1706956800123_a1b2c3d4e5`

## FSM State Transitions

### Booking Status Flow (Demo Mode)

```
PENDING_PAYMENT  (skipped in demo mode)
    ↓
CONFIRMED  (auto-set on creation)
    ↓
JOCKEY_ASSIGNED  (auto-set after assignment creation)
    ↓
IN_PROGRESS  (jockey picks up vehicle)
    ↓
IN_WORKSHOP  (vehicle delivered to workshop)
    ↓
READY_FOR_DELIVERY  (service complete)
    ↓
DELIVERING  (jockey picks up from workshop)
    ↓
COMPLETED  (vehicle delivered to customer)
```

### Extension Status Flow

```
PENDING  (created by workshop)
    ↓
APPROVED  (customer approves, payment authorized)
    ↓
APPROVED + paidAt  (payment captured, work complete)
```

## Benefits of Demo Mode

### For Development
- No Stripe API keys needed
- Faster iteration cycles
- No webhook configuration required
- No test card numbers needed

### For Testing
- Predictable payment outcomes
- Easy to trigger edge cases
- No external API dependencies
- Instant feedback

### For Demonstrations
- Works offline
- No payment processing delays
- Clean demo flow
- No accidental charges

## Limitations

### In-Memory Storage
- Payment intents are NOT persisted to database
- Cleared on server restart
- Not suitable for production

### No Webhook Simulation
- Real Stripe webhooks won't fire
- Use demo endpoints instead

### Auto-Confirmation
- Payments are auto-confirmed
- Can't test pending payment states

## Production Checklist

Before deploying to production:

- [ ] Set `DEMO_MODE=false` in production `.env`
- [ ] Configure real Stripe API keys
- [ ] Set up Stripe webhooks
- [ ] Test with real payment flow
- [ ] Remove any demo endpoint calls from frontend

## Troubleshooting

### Demo endpoints return 403

**Problem**: Demo endpoints not accessible

**Solution**: Verify `DEMO_MODE=true` in `.env` and restart server

### Bookings stuck in PENDING_PAYMENT

**Problem**: Demo mode not active for booking creation

**Solution**:
1. Check `DEMO_MODE=true` in `.env`
2. Restart backend server
3. Create new booking (don't reuse old ones)

### Payment intent not found

**Problem**: Server was restarted (in-memory storage cleared)

**Solution**: Create a new booking to generate a new payment intent

## Example Test Workflow

### Create and Complete a Booking

```bash
# 1. Create booking (returns payment intent ID)
curl -X POST http://localhost:5001/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "customer": {
      "email": "test@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+49 123 456789"
    },
    "vehicle": {
      "brand": "BMW",
      "model": "3 Series",
      "year": 2020,
      "mileage": 50000
    },
    "services": ["OIL_CHANGE", "INSPECTION"],
    "pickup": {
      "date": "2024-02-10",
      "timeSlot": "09:00",
      "street": "Hauptstraße 1",
      "city": "Munich",
      "postalCode": "80331"
    },
    "delivery": {
      "date": "2024-02-12",
      "timeSlot": "14:00"
    }
  }'

# 2. Booking is auto-confirmed in demo mode!
# Status: CONFIRMED → JOCKEY_ASSIGNED

# 3. Check booking status
curl http://localhost:5001/api/bookings/{bookingId}
```

### Test Extension Flow

```bash
# 1. Workshop creates extension (via workshop app)
# Extension status: PENDING

# 2. Authorize extension payment
curl -X POST http://localhost:5001/api/demo/extension/authorize \
  -H "Content-Type: application/json" \
  -d '{
    "extensionId": "clx1234567890",
    "bookingId": "clx0987654321"
  }'

# Extension status: APPROVED

# 3. Capture payment after work complete
curl -X POST http://localhost:5001/api/demo/extension/capture \
  -H "Content-Type: application/json" \
  -d '{
    "paymentIntentId": "demo_pi_1234567890_def456",
    "extensionId": "clx1234567890"
  }'

# Extension status: APPROVED + paidAt set
```

## Support

For issues or questions:
1. Check server logs for `[DEMO]` tagged messages
2. Verify `DEMO_MODE=true` in `.env`
3. Ensure server was restarted after changing `.env`
4. Check that demo endpoints return proper 403 when demo mode is disabled
