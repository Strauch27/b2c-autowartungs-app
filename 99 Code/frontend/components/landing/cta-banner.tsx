'use client';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/useLovableTranslation';

const translations = {
  de: {
    title: 'Bereit? Buchen Sie in 2 Minuten!',
    subtitle: 'Kein Anruf, kein Warten. Wählen Sie Ihren Service und wir kümmern uns um den Rest.',
    cta: 'Jetzt Service buchen',
  },
  en: {
    title: 'Ready? Book in 2 minutes!',
    subtitle: 'No calls, no waiting. Choose your service and we take care of the rest.',
    cta: 'Book service now',
  },
};

export function CTABanner() {
  const { language } = useLanguage();
  const params = useParams();
  const locale = (params.locale as string) || 'de';
  const t = translations[language] || translations.de;

  return (
    <section
      className="py-16 relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, hsl(var(--cta)), hsl(var(--cta-hover)))`,
      }}
      data-testid="cta-banner"
    >
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full translate-x-1/4 translate-y-1/4" />
      </div>
      <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          {t.title}
        </h2>
        <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
          {t.subtitle}
        </p>
        <Link
          href={`/${locale}/booking`}
          className="inline-flex items-center gap-2 bg-white text-cta font-bold px-8 py-4 rounded-xl hover:bg-neutral-50 transition shadow-lg hover:shadow-xl"
        >
          {t.cta}
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </section>
  );
}
