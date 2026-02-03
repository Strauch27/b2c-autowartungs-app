'use client';

import { useTranslations } from 'next-intl';

export function HowItWorksSection() {
  const t = useTranslations('landing.howItWorks');

  const steps = [
    { number: 1, key: 'step1' },
    { number: 2, key: 'step2' },
    { number: 3, key: 'step3' },
  ];

  return (
    <section className="py-16 px-4 bg-white" id="how-it-works">
      <div className="container mx-auto max-w-4xl">
        <h2 className="text-3xl font-bold text-center mb-12">{t('title')}</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div key={step.number} className="text-center">
              <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">
                {step.number}
              </div>
              <h3 className="text-xl font-semibold mb-2">{t(`${step.key}.title`)}</h3>
              <p className="text-gray-600">{t(`${step.key}.description`)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
