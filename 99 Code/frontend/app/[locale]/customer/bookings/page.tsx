"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useLanguage } from "@/lib/i18n/useLovableTranslation";
import { useTranslations } from "next-intl";
import { bookingsApi, BookingResponse } from "@/lib/api/bookings";
import { toast } from "sonner";
import { resolveVehicleDisplay } from "@/lib/constants/vehicles";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Car,
  Calendar,
  ClipboardList,
  Loader2,
  ArrowLeft,
  XCircle,
} from "lucide-react";

const statusColors: Record<string, string> = {
  CONFIRMED: "bg-blue-100 text-blue-800",
  PICKUP_ASSIGNED: "bg-blue-100 text-blue-800",
  PICKED_UP: "bg-yellow-100 text-yellow-800",
  AT_WORKSHOP: "bg-yellow-100 text-yellow-800",
  IN_SERVICE: "bg-yellow-100 text-yellow-800",
  IN_WORKSHOP: "bg-yellow-100 text-yellow-800",
  READY_FOR_RETURN: "bg-green-100 text-green-800",
  RETURN_ASSIGNED: "bg-green-100 text-green-800",
  RETURNED: "bg-green-100 text-green-800",
  DELIVERED: "bg-green-100 text-green-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  PENDING_PAYMENT: "bg-gray-100 text-gray-800",
};

// Status keys that exist in customerPortal.bookingDetail.status namespace
const STATUS_KEYS = [
  "PENDING_PAYMENT", "CONFIRMED", "PICKUP_ASSIGNED", "PICKED_UP",
  "AT_WORKSHOP", "IN_SERVICE", "READY_FOR_RETURN", "RETURN_ASSIGNED",
  "RETURNED", "DELIVERED", "COMPLETED", "CANCELLED",
] as const;

function BookingsContent() {
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || "de";
  const { language } = useLanguage();
  const tStatus = useTranslations("customerPortal.bookingDetail.status");
  const tDashboard = useTranslations("customerDashboard");

  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancelBookingId, setCancelBookingId] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const result = await bookingsApi.getAll({ limit: 100 });
      setBookings(result.bookings);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
      toast.error(
        language === "de"
          ? "Buchungen konnten nicht geladen werden"
          : "Failed to load bookings"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelBookingId) return;

    try {
      setIsCancelling(true);
      await bookingsApi.cancel(cancelBookingId);
      toast.success(
        language === "de"
          ? "Buchung wurde storniert"
          : "Booking has been cancelled"
      );
      setBookings((prev) =>
        prev.map((b) =>
          b.id === cancelBookingId ? { ...b, status: "CANCELLED" } : b
        )
      );
    } catch (error) {
      console.error("Failed to cancel booking:", error);
      toast.error(
        language === "de"
          ? "Stornierung fehlgeschlagen"
          : "Cancellation failed"
      );
    } finally {
      setIsCancelling(false);
      setCancelBookingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat(language === "de" ? "de-DE" : "en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(dateString));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              {tDashboard("nav.myBookings")}
            </h1>
            <p className="text-muted-foreground">
              {language === "de"
                ? "Übersicht aller Ihrer Buchungen"
                : "Overview of all your bookings"}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push(`/${locale}/customer/dashboard`)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {tDashboard("nav.dashboard")}
          </Button>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Empty state */}
        {!isLoading && bookings.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <ClipboardList className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">
                {language === "de"
                  ? "Keine Buchungen vorhanden"
                  : "No bookings found"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {language === "de"
                  ? "Sie haben noch keine Buchungen. Starten Sie jetzt Ihre erste Buchung!"
                  : "You don't have any bookings yet. Start your first booking now!"}
              </p>
              <Button
                onClick={() => router.push(`/${locale}/customer/booking`)}
              >
                {language === "de" ? "Jetzt buchen" : "Book Now"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Bookings list */}
        {!isLoading && bookings.length > 0 && (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <Card key={booking.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4">
                    {/* Left: Info */}
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 shrink-0">
                        <Car className="h-6 w-6 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-semibold">
                          {Array.isArray(booking.services) &&
                          booking.services.length > 0
                            ? booking.services
                                .map((s) => s.type)
                                .join(", ")
                            : booking.serviceType || (language === "de" ? "Service" : "Service")}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {booking.vehicle
                            ? (() => {
                                const v = resolveVehicleDisplay(booking.vehicle.brand, booking.vehicle.model);
                                return `${v.brandName} ${v.modelName} (${booking.vehicle.year})`;
                              })()
                            : language === "de"
                            ? "Fahrzeug"
                            : "Vehicle"}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{formatDate(booking.pickupDate)}</span>
                        </div>
                        {booking.totalPrice && (
                          <p className="text-sm font-medium">
                            {booking.totalPrice}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: Status + Actions */}
                    <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                      <Badge
                        className={
                          statusColors[booking.status] ||
                          "bg-gray-100 text-gray-800"
                        }
                      >
                        {STATUS_KEYS.includes(booking.status as any)
                          ? tStatus(booking.status as any)
                          : booking.status}
                      </Badge>

                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            router.push(
                              `/${locale}/customer/bookings/${booking.id}`
                            )
                          }
                        >
                          {language === "de" ? "Details" : "Details"}
                        </Button>

                        {/* C4: Cancel button for CONFIRMED bookings */}
                        {booking.status === "CONFIRMED" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => setCancelBookingId(booking.id)}
                          >
                            <XCircle className="mr-1 h-3.5 w-3.5" />
                            {language === "de" ? "Stornieren" : "Cancel"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* C4: Cancellation confirmation dialog */}
        <Dialog
          open={!!cancelBookingId}
          onOpenChange={(open) => {
            if (!open) setCancelBookingId(null);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {language === "de"
                  ? "Buchung stornieren"
                  : "Cancel Booking"}
              </DialogTitle>
              <DialogDescription>
                {language === "de"
                  ? "Möchten Sie diese Buchung wirklich stornieren? Diese Aktion kann nicht rückgängig gemacht werden."
                  : "Are you sure you want to cancel this booking? This action cannot be undone."}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setCancelBookingId(null)}
                disabled={isCancelling}
              >
                {language === "de" ? "Abbrechen" : "Go Back"}
              </Button>
              <Button
                variant="destructive"
                onClick={handleCancel}
                disabled={isCancelling}
              >
                {isCancelling ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {language === "de" ? "Wird storniert..." : "Cancelling..."}
                  </>
                ) : language === "de" ? (
                  "Ja, stornieren"
                ) : (
                  "Yes, Cancel"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default function BookingsPage() {
  return (
    <ProtectedRoute requiredRole="customer">
      <BookingsContent />
    </ProtectedRoute>
  );
}
