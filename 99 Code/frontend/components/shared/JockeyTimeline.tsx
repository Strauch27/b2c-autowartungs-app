'use client';

import { useTranslations, useLocale } from 'next-intl';
import { JockeyAssignmentSummary } from '@/lib/api/bookings';
import { Clock, Navigation, MapPin, CheckCircle2 } from 'lucide-react';

interface JockeyTimelineProps {
  assignment: JockeyAssignmentSummary;
}

const steps = [
  { key: 'scheduled', field: 'scheduledTime' as const, Icon: Clock },
  { key: 'routeStarted', field: 'departedAt' as const, Icon: Navigation },
  { key: 'arrived', field: 'arrivedAt' as const, Icon: MapPin },
  { key: 'handoverComplete', field: 'completedAt' as const, Icon: CheckCircle2 },
];

export function JockeyTimeline({ assignment }: JockeyTimelineProps) {
  const t = useTranslations('jockeyTimeline');
  const locale = useLocale();

  const formatTimestamp = (ts: string | null) => {
    if (!ts) return null;
    const d = new Date(ts);
    return d.toLocaleString(locale === 'de' ? 'de-DE' : 'en-US', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Determine how far the timeline has progressed
  const activeIndex = (() => {
    if (assignment.completedAt) return 3;
    if (assignment.arrivedAt) return 2;
    if (assignment.departedAt) return 1;
    if (assignment.scheduledTime) return 0;
    return -1;
  })();

  const typeLabel = assignment.type === 'PICKUP' ? t('pickup') : t('return');
  const jockeyName = assignment.jockey
    ? [assignment.jockey.firstName, assignment.jockey.lastName].filter(Boolean).join(' ')
    : null;

  return (
    <div className="rounded-xl border border-neutral-200 bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t('title')} — {typeLabel}
        </p>
        {jockeyName && (
          <p className="text-xs text-muted-foreground">
            {t('jockey')}: {jockeyName}
          </p>
        )}
      </div>

      {/* Horizontal timeline */}
      <div className="flex items-start gap-0">
        {steps.map((step, i) => {
          const timestamp = assignment[step.field];
          const isActive = i <= activeIndex;
          const isCurrent = i === activeIndex;
          const formattedTime = formatTimestamp(timestamp);
          const StepIcon = step.Icon;

          return (
            <div key={step.key} className="flex-1 flex flex-col items-center relative">
              {/* Connector line (before dot) */}
              {i > 0 && (
                <div
                  className={`absolute top-3.5 right-1/2 w-full h-0.5 -z-10 ${
                    isActive ? 'bg-emerald-400' : 'bg-neutral-200'
                  }`}
                />
              )}

              {/* Dot / Icon */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center border-2 ${
                  isCurrent
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-600'
                    : isActive
                    ? 'border-emerald-400 bg-emerald-400 text-white'
                    : 'border-neutral-300 bg-white text-neutral-400'
                }`}
              >
                <StepIcon className="w-3.5 h-3.5" />
              </div>

              {/* Label */}
              <p
                className={`mt-1.5 text-[10px] font-medium text-center leading-tight ${
                  isActive ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {t(step.key)}
              </p>

              {/* Timestamp */}
              {formattedTime && (
                <p className="text-[10px] text-muted-foreground text-center mt-0.5">
                  {formattedTime}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
