'use client';

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  currentStep: number;
  steps: string[];
}

export function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((_, index) => {
          const stepNumber = index + 1;
          return (
            <div key={stepNumber} className="flex items-center">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                  stepNumber < currentStep
                    ? "bg-success text-success-foreground"
                    : stepNumber === currentStep
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {stepNumber < currentStep ? <Check className="h-5 w-5" /> : stepNumber}
              </div>
              {stepNumber < steps.length && (
                <div
                  className={cn(
                    "hidden h-1 w-16 sm:block md:w-24 lg:w-32",
                    stepNumber < currentStep ? "bg-success" : "bg-muted"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex justify-between text-xs text-muted-foreground">
        {steps.map((step, index) => (
          <span key={index}>{step}</span>
        ))}
      </div>
    </div>
  );
}
