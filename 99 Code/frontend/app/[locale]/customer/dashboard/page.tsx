'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Car,
  Calendar,
  ClipboardList,
  Plus,
  User,
  LogOut,
  Home,
  ChevronRight,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useLanguage } from "@/lib/i18n/useLovableTranslation";
import { useUser } from "@/lib/auth-hooks";
import { bookingsApi, BookingResponse } from "@/lib/api/bookings";
import { toast } from "sonner";
import { NotificationCenter } from "@/components/customer/NotificationCenter";
import dynamic from "next/dynamic";

// Load LanguageSwitcher without SSR to avoid hydration mismatch
const LanguageSwitcher = dynamic(() => import("@/components/LanguageSwitcher"), {
  ssr: false,
});

const statusStyles = {
  PENDING_PAYMENT: "badge-pending",
  CONFIRMED: "badge-pending",
  PICKUP_ASSIGNED: "badge-in-progress",
  PICKED_UP: "badge-in-progress",
  AT_WORKSHOP: "badge-in-progress",
  IN_SERVICE: "badge-in-progress",
  READY_FOR_RETURN: "badge-in-progress",
  RETURN_ASSIGNED: "badge-in-progress",
  RETURNED: "badge-in-progress",
  DELIVERED: "badge-completed",
  CANCELLED: "badge-completed",
  // Legacy status mappings (for backward compatibility)
  JOCKEY_ASSIGNED: "badge-in-progress",
  IN_TRANSIT_TO_WORKSHOP: "badge-in-progress",
  IN_WORKSHOP: "badge-in-progress",
  COMPLETED: "badge-in-progress",
  IN_TRANSIT_TO_CUSTOMER: "badge-in-progress",
};

const statusLabels: Record<string, { de: string; en: string }> = {
  PENDING_PAYMENT: { de: "Zahlung ausstehend", en: "Payment Pending" },
  CONFIRMED: { de: "Bestätigt", en: "Confirmed" },
  PICKUP_ASSIGNED: { de: "Abholung geplant", en: "Pickup Scheduled" },
  PICKED_UP: { de: "Wird zur Werkstatt gebracht", en: "Being Delivered to Workshop" },
  AT_WORKSHOP: { de: "In der Werkstatt angekommen", en: "Arrived at Workshop" },
  IN_SERVICE: { de: "Wird bearbeitet", en: "Being Serviced" },
  READY_FOR_RETURN: { de: "Bereit zur Rückgabe", en: "Ready for Return" },
  RETURN_ASSIGNED: { de: "Rückgabe geplant", en: "Return Scheduled" },
  RETURNED: { de: "Zurückgebracht", en: "Returned to Customer" },
  DELIVERED: { de: "Abgeschlossen", en: "Completed" },
  CANCELLED: { de: "Storniert", en: "Cancelled" },
  // Legacy status mappings (for backward compatibility)
  JOCKEY_ASSIGNED: { de: "Jockey zugeteilt", en: "Jockey Assigned" },
  IN_TRANSIT_TO_WORKSHOP: { de: "Auf dem Weg zur Werkstatt", en: "In Transit to Workshop" },
  IN_WORKSHOP: { de: "In Werkstatt", en: "In Workshop" },
  COMPLETED: { de: "Abgeschlossen", en: "Completed" },
  IN_TRANSIT_TO_CUSTOMER: { de: "Auf dem Rückweg", en: "In Transit to Customer" },
};

