'use client';

import { useTranslations } from 'next-intl';

export function TrustSection() {
  const t = useTranslations('landing.trust');

  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="container mx-auto max-w-4xl text-center">
        <h2 className="text-3xl font-bold mb-8">{t('title')}</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <div className="text-4xl font-bold text-blue-600 mb-2">{t('workshops')}</div>
            <p className="text-gray-600">{t('workshopsLabel')}</p>
          </div>
          <div>
            <div className="text-4xl font-bold text-blue-600 mb-2">{t('customers')}</div>
            <p className="text-gray-600">{t('customersLabel')}</p>
          </div>
          <div>
            <div className="text-4xl font-bold text-blue-600 mb-2">{t('rating')}</div>
            <p className="text-gray-600">{t('ratingLabel')}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
