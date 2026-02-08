'use client';

import { useState, useEffect } from "react";
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from "@/lib/auth-hooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  Search,
  ArrowUpDown,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useLanguage } from "@/lib/i18n/useLovableTranslation";
import { bookingsApi, BookingResponse } from "@/lib/api/bookings";
import { toast } from "sonner";
import { NotificationCenter } from "@/components/customer/NotificationCenter";
import dynamic from "next/dynamic";

// Load LanguageSwitcher without SSR to avoid hydration mismatch
const LanguageSwitcher = dynamic(() => import("@/components/LanguageSwitcher"), {
  ssr: false,
});

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
  // Legacy status mappings (for backward compatibility)
  JOCKEY_ASSIGNED: "badge-pickup",
  IN_TRANSIT_TO_WORKSHOP: "badge-transit",
  IN_WORKSHOP: "badge-in-progress",
  COMPLETED: "badge-completed",
  IN_TRANSIT_TO_CUSTOMER: "badge-return",
};

// Progress step mapping: which step (0-4) each status represents
const statusProgress: Record<string, number> = {
  PENDING_PAYMENT: 0,
  CONFIRMED: 0,
  PICKUP_ASSIGNED: 1,
  PICKED_UP: 1,
  AT_WORKSHOP: 2,
  IN_SERVICE: 2,
  READY_FOR_RETURN: 3,
  RETURN_ASSIGNED: 3,
  RETURNED: 4,
  DELIVERED: 4,
  CANCELLED: -1,
  JOCKEY_ASSIGNED: 1,
  IN_TRANSIT_TO_WORKSHOP: 1,
  IN_WORKSHOP: 2,
  COMPLETED: 4,
  IN_TRANSIT_TO_CUSTOMER: 3,
};

