"use client";

import React, { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Loader2, CheckCircle, CreditCard, Lock, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/lib/i18n/useLovableTranslation";

const translations = {
  de: {
    paymentMethod: "Zahlungsmethode:",
    paymentCard: "Kreditkarte",
    bookingId: "Buchungs-ID:",
    extensionId: "Erweiterungs-ID:",
    totalAmount: "Gesamtbetrag:",
    processing: "Zahlung wird verarbeitet...",
    payButton: "Jetzt bezahlen",
    disclaimer: "Ihre Zahlung wird sicher verarbeitet.",
    successTitle: "Zahlung erfolgreich!",
    bookingConfirmed: "Ihre Buchung wurde bestätigt.",
    extensionAuthorized: "Die Erweiterung wurde autorisiert.",
  },
  en: {
    paymentMethod: "Payment Method:",
    paymentCard: "Credit Card",
    bookingId: "Booking ID:",
    extensionId: "Extension ID:",
    totalAmount: "Total Amount:",
    processing: "Processing payment...",
    payButton: "Pay now",
    disclaimer: "Your payment is processed securely.",
    successTitle: "Payment Successful!",
    bookingConfirmed: "Your booking has been confirmed.",
    extensionAuthorized: "Extension has been authorized.",
  },
};

interface DemoPaymentFormProps {
  amount: number;
  bookingId?: string;
  extensionId?: string;
  type: "booking" | "extension";
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function DemoPaymentForm({
  amount,
  bookingId,
  extensionId,
  type,
  onSuccess,
  onError,
}: DemoPaymentFormProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const { language } = useLanguage();
  const t = translations[language] || translations.de;

  const formattedAmount = amount.toLocaleString(language === 'en' ? 'en-US' : 'de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setIsProcessing(true);
    setErrorMessage("");

    try {
      // Simulate processing delay (1-2 seconds)
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
      const { tokenStorage } = await import("@/lib/auth/token-storage");
      const token = tokenStorage.getToken();

      if (!token) {
        throw new Error("Authentication required. Please log in.");
      }

      let endpoint = "";
      let payload = {};

      if (type === "booking" && bookingId) {
        endpoint = `${apiUrl}/api/demo/payment/confirm`;
        payload = { bookingId };
      } else if (type === "extension" && extensionId) {
        endpoint = `${apiUrl}/api/demo/extension/authorize`;
        payload = { extensionId };
      } else {
        throw new Error("Invalid payment type or missing ID");
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Payment failed");
      }

      // Show success state
      setIsSuccess(true);

      // Wait a moment to show success message, then call success callback
      setTimeout(() => {
        onSuccess?.();
      }, 1000);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Payment failed. Please try again.";
      setErrorMessage(errorMsg);
      onError?.(errorMsg);
      setIsProcessing(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-center py-10 space-y-4">
          <div className="rounded-full bg-green-100 p-5">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold text-green-900 mb-2">
              {t.successTitle}
            </h3>
            <p className="text-sm text-gray-600">
              {type === "booking" ? t.bookingConfirmed : t.extensionAuthorized}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Payment Details */}
      <div className="border rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between pb-3 border-b">
          <span className="text-sm text-gray-600 font-medium">{t.paymentMethod}</span>
          <span className="text-sm font-semibold flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            {t.paymentCard}
          </span>
        </div>

        {bookingId && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">{t.bookingId}</span>
            <span className="text-sm font-medium font-mono text-xs">{bookingId}</span>
          </div>
        )}

        {extensionId && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">{t.extensionId}</span>
            <span className="text-sm font-medium font-mono text-xs">{extensionId}</span>
          </div>
        )}
      </div>

      {/* Error Message */}
      {errorMessage && (
        <Alert variant="destructive">
          <p className="text-sm">{errorMessage}</p>
        </Alert>
      )}

      {/* Payment Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex justify-between items-center text-lg font-bold">
          <span>{t.totalAmount}</span>
          <span className="text-2xl font-bold text-primary">{formattedAmount} EUR</span>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isProcessing}
        className="w-full min-h-[48px]"
        size="lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            {t.processing}
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-5 w-5" />
            {t.payButton} — {formattedAmount} EUR
          </>
        )}
      </Button>

      {/* Security Notice */}
      <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500">
        <Lock className="h-3 w-3" />
        <span>{t.disclaimer}</span>
      </div>
    </form>
  );
}
