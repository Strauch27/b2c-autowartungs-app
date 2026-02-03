# Quick Start: Extension Approval Workflow

## Overview
Customer-facing feature to approve or decline additional service work proposed by the workshop with integrated Stripe payment authorization.

---

## API Endpoints

### 1. Authorize Payment for Extension
```http
POST /api/payment/authorize-extension
Authorization: Bearer <customer_jwt_token>
Content-Type: application/json

{
  "extensionId": "clxxx"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "clientSecret": "pi_xxxxx_secret_xxxxx",
    "paymentIntentId": "pi_xxxxx",
    "amount": 209.00
  }
}
```

---

### 2. Approve Extension (After Payment Authorization)
```http
POST /api/extensions/:id/approve
Authorization: Bearer <customer_jwt_token>
Content-Type: application/json

{
  "paymentIntentId": "pi_xxxxx"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "extension": {
      "id": "clxxx",
      "status": "APPROVED",
      "approvedAt": "2026-02-01T20:30:00Z",
      "totalAmount": 20900,
      ...
    }
  },
  "message": "Extension approved successfully"
}
```

---

### 3. Decline Extension
```http
POST /api/extensions/:id/decline
Authorization: Bearer <customer_jwt_token>
Content-Type: application/json

{
  "reason": "Zu teuer, bitte Kostenvoranschlag senden"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "extension": {
      "id": "clxxx",
      "status": "DECLINED",
      "declinedAt": "2026-02-01T20:30:00Z",
      "declineReason": "Zu teuer, bitte Kostenvoranschlag senden",
      ...
    }
  },
  "message": "Extension declined successfully"
}
```

---

## Frontend Integration

### Using the ExtensionApprovalModal Component

```typescript
import { ExtensionApprovalModal } from "@/components/customer/ExtensionApprovalModal";

function BookingDetails() {
  const [selectedExtension, setSelectedExtension] = useState<ExtensionResponse | null>(null);

  return (
    <>
      {/* Extension list */}
      <ExtensionList
        bookingId={bookingId}
        extensions={extensions}
        onExtensionUpdated={refetch}
      />

      {/* Modal automatically handled by ExtensionList */}
    </>
  );
}
```

### Manual Modal Control

```typescript
<ExtensionApprovalModal
  open={isOpen}
  onOpenChange={setIsOpen}
  bookingId="clxxx"
  extension={extensionData}
  onApproved={() => {
    console.log("Extension approved!");
    refetchExtensions();
  }}
  onDeclined={() => {
    console.log("Extension declined!");
    refetchExtensions();
  }}
/>
```

---

## Testing

### Test Cards (Stripe Test Mode)

| Card Number | Scenario |
|-------------|----------|
| 4242 4242 4242 4242 | Successful payment |
| 4000 0027 6000 3184 | 3D Secure authentication |
| 4000 0000 0000 0002 | Payment declined |
| 4000 0000 0000 9995 | Insufficient funds |

**Expiry:** Any future date
**CVC:** Any 3 digits
**ZIP:** Any 5 digits

---

## Workflow Sequence

```
1. Workshop creates extension
   ↓
2. Customer sees notification
   ↓
3. Customer opens booking details → Extensions tab
   ↓
4. Customer clicks extension card → Modal opens
   ↓
5a. APPROVE PATH:
   - Click "Genehmigen & Bezahlen"
   - Enter payment details
   - Stripe authorizes payment (no charge yet)
   - Extension status → APPROVED
   - Workshop notified
   ↓
5b. DECLINE PATH:
   - Click "Ablehnen"
   - Enter optional reason
   - Extension status → DECLINED
   - Workshop notified
   ↓
6. Modal closes, list refreshed
```

---

## Database Schema

```prisma
model Extension {
  id              String          @id @default(cuid())
  bookingId       String
  description     String          @db.Text
  items           Json            // [{name, price, quantity}]
  totalAmount     Int             // In cents
  images          String[]
  videos          String[]
  status          ExtensionStatus @default(PENDING)
  paymentIntentId String?
  paidAt          DateTime?
  approvedAt      DateTime?
  declinedAt      DateTime?
  declineReason   String?         @db.Text
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  booking Booking @relation(...)
}

enum ExtensionStatus {
  PENDING
  APPROVED
  DECLINED
  CANCELLED
}
```

---

## Environment Variables

Required in `/backend/.env`:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Database
DATABASE_URL="postgresql://..."

# JWT
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="24h"
```

Required in `/frontend/.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
```

---

## Error Handling

### Common Errors

| Status | Error Code | Meaning |
|--------|------------|---------|
| 401 | Authentication required | No/invalid JWT token |
| 403 | Permission denied | Extension belongs to another customer |
| 404 | EXTENSION_NOT_FOUND | Invalid extension ID |
| 400 | EXTENSION_NOT_PENDING | Extension already approved/declined |
| 400 | Payment authorization failed | Stripe payment error |

### Frontend Error Display

Errors are shown via toast notifications:
```typescript
toast.error("Fehler beim Genehmigen der Erweiterung.");
```

---

## Logging

Backend logs include:
```typescript
logger.info('Extension approved', {
  extensionId: id,
  bookingId: extension.bookingId,
  customerId: req.user.userId,
  totalAmount: extension.totalAmount,
  paymentIntentId,
});
```

---

## Security Features

- ✅ JWT authentication required
- ✅ Customer ownership verification
- ✅ Extension status validation
- ✅ Rate limiting (20 req/15min)
- ✅ Stripe secure payment handling
- ✅ Input validation with Zod

---

## Support

For issues or questions:
1. Check backend logs: `npm run dev` in `/backend`
2. Check frontend console: Browser DevTools
3. Verify Stripe dashboard: https://dashboard.stripe.com/test
4. Review implementation: `IMPLEMENTATION_SUMMARY_EXTENSION_APPROVAL.md`

---

## Quick Commands

### Start Backend
```bash
cd backend
npm install
npx prisma db push
npm run dev
```

### Start Frontend
```bash
cd frontend
npm install
npm run dev
```

### View Stripe Events
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local
stripe listen --forward-to localhost:5000/api/payment/webhook
```

---

## Demo Checklist

- [ ] Backend server running on port 5000
- [ ] Frontend server running on port 3000
- [ ] Database connected and schema up to date
- [ ] Stripe test keys configured
- [ ] Test customer logged in
- [ ] Test booking with CONFIRMED status
- [ ] Extension created for the booking
- [ ] Extension visible in customer dashboard
- [ ] Modal opens when clicking extension
- [ ] Payment form displays correctly
- [ ] Test card processes successfully
- [ ] Extension status updates to APPROVED
- [ ] Notification created for workshop

---

**Ready to Demo!** 🚀
