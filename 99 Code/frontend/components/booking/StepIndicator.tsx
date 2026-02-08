'use client';

import { Check } from "lucide-react";

interface StepIndicatorProps {
  currentStep: number;
  steps: string[];
}

export function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
  return (
    <div className="mb-8" data-testid="booking-step-indicator">
      {/* Desktop: full circles + lines */}
      <div className="hidden sm:flex items-center justify-center px-4">
        <div className="flex items-center gap-0 w-full max-w-2xl">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber < currentStep;
            const isActive = stepNumber === currentStep;
            return (
              <div key={stepNumber} className="contents">
                <div className="flex flex-col items-center" style={{ minWidth: 70 }}>
                  <div
                    className={`
                      progress-circle
                      ${isCompleted ? 'progress-circle-completed' : ''}
                      ${isActive ? 'progress-circle-active' : ''}
                      ${!isCompleted && !isActive ? 'progress-circle-upcoming' : ''}
                    `}
                  >
                    {isCompleted ? <Check className="h-4 w-4" /> : stepNumber}
                  </div>
                  <span
                    className={`text-xs mt-2 font-medium ${
                      isActive ? 'text-blue-500' : isCompleted ? 'text-green-500' : 'text-gray-400'
                    }`}
                  >
                    {step}
                  </span>
                </div>
                {stepNumber < steps.length && (
                  <div
                    className={`progress-line flex-1 ${
                      isCompleted ? 'progress-line-done' : 'progress-line-pending'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile: compact "Schritt X von Y: Label" + thin bar */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-blue-500">
            {currentStep}/{steps.length}: {steps[currentStep - 1]}
          </span>
        </div>
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-500"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
