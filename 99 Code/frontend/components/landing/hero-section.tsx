'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Calculator, CheckCircle, Star } from 'lucide-react';

export function HeroSection() {
  const t = useTranslations('landing.hero');
  const tFixedPrice = useTranslations('landing.fixedPrice');
  const router = useRouter();

  const handleGetStarted = () => {
    // Route to Express Flow (simplified 3-step booking)
    router.push('/de/buchen/express');
  };

  return (
    <section className="bg-gradient-to-b from-blue-50 via-blue-50/50 to-white py-16 md:py-24 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Social Proof Badge - Above the fold */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-medium">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="h-4 w-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-sm font-semibold text-gray-900">4.5 aus 1.247 Bewertungen</span>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            {t('title')}
          </h1>

          {/* Festpreis-Garantie Badge */}
          <div className="flex justify-center mb-6">
            <Badge className="bg-green-50 text-green-700 border-2 border-green-600 hover:bg-green-100 px-4 py-2 text-sm md:text-base font-semibold">
              <CheckCircle className="h-5 w-5 mr-2 inline" />
              {tFixedPrice('badge')}
            </Badge>
          </div>

          <p className="text-xl md:text-2xl text-gray-600 mb-4 max-w-3xl mx-auto">
            {t('subtitle')}
          </p>

          {/* Concierge USP - Transcript Requirement */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-50 to-orange-50 rounded-full border-2 border-blue-200 shadow-medium">
              <span className="text-2xl">🚗</span>
              <span className="text-base font-semibold text-gray-900">
                Wir holen Ihr Auto ab & bringen es zurück
              </span>
              <span className="text-2xl">✓</span>
            </div>
          </div>
        </div>

        {/* Primary CTA - Prominent */}
        <div className="max-w-md mx-auto mb-6">
          <Button
            onClick={handleGetStarted}
            size="lg"
            className="w-full h-14 text-lg bg-orange-500 hover:bg-orange-600 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
            data-testid="calculate-price-button"
          >
            <Calculator className="h-6 w-6 mr-2" />
            {t('cta')}
            <ArrowRight className="h-6 w-6 ml-2" />
          </Button>
        </div>


        {/* Trust Indicators */}
        <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-gray-600">
          <span className="flex items-center gap-2 font-medium">
            <CheckCircle className="h-5 w-5 text-green-600" />
            {t('features.fixedPrice')}
          </span>
          <span className="flex items-center gap-2 font-medium">
            <CheckCircle className="h-5 w-5 text-green-600" />
            {t('features.certified')}
          </span>
          <span className="flex items-center gap-2 font-medium">
            <CheckCircle className="h-5 w-5 text-green-600" />
            {t('features.instant')}
          </span>
        </div>
      </div>
    </section>
  );
}
