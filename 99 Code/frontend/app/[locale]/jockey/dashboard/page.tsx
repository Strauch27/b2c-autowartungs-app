'use client';

import { useState, useEffect, useMemo } from "react";
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useUser } from '@/lib/auth-hooks';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Car,
  Clock,
  CheckCircle,
  MapPin,
  Navigation,
  Bell,
  LogOut,
  ChevronRight,
  Phone,
  Camera,
  Loader2,
  X,
  ArrowDownToLine,
  ArrowUpFromLine,
  MapPinCheck,
  BarChart3,
  CalendarDays,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n/useLovableTranslation";
import HandoverModal from "@/components/jockey/HandoverModal";
import { jockeysApi, JockeyAssignment } from "@/lib/api/jockeys";
import { toast } from "sonner";
import dynamic from "next/dynamic";

// Load LanguageSwitcher without SSR to avoid hydration mismatch
const LanguageSwitcher = dynamic(() => import("@/components/LanguageSwitcher"), {
  ssr: false,
});

interface Assignment {
  id: string;
  customer: string;
  customerPhone: string;
  address: string;
  time: string;
  scheduledDate: string;
  vehicle: string;
  status: "upcoming" | "inProgress" | "atLocation" | "completed" | "cancelled";
  type: "pickup" | "return";
}

/** Group assignments into Today / Tomorrow / Later sections */
function groupByDate(
  assignments: Assignment[],
  labels: { today: string; tomorrow: string; later: string }
): { label: string; items: Assignment[] }[] {
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const tomorrowDate = new Date(now);
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowStr = tomorrowDate.toISOString().slice(0, 10);

  const groups: Record<string, Assignment[]> = {};
  for (const a of assignments) {
    let key: string;
    if (a.scheduledDate === todayStr) key = labels.today;
    else if (a.scheduledDate === tomorrowStr) key = labels.tomorrow;
    else key = labels.later;
    (groups[key] ??= []).push(a);
  }

  const order = [labels.today, labels.tomorrow, labels.later];
  return order.filter((l) => groups[l]?.length).map((l) => ({ label: l, items: groups[l] }));
}

