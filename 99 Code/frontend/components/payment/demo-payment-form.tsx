"use client";

import React, { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Loader2, CheckCircle, CreditCard } from "lucide-react";

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setIsProcessing(true);
    setErrorMessage("");

    try {
      // Simulate processing delay (1-2 seconds)
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
      const token = localStorage.getItem("auth_token");

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
        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          <div className="rounded-full bg-green-100 p-4">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold text-green-900 mb-2">
              Payment Successful!
            </h3>
            <p className="text-sm text-gray-600">
              {type === "booking"
                ? "Your booking has been confirmed."
                : "Extension has been authorized."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Demo Mode Banner */}
      <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-yellow-400 text-yellow-900">
              DEMO MODE
            </span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-yellow-900">
              This is a simulated payment for demonstration purposes.
            </p>
            <p className="text-xs text-yellow-800 mt-1">
              No real payment will be processed. Click "Pay with Demo" to simulate a successful payment.
            </p>
          </div>
        </div>
      </div>

      {/* Payment Details */}
      <div className="border rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b">
          <span className="text-sm text-gray-600 font-medium">Payment Method:</span>
          <span className="text-sm font-semibold">Demo Payment (Simulated)</span>
        </div>

        {bookingId && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Booking ID:</span>
            <span className="text-sm font-medium">{bookingId}</span>
          </div>
        )}

        {extensionId && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Extension ID:</span>
            <span className="text-sm font-medium">{extensionId}</span>
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
      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
        <div className="flex justify-between text-lg font-bold border-t pt-2">
          <span>Total Amount:</span>
          <span>{amount.toFixed(2)} EUR</span>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isProcessing}
        className="w-full"
        size="lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Processing Demo Payment...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-5 w-5" />
            Pay with Demo ({amount.toFixed(2)} EUR)
          </>
        )}
      </Button>

      {/* Security Notice */}
      <p className="text-xs text-center text-gray-500">
        Demo payment mode - No real charges will be made. This is for testing purposes only.
      </p>
    </form>
  );
}