export default function CustomerDashboardPage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const user = useUser();
  const params = useParams();
  const locale = params.locale as string || 'de';
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchBookings() {
      try {
        setIsLoading(true);
        const result = await bookingsApi.getAll({ limit: 10 });
        setBookings(result.bookings);
      } catch (error) {
        console.error('Failed to fetch bookings:', error);
        toast.error(
          language === "de" ? "Buchungen konnten nicht geladen werden" : "Failed to load bookings"
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchBookings();
  }, [language]);

  const handleLogout = () => {
    router.push(`/${locale}`);
  };

  // Calculate stats from real bookings
  const activeBookings = bookings.filter(
    b => !['DELIVERED', 'CANCELLED'].includes(b.status)
  ).length;

  const recentBookings = bookings.slice(0, 5);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="hidden w-64 border-r border-border bg-card lg:block">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center gap-2 border-b border-border px-6">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Car className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold">AutoConcierge</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            <Link
              href={`/${locale}/customer/dashboard`}
              className="flex items-center gap-3 rounded-lg bg-primary/10 px-3 py-2.5 text-sm font-medium text-primary"
            >
              <Home className="h-4 w-4" />
              {t.customerDashboard.nav.dashboard}
            </Link>
            <Link
              href={`/${locale}/customer/booking`}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <Plus className="h-4 w-4" />
              {t.customerDashboard.nav.newBooking}
            </Link>
            <Link
              href={`/${locale}/customer/bookings`}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <ClipboardList className="h-4 w-4" />
              {t.customerDashboard.nav.myBookings}
            </Link>
            <Link
              href={`/${locale}/customer/vehicles`}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <Car className="h-4 w-4" />
              {t.customerDashboard.nav.vehicles}
            </Link>
            <Link
              href={`/${locale}/customer/profile`}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <User className="h-4 w-4" />
              {t.customerDashboard.nav.profile}
            </Link>
          </nav>

          {/* Language Switcher & Logout */}
          <div className="border-t border-border p-4 space-y-2">
            <div className="flex justify-center">
              <LanguageSwitcher />
            </div>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              {t.dashboard.logout}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        {/* Mobile Header */}
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 lg:hidden">
          <Link href={`/${locale}`} className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Car className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold">AutoConcierge</span>
          </Link>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <NotificationCenter />
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Desktop Header */}
        <header className="hidden h-16 items-center justify-end gap-3 border-b border-border bg-card px-6 lg:flex">
          <LanguageSwitcher />
          <NotificationCenter />
        </header>

        <div className="p-6 lg:p-8">
          {/* Welcome */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold lg:text-3xl">
              {language === "de"
                ? `Willkommen zurück, ${user?.firstName || 'Kunde'}`
                : `Welcome back, ${user?.firstName || 'Customer'}`}
            </h1>
            <p className="text-muted-foreground">
              {language === "de"
                ? "Hier ist eine Übersicht Ihrer Buchungen."
                : "Here's an overview of your bookings."}
            </p>
          </div>

          {/* Quick Stats */}
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <Card className="card-premium">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t.customerDashboard.stats.activeBookings}
                </CardTitle>
                <Calendar className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                ) : (
                  <div className="text-3xl font-bold">{activeBookings}</div>
                )}
              </CardContent>
            </Card>
            <Card className="card-premium">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t.customerDashboard.stats.savedVehicles}
                </CardTitle>
                <Car className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                ) : (
                  <div className="text-3xl font-bold">
                    {new Set(bookings.map(b => b.vehicle?.id)).size}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="card-premium">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t.customerDashboard.stats.lastBooking}
                </CardTitle>
                <ClipboardList className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                ) : bookings.length > 0 ? (
                  <div className="text-xl font-bold">
                    {new Date(bookings[0].pickupDate).toLocaleDateString(
                      language === "de" ? "de-DE" : "en-US",
                      { day: "numeric", month: "short" }
                    )}
                  </div>
                ) : (
                  <div className="text-xl font-bold">-</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Bookings */}
          <div className="mb-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">{t.customerDashboard.recentBookings}</h2>
              <Link href={`/${locale}/customer/bookings`}>
                <Button variant="ghost" size="sm">
                  {t.customerDashboard.viewDetails}
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : recentBookings.length === 0 ? (
              <Card className="card-premium">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <ClipboardList className="mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    {language === "de"
                      ? "Keine Buchungen vorhanden"
                      : "No bookings available"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {recentBookings.map((booking) => (
                  <Card key={booking.id} className="card-premium">
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                          <Car className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">
                            {Array.isArray(booking.services) && booking.services.length > 0
                              ? `${booking.services.length} ${language === "de" ? "Leistungen" : "Services"}`
                              : booking.serviceType}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {booking.vehicle
                              ? `${booking.vehicle.brand} ${booking.vehicle.model}`
                              : language === "de" ? "Fahrzeug" : "Vehicle"} • {" "}
                            {new Date(booking.pickupDate).toLocaleDateString(
                              language === "de" ? "de-DE" : "en-US",
                              { day: "numeric", month: "short", year: "numeric" }
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={statusStyles[booking.status as keyof typeof statusStyles]}>
                          {statusLabels[booking.status]?.[language] || booking.status}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/${locale}/customer/bookings/${booking.id}`)}
                        >
                          Details
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Quick Action */}
          <Card className="card-premium border-2 border-dashed border-primary/30 bg-primary/5">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
                <Plus className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Neuen Service buchen</h3>
              <p className="mb-4 max-w-sm text-muted-foreground">
                Buchen Sie jetzt Ihren nächsten Wartungstermin mit Festpreis-Garantie.
              </p>
              <Link href={`/${locale}/customer/booking`}>
                <Button variant="cta" size="lg">
                  Jetzt buchen
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
