# Demo Payment Service Documentation

## Overview

The Demo Payment Service provides a complete payment simulation for development and testing without requiring Stripe API keys or making real payment transactions. It implements the same interface as the real Stripe payment service but stores everything in memory.

**Use Case:** Enable full E2E testing of the booking and extension payment flows in demo mode.

## Configuration

Enable demo mode by setting the environment variable:

```bash
DEMO_MODE=true
```

When `DEMO_MODE=true`, the application uses the Demo Payment Service instead of Stripe for all payment operations.

## Architecture

### Services

- **`demo-payment.service.ts`**: Core service implementing payment operations
  - In-memory storage for Payment Intents
  - Simulates Stripe Payment Intent lifecycle
  - Supports both automatic and manual capture

### Controllers & Routes

- **`demo.controller.ts`**: Endpoints for simulating payment events
- **`demo.routes.ts`**: Route definitions (`/api/demo/*`)

### Key Features

1. **No External Dependencies**: No Stripe API keys or network calls required
2. **Full Payment Lifecycle**: Supports create, confirm, capture, cancel operations
3. **Extension Payment Flow**: Authorize/capture pattern for service extensions
4. **Logging**: All operations logged with `[DEMO]` prefix for easy identification

## Payment Flows

### 1. Booking Payment Flow (Automatic Capture)

Standard booking payments are automatically captured when confirmed.

```
Customer initiates booking
    ↓
POST /api/bookings (creates PaymentIntent via demo service)
    ↓ Returns clientSecret
Customer completes payment on frontend
    ↓
POST /api/demo/payment/confirm (simulates Stripe webhook)
    ↓
Booking status → CONFIRMED, paidAt set
```

**Implementation Details:**

- Payment Intent created with `captureMethod: 'automatic'`
- Status transitions: `requires_payment_method` → `succeeded`
- Booking immediately confirmed and marked as paid

### 2. Extension Payment Flow (Authorize → Capture)

Extension payments use the authorize-then-capture pattern to hold funds until work is completed.

```
Workshop creates extension
    ↓ Extension status: PENDING
Customer reviews extension
    ↓
Customer approves → POST /api/demo/extension/authorize
    ↓ Payment authorized (not captured)
Extension status → APPROVED, paymentIntentId stored
    ↓
Workshop completes work
    ↓ Booking status → COMPLETED
Auto-capture triggered
    ↓
POST /api/demo/extension/capture (internal)
    ↓
Extension status → COMPLETED, paidAt set
    ↓
Funds captured
```

**Implementation Details:**

- Payment Intent created with `captureMethod: 'manual'`
- Status transitions: `requires_payment_method` → `requires_action` → `succeeded`
- Extension status flow: `PENDING` → `APPROVED` → `COMPLETED`

### 3. Extension Decline Flow

Customer can decline an extension, releasing any authorized payment.

```
Customer declines extension
    ↓
POST /api/demo/extension/decline
    ↓
Payment Intent cancelled (if exists)
    ↓
Extension status → DECLINED, declineReason set
```

## API Endpoints

### POST `/api/demo/payment/confirm`

Simulates Stripe webhook confirming a booking payment.

**Request:**
```json
{
  "paymentIntentId": "demo_pi_1234567890_abc",
  "bookingId": "clxy1234567890abcdef"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "booking": { ... },
    "payment": {
      "id": "demo_pi_1234567890_abc",
      "status": "succeeded",
      "amount": 5000
    }
  },
  "message": "Payment confirmed successfully"
}
```

**Status Codes:**
- `200 OK`: Payment confirmed
- `400 Bad Request`: Invalid input
- `403 Forbidden`: Demo mode not enabled
- `404 Not Found`: Payment or booking not found

### POST `/api/demo/extension/authorize`

Simulates customer approving an extension (authorizes payment).

