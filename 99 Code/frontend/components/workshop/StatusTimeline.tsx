'use client';

import { CheckCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface StatusTimelineProps {
  currentStatus: string;
  timestamps?: Record<string, string>;
}

export function StatusTimeline({ currentStatus, timestamps = {} }: StatusTimelineProps) {
  const t = useTranslations('workshopModal.orderDetails.steps');

  const steps = [
    {
      key: 'received',
      label: t('received'),
      completed: true, // always completed if order exists
    },
    {
      key: 'inProgress',
      label: t('inProgress'),
      completed: currentStatus === 'inProgress' || currentStatus === 'completed',
      current: currentStatus === 'inProgress',
    },
    {
      key: 'completed',
      label: t('completed'),
      completed: currentStatus === 'completed',
    },
  ];

  return (
    <div className="flex items-center justify-between" data-testid="status-timeline">
      {steps.map((step, index) => (
        <div key={step.key} className="flex flex-1 items-center">
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
            <p className={`mt-1 text-[9px] sm:text-[10px] ${step.current ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
              {step.label}
            </p>
            {timestamps[step.key] && (
              <p className="text-[9px] text-neutral-300">{timestamps[step.key]}</p>
            )}
          </div>
          {index < steps.length - 1 && (
            <div className={`mx-1 h-0.5 w-8 flex-1 sm:w-12 ${step.completed ? 'bg-success' : 'bg-neutral-200'}`} />
          )}
        </div>
      ))}
    </div>
  );
}
