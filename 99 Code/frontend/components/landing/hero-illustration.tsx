'use client';

import { useLanguage } from '@/lib/i18n/useLovableTranslation';

const translations = {
  de: { fixedPrice: 'Festpreis', freePickup: 'Kostenlose Abholung' },
  en: { fixedPrice: 'Fixed price', freePickup: 'Free pickup' },
};

export function HeroIllustration() {
  const { language } = useLanguage();
  const t = translations[language] || translations.de;

  return (
    <div className="hidden md:flex justify-center items-center relative">
      <div className="w-80 h-80 rounded-full bg-gradient-to-br from-primary/20 to-cta/10 flex items-center justify-center relative">
        <div
          className="absolute inset-4 rounded-full border-2 border-dashed border-white/10 animate-spin"
          style={{ animationDuration: '30s' }}
        />
        <svg
          className="w-40 h-40 text-white/80"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
        >
          <path
            d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-2-2.1-3.3C13.2 5.6 12 5 10.8 5H5.6c-.8 0-1.5.4-1.9 1L2 9c-.7 1.1-1 2.3-1 3.6V16c0 .6.4 1 1 1h2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="7" cy="17" r="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="17" cy="17" r="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div className="absolute -top-4 -right-4 bg-cta text-white rounded-2xl px-4 py-2 font-bold text-sm shadow-lg shadow-cta/30">
          {t.fixedPrice}
        </div>
        <div className="absolute -bottom-2 -left-4 bg-success text-white rounded-2xl px-4 py-2 font-bold text-sm shadow-lg shadow-success/30">
          {t.freePickup}
        </div>
      </div>
    </div>
  );
}
