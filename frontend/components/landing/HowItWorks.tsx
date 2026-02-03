'use client';

import { Car, ClipboardList, CalendarCheck } from "lucide-react";
import { useLanguage } from "@/lib/i18n/useLovableTranslation";

const HowItWorks = () => {
  const { t } = useLanguage();

  const steps = [
    {
      number: 1,
      icon: Car,
      title: t.howItWorks.steps.vehicle.title,
      description: t.howItWorks.steps.vehicle.description,
    },
    {
      number: 2,
      icon: ClipboardList,
      title: t.howItWorks.steps.service.title,
      description: t.howItWorks.steps.service.description,
    },
    {
      number: 3,
      icon: CalendarCheck,
      title: t.howItWorks.steps.booking.title,
      description: t.howItWorks.steps.booking.description,
    },
  ];

  return (
    <section className="section-spacing">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
            {t.howItWorks.title}
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            {t.howItWorks.subtitle}
          </p>
        </div>

        <div className="relative max-w-5xl mx-auto">
          {/* Connecting Dots - Desktop */}
          <div className="absolute top-10 left-0 right-0 hidden lg:flex items-center justify-center px-32">
            <div className="flex-1 flex items-center justify-around">
              <div className="w-3 h-3 rounded-full bg-cta"></div>
              <div className="w-3 h-3 rounded-full bg-cta"></div>
            </div>
          </div>

          <div className="grid gap-12 lg:grid-cols-3 lg:gap-8">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className="relative text-center animate-fade-in-up"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Step Circle with Icon */}
                <div className="relative mx-auto mb-6 w-20 h-20">
                  <div className="w-20 h-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
                    <step.icon className="h-10 w-10" />
                  </div>
                  {/* Step Number Badge */}
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-cta text-cta-foreground flex items-center justify-center text-sm font-bold shadow-md">
                    {step.number}
                  </div>
                </div>

                {/* Content */}
                <h3 className="mb-3 text-xl font-semibold">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
