# Payment Components

React components for Stripe payment integration.

## Components

### StripeCheckout

Main checkout component that creates a payment intent and manages the payment flow.

**Usage:**
```tsx
import { StripeCheckout } from "@/components/payment";

<StripeCheckout
  bookingId="clxx1234567890"
  onSuccess={() => router.push('/confirmation')}
  onError={(error) => console.error(error)}
/>
```

**Props:**
- `bookingId` (string, required) - The booking ID to create payment for
- `onSuccess` (function, optional) - Callback when payment succeeds
- `onError` (function, optional) - Callback when payment fails

**Features:**
- Automatically creates payment intent
- Handles loading states
- Manages Stripe Elements initialization
- Displays user-friendly errors
- Mobile-responsive

---

### PaymentForm

Form component with Stripe Elements for collecting payment details.

**Usage:**
```tsx
import { PaymentForm } from "@/components/payment";

<PaymentForm
  clientSecret="pi_xxx_secret_xxx"
  amount={249.99}
  bookingId="clxx1234567890"
  onSuccess={() => console.log('Payment successful')}
  onError={(error) => console.error(error)}
/>
```

**Props:**
- `clientSecret` (string, required) - Stripe PaymentIntent client secret
- `amount` (number, required) - Payment amount in EUR
- `bookingId` (string, required) - Booking ID for display
- `onSuccess` (function, optional) - Callback when payment succeeds
- `onError` (function, optional) - Callback when payment fails

**Features:**
- Stripe PaymentElement integration
- Supports multiple payment methods (Card, SEPA, Sofort)
- 3D Secure authentication
- Real-time validation
- Error handling

**Payment Methods:**
- Credit/Debit Cards
- SEPA Direct Debit
- Sofort Banking
- Google Pay / Apple Pay (automatic)

---

### PaymentStatus

Component to display payment status with real-time updates.

**Usage:**
```tsx
import { PaymentStatus } from "@/components/payment";

<PaymentStatus
  paymentIntentId="pi_xxx"
  onStatusChange={(status) => console.log('Status:', status)}
/>
```

**Props:**
- `paymentIntentId` (string, required) - Stripe PaymentIntent ID
- `onStatusChange` (function, optional) - Callback when status changes

**Features:**
- Real-time status checking
- Visual status indicators (icons, badges)
- Status messages
- Refresh button for failed payments
- Auto-updates on status change

**Status Values:**
- `succeeded` - Payment successful (green)
- `processing` - Payment being processed (yellow)
- `requires_payment_method` - Awaiting payment (blue)
- `canceled` - Payment cancelled (gray)
- `failed` - Payment failed (red)

---

### PaymentSummary

Displays booking details and price breakdown before payment.

**Usage:**
```tsx
import { PaymentSummary } from "@/components/payment";

<PaymentSummary booking={booking} />
```

**Props:**
- `booking` (object, required) - Booking object with details

**Booking Object:**
```typescript
{
  bookingNumber: string;
  serviceType: string;
  totalPrice: number;
  pickupDate: string;
  pickupTimeSlot: string;
  pickupAddress: string;
  pickupCity: string;
  pickupPostalCode: string;
  vehicle: {
    brand: string;
    model: string;
    year: number;
    licensePlate?: string;
  };
  priceBreakdown?: {
    basePrice: number;
    ageMultiplier: number;
    finalPrice: number;
  };
}
```

**Features:**
- Service details display
- Vehicle information
- Pickup date and time
- Address information
- Price breakdown
- Total amount prominent display

---

## Context Provider

### StripeProvider

Wraps your app with Stripe Elements provider.

**Setup:**

Add to your root layout:

```tsx
// app/layout.tsx
import { StripeProvider } from "@/lib/contexts/StripeContext";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <StripeProvider>
          {children}
        </StripeProvider>
      </body>
    </html>
  );
}
```

**Configuration:**

Set your Stripe publishable key in `.env.local`:
```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51...
```

---

## Complete Example

### Payment Page

```tsx
"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { StripeCheckout, PaymentSummary } from "@/components/payment";

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (bookingId) {
      fetchBooking();
    }
  }, [bookingId]);

  const fetchBooking = async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/bookings/${bookingId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      }
    );

    const data = await response.json();
    if (data.success) {
      setBooking(data.data);
    }
    setLoading(false);
  };

  const handleSuccess = () => {
    router.push(`/customer/booking/confirmation?bookingId=${bookingId}`);
  };

  if (loading) return <div>Loading...</div>;
  if (!booking) return <div>Booking not found</div>;

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Complete Your Payment</h1>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left: Summary */}
        <PaymentSummary booking={booking} />

        {/* Right: Payment */}
        <StripeCheckout
          bookingId={bookingId}
          onSuccess={handleSuccess}
          onError={(error) => console.error(error)}
        />
      </div>
    </div>
  );
}
```