function DashboardContent() {
  const user = useUser();
  const router = useRouter();
  const { t, language } = useLanguage();
  const [handoverModal, setHandoverModal] = useState<{
    open: boolean;
    assignment: Assignment | null;
  }>({ open: false, assignment: null });
  const [assignments, setAssignments] = useState<JockeyAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<'all' | 'pickup' | 'return'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'active' | 'completed'>('all');

  useEffect(() => {
    async function fetchAssignments() {
      try {
        setIsLoading(true);
        const result = await jockeysApi.getAssignments({ limit: 50 });
        setAssignments(result.assignments);
      } catch (error) {
        console.error('Failed to fetch assignments:', error);
        toast.error(t.jockeyDashboard.loadError);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAssignments();

    // Refresh every 30 seconds
    const interval = setInterval(fetchAssignments, 30000);
    return () => clearInterval(interval);
  }, [language, t.jockeyDashboard.loadError]);

  const today = new Date().toLocaleDateString(language === "de" ? "de-DE" : "en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  // Map assignment status to display status
  const mapStatus = (assignmentStatus: string): "upcoming" | "inProgress" | "atLocation" | "completed" | "cancelled" => {
    if (assignmentStatus === 'COMPLETED') return "completed";
    if (assignmentStatus === 'CANCELLED') return "cancelled";
    if (assignmentStatus === 'AT_LOCATION' || assignmentStatus === 'IN_PROGRESS') return "atLocation";
    if (assignmentStatus === 'EN_ROUTE') return "inProgress";
    return "upcoming";
  };

  // Map assignment type to display type (safe conversion from PICKUP/RETURN to pickup/return)
  const mapType = (assignmentType: string): "pickup" | "return" => {
    const type = assignmentType.toUpperCase();
    if (type === 'PICKUP') return "pickup";
    if (type === 'RETURN') return "return";
    console.warn(`Unknown assignment type: ${assignmentType}, defaulting to pickup`);
    return "pickup";
  };

  // Convert assignments to display format
  const displayAssignments = useMemo(() => assignments.map(a => ({
    id: a.id,
    customer: a.customerName || (a.booking?.customer ? `${a.booking.customer.firstName || ''} ${a.booking.customer.lastName || ''}`.trim() : 'Customer'),
    customerPhone: a.customerPhone || a.booking?.customer?.phone || '',
    address: `${a.customerAddress}, ${a.customerPostalCode} ${a.customerCity}`,
    time: new Date(a.scheduledTime).toLocaleTimeString(language === "de" ? "de-DE" : "en-US", { hour: '2-digit', minute: '2-digit' }),
    scheduledDate: new Date(a.scheduledTime).toISOString().slice(0, 10),
    vehicle: `${a.vehicleBrand} ${a.vehicleModel}`,
    status: mapStatus(a.status),
    type: mapType(a.type),
  })) as Assignment[], [assignments, language]);

  // Filter and sort assignments
  const filteredAssignments = useMemo(() => displayAssignments
    .filter(a => {
      if (typeFilter !== 'all' && a.type !== typeFilter) return false;
      if (statusFilter === 'pending' && a.status !== 'upcoming') return false;
      if (statusFilter === 'active' && !['inProgress', 'atLocation'].includes(a.status)) return false;
      if (statusFilter === 'completed' && a.status !== 'completed') return false;
      return true;
    })
    .sort((a, b) => {
      const priority: Record<string, number> = { inProgress: 0, atLocation: 0, upcoming: 1, completed: 2, cancelled: 3 };
      return (priority[a.status] ?? 9) - (priority[b.status] ?? 9);
    }), [displayAssignments, typeFilter, statusFilter]);

  // J9: Group filtered assignments by date
  const groupedAssignments = useMemo(() => groupByDate(filteredAssignments, {
    today: t.jockeyDashboard.today,
    tomorrow: t.jockeyDashboard.tomorrow,
    later: t.jockeyDashboard.later,
  }), [filteredAssignments, t.jockeyDashboard.today, t.jockeyDashboard.tomorrow, t.jockeyDashboard.later]);

  const statusConfig = {
    upcoming: {
      label: t.jockeyDashboard.status.upcoming,
      class: "badge-pending",
    },
    inProgress: {
      label: t.jockeyDashboard.status.onRoute,
      class: "badge-in-progress",
    },
    atLocation: {
      label: t.jockeyDashboard.status.arrived,
      class: "badge-pickup",
    },
    completed: {
      label: t.jockeyDashboard.status.completed,
      class: "badge-completed",
    },
    cancelled: {
      label: t.jockeyDashboard.status.cancelled,
      class: "badge-destructive",
    },
  };

  const stats = {
    total: displayAssignments.length,
    completed: displayAssignments.filter((a) => a.status === "completed").length,
    pending: displayAssignments.filter((a) => a.status !== "completed").length,
  };

  // J4: Confirmation before irreversible status updates
  const handleStartPickup = async (id: string) => {
    if (!window.confirm(t.jockeyDashboard.confirmAction)) return;

    try {
      await jockeysApi.updateStatus(id, { status: 'EN_ROUTE' });
      toast.success(t.jockeyDashboard.pickupStarted);
      const { assignments: updatedAssignments } = await jockeysApi.getAssignments({ limit: 50 });
      setAssignments(updatedAssignments);
    } catch (error) {
      console.error('Failed to start pickup:', error);
      toast.error(t.jockeyDashboard.pickupStartError);
    }
  };

  const handleOpenHandover = (assignment: Assignment) => {
    // J4: Confirmation before opening handover (irreversible action)
    if (!window.confirm(t.jockeyDashboard.confirmAction)) return;
    setHandoverModal({ open: true, assignment });
  };

  const handleCompleteHandover = async (handoverData?: { photos: string[]; customerSignature: string; notes: string }) => {
    if (handoverModal.assignment) {
      try {
        await jockeysApi.completeAssignment(handoverModal.assignment.id, {
          photos: handoverData?.photos || [],
          customerSignature: handoverData?.customerSignature || '',
          ronjaSignature: '',
          notes: handoverData?.notes || '',
        });

        toast.success(
          handoverModal.assignment.type === "pickup"
            ? t.jockeyDashboard.pickupCompleted
            : t.jockeyDashboard.returnCompleted
        );

        const { assignments: updatedAssignments } = await jockeysApi.getAssignments({ limit: 50 });
        setAssignments(updatedAssignments);
      } catch (error) {
        console.error('Failed to complete handover:', error);
        toast.error(t.jockeyDashboard.handoverError);
      }
    }
    setHandoverModal({ open: false, assignment: null });
  };

  /** J3: Build a Google Maps navigation URL for a given address */
  const getMapsUrl = (address: string) =>
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-jockey text-jockey-foreground">
        <div className="container mx-auto flex h-14 sm:h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link href={`/${language}`} className="flex items-center gap-2" aria-label={t.header.home}>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-jockey-foreground/10">
                <Car className="h-4 w-4" />
              </div>
            </Link>
            <div>
              <p className="text-sm font-medium">{t.dashboard.welcome}, {user.name || user.email}</p>
              <p className="text-xs text-jockey-foreground/70">{today}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="[&_button]:text-jockey-foreground [&_button:hover]:bg-jockey-foreground/10">
              <LanguageSwitcher />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-jockey-foreground hover:bg-jockey-foreground/10"
              aria-label={t.jockeyDashboard.notifications}
            >
              <Bell className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-jockey-foreground hover:bg-jockey-foreground/10"
              onClick={() => router.push(`/${language}`)}
              aria-label={t.jockeyDashboard.logout}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 sm:py-6">
        {/* Stats - J6: responsive grid */}
        <div className="mb-6 grid grid-cols-3 gap-2 sm:gap-4">
          <Card className="card-premium">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="mb-1 text-2xl sm:text-3xl font-bold text-jockey">{stats.total}</div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">{t.jockeyDashboard.stats.todayTrips}</p>
            </CardContent>
          </Card>
          <Card className="card-premium">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="mb-1 text-2xl sm:text-3xl font-bold text-success">{stats.completed}</div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">{t.jockeyDashboard.stats.completed}</p>
            </CardContent>
          </Card>
          <Card className="card-premium">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="mb-1 text-2xl sm:text-3xl font-bold text-cta">{stats.pending}</div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">{t.jockeyDashboard.stats.pending}</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick links to stats & availability */}
        <div className="mb-4 flex gap-2">
          <Link href={`/${language}/jockey/stats`}>
            <Button variant="outline" size="sm" className="min-h-[44px]" aria-label={t.jockeyStats?.title}>
              <BarChart3 className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">{t.jockeyStats?.title}</span>
              <span className="sm:hidden">{t.jockeyStats?.title}</span>
            </Button>
          </Link>
          <Link href={`/${language}/jockey/availability`}>
            <Button variant="outline" size="sm" className="min-h-[44px]" aria-label={t.jockeyAvailability?.title}>
              <CalendarDays className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">{t.jockeyAvailability?.title}</span>
              <span className="sm:hidden">{t.jockeyAvailability?.title}</span>
            </Button>
          </Link>
        </div>

        {/* Assignments */}
        <h2 className="mb-4 text-lg font-semibold">{t.jockeyDashboard.assignments}</h2>

        {/* Filter Bar - J1: all strings from i18n, J6: min touch targets */}
        <div className="mb-4 flex flex-wrap gap-2">
          <div className="flex gap-1.5">
            {([
              { key: 'all' as const, label: t.jockeyDashboard.filter.all },
              { key: 'pickup' as const, label: t.jockeyDashboard.filter.pickupType },
              { key: 'return' as const, label: t.jockeyDashboard.filter.returnType },
            ]).map(({ key, label }) => (
              <Button
                key={key}
                variant={typeFilter === key ? "default" : "outline"}
                size="sm"
                className="min-h-[44px]"
                onClick={() => setTypeFilter(key)}
                aria-label={label}
                aria-pressed={typeFilter === key}
              >
                {key === 'pickup' && <ArrowDownToLine className="mr-1.5 h-3.5 w-3.5" />}
                {key === 'return' && <ArrowUpFromLine className="mr-1.5 h-3.5 w-3.5" />}
                {label}
              </Button>
            ))}
          </div>
          <div className="flex gap-1.5">
            {([
              { key: 'all' as const, label: t.jockeyDashboard.filter.allStatus },
              { key: 'pending' as const, label: t.jockeyDashboard.filter.upcoming },
              { key: 'active' as const, label: t.jockeyDashboard.filter.active },
              { key: 'completed' as const, label: t.jockeyDashboard.filter.done },
            ]).map(({ key, label }) => (
              <Button
                key={key}
                variant={statusFilter === key ? "default" : "outline"}
                size="sm"
                className="min-h-[44px]"
                onClick={() => setStatusFilter(key)}
                aria-label={label}
                aria-pressed={statusFilter === key}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12" role="status" aria-label="Loading">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredAssignments.length === 0 ? (
          <Card className="card-premium">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Car className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">
                {typeFilter !== 'all' || statusFilter !== 'all'
                  ? t.jockeyDashboard.noMatchingAssignments
                  : t.jockeyDashboard.noAssignments}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* J9: Timeline view grouped by date */}
            {groupedAssignments.map((group) => (
              <section key={group.label} aria-label={group.label}>
                <h3 className="mb-3 text-base font-semibold text-muted-foreground">{group.label}</h3>
                <div className="space-y-3 sm:space-y-4">
                  {group.items.map((assignment) => {
                    const config = statusConfig[assignment.status];
                    return (
                      <Card key={assignment.id} className="card-premium overflow-hidden w-full">
                        <div className={`h-1 ${
                          assignment.status === "inProgress" || assignment.status === "atLocation" ? "bg-cta"
                          : assignment.status === "completed" ? "bg-success"
                          : assignment.status === "cancelled" ? "bg-destructive"
                          : assignment.type === "return" ? "bg-jockey"
                          : "bg-primary"
                        }`} />
                        <CardContent className="p-3 sm:p-4">
                          <div className="mb-3 flex items-start justify-between">
                            <div>
                              <div className="mb-1 flex items-center gap-2 flex-wrap">
                                <Badge data-testid="booking-status" className={config.class} role="status">{config.label}</Badge>
                                <span className={`flex items-center gap-1 text-sm font-medium ${
                                  assignment.type === "pickup" ? "text-primary" : "text-jockey"
                                }`}>
                                  {assignment.type === "pickup"
                                    ? <><ArrowDownToLine className="h-3.5 w-3.5" />{t.jockeyDashboard.pickup}</>
                                    : <><ArrowUpFromLine className="h-3.5 w-3.5" />{t.jockeyDashboard.return}</>}
                                </span>
                              </div>
                              <p className="font-semibold text-sm sm:text-base">{assignment.customer}</p>
                            </div>
                            <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              {assignment.time}
                            </div>
                          </div>

                          {/* J3: Clickable address with Google Maps link */}
                          <a
                            href={getMapsUrl(assignment.address)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mb-3 flex items-start gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                            aria-label={`${t.jockeyDashboard.navigate}: ${assignment.address}`}
                          >
                            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                            <span className="underline underline-offset-2">{assignment.address}</span>
                          </a>

                          <div className="mb-4 flex items-center gap-2 text-sm">
                            <Car className="h-4 w-4 text-primary" />
                            <span className="font-medium">{assignment.vehicle}</span>
                          </div>

                          {/* J12: Call + Navigate buttons, J6: min 44px touch targets */}
                          {assignment.status !== "completed" && assignment.status !== "cancelled" && (
                            <div className="flex gap-2">
                              {assignment.customerPhone ? (
                                <a href={`tel:${assignment.customerPhone}`} className="flex-1">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full min-h-[44px]"
                                    aria-label={`${t.jockeyDashboard.call} ${assignment.customer}`}
                                  >
                                    <Phone className="mr-2 h-4 w-4" />
                                    {t.jockeyDashboard.call}
                                  </Button>
                                </a>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1 min-h-[44px]"
                                  disabled
                                  aria-label={t.jockeyDashboard.call}
                                >
                                  <Phone className="mr-2 h-4 w-4" />
                                  {t.jockeyDashboard.call}
                                </Button>
                              )}
                              <a
                                href={getMapsUrl(assignment.address)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1"
                              >
                                <Button
                                  variant="jockey"
                                  size="sm"
                                  className="w-full min-h-[44px]"
                                  aria-label={`${t.jockeyDashboard.navigate}: ${assignment.address}`}
                                >
                                  <Navigation className="mr-2 h-4 w-4" />
                                  {t.jockeyDashboard.navigate}
                                </Button>
                              </a>
                            </div>
                          )}

                          {assignment.status === "upcoming" && (
                            <Button
                              data-testid="job-accept"
                              variant="ghost"
                              className="mt-3 w-full text-jockey min-h-[44px]"
                              size="sm"
                              onClick={() => handleStartPickup(assignment.id)}
                              aria-label={assignment.type === "pickup"
                                ? t.jockeyDashboard.startPickup
                                : t.jockeyDashboard.startReturn}
                            >
                              {assignment.type === "pickup"
                                ? t.jockeyDashboard.startPickup
                                : t.jockeyDashboard.startReturn}
                              <ChevronRight className="ml-1 h-4 w-4" />
                            </Button>
                          )}

                          {assignment.status === "inProgress" && (
                            <Button
                              data-testid={assignment.type === "pickup" ? "job-mark-pickedup" : "job-mark-delivered"}
                              variant="ghost"
                              className="mt-3 w-full text-jockey min-h-[44px]"
                              size="sm"
                              onClick={() => handleOpenHandover(assignment)}
                              aria-label={t.jockeyDashboard.documentHandover}
                            >
                              <Camera className="mr-2 h-4 w-4" />
                              {t.jockeyDashboard.documentHandover}
                              <ChevronRight className="ml-1 h-4 w-4" />
                            </Button>
                          )}

                          {assignment.status === "atLocation" && (
                            <Button
                              data-testid={assignment.type === "pickup" ? "job-mark-pickedup" : "job-mark-delivered"}
                              variant="ghost"
                              className="mt-3 w-full text-jockey min-h-[44px]"
                              size="sm"
                              onClick={() => handleOpenHandover(assignment)}
                              aria-label={t.jockeyDashboard.documentHandover}
                            >
                              <MapPinCheck className="mr-2 h-4 w-4" />
                              {t.jockeyDashboard.documentHandover}
                              <ChevronRight className="ml-1 h-4 w-4" />
                            </Button>
                          )}

                          {assignment.status === "completed" && (
                            <div
                              className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-success/10 py-2 text-sm font-medium text-success"
                              role="status"
                            >
                              <CheckCircle className="h-4 w-4" />
                              {t.jockeyDashboard.successfullyCompleted}
                            </div>
                          )}

                          {assignment.status === "cancelled" && (
                            <div
                              className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-destructive/10 py-2 text-sm font-medium text-destructive"
                              role="status"
                            >
                              <X className="h-4 w-4" />
                              {t.jockeyDashboard.status.cancelled}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      {/* Handover Modal */}
      {handoverModal.assignment && (
        <HandoverModal
          open={handoverModal.open}
          onOpenChange={(open) => setHandoverModal({ ...handoverModal, open })}
          assignment={handoverModal.assignment}
          onComplete={handleCompleteHandover}
        />
      )}
    </div>
  );
}

export default function JockeyDashboardPage() {
  return (
    <ProtectedRoute requiredRole="jockey">
      <DashboardContent />
    </ProtectedRoute>
  );
}
