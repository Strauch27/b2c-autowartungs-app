// Payment-related TypeScript types

export interface PaymentIntent {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
}

export interface PaymentIntentResponse {
  success: boolean;
  data: PaymentIntent;
  error?: string;
}

export interface PaymentStatus {
  status: "requires_payment_method" | "requires_confirmation" | "processing" | "succeeded" | "canceled" | "requires_action";
  amount: number;
  currency: string;
  paid: boolean;
}

export interface PaymentStatusResponse {
  success: boolean;
  data: PaymentStatus;
  error?: string;
}

export interface RefundRequest {
  paymentIntentId: string;
  amount?: number;
  reason?: "duplicate" | "fraudulent" | "requested_by_customer";
}

export interface RefundResponse {
  success: boolean;
  data: {
    refundId: string;
    amount: number;
    status: string;
  };
  message?: string;
  error?: string;
}

export interface BookingWithPayment {
  id: string;
  bookingNumber: string;
  serviceType: string;
  status: string;
  totalPrice: number;
  paymentIntentId?: string;
  paidAt?: string;
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
  customer: {
    email: string;
    firstName?: string;
    lastName?: string;
  };
  priceBreakdown?: {
    basePrice: number;
    ageMultiplier: number;
    finalPrice: number;
  };
}

export interface StripeCheckoutProps {
  bookingId: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export interface PaymentFormProps {
  clientSecret: string;
  amount: number;
  bookingId: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export interface PaymentStatusProps {
  paymentIntentId: string;
  onStatusChange?: (status: string) => void;
}

export interface PaymentSummaryProps {
  booking: BookingWithPayment;
}
