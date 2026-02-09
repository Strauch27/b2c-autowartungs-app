'use client';

import { MapPin, Calendar, CheckCircle, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/useLovableTranslation';

const translations = {
  de: {
    heading: 'So einfach geht\'s',
    subheading: 'In nur 3 Schritten zum Werkstatt-Termin',
    steps: [
      {
        title: 'Werkstatt wählen',
        description: 'Finden Sie die perfekte Werkstatt in Ihrer Nähe mit transparenten Bewertungen.',
      },
      {
        title: 'Termin buchen',
        description: 'Wählen Sie Ihren Wunschtermin und Service mit garantiertem Festpreis.',
      },
      {
        title: 'Fertig!',
        description: 'Erhalten Sie sofort eine Bestätigung und bringen Sie Ihr Auto zur Werkstatt.',
      },
    ],
  },
  en: {
    heading: "It's that simple",
    subheading: 'Your workshop appointment in just 3 steps',
    steps: [
      {
        title: 'Choose Workshop',
        description: 'Find the perfect workshop near you with transparent reviews.',
      },
      {
        title: 'Book Appointment',
        description: 'Choose your preferred date and service with a guaranteed fixed price.',
      },
      {
        title: 'Done!',
        description: 'Receive instant confirmation and bring your car to the workshop.',
      },
    ],
  },
};

const stepStyles = [
  { number: '1', icon: MapPin, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  { number: '2', icon: Calendar, color: 'text-purple-600', bgColor: 'bg-purple-50' },
  { number: '3', icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50' },
];

export function HowItWorksSteps() {
  const { language } = useLanguage();
  const t = translations[language] || translations.de;

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t.heading}
          </h2>
          <p className="text-xl text-gray-600">
            {t.subheading}
          </p>
        </div>

        <div className="relative">
          {/* Desktop: Horizontal Layout with Arrows */}
          <div className="hidden md:flex items-start justify-between">
            {t.steps.map((step, index) => {
              const style = stepStyles[index];
              const Icon = style.icon;
              return (
                <div key={index} className="flex items-start gap-4 flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div className={`relative w-24 h-24 rounded-full ${style.bgColor} flex items-center justify-center mb-4 shadow-medium`}>
                      <Icon className={`h-10 w-10 ${style.color}`} />
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        {style.number}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 text-center max-w-xs">
                      {step.description}
                    </p>
                  </div>

                  {index < t.steps.length - 1 && (
                    <div className="flex items-center justify-center pt-12 px-4">
                      <ArrowRight className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Mobile: Vertical Layout */}
          <div className="md:hidden space-y-8">
            {t.steps.map((step, index) => {
              const style = stepStyles[index];
              const Icon = style.icon;
              return (
                <div key={index} className="flex gap-4">
                  <div className={`relative w-16 h-16 rounded-full ${style.bgColor} flex items-center justify-center flex-shrink-0 shadow-medium`}>
                    <Icon className={`h-7 w-7 ${style.color}`} />
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-xs">
                      {style.number}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-gray-600">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
