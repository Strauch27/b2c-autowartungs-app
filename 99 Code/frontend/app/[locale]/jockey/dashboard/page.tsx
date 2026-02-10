'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useUser } from '@/lib/auth-hooks';
import { Bell, Loader2, ChevronRight, ChevronLeft, Car, CalendarDays } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/useLovableTranslation';
import { useTranslations, useLocale } from 'next-intl';
import HandoverModal from '@/components/jockey/HandoverModal';
import { AssignmentCard, AssignmentCardAssignment } from '@/components/jockey/AssignmentCard';
import { AvailabilityToggle } from '@/components/jockey/AvailabilityToggle';
import { JockeyAssignmentDetail } from '@/components/jockey/JockeyAssignmentDetail';
import { jockeysApi, JockeyAssignment } from '@/lib/api/jockeys';
import { resolveVehicleDisplay } from '@/lib/constants/vehicles';
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
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [upcomingExpanded, setUpcomingExpanded] = useState(true);

  const formatDateStr = useCallback((date: Date) => {
    return date.toISOString().slice(0, 10);
  }, []);

  const selectedDateStr = formatDateStr(selectedDate);
  const todayStr = formatDateStr(new Date());
  const isToday = selectedDateStr === todayStr;

  const navigateDate = useCallback((offset: number) => {
    setSelectedDate(prev => {
      const next = new Date(prev);
      next.setDate(next.getDate() + offset);
      return next;
    });
  }, []);

  const goToToday = useCallback(() => {
    setSelectedDate(new Date());
  }, []);

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

  const headerDateStr = new Date().toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const selectedDateDisplay = selectedDate.toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  const locale = useLocale();
  const pathname = usePathname();
  const switchLocale = (newLocale: string) => {
    router.push(pathname.replace(`/${locale}`, `/${newLocale}`));
  };

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
      assignments.map((a) => {
        const vd = resolveVehicleDisplay(a.vehicleBrand || '', a.vehicleModel || '');
        return {
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
          vehicle: `${vd.brandName} ${language === 'en' && vd.modelNameEn ? vd.modelNameEn : vd.modelName}`,
          vehicleBrandLogo: vd.brandLogo,
          licensePlate: a.vehicleLicensePlate || '',
          status: mapStatus(a.status),
          type: mapType(a.type),
        };
      }),
    [assignments, language]
  );

  // Categorize assignments for selected date
  const selectedDayAssignments = displayAssignments.filter((a) => a.scheduledDate === selectedDateStr);

  const activeAssignment = selectedDayAssignments.find(
    (a) => a.status === 'inProgress' || a.status === 'atLocation'
  );
  const upcomingAssignment = selectedDayAssignments.find(
    (a) => a.status === 'upcoming'
  );
  const completedAssignments = selectedDayAssignments.filter(
    (a) => a.status === 'completed'
  );

  // Stats for selected date
  const pickupCount = selectedDayAssignments.filter((a) => a.type === 'pickup' && a.status !== 'cancelled').length;
  const returnCount = selectedDayAssignments.filter((a) => a.type === 'return' && a.status !== 'cancelled').length;
  const totalCount = selectedDayAssignments.filter((a) => a.status !== 'cancelled').length;

  // Upcoming assignments (next 7 days, excluding selected date)
  const upcomingDays = useMemo(() => {
    const days: { dateStr: string; label: string; assignments: AssignmentCardAssignment[] }[] = [];
    const now = new Date();
    for (let i = 1; i <= 7; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().slice(0, 10);
      if (dateStr === selectedDateStr) continue;
      const dayAssignments = displayAssignments.filter(
        (a) => a.scheduledDate === dateStr && a.status !== 'cancelled'
      );
      if (dayAssignments.length > 0) {
        const label = d.toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
        });
        days.push({ dateStr, label, assignments: dayAssignments });
      }
    }
    return days;
  }, [displayAssignments, selectedDateStr, language]);

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
    } else if (action === 'arrived') {
      if (!window.confirm(t.jockeyDashboard.confirmAction)) return;
      try {
        await jockeysApi.updateStatus(id, { status: 'AT_LOCATION' });
        toast.success(language === 'de' ? 'Angekommen' : 'Arrived');
        const { assignments: updated } = await jockeysApi.getAssignments({ limit: 50 });
        setAssignments(updated);
      } catch {
        toast.error(language === 'de' ? 'Status-Update fehlgeschlagen' : 'Status update failed');
      }
    } else if (action === 'complete_handover') {
      const assignment = displayAssignments.find((a) => a.id === id);
      if (assignment) {
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
            <p className="text-neutral-400 text-xs">{headerDateStr}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-0.5 rounded-lg bg-white/10 p-0.5">
              <button
                onClick={() => switchLocale('de')}
                className={`px-2 py-1 text-[11px] font-semibold rounded-md transition-colors ${locale === 'de' ? 'bg-white/20 text-white' : 'text-neutral-400 hover:text-white'}`}
              >DE</button>
              <button
                onClick={() => switchLocale('en')}
                className={`px-2 py-1 text-[11px] font-semibold rounded-md transition-colors ${locale === 'en' ? 'bg-white/20 text-white' : 'text-neutral-400 hover:text-white'}`}
              >EN</button>
            </div>
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

      {/* Date picker */}
      <div className="mx-5 mt-3 flex items-center justify-between bg-[hsl(222,47%,11%)]/5 rounded-xl px-2 py-1.5" data-testid="date-picker">
        <button
          onClick={() => navigateDate(-1)}
          className="p-2 rounded-lg hover:bg-neutral-200/50 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label={td('previousDay')}
        >
          <ChevronLeft className="w-4 h-4 text-neutral-600" />
        </button>
        <button
          onClick={goToToday}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-neutral-200/50 transition-colors"
          data-testid="date-display"
        >
          <CalendarDays className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">
            {isToday ? td('today') : selectedDateDisplay}
          </span>
          {!isToday && (
            <span className="text-[10px] text-primary font-medium">
              {td('backToToday')}
            </span>
          )}
        </button>
        <button
          onClick={() => navigateDate(1)}
          className="p-2 rounded-lg hover:bg-neutral-200/50 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label={td('nextDay')}
        >
          <ChevronRight className="w-4 h-4 text-neutral-600" />
        </button>
      </div>

      {/* Day summary */}
      <div className="mx-5 mt-2 px-4 py-2.5 bg-[hsl(222,47%,11%)]/5 rounded-xl" data-testid="today-summary">
        <p className="text-xs font-medium text-foreground">
          <span className="font-bold">{td(totalCount === 1 ? 'summaryDay' : 'summaryDayPlural', { count: totalCount })}</span>
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
            {selectedDayAssignments
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

            {/* Completed for selected day */}
            <div className="mx-5 mt-5">
              <button
                onClick={() => setCompletedExpanded(!completedExpanded)}
                className="flex items-center gap-2 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-2 hover:text-neutral-600 min-h-[44px]"
                data-testid="completed-toggle"
              >
                <ChevronRight
                  className={`w-3.5 h-3.5 transition-transform ${completedExpanded ? 'rotate-90' : ''}`}
                />
                {td('completedCount', { count: completedAssignments.length })}
              </button>
              {completedExpanded && (
                <div className="space-y-2">
                  {completedAssignments.length === 0 ? (
                    <div className="bg-neutral-50 rounded-xl p-4 text-center">
                      <p className="text-xs text-neutral-400">{td('noCompletedYet')}</p>
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

            {/* Upcoming assignments (next 7 days) */}
            {upcomingDays.length > 0 && (
              <div className="mx-5 mt-6 mb-6">
                <button
                  onClick={() => setUpcomingExpanded(!upcomingExpanded)}
                  className="flex items-center gap-2 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-3 hover:text-neutral-600 min-h-[44px]"
                  data-testid="upcoming-toggle"
                >
                  <ChevronRight
                    className={`w-3.5 h-3.5 transition-transform ${upcomingExpanded ? 'rotate-90' : ''}`}
                  />
                  {td('upcomingAssignments')}
                </button>
                {upcomingExpanded && (
                  <div className="space-y-4">
                    {upcomingDays.map((day) => (
                      <div key={day.dateStr}>
                        <p className="text-[11px] font-semibold text-neutral-500 mb-2">
                          {day.label} <span className="text-neutral-400 font-normal">({day.assignments.length})</span>
                        </p>
                        <div className="space-y-2">
                          {day.assignments.map((a) => (
                            <AssignmentCard
                              key={a.id}
                              assignment={a}
                              variant="upcoming"
                              onTap={setSelectedAssignment}
                              getMapsUrl={getMapsUrl}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {upcomingDays.length === 0 && <div className="mb-6" />}
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