**Request:**
```json
{
  "extensionId": "clxy2345678901abcdef",
  "bookingId": "clxy1234567890abcdef"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "extension": {
      "id": "clxy2345678901abcdef",
      "status": "APPROVED",
      "totalAmount": 15000,
      "paymentIntentId": "demo_pi_1234567891_xyz",
      "approvedAt": "2026-02-03T10:00:00.000Z"
    },
    "paymentIntent": {
      "id": "demo_pi_1234567891_xyz",
      "clientSecret": "demo_pi_1234567891_xyz_secret_xyz",
      "amount": 15000,
      "status": "requires_payment_method"
    }
  },
  "message": "Extension payment authorized"
}
```

**Status Codes:**
- `200 OK`: Extension authorized
- `400 Bad Request`: Invalid input or extension mismatch
- `403 Forbidden`: Demo mode not enabled
- `404 Not Found`: Extension not found

### POST `/api/demo/extension/capture`

Simulates workshop completing work and capturing extension payment.

**Request:**
```json
{
  "paymentIntentId": "demo_pi_1234567891_xyz",
  "extensionId": "clxy2345678901abcdef"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "extension": {
      "id": "clxy2345678901abcdef",
      "status": "APPROVED",
      "paidAt": "2026-02-03T12:00:00.000Z"
    },
    "payment": {
      "id": "demo_pi_1234567891_xyz",
      "status": "succeeded",
      "amount": 15000
    }
  },
  "message": "Extension payment captured successfully"
}
```

**Status Codes:**
- `200 OK`: Payment captured
- `400 Bad Request`: Invalid input or payment cannot be captured
- `403 Forbidden`: Demo mode not enabled
- `404 Not Found`: Payment or extension not found

**Note:** Extension status is updated with `paidAt` timestamp. The status transitions to `COMPLETED` are handled by the workshop controller when marking work complete.

### POST `/api/demo/extension/decline`

Simulates customer declining an extension.

**Request:**
```json
{
  "extensionId": "clxy2345678901abcdef",
  "reason": "Too expensive"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "clxy2345678901abcdef",
    "status": "DECLINED",
    "declinedAt": "2026-02-03T10:30:00.000Z",
    "declineReason": "Too expensive"
  },
  "message": "Extension declined successfully"
}
```

**Status Codes:**
- `200 OK`: Extension declined
- `400 Bad Request`: Invalid input
- `403 Forbidden`: Demo mode not enabled
- `404 Not Found`: Extension not found

### GET `/api/demo/payment/:paymentIntentId`

Get payment status for debugging.

**Response:**
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

**Status Codes:**
- `200 OK`: Status retrieved
- `403 Forbidden`: Demo mode not enabled
- `404 Not Found`: Payment not found

## Auto-Capture Integration

The workshops controller automatically captures approved extension payments when marking a booking as `COMPLETED`.

**Code Location:** `backend/src/controllers/workshops.controller.ts` (lines 352-393)

**Logic:**
1. When booking status changes to `COMPLETED`
2. Find all extensions with `status = APPROVED` and `paymentIntentId != null`
3. For each extension:
   - Check if `DEMO_MODE=true`
   - Use `demoPaymentService.capturePayment()` if demo mode
   - Use `paymentService.capturePayment()` if production mode
   - Update extension `status = COMPLETED` and set `paidAt`
4. Log success/failure for each capture

**Error Handling:**
- Individual extension capture failures don't block other extensions
- Errors are logged but don't fail the booking status update
- Workshop can manually retry failed captures

## Testing Examples

### Example 1: Complete Booking Payment

```bash
# 1. Create booking (returns paymentIntentId)
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "clxy...",
    "vehicleId": "clxy...",
    "pickupDate": "2026-02-10T10:00:00Z",
    "pickupAddress": "Hauptstrasse 1",
    ...
  }'

# Response includes paymentIntentId

# 2. Confirm payment (simulates Stripe webhook)
curl -X POST http://localhost:5000/api/demo/payment/confirm \
  -H "Content-Type: application/json" \
  -d '{
    "paymentIntentId": "demo_pi_...",
    "bookingId": "clxy..."
  }'
```

### Example 2: Extension Approve & Capture

