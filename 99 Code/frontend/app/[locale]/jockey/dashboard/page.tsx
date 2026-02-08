'use client';

import { useState, useEffect, useMemo } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useUser } from '@/lib/auth-hooks';
import { Bell, Loader2, ChevronRight, Car } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/useLovableTranslation';
import { useTranslations } from 'next-intl';
import HandoverModal from '@/components/jockey/HandoverModal';
import { AssignmentCard, AssignmentCardAssignment } from '@/components/jockey/AssignmentCard';
import { AvailabilityToggle } from '@/components/jockey/AvailabilityToggle';
import { JockeyAssignmentDetail } from '@/components/jockey/JockeyAssignmentDetail';
import { jockeysApi, JockeyAssignment } from '@/lib/api/jockeys';
import { toast } from 'sonner';

function DashboardContent() {
  const user = useUser();
  const router = useRouter();
  const { t, language } = useLanguage();
  const td = useTranslations('jockeyDashboard');
  const [handoverModal, setHandoverModal] = useState<{
    open: boolean;
    assignment: AssignmentCardAssignment | null;
  }>({ open: false, assignment: null });
  const [assignments, setAssignments] = useState<JockeyAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [completedExpanded, setCompletedExpanded] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<AssignmentCardAssignment | null>(null);

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
    const interval = setInterval(fetchAssignments, 30000);
    return () => clearInterval(interval);
  }, [language, t.jockeyDashboard.loadError]);

  const today = new Date().toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const firstName = user.name?.split(' ')[0] || user.email?.split('@')[0] || '';
  const initials = (user.name || user.email || 'U')
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Map status
  const mapStatus = (s: string): AssignmentCardAssignment['status'] => {
    if (s === 'COMPLETED') return 'completed';
    if (s === 'CANCELLED') return 'cancelled';
    if (s === 'AT_LOCATION' || s === 'IN_PROGRESS') return 'atLocation';
    if (s === 'EN_ROUTE') return 'inProgress';
    return 'upcoming';
  };

  const mapType = (t: string): 'pickup' | 'return' => {
    return t.toUpperCase() === 'RETURN' ? 'return' : 'pickup';
  };

  // Convert to display format
  const displayAssignments: AssignmentCardAssignment[] = useMemo(
    () =>
      assignments.map((a) => ({
        id: a.id,
        customer:
          a.customerName ||
          (a.booking?.customer
            ? `${a.booking.customer.firstName || ''} ${a.booking.customer.lastName || ''}`.trim()
            : 'Customer'),
        customerPhone: a.customerPhone || a.booking?.customer?.phone || '',
        address: `${a.customerAddress}, ${a.customerPostalCode} ${a.customerCity}`,
        time: new Date(a.scheduledTime).toLocaleTimeString(language === 'de' ? 'de-DE' : 'en-US', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        scheduledDate: new Date(a.scheduledTime).toISOString().slice(0, 10),
        vehicle: `${a.vehicleBrand} ${a.vehicleModel}`,
        licensePlate: a.vehicleLicensePlate || '',
        status: mapStatus(a.status),
        type: mapType(a.type),
      })),
    [assignments, language]
  );

  // Categorize assignments
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayAssignments = displayAssignments.filter((a) => a.scheduledDate === todayStr);

  const activeAssignment = todayAssignments.find(
    (a) => a.status === 'inProgress' || a.status === 'atLocation'
  );
  const upcomingAssignment = todayAssignments.find(
    (a) => a.status === 'upcoming'
  );
  const completedAssignments = todayAssignments.filter(
    (a) => a.status === 'completed'
  );

  // Stats
  const pickupCount = todayAssignments.filter((a) => a.type === 'pickup' && a.status !== 'cancelled').length;
  const returnCount = todayAssignments.filter((a) => a.type === 'return' && a.status !== 'cancelled').length;
  const totalCount = todayAssignments.filter((a) => a.status !== 'cancelled').length;

  const getMapsUrl = (address: string) =>
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  const handleAction = async (id: string, action: string) => {
    if (action === 'start_route') {
      if (!window.confirm(t.jockeyDashboard.confirmAction)) return;
      try {
        await jockeysApi.updateStatus(id, { status: 'EN_ROUTE' });
        toast.success(t.jockeyDashboard.pickupStarted);
        const { assignments: updated } = await jockeysApi.getAssignments({ limit: 50 });
        setAssignments(updated);
      } catch {
        toast.error(t.jockeyDashboard.pickupStartError);
      }
    } else if (action === 'arrived' || action === 'complete_handover') {
      const assignment = displayAssignments.find((a) => a.id === id);
      if (assignment) {
        if (!window.confirm(t.jockeyDashboard.confirmAction)) return;
        setHandoverModal({ open: true, assignment });
      }
    }
  };

  const handleCompleteHandover = async (handoverData?: {
    photos: string[];
    customerSignature: string;
    notes: string;
  }) => {
    if (handoverModal.assignment) {
      try {
        await jockeysApi.completeAssignment(handoverModal.assignment.id, {
          photos: handoverData?.photos || [],
          customerSignature: handoverData?.customerSignature || '',
          ronjaSignature: '',
          notes: handoverData?.notes || '',
        });
        toast.success(
          handoverModal.assignment.type === 'pickup'
            ? t.jockeyDashboard.pickupCompleted
            : t.jockeyDashboard.returnCompleted
        );
        const { assignments: updated } = await jockeysApi.getAssignments({ limit: 50 });
        setAssignments(updated);
      } catch {
        toast.error(t.jockeyDashboard.handoverError);
      }
    }
    setHandoverModal({ open: false, assignment: null });
  };

  const handleAvailabilityToggle = (_available: boolean) => {
    // TODO: Call availability API when endpoint is available
  };

  const handleDetailComplete = async (data: {
    photos: string[];
    customerSignature: string;
    notes: string;
  }) => {
    if (!selectedAssignment) return;
    try {
      await jockeysApi.completeAssignment(selectedAssignment.id, {
        photos: data.photos,
        customerSignature: data.customerSignature,
        ronjaSignature: '',
        notes: data.notes,
      });
      toast.success(
        selectedAssignment.type === 'pickup'
          ? t.jockeyDashboard.pickupCompleted
          : t.jockeyDashboard.returnCompleted
      );
      const { assignments: updated } = await jockeysApi.getAssignments({ limit: 50 });
      setAssignments(updated);
      setSelectedAssignment(null);
    } catch {
      toast.error(t.jockeyDashboard.handoverError);
    }
  };

  // If detail view is active, render it
  if (selectedAssignment) {
    return (
      <JockeyAssignmentDetail
        assignment={selectedAssignment}
        onBack={() => setSelectedAssignment(null)}
        onComplete={handleDetailComplete}
      />
    );
  }

  return (
    <>
      {/* Dark navy header */}
      <header className="bg-gradient-to-r from-[hsl(222,47%,11%)] to-[hsl(217,33%,17%)] px-5 pt-3 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-semibold text-base" data-testid="jockey-greeting">
              {td('greeting', { name: firstName })}
            </p>
            <p className="text-neutral-400 text-xs">{today}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="relative"
              aria-label={t.jockeyDashboard.notifications}
              data-testid="notification-bell"
            >
              <Bell className="w-5 h-5 text-neutral-300" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full text-white text-[9px] flex items-center justify-center font-bold">
                3
              </span>
            </button>
            <div className="w-8 h-8 rounded-full bg-primary/30 border-2 border-primary flex items-center justify-center text-white text-xs font-bold">
              {initials}
            </div>
          </div>
        </div>
      </header>

      {/* Availability toggle */}
      <AvailabilityToggle onToggle={handleAvailabilityToggle} />

      {/* Today summary */}
      <div className="mx-5 mt-3 px-4 py-2.5 bg-[hsl(222,47%,11%)]/5 rounded-xl" data-testid="today-summary">
        <p className="text-xs font-medium text-foreground">
          <span className="font-bold">{td(totalCount === 1 ? 'summaryToday' : 'summaryTodayPlural', { count: totalCount })}</span>
          <span className="text-neutral-400 mx-1.5">&middot;</span>
          <span className="text-primary">{td(pickupCount === 1 ? 'summaryPickups' : 'summaryPickupsPlural', { count: pickupCount })}</span>
          <span className="text-neutral-400 mx-1.5">&middot;</span>
          <span className="text-[hsl(262,83%,58%)]">{td(returnCount === 1 ? 'summaryReturns' : 'summaryReturnsPlural', { count: returnCount })}</span>
        </p>
      </div>

      {/* Main content */}
      <main className="pb-20">
        {isLoading ? (
          <div className="flex items-center justify-center py-12" role="status" aria-label="Loading">
            <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
          </div>
        ) : (
          <>
            {/* Active assignment */}
            {activeAssignment && (
              <div className="mx-5 mt-4">
                <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                  {td('currentAssignment')}
                </p>
                <AssignmentCard
                  assignment={activeAssignment}
                  variant="active"
                  onAction={handleAction}
                  onTap={setSelectedAssignment}
                  getMapsUrl={getMapsUrl}
                />
              </div>
            )}

            {/* If no active, show the first upcoming as "active" style */}
            {!activeAssignment && upcomingAssignment && (
              <div className="mx-5 mt-4">
                <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                  {td('currentAssignment')}
                </p>
                <AssignmentCard
                  assignment={upcomingAssignment}
                  variant="active"
                  onAction={handleAction}
                  onTap={setSelectedAssignment}
                  getMapsUrl={getMapsUrl}
                />
              </div>
            )}

            {/* Upcoming assignment (next after active) */}
            {activeAssignment && upcomingAssignment && (
              <div className="mx-5 mt-5">
                <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                  {td('nextAssignment')}
                </p>
                <AssignmentCard
                  assignment={upcomingAssignment}
                  variant="upcoming"
                  onTap={setSelectedAssignment}
                  getMapsUrl={getMapsUrl}
                />
              </div>
            )}

            {/* Additional upcoming assignments beyond the first */}
            {todayAssignments
              .filter(
                (a) =>
                  a.status === 'upcoming' &&
                  a.id !== upcomingAssignment?.id
              )
              .map((a) => (
                <div key={a.id} className="mx-5 mt-3">
                  <AssignmentCard
                    assignment={a}
                    variant="upcoming"
                    onTap={setSelectedAssignment}
                    getMapsUrl={getMapsUrl}
                  />
                </div>
              ))}

            {/* No assignments state */}
            {totalCount === 0 && (
              <div className="mx-5 mt-8 flex flex-col items-center justify-center text-center py-12">
                <Car className="mb-4 h-12 w-12 text-neutral-300" />
                <p className="text-neutral-400 text-sm">{t.jockeyDashboard.noAssignments}</p>
              </div>
            )}

            {/* Completed today */}
            <div className="mx-5 mt-5 mb-6">
              <button
                onClick={() => setCompletedExpanded(!completedExpanded)}
                className="flex items-center gap-2 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-2 hover:text-neutral-600 min-h-[44px]"
                data-testid="completed-toggle"
              >
                <ChevronRight
                  className={`w-3.5 h-3.5 transition-transform ${completedExpanded ? 'rotate-90' : ''}`}
                />
                {td('completedToday', { count: completedAssignments.length })}
              </button>
              {completedExpanded && (
                <div className="space-y-2">
                  {completedAssignments.length === 0 ? (
                    <div className="bg-neutral-50 rounded-xl p-4 text-center">
                      <p className="text-xs text-neutral-400">{td('noCompletedToday')}</p>
                    </div>
                  ) : (
                    completedAssignments.map((a) => (
                      <AssignmentCard
                        key={a.id}
                        assignment={a}
                        variant="completed"
                        onTap={setSelectedAssignment}
                        getMapsUrl={getMapsUrl}
                      />
                    ))
                  )}
                </div>
              )}
            </div>
          </>
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
    </>
  );
}

export default function JockeyDashboardPage() {
  return (
    <ProtectedRoute requiredRole="jockey">
      <DashboardContent />
    </ProtectedRoute>
  );
}
