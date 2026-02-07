"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { StripeCheckout } from "@/components/payment/stripe-checkout";
import { DemoPaymentForm } from "@/components/payment/demo-payment-form";
import { PaymentSummary } from "@/components/payment/payment-summary";
import { Alert } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { Suspense } from "react";

function PaymentContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = params.locale as string;
  const bookingId = searchParams.get("bookingId");
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!bookingId) {
      setError("No booking ID provided");
      setLoading(false);
      return;
    }

    fetchBooking();
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
      const token = localStorage.getItem("auth_token");

      if (!token) {
        router.push(`/${locale}/customer/login`);
        return;
      }

      const response = await fetch(`${apiUrl}/api/bookings/${bookingId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to fetch booking");
      }

      setBooking(data.data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch booking";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    // Redirect to confirmation page
    router.push(`/${locale}/customer/booking/confirmation?bookingId=${bookingId}`);
  };

  const handlePaymentError = (error: string) => {
    setError(error);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error || !bookingId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Alert variant="destructive">
            <h3 className="font-semibold mb-2">Error</h3>
            <p className="text-sm">{error || "Invalid booking"}</p>
            <button
              onClick={() => router.push(`/${locale}/customer/dashboard`)}
              className="mt-4 text-sm underline hover:no-underline"
            >
              Go to Dashboard
            </button>
          </Alert>
        </div>
      </div>
    );
  }

  if (!booking) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Demo Mode Banner */}
        {isDemoMode && (
          <div className="mb-6 bg-yellow-400 border-2 border-yellow-600 rounded-lg p-4">
            <div className="flex items-center justify-center space-x-3">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-base font-bold bg-yellow-600 text-white">
                DEMO MODE
              </span>
              <p className="text-sm font-semibold text-yellow-900">
                This is a demonstration environment. No real payments will be processed.
              </p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Complete Your Booking</h1>
          <p className="text-gray-600">
            Review your booking details and complete the payment to confirm your
            service appointment.
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Booking Summary */}
          <div>
            <PaymentSummary booking={booking} />
          </div>

          {/* Right Column - Payment Form */}
          <div>
            {isDemoMode ? (
              <DemoPaymentForm
                amount={booking.totalPrice ? parseFloat(booking.totalPrice) : 0}
                bookingId={bookingId}
                type="booking"
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            ) : (
              <StripeCheckout
                bookingId={bookingId}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            )}

            {/* Additional Information */}
            <div className="mt-6 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">
                  What happens next?
                </h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                  <li>Complete the payment to confirm your booking</li>
                  <li>Receive a confirmation email with all details</li>
                  <li>A jockey will be assigned to your booking</li>
                  <li>Your vehicle will be picked up at the scheduled time</li>
                </ol>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold mb-2">Cancellation Policy</h4>
                <p className="text-sm text-gray-600">
                  You can cancel your booking up to 24 hours before the scheduled
                  pickup time for a full refund.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={null}>
      <PaymentContent />
    </Suspense>
  );
}
