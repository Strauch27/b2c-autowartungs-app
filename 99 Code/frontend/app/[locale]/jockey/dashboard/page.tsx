'use client';

import { useState, useEffect } from "react";
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
  address: string;
  time: string;
  vehicle: string;
  status: "upcoming" | "inProgress" | "completed" | "cancelled";
  type: "pickup" | "return";
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

  useEffect(() => {
    async function fetchAssignments() {
      try {
        setIsLoading(true);
        const result = await jockeysApi.getAssignments({ limit: 50 });
        setAssignments(result.assignments);
      } catch (error) {
        console.error('Failed to fetch assignments:', error);
        toast.error(
          language === "de"
            ? "Aufträge konnten nicht geladen werden"
            : "Failed to load assignments"
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchAssignments();

    // Refresh every 30 seconds
    const interval = setInterval(fetchAssignments, 30000);
    return () => clearInterval(interval);
  }, [language]);

  const today = new Date().toLocaleDateString(language === "de" ? "de-DE" : "en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  // Map assignment status to display status
  const mapStatus = (assignmentStatus: string): "upcoming" | "inProgress" | "completed" | "cancelled" => {
    if (assignmentStatus === 'COMPLETED') return "completed";
    if (assignmentStatus === 'CANCELLED') return "cancelled";
    if (assignmentStatus === 'EN_ROUTE' || assignmentStatus === 'AT_LOCATION' || assignmentStatus === 'IN_PROGRESS') return "inProgress";
    return "upcoming";
  };

  // Map assignment type to display type (safe conversion from PICKUP/RETURN to pickup/return)
  const mapType = (assignmentType: string): "pickup" | "return" => {
    const type = assignmentType.toUpperCase();
    if (type === 'PICKUP') return "pickup";
    if (type === 'RETURN') return "return";
    // Fallback to pickup if type is unknown
    console.warn(`Unknown assignment type: ${assignmentType}, defaulting to pickup`);
    return "pickup";
  };

  // Convert assignments to display format
  const displayAssignments = assignments.map(a => ({
    id: a.id,
    customer: a.customerName || (a.booking?.customer ? `${a.booking.customer.firstName || ''} ${a.booking.customer.lastName || ''}`.trim() : 'Customer'),
    address: `${a.customerAddress}, ${a.customerPostalCode} ${a.customerCity}`,
    time: new Date(a.scheduledTime).toLocaleTimeString(language === "de" ? "de-DE" : "en-US", { hour: '2-digit', minute: '2-digit' }),
    vehicle: `${a.vehicleBrand} ${a.vehicleModel}`,
    status: mapStatus(a.status),
    type: mapType(a.type),
  })) as Assignment[];

  const statusConfig = {
    upcoming: {
      label: t.jockeyDashboard.status.upcoming,
      class: "badge-pending",
      action: t.jockeyDashboard.startPickup,
    },
    inProgress: {
      label: t.jockeyDashboard.status.onRoute,
      class: "badge-in-progress",
      action: t.jockeyDashboard.documentHandover,
    },
    completed: {
      label: t.jockeyDashboard.status.completed,
      class: "badge-completed",
      action: null,
    },
    cancelled: {
      label: language === "de" ? "Storniert" : "Cancelled",
      class: "badge-destructive",
      action: null,
    },
  };

  const stats = {
    total: displayAssignments.length,
    completed: displayAssignments.filter((a) => a.status === "completed").length,
    pending: displayAssignments.filter((a) => a.status !== "completed").length,
  };

  const handleStartPickup = async (id: string) => {
    try {
      await jockeysApi.updateStatus(id, { status: 'EN_ROUTE' });
      toast.success(
        language === "de"
          ? "Abholung gestartet"
          : "Pickup started"
      );
      // Refresh assignments
      const { assignments: updatedAssignments } = await jockeysApi.getAssignments({ limit: 50 });
      setAssignments(updatedAssignments);
    } catch (error) {
      console.error('Failed to start pickup:', error);
      toast.error(
        language === "de"
          ? "Fehler beim Start der Abholung"
          : "Failed to start pickup"
      );
    }
  };

  const handleOpenHandover = (assignment: Assignment) => {
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
          language === "de"
            ? handoverModal.assignment.type === "pickup"
              ? "Abholung abgeschlossen"
              : "Rückgabe abgeschlossen"
            : handoverModal.assignment.type === "pickup"
              ? "Pickup completed"
              : "Return completed"
        );

        // Refresh assignments
        const { assignments: updatedAssignments } = await jockeysApi.getAssignments({ limit: 50 });
        setAssignments(updatedAssignments);
      } catch (error) {
        console.error('Failed to complete handover:', error);
        toast.error(
          language === "de"
            ? "Fehler beim Abschluss"
            : "Failed to complete"
        );
      }
    }
    setHandoverModal({ open: false, assignment: null });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-jockey text-jockey-foreground">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link href={`/${language}`} className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-jockey-foreground/10">
                <Car className="h-4 w-4" />
              </div>
            </Link>
            <div>
              <p className="text-sm font-medium">{t.dashboard.welcome}, {user.name || user.email}</p>
              <p className="text-xs text-jockey-foreground/70">{today}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="[&_button]:text-jockey-foreground [&_button:hover]:bg-jockey-foreground/10">
              <LanguageSwitcher />
            </div>
            <Button variant="ghost" size="icon" className="text-jockey-foreground hover:bg-jockey-foreground/10">
              <Bell className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-jockey-foreground hover:bg-jockey-foreground/10"
              onClick={() => router.push(`/${language}`)}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Stats */}
        <div className="mb-6 grid grid-cols-3 gap-4">
          <Card className="card-premium">
            <CardContent className="p-4 text-center">
              <div className="mb-1 text-3xl font-bold text-jockey">{stats.total}</div>
              <p className="text-xs text-muted-foreground">{t.jockeyDashboard.stats.todayTrips}</p>
            </CardContent>
          </Card>
          <Card className="card-premium">
            <CardContent className="p-4 text-center">
              <div className="mb-1 text-3xl font-bold text-success">{stats.completed}</div>
              <p className="text-xs text-muted-foreground">{t.jockeyDashboard.stats.completed}</p>
            </CardContent>
          </Card>
          <Card className="card-premium">
            <CardContent className="p-4 text-center">
              <div className="mb-1 text-3xl font-bold text-cta">{stats.pending}</div>
              <p className="text-xs text-muted-foreground">{t.jockeyDashboard.stats.pending}</p>
            </CardContent>
          </Card>
        </div>

        {/* Assignments */}
        <h2 className="mb-4 text-lg font-semibold">{t.jockeyDashboard.assignments}</h2>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : displayAssignments.length === 0 ? (
          <Card className="card-premium">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Car className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">
                {language === "de"
                  ? "Keine Aufträge für heute"
                  : "No assignments for today"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {displayAssignments.map((assignment) => {
            const config = statusConfig[assignment.status];
            return (
              <Card key={assignment.id} className="card-premium overflow-hidden">
                <div className={`h-1 ${assignment.status === "inProgress" ? "bg-cta" : assignment.status === "completed" ? "bg-success" : assignment.status === "cancelled" ? "bg-destructive" : "bg-primary"}`} />
                <CardContent className="p-4">
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <div className="mb-1 flex items-center gap-2">
                        <Badge className={config.class}>{config.label}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {assignment.type === "pickup" ? t.jockeyDashboard.pickup : (language === "de" ? "Rückgabe" : "Return")}
                        </span>
                      </div>
                      <p className="font-semibold">{assignment.customer}</p>
                    </div>
                    <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {assignment.time}
                    </div>
                  </div>

                  <div className="mb-3 flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                    {assignment.address}
                  </div>

                  <div className="mb-4 flex items-center gap-2 text-sm">
                    <Car className="h-4 w-4 text-primary" />
                    <span className="font-medium">{assignment.vehicle}</span>
                  </div>

                  {assignment.status !== "completed" && assignment.status !== "cancelled" && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Phone className="mr-2 h-4 w-4" />
                        {language === "de" ? "Anrufen" : "Call"}
                      </Button>
                      <Button variant="jockey" size="sm" className="flex-1">
                        <Navigation className="mr-2 h-4 w-4" />
                        {t.jockeyDashboard.navigate}
                      </Button>
                    </div>
                  )}

                  {assignment.status === "upcoming" && (
                    <Button
                      variant="ghost"
                      className="mt-3 w-full text-jockey"
                      size="sm"
                      onClick={() => handleStartPickup(assignment.id)}
                    >
                      {assignment.type === "pickup"
                        ? t.jockeyDashboard.startPickup
                        : (language === "de" ? "Rückgabe starten" : "Start Return")}
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  )}

                  {assignment.status === "inProgress" && (
                    <Button
                      variant="ghost"
                      className="mt-3 w-full text-jockey"
                      size="sm"
                      onClick={() => handleOpenHandover(assignment)}
                    >
                      <Camera className="mr-2 h-4 w-4" />
                      {t.jockeyDashboard.documentHandover}
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  )}

                  {assignment.status === "completed" && (
                    <div className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-success/10 py-2 text-sm font-medium text-success">
                      <CheckCircle className="h-4 w-4" />
                      {language === "de" ? "Erfolgreich abgeschlossen" : "Successfully completed"}
                    </div>
                  )}

                  {assignment.status === "cancelled" && (
                    <div className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-destructive/10 py-2 text-sm font-medium text-destructive">
                      <X className="h-4 w-4" />
                      {language === "de" ? "Storniert" : "Cancelled"}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
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
