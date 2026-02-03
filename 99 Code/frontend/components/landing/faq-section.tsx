'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

export function FAQSection() {
  const t = useTranslations('landing.faq');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    { key: 'howItWorks' },
    { key: 'fixedPrices' },
    { key: 'cancellation' },
    { key: 'payment' },
  ];

  return (
    <section id="faq" className="py-16 px-4 bg-white">
      <div className="container mx-auto max-w-2xl">
        <h2 className="text-3xl font-bold text-center mb-12">{t('title')}</h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border rounded-lg">
              <button
                className="w-full px-6 py-4 text-left font-medium flex justify-between items-center"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                {t(`questions.${faq.key}.question`)}
                <span className="text-xl">{openIndex === index ? '−' : '+'}</span>
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4 text-gray-600">
                  {t(`questions.${faq.key}.answer`)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
