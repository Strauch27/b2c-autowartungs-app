'use client';

import { ClipboardCheck, Droplets, ShieldCheck, RefreshCw, Settings } from 'lucide-react';
import { LandingServiceCard } from './landing-service-card';
import { useLanguage } from '@/lib/i18n/useLovableTranslation';

const serviceData = [
  {
    key: 'inspection',
    iconColor: 'bg-blue-50',
    iconTextColor: 'text-blue-500',
    priceColor: 'text-blue-500',
    Icon: ClipboardCheck,
  },
  {
    key: 'oilChange',
    iconColor: 'bg-amber-50',
    iconTextColor: 'text-amber-500',
    priceColor: 'text-amber-500',
    Icon: Droplets,
  },
  {
    key: 'brakes',
    iconColor: 'bg-red-50',
    iconTextColor: 'text-red-500',
    priceColor: 'text-red-500',
    Icon: ({ className }: { className?: string }) => (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" strokeWidth="2" />
        <circle cx="12" cy="12" r="4" strokeWidth="2" />
      </svg>
    ),
  },
  {
    key: 'tires',
    iconColor: 'bg-green-50',
    iconTextColor: 'text-green-500',
    priceColor: 'text-green-500',
    Icon: RefreshCw,
  },
  {
    key: 'tuv',
    iconColor: 'bg-purple-50',
    iconTextColor: 'text-purple-500',
    priceColor: 'text-purple-500',
    Icon: ShieldCheck,
  },
  {
    key: 'maintenance',
    iconColor: 'bg-indigo-50',
    iconTextColor: 'text-indigo-500',
    priceColor: 'text-indigo-500',
    Icon: Settings,
  },
];

// Hardcoded translations to avoid adding new namespaces to the Lovable adapter
const translations = {
  de: {
    overline: 'Unsere Services',
    title: 'Alles für Ihr Fahrzeug',
    subtitle: 'Professionelle Wartung und Reparatur zum transparenten Festpreis.',
    items: {
      inspection: { title: 'Inspektion', description: 'Komplette Fahrzeugprüfung nach Herstellervorgaben inkl. Protokoll.', price: 'ab 149 €', duration: '60–90 Min.' },
      oilChange: { title: 'Ölwechsel', description: 'Motoröl und Filter wechseln mit Premium-Markenprodukten.', price: 'ab 89 €', duration: '30–45 Min.' },
      brakes: { title: 'Bremsservice', description: 'Bremsbeläge, Scheiben und Flüssigkeit prüfen und erneuern.', price: 'ab 199 €', duration: '90–120 Min.' },
      tires: { title: 'Reifenwechsel', description: 'Saisonaler Reifenwechsel inkl. Auswuchten und Reifencheck.', price: 'ab 59 €', duration: '30–45 Min.' },
      tuv: { title: 'TÜV / HU', description: 'Hauptuntersuchung mit Abgasuntersuchung bei TÜV-Partnern.', price: 'ab 119 €', duration: '60–90 Min.' },
      maintenance: { title: 'Wartung', description: 'Komplettservice nach Herstellerplan mit allen Verschleißteilen.', price: 'ab 249 €', duration: '2–4 Std.' },
    },
  },
  en: {
    overline: 'Our Services',
    title: 'Everything for your vehicle',
    subtitle: 'Professional maintenance and repair at transparent fixed prices.',
    items: {
      inspection: { title: 'Inspection', description: 'Complete vehicle inspection according to manufacturer specifications incl. report.', price: 'from 149 EUR', duration: '60-90 min.' },
      oilChange: { title: 'Oil change', description: 'Engine oil and filter change with premium brand products.', price: 'from 89 EUR', duration: '30-45 min.' },
      brakes: { title: 'Brake service', description: 'Brake pads, discs, and fluid inspection and renewal.', price: 'from 199 EUR', duration: '90-120 min.' },
      tires: { title: 'Tire change', description: 'Seasonal tire change including balancing and tire check.', price: 'from 59 EUR', duration: '30-45 min.' },
      tuv: { title: 'MOT / Inspection', description: 'Main inspection with emissions test at certified partners.', price: 'from 119 EUR', duration: '60-90 min.' },
      maintenance: { title: 'Full service', description: 'Complete service according to manufacturer schedule with all wear parts.', price: 'from 249 EUR', duration: '2-4 hrs.' },
    },
  },
};

export function ServicesShowcase() {
  const { language } = useLanguage();
  const t = translations[language] || translations.de;

  return (
    <section id="services" className="py-20 md:py-28 bg-card" data-testid="services-section">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-16">
          <span className="text-primary font-semibold text-sm uppercase tracking-widest">
            {t.overline}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mt-3">{t.title}</h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">{t.subtitle}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {serviceData.map((svc) => {
            const item = t.items[svc.key as keyof typeof t.items];
            return (
              <LandingServiceCard
                key={svc.key}
                icon={<svc.Icon className={`w-7 h-7 ${svc.iconTextColor}`} />}
                title={item.title}
                description={item.description}
                price={item.price}
                duration={item.duration}
                colorClass={svc.iconColor}
                priceColorClass={svc.priceColor}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
