'use client';

import { Mail, Phone, MapPin } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/useLovableTranslation';

const translations = {
  de: {
    tagline: 'Premium Fahrzeugwartung mit Concierge-Service. Wir holen ab, Sie lehnen sich zurück.',
    aboutUs: 'Über uns',
    team: 'Unser Team',
    partnerWorkshops: 'Partnerwerkstätten',
    careers: 'Karriere',
    press: 'Presse',
    legal: 'Rechtliches',
    privacy: 'Datenschutz',
    terms: 'AGB',
    imprint: 'Impressum',
    cookies: 'Cookie-Einstellungen',
    contact: 'Kontakt',
    copyright: 'AutoConcierge. Alle Rechte vorbehalten.',
  },
  en: {
    tagline: 'Premium vehicle maintenance with concierge service. We pick up, you relax.',
    aboutUs: 'About us',
    team: 'Our team',
    partnerWorkshops: 'Partner workshops',
    careers: 'Careers',
    press: 'Press',
    legal: 'Legal',
    privacy: 'Privacy policy',
    terms: 'Terms of service',
    imprint: 'Imprint',
    cookies: 'Cookie settings',
    contact: 'Contact',
    copyright: 'AutoConcierge. All rights reserved.',
  },
};

const Footer = () => {
  const { language } = useLanguage();
  const params = useParams();
  const locale = (params.locale as string) || 'de';
  const t = translations[language] || translations.de;

  return (
    <footer className="bg-neutral-900 text-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link href={`/${locale}`} className="mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 7h8m-8 4h4m-2 4v4m-4-4h8a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v6a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <span className="text-xl font-bold">AutoConcierge</span>
            </Link>
            <p className="text-gray-400 mt-4">{t.tagline}</p>
          </div>

          {/* About */}
          <div>
            <h3 className="mb-6 text-lg font-semibold">{t.aboutUs}</h3>
            <ul className="space-y-3">
              <li>
                <span className="text-gray-400">{t.team}</span>
              </li>
              <li>
                <span className="text-gray-400">{t.partnerWorkshops}</span>
              </li>
              <li>
                <span className="text-gray-400">{t.careers}</span>
              </li>
              <li>
                <span className="text-gray-400">{t.press}</span>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-6 text-lg font-semibold">{t.legal}</h3>
            <ul className="space-y-3">
              <li>
                <Link href={`/${locale}/privacy`} className="text-gray-400 transition-colors hover:text-white">
                  {t.privacy}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/terms`} className="text-gray-400 transition-colors hover:text-white">
                  {t.terms}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/imprint`} className="text-gray-400 transition-colors hover:text-white">
                  {t.imprint}
                </Link>
              </li>
              <li>
                <span className="text-gray-400">{t.cookies}</span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-6 text-lg font-semibold">{t.contact}</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-gray-400">
                <Mail className="h-4 w-4" />
                <span>info@ronya.de</span>
              </li>
              <li className="flex items-center gap-2 text-gray-400">
                <Phone className="h-4 w-4" />
                <span>+49 30 123 456 789</span>
              </li>
              <li className="flex items-start gap-2 text-gray-400">
                <MapPin className="h-4 w-4 mt-1" />
                <span>
                  Musterstraße 123
                  <br />
                  10115 Berlin
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-white/10 pt-8 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} {t.copyright}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