```bash
# 1. Workshop creates extension
curl -X POST http://localhost:5000/api/workshops/bookings/{bookingId}/extensions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {workshop_token}" \
  -d '{
    "description": "Brake pads need replacement",
    "items": [
      {"name": "Brake pads front", "price": 8000, "quantity": 1},
      {"name": "Labor", "price": 5000, "quantity": 1}
    ]
  }'

# Response includes extensionId

# 2. Customer approves extension
curl -X POST http://localhost:5000/api/demo/extension/authorize \
  -H "Content-Type: application/json" \
  -d '{
    "extensionId": "clxy...",
    "bookingId": "clxy..."
  }'

# 3. Workshop marks booking as completed (auto-captures)
curl -X PATCH http://localhost:5000/api/workshops/orders/{bookingId}/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {workshop_token}" \
  -d '{"status": "COMPLETED"}'
```

### Example 3: Extension Decline

```bash
# Customer declines extension
curl -X POST http://localhost:5000/api/demo/extension/decline \
  -H "Content-Type: application/json" \
  -d '{
    "extensionId": "clxy...",
    "reason": "Budget constraints"
  }'
```

### Example 4: Check Payment Status

```bash
curl -X GET http://localhost:5000/api/demo/payment/demo_pi_1234567890_abc
```

## Extension Status State Machine

```
PENDING
    ↓
    ├─→ APPROVED (customer approves, payment authorized)
    │       ↓
    │       └─→ COMPLETED (workshop finishes, payment captured)
    │
    ├─→ DECLINED (customer declines, payment cancelled)
    │
    └─→ CANCELLED (workshop cancels before customer responds)
```

**Key States:**

- **PENDING**: Extension created, awaiting customer decision
- **APPROVED**: Customer approved, payment authorized (not captured)
- **COMPLETED**: Workshop finished work, payment captured
- **DECLINED**: Customer declined extension
- **CANCELLED**: Extension cancelled by workshop

## Important Notes

### Security

- Demo endpoints are **only accessible when `DEMO_MODE=true`**
- Returns `403 Forbidden` in production mode
- No authentication required in demo mode (for E2E testing)

### Data Persistence

- All payment intents stored **in-memory only**
- Data lost on server restart
- Use `demoPaymentService.clearAll()` to reset during testing

### Logging

- All demo operations logged with `[DEMO]` prefix
- Amounts logged in EUR (divided by 100)
- Includes paymentIntentId, extensionId, bookingId for tracing

### Frontend Integration

The demo service provides the same interface as Stripe, so frontend code remains unchanged:

```typescript
// Frontend can use the same payment flow
const { paymentIntentId, clientSecret } = await createPayment();

// In demo mode, use demo endpoint to complete
await fetch('/api/demo/payment/confirm', {
  method: 'POST',
  body: JSON.stringify({ paymentIntentId, bookingId })
});
```

## Migration to Production

When moving to production:

1. Set `DEMO_MODE=false` (or remove)
2. Configure `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`
3. Demo endpoints automatically disabled (403 responses)
4. All payment logic switches to real Stripe service
5. No code changes required in controllers or frontend

## Troubleshooting

### "Demo endpoints are only available in demo mode"

**Cause:** `DEMO_MODE` not set to `'true'`

**Solution:**
```bash
export DEMO_MODE=true
# or in .env file
DEMO_MODE=true
```

### "Payment intent not found"

**Cause:** Server restarted (in-memory storage cleared)

**Solution:** Recreate the booking/extension to generate new payment intent

### Extension not auto-captured

**Possible causes:**
1. Extension status not `APPROVED`
2. Extension missing `paymentIntentId`
3. Booking status not changed to `COMPLETED`
4. Check logs for capture errors

**Solution:** Verify extension state and retry status update

## Related Files

- **Service:** `backend/src/services/demo-payment.service.ts`
- **Controller:** `backend/src/controllers/demo.controller.ts`
- **Routes:** `backend/src/routes/demo.routes.ts`
- **Integration:** `backend/src/controllers/workshops.controller.ts` (lines 352-393)
- **Schema:** `backend/prisma/schema.prisma` (Extension model)

## Additional Resources

- [Payment API Documentation](./PAYMENT_API.md)
- [Payment Testing Guide](./PAYMENT_TESTING_GUIDE.md)
- [Booking API Guide](../BOOKING_API_COMPLETE_GUIDE.md)
