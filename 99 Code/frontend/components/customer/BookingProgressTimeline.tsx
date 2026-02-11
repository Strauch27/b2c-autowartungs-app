'use client';

import { Check, Settings, CheckCircle, Home } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

interface BookingProgressTimelineProps {
  currentStep: number;
}

export function BookingProgressTimeline({ currentStep }: BookingProgressTimelineProps) {
  const t = useTranslations('customerPortal.progressSteps');

  const steps = [
    { key: 'booked', label: t('booked') },
    { key: 'pickedUp', label: t('pickedUp') },
    { key: 'workshop', label: t('workshop') },
    { key: 'ready', label: t('ready') },
    { key: 'returned', label: t('returned') },
  ];

  return (
    <div className="mb-6" data-testid="booking-progress-timeline">
      <div className="flex items-center w-full">
        {steps.map((step, i) => {
          const isCompleted = i < currentStep;
          const isActive = i === currentStep;
          const isFuture = i > currentStep;

          return (
            <div key={step.key} className="flex items-center flex-1 last:flex-none" data-testid={`progress-step-${i}`}>
              <div className="flex flex-col items-center flex-shrink-0">
                <div
                  className={cn(
                    'w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center',
                    isCompleted && 'bg-emerald-500',
                    isActive && 'bg-blue-500 animate-timeline-pulse',
                    isFuture && 'bg-gray-200'
                  )}
                >
                  {isCompleted && (
                    <Check className="w-5 h-5 text-white" strokeWidth={2.5} />
                  )}
                  {isActive && step.key === 'workshop' && (
                    <Settings className="w-5 h-5 text-white" />
                  )}
                  {isActive && step.key !== 'workshop' && (
                    <div className="w-3 h-3 bg-white rounded-full" />
                  )}
                  {isFuture && (
                    <div className="w-3 h-3 bg-gray-400 rounded-full" />
                  )}
                </div>
                <span
                  className={cn(
                    'text-[10px] sm:text-xs mt-1.5 text-center leading-tight max-w-[56px] sm:max-w-none',
                    isCompleted && 'font-medium text-emerald-500',
                    isActive && 'font-semibold text-blue-500',
                    isFuture && 'font-medium text-gray-400'
                  )}
                >
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={cn(
                    'h-[3px] flex-1 mx-[-2px] rounded-sm',
                    i < currentStep ? 'bg-emerald-500' : 'bg-gray-200'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
