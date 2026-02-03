# Payment Integration Example

How to integrate the Stripe payment components into your existing booking flow.

## Scenario: Add Payment to Booking Flow

You have a booking flow with 3 steps:
1. Vehicle & Service Selection
2. Appointment Details
3. **Payment (NEW)**

## Step 1: Import Payment Components

```tsx
import { StripeCheckout, PaymentSummary } from "@/components/payment";
```

## Step 2: Update Booking Context (Optional)

If using BookingContext, add payment step:

```tsx
// lib/contexts/BookingContext.tsx

interface BookingContextType {
  // ... existing fields
  currentStep: number; // 1, 2, 3, or 4 (payment)
  bookingId: string | null; // Store created booking ID
  setBookingId: (id: string) => void;
}
```

## Step 3: Create Booking After Step 2

After customer completes appointment details:

```tsx
// app/[locale]/customer/booking/appointment/page.tsx

const handleAppointmentSubmit = async (data: AppointmentData) => {
  try {
    // Create booking via API
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        vehicleId: vehicleData.vehicleId,
        serviceType: selectedService,
        pickupDate: data.pickupDate,
        pickupTimeSlot: data.pickupTimeSlot,
        pickupAddress: data.pickupAddress.street,
        pickupCity: data.pickupAddress.city,
        pickupPostalCode: data.pickupAddress.zip,
        customerNotes: data.notes,
      }),
    });

    const result = await response.json();

    if (result.success) {
      // Store booking ID
      const bookingId = result.data.id;

      // Redirect to payment page
      router.push(`/customer/booking/payment?bookingId=${bookingId}`);
    }
  } catch (error) {
    console.error("Failed to create booking:", error);
  }
};
```

## Step 4: Create Payment Page

```tsx
// app/[locale]/customer/booking/payment/page.tsx

"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { StripeCheckout, PaymentSummary } from "@/components/payment";

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingId = searchParams.get("bookingId");

  const [booking, setBooking] = useState(null);

  useEffect(() => {
    // Fetch booking details
    fetchBooking();
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
  };

  const handlePaymentSuccess = () => {
    router.push(`/customer/booking/confirmation?bookingId=${bookingId}`);
  };

  if (!booking) return <div>Loading...</div>;

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Left: Booking Summary */}
      <PaymentSummary booking={booking} />

      {/* Right: Payment Form */}
      <StripeCheckout
        bookingId={bookingId}
        onSuccess={handlePaymentSuccess}
        onError={(error) => console.error(error)}
      />
    </div>
  );
}
```

## Step 5: Add Stripe Provider to Layout

Wrap your app with StripeProvider:

```tsx
// app/layout.tsx or app/[locale]/layout.tsx

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

## Alternative: Modal Payment Flow

Instead of redirecting to a payment page, show payment in a modal:

```tsx
// app/[locale]/customer/booking/page.tsx

import { Dialog } from "@/components/ui/dialog";
import { StripeCheckout } from "@/components/payment";