const progressSteps = {
  de: ["Gebucht", "Abholung", "Werkstatt", "Rückgabe", "Fertig"],
  en: ["Booked", "Pickup", "Workshop", "Return", "Done"],
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

function DashboardContent() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const params = useParams();
  const locale = params.locale as string || 'de';
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingExtensions, setPendingExtensions] = useState<Record<string, number>>({});

  useEffect(() => {
    async function fetchBookings() {
      try {
        setIsLoading(true);
        const result = await bookingsApi.getAll({ limit: 50 });
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

  // Fetch pending extension counts for active bookings
  useEffect(() => {
    async function fetchPendingExtensions() {
      const activeBookingsList = bookings.filter(
        b => !['DELIVERED', 'CANCELLED', 'RETURNED', 'COMPLETED'].includes(b.status)
      );
      const counts: Record<string, number> = {};
      for (const booking of activeBookingsList) {
        try {
          const exts = await bookingsApi.getExtensions(booking.id);
          const pending = exts.filter(e => e.status === 'PENDING').length;
          if (pending > 0) counts[booking.id] = pending;
        } catch {
          // ignore per-booking errors
        }
      }
      if (Object.keys(counts).length > 0) setPendingExtensions(counts);
    }
    if (bookings.length > 0) fetchPendingExtensions();
  }, [bookings]);

  const handleLogout = () => {
    router.push(`/${locale}`);
  };

  // Calculate stats from real bookings
  const activeBookings = bookings.filter(
    b => !['DELIVERED', 'CANCELLED'].includes(b.status)
  ).length;

  // Filter and sort bookings
  const filteredBookings = bookings
    .filter(b => {
      // Status filter
      if (statusFilter === 'active') return !['DELIVERED', 'RETURNED', 'COMPLETED', 'CANCELLED'].includes(b.status);
      if (statusFilter === 'completed') return ['DELIVERED', 'RETURNED', 'COMPLETED'].includes(b.status);
      if (statusFilter === 'cancelled') return b.status === 'CANCELLED';
      return true;
    })
    .filter(b => {
      // Search filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const vehicle = b.vehicle ? `${b.vehicle.brand} ${b.vehicle.model}`.toLowerCase() : '';
      const bookingNum = (b.bookingNumber || '').toLowerCase();
      return vehicle.includes(q) || bookingNum.includes(q);
    })
    .sort((a, b) => {
      const dateA = new Date(a.pickupDate).getTime();
      const dateB = new Date(b.pickupDate).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

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
                ? `Willkommen zurück, ${user?.name || 'Kunde'}`
                : `Welcome back, ${user?.name || 'Customer'}`}
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

          {/* Bookings */}
          <div className="mb-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {language === "de" ? "Meine Buchungen" : "My Bookings"}
              </h2>
              <Link href={`/${locale}/customer/bookings`}>
                <Button variant="ghost" size="sm">
                  {t.customerDashboard.viewDetails}
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Filter Bar */}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex gap-2">
                {([
                  { key: 'all', de: 'Alle', en: 'All' },
                  { key: 'active', de: 'Aktiv', en: 'Active' },
                  { key: 'completed', de: 'Abgeschlossen', en: 'Completed' },
                  { key: 'cancelled', de: 'Storniert', en: 'Cancelled' },
                ] as const).map(({ key, de, en }) => (
                  <Button
                    key={key}
                    variant={statusFilter === key ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter(key)}
                  >
                    {language === "de" ? de : en}
                  </Button>
                ))}
              </div>
              <div className="flex flex-1 gap-2">
                <div className="relative flex-1 sm:max-w-xs">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={language === "de" ? "Buchung suchen..." : "Search bookings..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSortOrder(s => s === 'newest' ? 'oldest' : 'newest')}
                  title={sortOrder === 'newest'
                    ? (language === "de" ? "Neueste zuerst" : "Newest first")
                    : (language === "de" ? "Älteste zuerst" : "Oldest first")}
                >
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredBookings.length === 0 ? (
              <Card className="card-premium">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <ClipboardList className="mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    {searchQuery || statusFilter !== 'all'
                      ? (language === "de" ? "Keine Buchungen gefunden" : "No bookings found")
                      : (language === "de" ? "Keine Buchungen vorhanden" : "No bookings available")}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredBookings.map((booking) => {
                  const currentStep = statusProgress[booking.status] ?? 0;
                  const steps = progressSteps[language];
                  const isCancelled = booking.status === 'CANCELLED';
                  return (
                  <Card key={booking.id} className="card-premium">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
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
                          <Badge className={statusStyles[booking.status] || "badge-pending"}>
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
                      </div>
                      {/* Pending Extension Alert */}
                      {pendingExtensions[booking.id] && (
                        <div
                          className="mt-3 bg-amber-50 border border-amber-300 rounded-lg p-2.5 flex items-center gap-2 cursor-pointer hover:bg-amber-100 transition-colors"
                          onClick={() => router.push(`/${locale}/customer/bookings/${booking.id}?tab=extensions`)}
                        >
                          <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                          <span className="text-sm font-medium text-amber-800">
                            {language === "de"
                              ? `${pendingExtensions[booking.id]} Erweiterung(en) wartet auf Genehmigung`
                              : `${pendingExtensions[booking.id]} extension(s) awaiting approval`}
                          </span>
                          <ChevronRight className="h-4 w-4 text-amber-600 ml-auto" />
                        </div>
                      )}
                      {/* Progress indicator */}
                      {!isCancelled && (
                        <div className="mt-3 flex items-center gap-1">
                          {steps.map((step, i) => (
                            <div key={i} className="flex flex-1 items-center">
                              <div className="flex flex-col items-center flex-1">
                                <div className="flex w-full items-center">
                                  <div
                                    className={`h-1.5 w-full rounded-full ${
                                      i <= currentStep
                                        ? "bg-primary"
                                        : "bg-muted"
                                    }`}
                                  />
                                </div>
                                <span className={`mt-1 text-[10px] ${
                                  i <= currentStep ? "text-primary font-medium" : "text-muted-foreground"
                                }`}>
                                  {step}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Action */}
          <Card className="card-premium border-2 border-dashed border-primary/30 bg-primary/5">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
                <Plus className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">
                {language === "de" ? "Neuen Service buchen" : "Book New Service"}
              </h3>
              <p className="mb-4 max-w-sm text-muted-foreground">
                {language === "de"
                  ? "Buchen Sie jetzt Ihren nächsten Wartungstermin mit Festpreis-Garantie."
                  : "Book your next maintenance appointment now with a fixed-price guarantee."}
              </p>
              <Link href={`/${locale}/customer/booking`}>
                <Button variant="cta" size="lg">
                  {language === "de" ? "Jetzt buchen" : "Book Now"}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default function CustomerDashboardPage() {
  return (
    <ProtectedRoute requiredRole="customer">
      <DashboardContent />
    </ProtectedRoute>
  );
}
