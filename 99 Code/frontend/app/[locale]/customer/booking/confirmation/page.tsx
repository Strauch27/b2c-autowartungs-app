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
import { useLanguage } from "@/lib/i18n/useLovableTranslation";
import { bookingsApi } from "@/lib/api/bookings";
import { Suspense } from "react";

function ConfirmationContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = params.locale as string;
  const { language } = useLanguage();
  const bookingId = searchParams.get("bookingId");

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!bookingId) {
      setError(language === "de" ? "Keine Buchungs-ID angegeben" : "No booking ID provided");
      setLoading(false);
      return;
    }

    fetchBooking();
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      const data = await bookingsApi.getById(bookingId!);
      setBooking(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : (language === "de" ? "Buchung konnte nicht geladen werden" : "Failed to fetch booking");
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(language === "de" ? "de-DE" : "en-US", {
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
          <p className="text-gray-600">{language === "de" ? "Bestätigung wird geladen..." : "Loading confirmation..."}</p>
        </div>
      </div>
    );
  }

  if (error || !bookingId || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Alert variant="destructive">
            <h3 className="font-semibold mb-2">{language === "de" ? "Fehler" : "Error"}</h3>
            <p className="text-sm">{error || (language === "de" ? "Ungültige Buchung" : "Invalid booking")}</p>
            <button
              onClick={() => router.push(`/${locale}/customer/dashboard`)}
              className="mt-4 text-sm underline hover:no-underline"
            >
              {language === "de" ? "Zum Dashboard" : "Go to Dashboard"}
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
            <h1 className="text-3xl font-bold mb-2">{language === "de" ? "Buchung bestätigt!" : "Booking Confirmed!"}</h1>
            <p className="text-gray-600">
              {language === "de"
                ? "Ihre Buchung wurde erfolgreich bestätigt. Wir haben Ihnen eine Bestätigungs-E-Mail an Ihre registrierte E-Mail-Adresse gesendet."
                : "Your booking has been successfully confirmed. We've sent a confirmation email to your registered email address."}
            </p>
          </div>
        </div>

        {/* Payment Status */}
        {booking.paymentIntentId && (
          <PaymentStatus paymentIntentId={booking.paymentIntentId} />
        )}

        {/* Booking Details */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">{language === "de" ? "Buchungsdetails" : "Booking Details"}</h2>

          <div className="space-y-4">
            {/* Booking Number */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">{language === "de" ? "Buchungsnummer" : "Booking Number"}</p>
              <p className="text-2xl font-bold">{booking.bookingNumber}</p>
            </div>

            {/* Service */}
            <div className="flex items-start space-x-3">
              <Car className="h-5 w-5 text-primary mt-1" />
              <div>
                <p className="font-medium">{language === "de" ? "Service" : "Service"}</p>
                <p className="text-sm text-gray-600">{booking.serviceType}</p>
              </div>
            </div>

            {/* Vehicle */}
            <div className="flex items-start space-x-3">
              <Car className="h-5 w-5 text-primary mt-1" />
              <div>
                <p className="font-medium">{language === "de" ? "Fahrzeug" : "Vehicle"}</p>
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
                <p className="font-medium">{language === "de" ? "Abholdatum & -zeit" : "Pickup Date & Time"}</p>
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
                <p className="font-medium">{language === "de" ? "Abholadresse" : "Pickup Address"}</p>
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
          <h3 className="font-semibold text-blue-900 mb-4">{language === "de" ? "Was passiert als Nächstes?" : "What happens next?"}</h3>
          <ol className="space-y-3">
            <li className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                1
              </span>
              <div>
                <p className="font-medium text-blue-900">
                  {language === "de" ? "Sie erhalten eine Bestätigungs-E-Mail" : "You'll receive a confirmation email"}
                </p>
                <p className="text-sm text-blue-800">
                  {language === "de" ? "Überprüfen Sie Ihren Posteingang für die Buchungsdetails und Quittung" : "Check your inbox for the booking details and receipt"}
                </p>
              </div>
            </li>
            <li className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                2
              </span>
              <div>
                <p className="font-medium text-blue-900">
                  {language === "de" ? "Ein Jockey wird zugewiesen" : "A jockey will be assigned"}
                </p>
                <p className="text-sm text-blue-800">
                  {language === "de" ? "Sie werden benachrichtigt, wenn ein Jockey Ihrer Buchung zugewiesen wird" : "You'll be notified when a jockey is assigned to your booking"}
                </p>
              </div>
            </li>
            <li className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                3
              </span>
              <div>
                <p className="font-medium text-blue-900">
                  {language === "de" ? "Fahrzeugabholung zur geplanten Zeit" : "Vehicle pickup at scheduled time"}
                </p>
                <p className="text-sm text-blue-800">
                  {language === "de" ? "Stellen Sie sicher, dass Ihr Fahrzeug zur geplanten Abholzeit bereit ist" : "Make sure your vehicle is ready at the scheduled pickup time"}
                </p>
              </div>
            </li>
            <li className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                4
              </span>
              <div>
                <p className="font-medium text-blue-900">
                  {language === "de" ? "Service-Abschluss und Lieferung" : "Service completion and delivery"}
                </p>
                <p className="text-sm text-blue-800">
                  {language === "de" ? "Verfolgen Sie Ihren Buchungsstatus in Ihrem Dashboard" : "Track your booking status in your dashboard"}
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
            {language === "de" ? "Zum Dashboard" : "Go to Dashboard"}
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push(`/${locale}/customer/booking/service`)}
            className="flex-1"
            size="lg"
          >
            {language === "de" ? "Neue Buchung" : "New Booking"}
          </Button>
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="flex-1"
            size="lg"
          >
            <Download className="mr-2 h-4 w-4" />
            {language === "de" ? "Bestätigung drucken" : "Print Confirmation"}
          </Button>
        </div>

        {/* Support */}
        <div className="text-center text-sm text-gray-600">
          <p>
            {language === "de" ? "Brauchen Sie Hilfe?" : "Need help?"}{" "}
            <a href={`/${locale}/support`} className="text-primary hover:underline">
              {language === "de" ? "Kontaktieren Sie unser Support-Team" : "Contact our support team"}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={null}>
      <ConfirmationContent />
    </Suspense>
  );
}
