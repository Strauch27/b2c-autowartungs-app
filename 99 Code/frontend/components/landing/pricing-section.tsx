'use client';

import { useTranslations } from 'next-intl';

export function PricingSection() {
  const t = useTranslations('landing.pricing');

  const services = [
    { key: 'inspection' },
    { key: 'oilChange' },
    { key: 'tireChange' },
    { key: 'tuv' },
    { key: 'brakePadsFront' },
    { key: 'brakePadsRear' },
    { key: 'brakeDiscsFront' },
    { key: 'brakeDiscsRear' },
    { key: 'brakePackageFull', featured: true },
  ];

  return (
    <section id="pricing" className="py-16 px-4 bg-white">
      <div className="container mx-auto max-w-4xl">
        <h2 className="text-3xl font-bold text-center mb-4">{t('title')}</h2>
        <p className="text-center text-gray-600 mb-12">{t('subtitle')}</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <div
              key={index}
              className={`border rounded-lg p-6 text-center hover:shadow-md transition-shadow relative ${
                service.featured ? 'border-blue-500 border-2 bg-blue-50' : ''
              }`}
            >
              {service.featured && (
                <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                  {t(`${service.key}.badge`)}
                </div>
              )}
              <h3 className="font-semibold text-lg mb-2">{t(`${service.key}.title`)}</h3>
              <div className="text-2xl font-bold text-blue-600 mb-2">{t(`${service.key}.price`)}</div>
              <p className="text-sm text-gray-600">{t(`${service.key}.description`)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