### Confirmation Page

```tsx
"use client";

import { useSearchParams } from "next/navigation";
import { PaymentStatus } from "@/components/payment";

export default function ConfirmationPage() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    fetchBooking();
  }, [bookingId]);

  if (!booking) return <div>Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="text-center mb-8">
        <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
        <h1 className="text-3xl font-bold">Booking Confirmed!</h1>
      </div>

      {/* Payment Status */}
      {booking.paymentIntentId && (
        <PaymentStatus paymentIntentId={booking.paymentIntentId} />
      )}

      {/* Booking Details */}
      <div className="mt-8">
        <h2>Booking Number: {booking.bookingNumber}</h2>
        <p>Service: {booking.serviceType}</p>
        <p>Total: {booking.totalPrice} EUR</p>
      </div>
    </div>
  );
}
```

---

## Styling

Components use Tailwind CSS and shadcn/ui components:

- `Card` - Container component
- `Button` - Submit buttons
- `Alert` - Error messages
- `Badge` - Status indicators
- `Loader2` - Loading spinner

### Customization

Override styles by wrapping with custom classes:

```tsx
<div className="custom-payment-container">
  <StripeCheckout
    bookingId={bookingId}
    // ...
  />
</div>
```

```css
.custom-payment-container {
  /* Your custom styles */
}
```

---

## API Integration

Components automatically integrate with backend API:

### Endpoints Used

**Create Payment Intent:**
```
POST /api/payment/create-intent
Authorization: Bearer <token>
Body: { bookingId: "xxx" }
```

**Get Payment Status:**
```
GET /api/payment/status/:paymentIntentId
Authorization: Bearer <token>
```

### Authentication

Components expect JWT token in localStorage:

```javascript
localStorage.setItem("auth_token", "your-jwt-token");
```

---

## Error Handling

### Common Errors

**"Authentication required"**
- Ensure user is logged in
- Check token is in localStorage
- Verify token is valid

**"Booking not found"**
- Verify bookingId exists
- Check user has permission

**"Stripe publishable key is not defined"**
- Add key to `.env.local`
- Restart development server

**Payment form not rendering:**
- Check StripeProvider wraps app
- Verify client secret is received
- Check browser console for errors

### Error Display

Components show user-friendly error messages:

```tsx
<StripeCheckout
  bookingId={bookingId}
  onError={(error) => {
    // Custom error handling
    toast.error(error);
  }}
/>
```

---

## Testing

### Test Payment

```tsx
// Use Stripe test card
Card Number: 4242 4242 4242 4242
Expiry: 12/25
CVC: 123
ZIP: 12345
```

### Test Different Scenarios

```tsx
// 3D Secure
Card: 4000 0027 6000 3184

// Declined
Card: 4000 0000 0000 0002

// Insufficient Funds
Card: 4000 0000 0000 9995
```

---

## TypeScript Support

Full TypeScript support with type definitions:

```typescript
import type {
  StripeCheckoutProps,
  PaymentFormProps,
  PaymentStatusProps,
  PaymentSummaryProps,
} from "@/types/payment";
```

---

## Performance

### Optimization

- Lazy load Stripe.js
- Use React.memo for static components
- Minimize re-renders with proper state management

### Bundle Size

- Stripe.js: ~45KB (loaded from CDN)
- Components: ~15KB combined
- Total impact: Minimal

---

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers

---

## Security

### Best Practices

✅ Card data never touches your server
✅ Stripe Elements handles PCI compliance
✅ HTTPS required in production
✅ Client secret is single-use
✅ Payment confirmation on backend

### Never Do

❌ Store card numbers
❌ Log sensitive payment data
❌ Expose secret API keys
❌ Accept client-side prices

---

## Troubleshooting

### Component Not Rendering

1. Check StripeProvider wraps component
2. Verify Stripe publishable key is set
3. Check browser console for errors
4. Ensure React version compatible

### Payment Not Processing

1. Verify client secret is valid
2. Check network tab for API errors
3. Ensure backend is running
4. Verify Stripe account is active

### Webhook Not Updating Booking

1. Check Stripe CLI is running
2. Verify webhook secret is correct
3. Check backend logs for webhook events
4. Test webhook with Stripe CLI

---

## Support

- **Documentation:** `/docs/PAYMENT_INTEGRATION_EXAMPLE.md`
- **API Docs:** `/backend/docs/PAYMENT_API.md`
- **Stripe Docs:** https://stripe.com/docs
- **Component Issues:** Open GitHub issue

---

## Changelog

### v1.0.0 (2024-02-01)
- Initial release
- StripeCheckout component
- PaymentForm component
- PaymentStatus component
- PaymentSummary component
- Full TypeScript support
- Comprehensive error handling
