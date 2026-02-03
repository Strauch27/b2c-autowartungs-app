'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { TrustBadge } from '@/components/ui/trust-badge';

export function LandingFooter() {
  const t = useTranslations('footer');
  const params = useParams();
  const locale = params.locale as string || 'de';
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Trust Badge */}
        <div className="mb-8 pb-8 border-b border-gray-800">
          <TrustBadge />
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-bold mb-4">Ronya B2C</h3>
            <p className="text-sm">
              {t('tagline')}
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">{t('services.title')}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href={`/${locale}/customer/login`} className="hover:text-white">{t('services.findWorkshop')}</Link></li>
              <li><Link href={`/${locale}`} className="hover:text-white">{t('services.ourServices')}</Link></li>
              <li><Link href={`/${locale}`} className="hover:text-white">{t('services.prices')}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">{t('legal.title')}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href={`/${locale}`} className="hover:text-white">{t('legal.imprint')}</Link></li>
              <li><Link href={`/${locale}`} className="hover:text-white">{t('legal.privacy')}</Link></li>
              <li><Link href={`/${locale}`} className="hover:text-white">{t('legal.terms')}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">{t('contact.title')}</h4>
            <ul className="space-y-2 text-sm">
              <li>{t('contact.email')}</li>
              <li>{t('contact.hours')}</li>
              <li className="pt-2"><Link href={`/${locale}`} className="hover:text-white">{t('contact.help')}</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
            <div className="text-center sm:text-left">
              {t('copyright', { year })}
            </div>
            <div className="flex gap-4">
              <Link href={`/${locale}/workshop/login`} className="hover:text-white">{t('forWorkshops')}</Link>
              <Link href={`/${locale}/jockey/login`} className="hover:text-white">{t('admin')}</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
