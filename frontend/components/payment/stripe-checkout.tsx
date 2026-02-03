"use client";

import React, { useEffect, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { PaymentForm } from "./payment-form";
import { getStripe } from "@/lib/contexts/StripeContext";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

interface StripeCheckoutProps {
  bookingId: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

interface PaymentIntentResponse {
  success: boolean;
  data: {
    clientSecret: string;
    paymentIntentId: string;
    amount: number;
  };
  error?: string;
}

export function StripeCheckout({
  bookingId,
  onSuccess,
  onError,
}: StripeCheckoutProps) {
  const [clientSecret, setClientSecret] = useState<string>("");
  const [amount, setAmount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    // Create PaymentIntent as soon as the component loads
    createPaymentIntent();
  }, [bookingId]);

  const createPaymentIntent = async () => {
    try {
      setLoading(true);
      setError("");

      // Get API URL from environment
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

      // Get auth token from localStorage
      const token = localStorage.getItem("auth_token");

      if (!token) {
        throw new Error("Authentication required. Please log in.");
      }

      // Call backend to create payment intent
      const response = await fetch(`${apiUrl}/api/payment/create-intent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bookingId }),
      });

      const data: PaymentIntentResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to initialize payment");
      }

      setClientSecret(data.data.clientSecret);
      setAmount(data.data.amount);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to initialize payment";
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <Card className="p-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-gray-600">Initializing secure payment...</p>
        </div>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="p-8">
        <Alert variant="destructive">
          <h3 className="font-semibold mb-2">Payment Initialization Failed</h3>
          <p className="text-sm">{error}</p>
          <button
            onClick={createPaymentIntent}
            className="mt-4 text-sm underline hover:no-underline"
          >
            Try Again
          </button>
        </Alert>
      </Card>
    );
  }

  // Payment form
  const stripePromise = getStripe();

  if (!stripePromise) {
    return (
      <Card className="p-8">
        <Alert variant="destructive">
          <p className="text-sm">
            Stripe is not configured. Please contact support.
          </p>
        </Alert>
      </Card>
    );
  }

  return (
    <Card className="p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Complete Your Payment</h2>
        <p className="text-gray-600">
          Secure payment processing powered by Stripe
        </p>
      </div>

      {clientSecret && (
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance: {
              theme: "stripe",
              variables: {
                colorPrimary: "#0070f3",
                colorBackground: "#ffffff",
                colorText: "#1a1a1a",
                colorDanger: "#ef4444",
                fontFamily: "system-ui, sans-serif",
                borderRadius: "8px",
              },
            },
            locale: "de",
          }}
        >
          <PaymentForm
            clientSecret={clientSecret}
            amount={amount}
            bookingId={bookingId}
            onSuccess={onSuccess}
            onError={onError}
          />
        </Elements>
      )}
    </Card>
  );
}
