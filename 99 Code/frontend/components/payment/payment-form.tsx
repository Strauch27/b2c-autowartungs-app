"use client";

import React, { useState, FormEvent } from "react";
import { useParams } from "next/navigation";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Loader2, Lock } from "lucide-react";
import { useTranslations } from "next-intl";
import { DemoPaymentForm } from "./demo-payment-form";

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
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
  const params = useParams();
  const locale = (params.locale as string) || 'de';
  const t = useTranslations('payment.form');

  // If demo mode is enabled, render the demo payment form
  if (isDemoMode) {
    return (
      <DemoPaymentForm
        amount={amount}
        bookingId={bookingId}
        type="booking"
        onSuccess={onSuccess}
        onError={onError}
      />
    );
  }

  // Otherwise, render the Stripe payment form
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
      // Confirm the payment with locale-aware return URL
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/${locale}/customer/booking/confirmation?bookingId=${bookingId}`,
        },
        redirect: "if_required", // Only redirect if necessary
      });

      if (error) {
        // Payment failed
        setErrorMessage(error.message || t('paymentFailed'));
        onError?.(error.message || t('paymentFailed'));
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        // Payment succeeded
        onSuccess?.();
      }
    } catch (err) {
      setErrorMessage(t('unexpectedError'));
      onError?.(t('unexpectedError'));
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
          <span className="text-gray-600">{t('bookingId')}:</span>
          <span className="font-medium font-mono text-xs">{bookingId}</span>
        </div>
        <div className="flex justify-between items-center text-lg font-bold border-t pt-2">
          <span>{t('totalAmount')}:</span>
          <span className="text-2xl font-bold text-primary">{amount.toFixed(2)} EUR</span>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isProcessing || !stripe || !elements}
        className="w-full min-h-[48px]"
        size="lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            {t('processing')}
          </>
        ) : (
          t('payButton', { amount: amount.toFixed(2) })
        )}
      </Button>

      {/* Security Notice */}
      <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500">
        <Lock className="h-3 w-3" />
        <span>{t('securityNotice')}</span>
      </div>
    </form>
  );
}
