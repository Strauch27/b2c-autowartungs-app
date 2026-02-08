'use client';

import { ArrowRight, Star, CheckCircle, Shield } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/useLovableTranslation';
import { HeroIllustration } from './hero-illustration';

const translations = {
  de: {
    badge: 'Festpreis-Garantie',
    title: 'Ihr Fahrzeug, unser Service',
    titleHighlight: 'Bequem von Zuhause',
    subtitle: 'Wir holen Ihr Auto ab, bringen es zur Werkstatt und liefern es fertig gewartet zurück. Kein Aufwand, kein Stress, zum Festpreis.',
    ctaPrimary: 'Jetzt Termin buchen',
    ctaSecondary: "So funktioniert's",
    trustRating: '4.9',
    trustRatingLabel: 'Bewertung',
    trustCustomers: '500+',
    trustCustomersLabel: 'zufriedene Kunden',
    trustPartners: 'Zertifizierte Partner',
  },
  en: {
    badge: 'Fixed price guarantee',
    title: 'Your vehicle, our service',
    titleHighlight: 'From the comfort of home',
    subtitle: 'We pick up your car, bring it to the workshop, and deliver it back fully serviced. No hassle, no stress, at a fixed price.',
    ctaPrimary: 'Book appointment now',
    ctaSecondary: 'How it works',
    trustRating: '4.9',
    trustRatingLabel: 'Rating',
    trustCustomers: '500+',
    trustCustomersLabel: 'satisfied customers',
    trustPartners: 'Certified partners',
  },
};

const Hero = () => {
  const { language } = useLanguage();
  const params = useParams();
  const locale = (params.locale as string) || 'de';
  const t = translations[language] || translations.de;

  return (
    <section
      className="hero-bg min-h-screen flex items-center pt-20"
      style={{ background: 'linear-gradient(135deg, hsl(222 47% 11%) 0%, hsl(217 33% 17%) 50%, hsl(222 47% 11%) 100%)' }}
      data-testid="hero-section"
    >
      <div className="hero-shape" />
      <div className="hero-shape" />
      <div className="hero-shape" />
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-20 relative z-10 w-full">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 mb-6 border border-white/10">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-success text-sm font-medium">{t.badge}</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              {t.title}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-amber-400">
                {t.titleHighlight}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-gray-400 mb-8 max-w-lg leading-relaxed">
              {t.subtitle}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 mb-10">
              <Link
                href={`/${locale}/booking`}
                className="btn-primary-landing px-8 py-4 rounded-xl font-bold text-lg inline-flex items-center gap-2"
                data-testid="hero-booking-cta"
              >
                {t.ctaPrimary}
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#how-it-works"
                className="btn-outline-landing px-8 py-4 rounded-xl font-semibold text-lg"
              >
                {t.ctaSecondary}
              </a>
            </div>

            {/* Trust strip */}
            <div className="flex flex-wrap gap-6 md:gap-8">
              <div className="flex items-center gap-2">
                <div className="flex text-cta text-sm">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="h-4 w-4 fill-cta text-cta" />
                  ))}
                </div>
                <span className="text-white font-semibold">{t.trustRating}</span>
                <span className="text-gray-500 text-sm">{t.trustRatingLabel}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-success" />
                <span className="text-gray-400 text-sm">
                  <b className="text-white">{t.trustCustomers}</b> {t.trustCustomersLabel}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-400" />
                <span className="text-gray-400 text-sm">{t.trustPartners}</span>
              </div>
            </div>
          </div>

          {/* Right illustration */}
          <HeroIllustration />
        </div>
      </div>
    </section>
  );
};

export default Hero;
