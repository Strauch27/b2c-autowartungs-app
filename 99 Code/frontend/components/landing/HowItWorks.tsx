'use client';

import { CalendarCheck, MapPin, Settings, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/useLovableTranslation';

const translations = {
  de: {
    overline: "So einfach geht's",
    title: 'In 4 Schritten zum Service',
    subtitle: 'Kein Werkstattbesuch, kein Zeitverlust. Wir erledigen alles für Sie.',
    steps: [
      { label: 'Schritt 1', title: 'Online buchen', description: 'Wählen Sie Fahrzeug, Service und Wunschtermin in nur 2 Minuten.' },
      { label: 'Schritt 2', title: 'Wir holen ab', description: 'Unser Fahrer holt Ihr Fahrzeug zum Wunschtermin bei Ihnen ab.' },
      { label: 'Schritt 3', title: 'Werkstatt-Service', description: 'Zertifizierte Partnerwerkstätten führen den Service fachgerecht durch.' },
      { label: 'Schritt 4', title: 'Rückgabe', description: 'Ihr Fahrzeug wird fertig gewartet direkt zu Ihnen zurückgebracht.' },
    ],
  },
  en: {
    overline: 'How it works',
    title: 'Your service in 4 steps',
    subtitle: 'No workshop visits, no wasted time. We handle everything for you.',
    steps: [
      { label: 'Step 1', title: 'Book online', description: 'Choose your vehicle, service, and preferred time slot in just 2 minutes.' },
      { label: 'Step 2', title: 'We pick up', description: 'Our driver picks up your vehicle at your preferred time and location.' },
      { label: 'Step 3', title: 'Workshop service', description: 'Certified partner workshops perform the service professionally.' },
      { label: 'Step 4', title: 'Return', description: 'Your vehicle is delivered back to you fully serviced.' },
    ],
  },
};

const stepIcons = [CalendarCheck, MapPin, Settings, CheckCircle];
const stepGradients = [
  'from-blue-500 to-blue-600 shadow-blue-500/25',
  'from-blue-400 to-blue-500 shadow-blue-400/25',
  'from-amber-400 to-amber-500 shadow-amber-400/25',
  'from-green-400 to-green-500 shadow-green-400/25',
];
const stepLabelColors = ['text-blue-500', 'text-blue-500', 'text-amber-500', 'text-green-500'];

const HowItWorks = () => {
  const { language } = useLanguage();
  const t = translations[language] || translations.de;

  return (
    <section
      id="how-it-works"
      className="py-20 md:py-28 bg-muted/50"
      data-testid="how-it-works-section"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-16">
          <span className="text-primary font-semibold text-sm uppercase tracking-widest">
            {t.overline}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mt-3">{t.title}</h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">{t.subtitle}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-4 relative">
          {/* Connecting line (desktop only) */}
          <div className="hidden md:block absolute top-[52px] left-[12.5%] right-[12.5%] h-[3px] bg-gradient-to-r from-blue-500 via-blue-400 to-blue-300 z-0 rounded-full" />

          {t.steps.map((step, index) => {
            const Icon = stepIcons[index];
            return (
              <div
                key={index}
                className="text-center relative z-10"
              >
                <div
                  className={`w-[68px] h-[68px] rounded-2xl bg-gradient-to-br ${stepGradients[index]} mx-auto flex items-center justify-center shadow-lg mb-5`}
                >
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
                  <span className={`${stepLabelColors[index]} font-bold text-sm`}>
                    {step.label}
                  </span>
                  <h3 className="font-bold text-lg mt-2 mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-sm">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
