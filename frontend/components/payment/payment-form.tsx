"use client";

import React, { useState, FormEvent } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

interface PaymentFormProps {
  clientSecret: string;
  amount: number;
  bookingId: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function PaymentForm({
  clientSecret,
  amount,
  bookingId,
  onSuccess,
  onError,
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't loaded yet
      return;
    }

    setIsProcessing(true);
    setErrorMessage("");

    try {
      // Confirm the payment
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/customer/booking/confirmation?bookingId=${bookingId}`,
        },
        redirect: "if_required", // Only redirect if necessary
      });

      if (error) {
        // Payment failed
        setErrorMessage(error.message || "Payment failed. Please try again.");
        onError?.(error.message || "Payment failed");
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        // Payment succeeded
        onSuccess?.();
      }
    } catch (err) {
      setErrorMessage("An unexpected error occurred. Please try again.");
      onError?.("An unexpected error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Element - handles all payment method types */}
      <div className="border rounded-lg p-4">
        <PaymentElement
          options={{
            layout: "tabs",
            paymentMethodOrder: ["card", "sepa_debit", "sofort"],
          }}
        />
      </div>

      {/* Error Message */}
      {errorMessage && (
        <Alert variant="destructive">
          <p className="text-sm">{errorMessage}</p>
        </Alert>
      )}

      {/* Payment Summary */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Booking ID:</span>
          <span className="font-medium">{bookingId}</span>
        </div>
        <div className="flex justify-between text-lg font-bold border-t pt-2">
          <span>Total Amount:</span>
          <span>{amount.toFixed(2)} EUR</span>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isProcessing || !stripe || !elements}
        className="w-full"
        size="lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Processing Payment...
          </>
        ) : (
          `Pay ${amount.toFixed(2)} EUR`
        )}
      </Button>

      {/* Security Notice */}
      <p className="text-xs text-center text-gray-500">
        Secure payment powered by Stripe. Your payment information is encrypted
        and secure.
      </p>
    </form>
  );
}
