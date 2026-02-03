"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { PaymentStatus } from "@/components/payment/payment-status";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import {
  CheckCircle2,
  Loader2,
  Calendar,
  MapPin,
  Car,
  Download,
} from "lucide-react";

export default function ConfirmationPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = params.locale as string;
  const bookingId = searchParams.get("bookingId");

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("de-DE", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-gray-600">Loading confirmation...</p>
        </div>
      </div>
    );
  }

  if (error || !bookingId || !booking) {
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

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Success Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2">Booking Confirmed!</h1>
            <p className="text-gray-600">
              Your booking has been successfully confirmed. We've sent a
              confirmation email to your registered email address.
            </p>
          </div>
        </div>

        {/* Payment Status */}
        {booking.paymentIntentId && (
          <PaymentStatus paymentIntentId={booking.paymentIntentId} />
        )}

        {/* Booking Details */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Booking Details</h2>

          <div className="space-y-4">
            {/* Booking Number */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Booking Number</p>
              <p className="text-2xl font-bold">{booking.bookingNumber}</p>
            </div>

            {/* Service */}
            <div className="flex items-start space-x-3">
              <Car className="h-5 w-5 text-primary mt-1" />
              <div>
                <p className="font-medium">Service</p>
                <p className="text-sm text-gray-600">{booking.serviceType}</p>
              </div>
            </div>

            {/* Vehicle */}
            <div className="flex items-start space-x-3">
              <Car className="h-5 w-5 text-primary mt-1" />
              <div>
                <p className="font-medium">Vehicle</p>
                <p className="text-sm text-gray-600">
                  {booking.vehicle.brand} {booking.vehicle.model} (
                  {booking.vehicle.year})
                </p>
              </div>
            </div>

            {/* Pickup Date */}
            <div className="flex items-start space-x-3">
              <Calendar className="h-5 w-5 text-primary mt-1" />
              <div>
                <p className="font-medium">Pickup Date & Time</p>
                <p className="text-sm text-gray-600">
                  {formatDate(booking.pickupDate)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {booking.pickupTimeSlot}
                </p>
              </div>
            </div>

            {/* Pickup Address */}
            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-primary mt-1" />
              <div>
                <p className="font-medium">Pickup Address</p>
                <p className="text-sm text-gray-600">{booking.pickupAddress}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {booking.pickupPostalCode} {booking.pickupCity}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Next Steps */}
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-4">What happens next?</h3>
          <ol className="space-y-3">
            <li className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                1
              </span>
              <div>
                <p className="font-medium text-blue-900">
                  You'll receive a confirmation email
                </p>
                <p className="text-sm text-blue-800">
                  Check your inbox for the booking details and receipt
                </p>
              </div>
            </li>
            <li className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                2
              </span>
              <div>
                <p className="font-medium text-blue-900">
                  A jockey will be assigned
                </p>
                <p className="text-sm text-blue-800">
                  You'll be notified when a jockey is assigned to your booking
                </p>
              </div>
            </li>
            <li className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                3
              </span>
              <div>
                <p className="font-medium text-blue-900">
                  Vehicle pickup at scheduled time
                </p>
                <p className="text-sm text-blue-800">
                  Make sure your vehicle is ready at the scheduled pickup time
                </p>
              </div>
            </li>
            <li className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                4
              </span>
              <div>
                <p className="font-medium text-blue-900">
                  Service completion and delivery
                </p>
                <p className="text-sm text-blue-800">
                  Track your booking status in your dashboard
                </p>
              </div>
            </li>
          </ol>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={() => router.push(`/${locale}/customer/dashboard`)}
            className="flex-1"
            size="lg"
          >
            Go to Dashboard
          </Button>
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="flex-1"
            size="lg"
          >
            <Download className="mr-2 h-4 w-4" />
            Print Confirmation
          </Button>
        </div>

        {/* Support */}
        <div className="text-center text-sm text-gray-600">
          <p>
            Need help?{" "}
            <a href="/support" className="text-primary hover:underline">
              Contact our support team
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
