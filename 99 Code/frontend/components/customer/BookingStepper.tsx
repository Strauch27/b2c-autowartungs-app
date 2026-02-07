"use client";

import { useTranslations } from 'next-intl';

interface BookingStepperProps {
  currentStep: number; // 1-based: 1=Fahrzeug, 2=Service, 3=Termin, 4=Bestätigung
}

const stepKeys = ['vehicle', 'service', 'appointment', 'confirmation'] as const;

export function BookingStepper({ currentStep }: BookingStepperProps) {
  const t = useTranslations('bookingStepper');

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {stepKeys.map((key, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;

          return (
            <div key={stepNumber} className="flex items-center flex-1 last:flex-initial">
              <div className="flex items-center space-x-2">
                <div
                  aria-current={isActive ? "step" : undefined}
                  className={`flex h-8 w-8 items-center justify-center rounded-full font-semibold text-sm transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : isCompleted
                      ? "bg-primary/80 text-primary-foreground"
                      : "border-2 border-gray-300 text-gray-400"
                  }`}
                >
                  {isCompleted ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    stepNumber
                  )}
                </div>
                <span
                  className={`text-sm font-medium hidden sm:inline ${
                    isActive || isCompleted ? "text-foreground" : "text-gray-400"
                  }`}
                >
                  {t(key)}
                </span>
              </div>
              {stepNumber < stepKeys.length && (
                <div
                  className={`flex-1 mx-4 border-t-2 ${
                    isCompleted ? "border-primary/60" : "border-gray-300"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
