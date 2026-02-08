'use client';

import { CheckCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface StatusTimelineProps {
  currentStatus: string;
  timestamps?: Record<string, string>;
}

export function StatusTimeline({ currentStatus, timestamps = {} }: StatusTimelineProps) {
  const t = useTranslations('workshopDashboard.detail');

  const steps = [
    {
      key: 'received',
      label: t('received'),
      completed: true, // always completed if order exists
    },
    {
      key: 'inProgress',
      label: t('statusTimeline') === 'Status Timeline' ? 'In Progress' : 'In Bearbeitung',
      completed: currentStatus === 'inProgress' || currentStatus === 'completed',
      current: currentStatus === 'inProgress',
    },
    {
      key: 'completed',
      label: t('markCompleted').replace('Als abgeschlossen markieren', 'Abgeschlossen').replace('Mark as Completed', 'Completed'),
      completed: currentStatus === 'completed',
    },
  ];

  // Provide cleaner labels using the i18n keys
  steps[0].label = t('received');
  steps[1].label = t('statusTimeline') !== 'Status-Verlauf' ? 'In Progress' : 'In Bearbeitung';
  steps[2].label = t('statusTimeline') !== 'Status-Verlauf' ? 'Completed' : 'Abgeschlossen';

  return (
    <div className="flex items-center gap-0" data-testid="status-timeline">
      {steps.map((step, index) => (
        <div key={step.key} className="flex items-center">
          <div className="flex flex-col items-center">
            {step.completed ? (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-success">
                <CheckCircle className="h-3.5 w-3.5 text-success-foreground" />
              </div>
            ) : step.current ? (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-cta animate-pulse-dot">
                <div className="h-2.5 w-2.5 rounded-full bg-white" />
              </div>
            ) : (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-200">
                <div className="h-2.5 w-2.5 rounded-full bg-neutral-300" />
              </div>
            )}
            <p className={`mt-1 text-[9px] ${step.current ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
              {step.label}
            </p>
            {timestamps[step.key] && (
              <p className="text-[9px] text-neutral-300">{timestamps[step.key]}</p>
            )}
          </div>
          {index < steps.length - 1 && (
            <div className={`mx-1 h-0.5 w-12 flex-1 ${step.completed ? 'bg-success' : 'bg-neutral-200'}`} />
          )}
        </div>
      ))}
    </div>
  );
}
