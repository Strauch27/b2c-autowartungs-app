'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Star, Car, Users, Wrench } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/useLovableTranslation';

const translations = {
  de: {
    socialProof: '4.5 aus 1.247 Bewertungen',
    concierge: 'Wir holen Ihr Auto ab & bringen es zurück',
    customerTitle: 'Kunden',
    customerDesc: 'Buchen Sie Ihre Fahrzeugwartung bequem online mit Festpreis-Garantie',
    signIn: 'Anmelden',
    bookNow: 'Jetzt buchen',
    driverTitle: 'Fahrer',
    driverDesc: 'Verwalten Sie Ihre Abholungen und Lieferungen',
    driverLogin: 'Fahrer-Login',
    workshopTitle: 'Werkstatt',
    workshopDesc: 'Verwalten Sie Aufträge und Werkstatt-Kapazitäten',
    workshopLogin: 'Werkstatt-Login',
  },
  en: {
    socialProof: '4.5 from 1,247 reviews',
    concierge: 'We pick up your car & bring it back',
    customerTitle: 'Customers',
    customerDesc: 'Book your vehicle maintenance conveniently online with fixed-price guarantee',
    signIn: 'Sign in',
    bookNow: 'Book now',
    driverTitle: 'Drivers',
    driverDesc: 'Manage your pickups and deliveries',
    driverLogin: 'Driver Login',
    workshopTitle: 'Workshop',
    workshopDesc: 'Manage orders and workshop capacities',
    workshopLogin: 'Workshop Login',
  },
};

export function HeroSectionPortals() {
  const t = useTranslations('landing.hero');
  const tFixedPrice = useTranslations('landing.fixedPrice');
  const { language } = useLanguage();
  const i = translations[language] || translations.de;
  const params = useParams();
  const locale = params.locale as string;

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
            <span className="text-sm font-semibold text-gray-900">{i.socialProof}</span>
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

          {/* Concierge USP */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-50 to-orange-50 rounded-full border-2 border-blue-200 shadow-medium">
              <span className="text-2xl">🚗</span>
              <span className="text-base font-semibold text-gray-900">
                {i.concierge}
              </span>
              <span className="text-2xl">✓</span>
            </div>
          </div>
        </div>

        {/* Three Portal Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mt-12">
          {/* Customer Portal */}
          <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow border-2 border-transparent hover:border-blue-200">
            <div className="flex justify-center mb-6">
              <div className="bg-blue-100 p-4 rounded-full">
                <Car className="w-12 h-12 text-blue-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
              {i.customerTitle}
            </h2>
            <p className="text-gray-600 mb-6 text-center">
              {i.customerDesc}
            </p>
            <div className="space-y-3">
              <Link
                href={`/${locale}/customer/login`}
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg text-center transition-colors"
              >
                {i.signIn}
              </Link>
              <Link
                href={`/${locale}/customer/login`}
                className="block w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-3 px-6 rounded-lg text-center transition-colors"
              >
                {i.bookNow}
              </Link>
            </div>
          </div>

          {/* Jockey Portal */}
          <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow border-2 border-transparent hover:border-green-200">
            <div className="flex justify-center mb-6">
              <div className="bg-green-100 p-4 rounded-full">
                <Users className="w-12 h-12 text-green-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
              {i.driverTitle}
            </h2>
            <p className="text-gray-600 mb-6 text-center">
              {i.driverDesc}
            </p>
            <div className="space-y-3">
              <Link
                href={`/${locale}/jockey/login`}
                className="block w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg text-center transition-colors"
              >
                {i.driverLogin}
              </Link>
            </div>
          </div>

          {/* Workshop Portal */}
          <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow border-2 border-transparent hover:border-orange-200">
            <div className="flex justify-center mb-6">
              <div className="bg-orange-100 p-4 rounded-full">
                <Wrench className="w-12 h-12 text-orange-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
              {i.workshopTitle}
            </h2>
            <p className="text-gray-600 mb-6 text-center">
              {i.workshopDesc}
            </p>
            <div className="space-y-3">
              <Link
                href={`/${locale}/workshop/login`}
                className="block w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-6 rounded-lg text-center transition-colors"
              >
                {i.workshopLogin}
              </Link>
            </div>
          </div>
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