export default function BookingPage() {
  const [showPayment, setShowPayment] = useState(false);
  const [bookingId, setBookingId] = useState(null);

  const handleCreateBooking = async () => {
    // Create booking...
    const booking = await createBooking();
    setBookingId(booking.id);
    setShowPayment(true);
  };

  return (
    <>
      {/* Booking Form */}
      <BookingForm onSubmit={handleCreateBooking} />

      {/* Payment Modal */}
      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent className="max-w-2xl">
          <StripeCheckout
            bookingId={bookingId}
            onSuccess={() => {
              setShowPayment(false);
              router.push("/customer/dashboard");
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
```

## Option: Inline Payment in Booking Flow

Embed payment directly in step 3:

```tsx
// app/[locale]/customer/booking/page.tsx

export default function BookingPage() {
  const [step, setStep] = useState(1);
  const [bookingId, setBookingId] = useState(null);

  return (
    <div>
      {/* Progress Indicator */}
      <ProgressSteps current={step} total={3} />

      {/* Step 1: Vehicle & Service */}
      {step === 1 && (
        <VehicleServiceForm onNext={() => setStep(2)} />
      )}

      {/* Step 2: Appointment */}
      {step === 2 && (
        <AppointmentForm
          onNext={async (data) => {
            const booking = await createBooking(data);
            setBookingId(booking.id);
            setStep(3);
          }}
        />
      )}

      {/* Step 3: Payment */}
      {step === 3 && bookingId && (
        <StripeCheckout
          bookingId={bookingId}
          onSuccess={() => router.push("/confirmation")}
        />
      )}
    </div>
  );
}
```

## Custom Payment Button

If you want more control over the payment flow:

```tsx
import { useState } from "react";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { getStripe } from "@/lib/contexts/StripeContext";

function CustomPaymentForm({ clientSecret, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + "/confirmation",
      },
    });

    if (error) {
      console.error(error);
      setProcessing(false);
    } else {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button type="submit" disabled={!stripe || processing}>
        {processing ? "Processing..." : "Pay Now"}
      </button>
    </form>
  );
}

// Usage
export default function CustomPaymentPage({ bookingId }) {
  const [clientSecret, setClientSecret] = useState("");

  useEffect(() => {
    // Create payment intent
    createPaymentIntent(bookingId).then((secret) => {
      setClientSecret(secret);
    });
  }, [bookingId]);

  if (!clientSecret) return <div>Loading...</div>;

  return (
    <Elements stripe={getStripe()} options={{ clientSecret }}>
      <CustomPaymentForm
        clientSecret={clientSecret}
        onSuccess={() => console.log("Payment successful!")}
      />
    </Elements>
  );
}
```

## Update Booking Status Display

Add payment status to your booking list:

```tsx
// components/customer/BookingCard.tsx

import { PaymentStatus } from "@/components/payment";

export function BookingCard({ booking }) {
  return (
    <Card>
      <CardHeader>
        <h3>{booking.bookingNumber}</h3>
        <Badge>{booking.status}</Badge>
      </CardHeader>

      <CardContent>
        {/* Booking details */}
        <p>{booking.serviceType}</p>
        <p>{booking.vehicle.brand} {booking.vehicle.model}</p>

        {/* Payment Status */}
        {booking.paymentIntentId && (
          <div className="mt-4">
            <PaymentStatus paymentIntentId={booking.paymentIntentId} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

## Handle Payment in Existing Booking Creation

If you already have a booking creation function:

```tsx
// lib/api/bookings.ts

export async function createBookingWithPayment(bookingData) {
  try {
    // 1. Create booking
    const booking = await createBooking(bookingData);

    // 2. Create payment intent
    const payment = await fetch("/api/payment/create-intent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ bookingId: booking.id }),
    });

    const { data } = await payment.json();

    // 3. Return booking and payment data
    return {
      booking,
      clientSecret: data.clientSecret,
      paymentIntentId: data.paymentIntentId,
    };
  } catch (error) {
    console.error("Failed to create booking with payment:", error);
    throw error;
  }
}
```

## Add to Existing Dashboard

Show payment summary in customer dashboard:

```tsx
// app/[locale]/customer/dashboard/page.tsx

export default function Dashboard() {
  const [bookings, setBookings] = useState([]);

  return (
    <div>
      <h1>My Bookings</h1>

      {bookings.map((booking) => (
        <Card key={booking.id}>
          <h3>{booking.bookingNumber}</h3>
          <p>Status: {booking.status}</p>
          <p>Total: {booking.totalPrice} EUR</p>

          {/* Show payment button for pending bookings */}
          {booking.status === "PENDING_PAYMENT" && (
            <Button
              onClick={() =>
                router.push(`/customer/booking/payment?bookingId=${booking.id}`)
              }
            >
              Complete Payment
            </Button>
          )}

          {/* Show payment status for paid bookings */}
          {booking.paymentIntentId && (
            <PaymentStatus paymentIntentId={booking.paymentIntentId} />
          )}
        </Card>
      ))}
    </div>
  );
}
```

## Testing Integration

1. **Create a test booking:**
```bash
POST /api/bookings
{
  "vehicleId": "clxx...",
  "serviceType": "INSPECTION",
  "pickupDate": "2024-02-15T09:00:00Z",
  "pickupTimeSlot": "08:00-10:00",
  "pickupAddress": "Hauptstraße 1",
  "pickupCity": "Berlin",
  "pickupPostalCode": "10115"
}
```

2. **Navigate to payment page:**
```
/customer/booking/payment?bookingId=<booking-id>
```

3. **Complete payment with test card:**
```
Card: 4242 4242 4242 4242
Expiry: 12/25
CVC: 123
```

4. **Verify confirmation page:**
```
/customer/booking/confirmation?bookingId=<booking-id>
```

## Common Issues

### "Client secret not found"
- Ensure booking exists
- Check booking status is PENDING_PAYMENT
- Verify authentication token is valid

### Payment form not rendering
- Check Stripe publishable key is set
- Verify StripeProvider wraps your component
- Check browser console for errors

### Webhook not updating booking
- Start Stripe CLI: `stripe listen --forward-to localhost:5001/api/payment/webhook`
- Verify webhook secret is correct
- Check backend logs for webhook events

## Next Steps

1. Add email notifications after payment
2. Implement payment retry logic
3. Add payment method saving
4. Create admin refund interface
5. Add payment analytics

## Resources

- [Payment Components Documentation](../components/payment/README.md)
- [API Documentation](../../backend/docs/PAYMENT_API.md)
- [Testing Guide](../../backend/docs/PAYMENT_TESTING_GUIDE.md)
- [Stripe Docs](https://stripe.com/docs)
