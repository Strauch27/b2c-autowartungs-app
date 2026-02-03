'use client';

import { useTranslations } from 'next-intl';

/**
 * USP Section - Optimized for Sprint 14 (US-20.10)
 *
 * Improvements:
 * - Fully visible text (no truncation)
 * - Better responsive layout
 * - Improved readability
 * - Internationalized with next-intl
 */
export function USPSection() {
  const t = useTranslations('landing.usp');

  const usps = [
    { icon: '💰', key: 'transparentPricing' },
    { icon: '⚡', key: 'fastBooking' },
    { icon: '🔒', key: 'securePayment' },
    { icon: '⭐', key: 'certifiedWorkshops' },
  ];

  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-3xl font-bold text-center mb-4">{t('title')}</h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          {t('subtitle')}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {usps.map((usp, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow-sm text-center flex flex-col items-center min-h-[200px]"
            >
              <div className="text-5xl mb-4">{usp.icon}</div>
              <h3 className="font-semibold text-lg mb-3 leading-tight">
                {t(`${usp.key}.title`)}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {t(`${usp.key}.description`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
