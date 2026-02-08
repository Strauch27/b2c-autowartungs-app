'use client';

import { Star } from 'lucide-react';
import { AnimatedCounter } from './animated-counter';
import { TestimonialCard } from './testimonial-card';
import { useLanguage } from '@/lib/i18n/useLovableTranslation';

const translations = {
  de: {
    vehiclesServedLabel: 'Fahrzeuge betreut',
    partnerWorkshopsLabel: 'Partnerwerkstätten',
    averageRatingLabel: 'Durchschnittsbewertung',
    testimonialsOverline: 'Kundenstimmen',
    testimonialsTitle: 'Das sagen unsere Kunden',
    testimonials: [
      {
        text: 'Absolut unkompliziert! Auto morgens abgeholt, abends fertig zurückgebracht. Besser als jeder Werkstattbesuch. Kann ich nur empfehlen.',
        author: 'Marcus T.',
        vehicle: 'BMW 3er, Inspektion',
        rating: 5,
      },
      {
        text: 'Super Service! Der Fahrer war pünktlich, freundlich und das Auto kam sauber zurück. Der Festpreis war auch genau wie angegeben.',
        author: 'Sandra K.',
        vehicle: 'Audi A4, Ölwechsel',
        rating: 5,
      },
      {
        text: 'Habe den TÜV-Service genutzt. Alles online gebucht, keine Wartezeiten, Plakette drauf. So muss das sein! Preis-Leistung top.',
        author: 'Jan R.',
        vehicle: 'VW Golf, TÜV/HU',
        rating: 4,
      },
    ],
    partnersLabel: 'Unsere Partnerwerkstätten',
  },
  en: {
    vehiclesServedLabel: 'Vehicles serviced',
    partnerWorkshopsLabel: 'Partner workshops',
    averageRatingLabel: 'Average rating',
    testimonialsOverline: 'Customer reviews',
    testimonialsTitle: 'What our customers say',
    testimonials: [
      {
        text: 'Absolutely hassle-free! Car picked up in the morning, returned fully serviced in the evening. Better than any workshop visit. Highly recommend.',
        author: 'Marcus T.',
        vehicle: 'BMW 3 Series, Inspection',
        rating: 5,
      },
      {
        text: 'Great service! The driver was on time, friendly, and the car came back clean. The fixed price was exactly as quoted.',
        author: 'Sandra K.',
        vehicle: 'Audi A4, Oil change',
        rating: 5,
      },
      {
        text: 'Used the MOT service. Booked everything online, no waiting times, sticker done. That\'s how it should be! Great value.',
        author: 'Jan R.',
        vehicle: 'VW Golf, MOT',
        rating: 4,
      },
    ],
    partnersLabel: 'Our partner workshops',
  },
};

const testimonialColors = [
  'bg-blue-100 text-blue-600',
  'bg-green-100 text-green-600',
  'bg-amber-100 text-amber-600',
];

export function TrustSocialProof() {
  const { language } = useLanguage();
  const t = translations[language] || translations.de;

  return (
    <section id="trust" className="py-20 md:py-28 bg-muted/50" data-testid="trust-section">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-12 md:gap-20 mb-20">
          <div className="text-center">
            <AnimatedCounter target={1247} />
            <p className="text-muted-foreground mt-2 font-medium">{t.vehiclesServedLabel}</p>
          </div>
          <div className="text-center">
            <AnimatedCounter target={48} />
            <p className="text-muted-foreground mt-2 font-medium">{t.partnerWorkshopsLabel}</p>
          </div>
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-foreground">4.9</div>
            <div className="flex justify-center text-cta mt-1 text-lg">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="h-5 w-5 fill-cta text-cta" />
              ))}
            </div>
            <p className="text-muted-foreground mt-1 font-medium">{t.averageRatingLabel}</p>
          </div>
        </div>

        {/* Testimonials */}
        <div className="text-center mb-12">
          <span className="text-primary font-semibold text-sm uppercase tracking-widest">
            {t.testimonialsOverline}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mt-3">{t.testimonialsTitle}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {t.testimonials.map((testimonial, index) => (
            <div key={index}>
              <TestimonialCard
                text={testimonial.text}
                author={testimonial.author}
                vehicle={testimonial.vehicle}
                rating={testimonial.rating}
                colorClass={testimonialColors[index]}
              />
            </div>
          ))}
        </div>

        {/* Partner Logos */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground text-sm uppercase tracking-widest mb-6">
            {t.partnersLabel}
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-40">
            {['Bosch', 'ATU', 'Euromaster', 'Vergolst', 'Pitstop'].map((name) => (
              <span key={name} className="text-2xl font-bold text-muted-foreground">
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
