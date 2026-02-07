// @ts-nocheck
'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Calculator, CheckCircle, Star } from 'lucide-react';
import { ABTestWrapper, useABTest, trackABTestConversion } from '@/components/ab-test/ab-test-wrapper';
import { AB_TEST_EVENTS } from '@/lib/ab-tests/config';

export function HeroSectionAB() {
  const t = useTranslations('landing.hero');
  const tFixedPrice = useTranslations('landing.fixedPrice');
  const tWorkshop = useTranslations('workshop');
  const [plz, setPlz] = useState('');
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string || 'de';

  // Get A/B test variants
  const colorVariant = useABTest('primary-color');
  const ctaCopyVariant = useABTest('cta-copy');
  const socialProofVariant = useABTest('social-proof-placement');

  // Dynamic button colors based on A/B test
  const buttonColor = colorVariant === 'orange'
    ? 'bg-orange-500 hover:bg-orange-600'
    : 'bg-primary hover:bg-primary/90';

  // Dynamic CTA copy
  const ctaText = ctaCopyVariant === 'alternative' ? 'Termin finden' : t('cta');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (plz.match(/^\d{5}$/)) {
      trackABTestConversion('cta-copy', AB_TEST_EVENTS.CTA_CLICK, {
        cta_type: 'plz_search',
        plz
      });
      router.push(`/${locale}/workshops?plz=${plz}`);
    }
  };

  const handleGetStarted = () => {
    trackABTestConversion('primary-color', AB_TEST_EVENTS.CTA_CLICK, {
      cta_type: 'primary_button'
    });
    trackABTestConversion('cta-copy', AB_TEST_EVENTS.CTA_CLICK, {
      cta_type: 'primary_button'
    });
    router.push(`/${locale}/customer/booking`);
  };

  // Social proof component
  const SocialProofBadge = () => (
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
  );

  return (
    <section className="bg-gradient-to-b from-blue-50 via-blue-50/50 to-white py-16 md:py-24 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* A/B Test: Social Proof Placement */}
        {socialProofVariant === 'control' && <SocialProofBadge />}

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

          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        {/* Primary CTA with A/B tested color and copy */}
        <div className="max-w-md mx-auto mb-6">
          <Button
            onClick={handleGetStarted}
            size="lg"
            className={`w-full h-14 text-lg ${buttonColor} text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all`}
            data-testid="calculate-price-button"
          >
            <Calculator className="h-6 w-6 mr-2" />
            {ctaText}
            <ArrowRight className="h-6 w-6 ml-2" />
          </Button>
        </div>

        {/* Secondary Option */}
        <div className="max-w-md mx-auto">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              type="text"
              name="plz"
              data-testid="plz-input"
              placeholder={tWorkshop('searchPlaceholder')}
              value={plz}
              onChange={(e) => setPlz(e.target.value.replace(/\D/g, '').slice(0, 5))}
              className="h-12 text-center text-base"
              maxLength={5}
              aria-label="Postleitzahl eingeben"
            />
            <Button
              type="submit"
              size="lg"
              variant="outline"
              className="h-12 px-6"
              data-testid="workshop-search-button"
              aria-label="Werkstatt suchen"
            >
              {tWorkshop('search')}
            </Button>
          </form>
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-gray-600">
          <span className="flex items-center gap-2 font-medium">
            <CheckCircle className="h-5 w-5 text-green-600" aria-hidden="true" />
            {t('features.fixedPrice')}
          </span>
          <span className="flex items-center gap-2 font-medium">
            <CheckCircle className="h-5 w-5 text-green-600" aria-hidden="true" />
            {t('features.certified')}
          </span>
          <span className="flex items-center gap-2 font-medium">
            <CheckCircle className="h-5 w-5 text-green-600" aria-hidden="true" />
            {t('features.instant')}
          </span>
        </div>

        {/* A/B Test: Social Proof Below Value Props */}
        {socialProofVariant === 'below' && (
          <div className="mt-12">
            <SocialProofBadge />
          </div>
        )}
      </div>
    </section>
  );
}
