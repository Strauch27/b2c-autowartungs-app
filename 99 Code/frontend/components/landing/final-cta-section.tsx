'use client';

import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowRight, Calendar } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/useLovableTranslation';

const translations = {
  de: {
    heading: 'Bereit für Ihren Werkstatt-Termin?',
    subheading: 'Über 15.000 zufriedene Kunden haben bereits gebucht. Werden Sie Teil der Ronya-Community!',
    ctaPrimary: 'Jetzt Werkstatt-Termin buchen',
    ctaSecondary: 'Mehr erfahren',
    workshops: 'Werkstätten',
    rating: 'Bewertung',
    bookings: 'Buchungen',
  },
  en: {
    heading: 'Ready for your workshop appointment?',
    subheading: 'Over 15,000 satisfied customers have already booked. Join the Ronya community!',
    ctaPrimary: 'Book workshop appointment now',
    ctaSecondary: 'Learn more',
    workshops: 'Workshops',
    rating: 'Rating',
    bookings: 'Bookings',
  },
};

export function FinalCTASection() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string || 'de';
  const { language } = useLanguage();
  const t = translations[language] || translations.de;

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800">
      <div className="container mx-auto max-w-4xl text-center">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
          {t.heading}
        </h2>
        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
          {t.subheading}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            size="lg"
            onClick={() => router.push(`/${locale}/customer/login`)}
            className="h-14 px-8 text-lg bg-orange-500 hover:bg-orange-600 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            <Calendar className="h-6 w-6 mr-2" />
            {t.ctaPrimary}
            <ArrowRight className="ml-2 h-6 w-6" />
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={() => router.push(`/${locale}`)}
            className="h-14 px-8 text-lg bg-white/10 hover:bg-white/20 text-white border-2 border-white/50 backdrop-blur-sm"
          >
            {t.ctaSecondary}
          </Button>
        </div>

        <div className="mt-12 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-white mb-1">200+</div>
            <div className="text-sm text-blue-200">{t.workshops}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-white mb-1">4.5★</div>
            <div className="text-sm text-blue-200">{t.rating}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-white mb-1">15k+</div>
            <div className="text-sm text-blue-200">{t.bookings}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
