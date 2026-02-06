"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ChevronLeft,
  Car,
  Calendar,
  MapPin,
  Euro,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { bookingsApi, BookingResponse, ExtensionResponse } from "@/lib/api/bookings";
import { useLanguage } from "@/lib/i18n/useLovableTranslation";
import { ExtensionList } from "@/components/customer/ExtensionList";
import { toast } from "sonner";

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language } = useLanguage();
  const bookingId = params.id as string;
  const defaultTab = searchParams.get("tab") || "details";

  const [booking, setBooking] = useState<BookingResponse | null>(null);
  const [extensions, setExtensions] = useState<ExtensionResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingExtensions, setIsLoadingExtensions] = useState(false);
  const [activeTab, setActiveTab] = useState(defaultTab);

  const t = {
    de: {
      back: "Zurück",
      bookingDetails: "Buchungsdetails",
      loading: "Lädt...",
      error: "Fehler beim Laden der Buchung",
      tabs: {
        details: "Details",
        extensions: "Erweiterungen",
      },
      status: "Status",
      bookingNumber: "Buchungsnummer",
      service: "Service",
      vehicle: "Fahrzeug",
      pickup: "Abholung",
      delivery: "Rückgabe",
      address: "Adresse",
      date: "Datum",
      timeSlot: "Zeitfenster",
      price: "Preis",
      notes: "Notizen",
      noNotes: "Keine Notizen",
      pendingExtensions: "Ausstehende Genehmigungen",
    },
    en: {
      back: "Back",
      bookingDetails: "Booking Details",
      loading: "Loading...",
      error: "Error loading booking",
      tabs: {
        details: "Details",
        extensions: "Extensions",
      },
      status: "Status",
      bookingNumber: "Booking Number",
      service: "Service",
      vehicle: "Vehicle",
      pickup: "Pickup",
      delivery: "Delivery",
      address: "Address",
      date: "Date",
      timeSlot: "Time Slot",
      price: "Price",
      notes: "Notes",
      noNotes: "No notes",
      pendingExtensions: "Pending Approvals",
    },
  };

  const texts = t[language];

  useEffect(() => {
    fetchBooking();
  }, [bookingId]);

  useEffect(() => {
    if (activeTab === "extensions") {
      fetchExtensions();
    }
  }, [activeTab]);

  const fetchBooking = async () => {
    try {
      setIsLoading(true);
      const data = await bookingsApi.getById(bookingId);
      setBooking(data);
    } catch (error) {
      console.error("Error fetching booking:", error);
      toast.error(texts.error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchExtensions = async () => {
    try {
      setIsLoadingExtensions(true);
      const data = await bookingsApi.getExtensions(bookingId);
      setExtensions(data);
    } catch (error) {
      console.error("Error fetching extensions:", error);
    } finally {
      setIsLoadingExtensions(false);
    }
  };

  const handleExtensionUpdated = () => {
    fetchExtensions();
    fetchBooking(); // Refresh booking to update total price
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(
      language === "de" ? "de-DE" : "en-US",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }
    );
  };

  const formatPrice = (price: string | number) => {
    const amount = typeof price === "string" ? parseFloat(price) : price;
    return amount.toFixed(2);
  };

  const statusStyles: Record<string, string> = {
    PENDING_PAYMENT: "badge-pending",
    CONFIRMED: "badge-pending",
    PICKUP_ASSIGNED: "badge-pickup",
    PICKED_UP: "badge-transit",
    AT_WORKSHOP: "badge-in-progress",
    IN_SERVICE: "badge-in-progress",
    READY_FOR_RETURN: "badge-ready",
    RETURN_ASSIGNED: "badge-return",
    RETURNED: "badge-completed",
    DELIVERED: "badge-completed",
    CANCELLED: "badge-destructive",
    JOCKEY_ASSIGNED: "badge-pickup",
    IN_TRANSIT_TO_WORKSHOP: "badge-transit",
    IN_WORKSHOP: "badge-in-progress",
    COMPLETED: "badge-completed",
    IN_TRANSIT_TO_CUSTOMER: "badge-return",
  };

  const detailStatusLabels: Record<string, { de: string; en: string }> = {
    PENDING_PAYMENT: { de: "Zahlung ausstehend", en: "Payment Pending" },
    CONFIRMED: { de: "Bestätigt", en: "Confirmed" },
    PICKUP_ASSIGNED: { de: "Abholung geplant", en: "Pickup Scheduled" },
    PICKED_UP: { de: "Wird zur Werkstatt gebracht", en: "Being Delivered to Workshop" },
    AT_WORKSHOP: { de: "In der Werkstatt angekommen", en: "Arrived at Workshop" },
    IN_SERVICE: { de: "Wird bearbeitet", en: "Being Serviced" },
    READY_FOR_RETURN: { de: "Bereit zur Rückgabe", en: "Ready for Return" },
    RETURN_ASSIGNED: { de: "Rückgabe geplant", en: "Return Scheduled" },
    RETURNED: { de: "Zurückgegeben", en: "Returned" },
    JOCKEY_ASSIGNED: { de: "Fahrer zugewiesen", en: "Driver Assigned" },
    IN_TRANSIT_TO_WORKSHOP: { de: "Unterwegs zur Werkstatt", en: "In Transit to Workshop" },
    IN_WORKSHOP: { de: "In Werkstatt", en: "In Workshop" },
    IN_TRANSIT_TO_CUSTOMER: { de: "Unterwegs zum Kunden", en: "In Transit to Customer" },
    COMPLETED: { de: "Service abgeschlossen", en: "Service Completed" },
    DELIVERED: { de: "Zugestellt", en: "Delivered" },
    CANCELLED: { de: "Storniert", en: "Cancelled" },
  };

  const getStatusBadge = (status: string) => {
    return (
      <Badge className={statusStyles[status] || "badge-pending"}>
        {detailStatusLabels[status]?.[language] || status}
      </Badge>
    );
  };

  const pendingExtensionsCount = extensions.filter(
    (ext) => ext.status === "PENDING"
  ).length;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">{texts.loading}</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center py-12">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <p className="text-lg font-medium">{texts.error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push(`/${language}/customer/dashboard`)}
            className="mb-4"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            {texts.back}
          </Button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">{texts.bookingDetails}</h1>
              <p className="text-muted-foreground">
                {texts.bookingNumber}: {booking.bookingNumber}
              </p>
            </div>
            {getStatusBadge(booking.status)}
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">{texts.tabs.details}</TabsTrigger>
            <TabsTrigger value="extensions" className="relative">
              {texts.tabs.extensions}
              {pendingExtensionsCount > 0 && (
                <Badge
                  variant="destructive"
                  className="ml-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {pendingExtensionsCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-6 mt-6">
            {/* Vehicle Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  {texts.vehicle}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {booking.vehicle ? (
                  <div className="space-y-2">
                    <p className="font-medium">
                      {booking.vehicle.brand} {booking.vehicle.model}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Baujahr: {booking.vehicle.year} | {booking.vehicle.mileage.toLocaleString()} km
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Keine Fahrzeugdaten</p>
                )}
              </CardContent>
            </Card>

            {/* Service Info */}
            <Card>
              <CardHeader>
                <CardTitle>{texts.service}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-medium">{booking.serviceType}</p>
                  {booking.services && booking.services.length > 0 && (
                    <div className="space-y-1 mt-3">
                      {booking.services.map((service, index) => (
                        <div
                          key={index}
                          className="flex justify-between text-sm bg-muted p-2 rounded"
                        >
                          <span>{service.type}</span>
                          <span className="font-medium">
                            {formatPrice(service.price)}€
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Pickup & Delivery */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    {texts.pickup}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">{texts.date}</p>
                    <p className="font-medium">{formatDate(booking.pickupDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{texts.timeSlot}</p>
                    <p className="font-medium">{booking.pickupTimeSlot}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {texts.address}
                    </p>
                    <p className="font-medium mt-1">
                      {booking.pickupAddress}<br />
                      {booking.pickupPostalCode} {booking.pickupCity}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {booking.deliveryDate && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      {texts.delivery}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">{texts.date}</p>
                      <p className="font-medium">{formatDate(booking.deliveryDate)}</p>
                    </div>
                    {booking.deliveryTimeSlot && (
                      <div>
                        <p className="text-sm text-muted-foreground">{texts.timeSlot}</p>
                        <p className="font-medium">{booking.deliveryTimeSlot}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Price */}
            <Card>
              <CardContent className="py-6">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">{texts.price}:</span>
                  <span className="text-2xl font-bold text-primary flex items-center gap-1">
                    {formatPrice(booking.totalPrice)}
                    <Euro className="h-6 w-6" />
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            {booking.customerNotes && (
              <Card>
                <CardHeader>
                  <CardTitle>{texts.notes}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{booking.customerNotes}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Extensions Tab */}
          <TabsContent value="extensions" className="mt-6">
            {isLoadingExtensions ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <ExtensionList
                bookingId={bookingId}
                extensions={extensions}
                onExtensionUpdated={handleExtensionUpdated}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
