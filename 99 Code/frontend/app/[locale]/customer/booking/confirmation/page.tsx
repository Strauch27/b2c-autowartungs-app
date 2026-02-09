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
import { useTranslations } from "next-intl";
import { bookingsApi } from "@/lib/api/bookings";
import { resolveVehicleDisplay } from "@/lib/constants/vehicles";
import { Suspense } from "react";

function ConfirmationContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = params.locale as string;
  const { language } = useLanguage();
  const t = useTranslations("bookingConfirmation");
  const tPayment = useTranslations("bookingPayment");
  const bookingId = searchParams.get("bookingId");

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!bookingId) {
      setError(tPayment("noBookingId"));
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
        err instanceof Error ? err.message : tPayment("error");
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
          <p className="text-gray-600">{t("loading")}</p>
        </div>
      </div>
    );
  }

  if (error || !bookingId || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Alert variant="destructive">
            <h3 className="font-semibold mb-2">{tPayment("error")}</h3>
            <p className="text-sm">{error || tPayment("invalidBooking")}</p>
            <button
              onClick={() => router.push(`/${locale}/customer/dashboard`)}
              className="mt-4 text-sm underline hover:no-underline"
            >
              {tPayment("goToDashboard")}
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
            <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
            <p className="text-gray-600">
              {t("subtitle")}
            </p>
          </div>
        </div>

        {/* Payment Status */}
        {booking.paymentIntentId && (
          <PaymentStatus paymentIntentId={booking.paymentIntentId} />
        )}

        {/* Booking Details */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">{t("bookingDetails")}</h2>

          <div className="space-y-4">
            {/* Booking Number */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">{t("bookingNumber")}</p>
              <p className="text-2xl font-bold">{booking.bookingNumber}</p>
            </div>

            {/* Service */}
            <div className="flex items-start space-x-3">
              <Car className="h-5 w-5 text-primary mt-1" />
              <div>
                <p className="font-medium">{t("service")}</p>
                <p className="text-sm text-gray-600">{booking.serviceType}</p>
              </div>
            </div>

            {/* Vehicle */}
            <div className="flex items-start space-x-3">
              <Car className="h-5 w-5 text-primary mt-1" />
              <div>
                <p className="font-medium">{t("vehicle")}</p>
                <p className="text-sm text-gray-600">
                  {(() => { const v = resolveVehicleDisplay(booking.vehicle.brand, booking.vehicle.model); return `${v.brandName} ${v.modelName} (${booking.vehicle.year})`; })()}
                </p>
              </div>
            </div>

            {/* Pickup Date */}
            <div className="flex items-start space-x-3">
              <Calendar className="h-5 w-5 text-primary mt-1" />
              <div>
                <p className="font-medium">{t("pickupDateTime")}</p>
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
                <p className="font-medium">{t("pickupAddress")}</p>
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
          <h3 className="font-semibold text-blue-900 mb-4">{t("whatNext.title")}</h3>
          <ol className="space-y-3">
            <li className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                1
              </span>
              <div>
                <p className="font-medium text-blue-900">
                  {t("whatNext.step1Title")}
                </p>
                <p className="text-sm text-blue-800">
                  {t("whatNext.step1Desc")}
                </p>
              </div>
            </li>
            <li className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                2
              </span>
              <div>
                <p className="font-medium text-blue-900">
                  {t("whatNext.step2Title")}
                </p>
                <p className="text-sm text-blue-800">
                  {t("whatNext.step2Desc")}
                </p>
              </div>
            </li>
            <li className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                3
              </span>
              <div>
                <p className="font-medium text-blue-900">
                  {t("whatNext.step3Title")}
                </p>
                <p className="text-sm text-blue-800">
                  {t("whatNext.step3Desc")}
                </p>
              </div>
            </li>
            <li className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                4
              </span>
              <div>
                <p className="font-medium text-blue-900">
                  {t("whatNext.step4Title")}
                </p>
                <p className="text-sm text-blue-800">
                  {t("whatNext.step4Desc")}
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
            {t("actions.goToDashboard")}
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
            {t("actions.printConfirmation")}
          </Button>
        </div>

        {/* Support */}
        <div className="text-center text-sm text-gray-600">
          <p>
            {t("support.needHelp")}{" "}
            <a href={`/${locale}/support`} className="text-primary hover:underline">
              {t("support.contactSupport")}
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
