import { Car, ClipboardList, CalendarCheck } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

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

        <div className="relative">
          {/* Connecting Line - Desktop */}
          <div className="absolute left-1/2 top-8 hidden h-0.5 w-2/3 -translate-x-1/2 bg-gradient-to-r from-primary/20 via-primary to-primary/20 lg:block" />

          <div className="grid gap-12 lg:grid-cols-3 lg:gap-8">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className="relative text-center animate-fade-in-up"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Step Number */}
                <div className="relative mx-auto mb-6">
                  <div className="step-indicator mx-auto shadow-card">
                    {step.number}
                  </div>
                  {/* Icon Badge */}
                  <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-cta text-cta-foreground shadow-lg">
                    <step.icon className="h-4 w-4" />
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
