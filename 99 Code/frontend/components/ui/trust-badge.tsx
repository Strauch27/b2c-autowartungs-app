'use client';

import { useTranslations } from 'next-intl';
import { Users, Star } from 'lucide-react';

export function TrustBadge() {
  const t = useTranslations('landing.trustBadge');

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 text-sm text-gray-700">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
          <Users className="h-5 w-5 text-green-600" />
        </div>
        <span className="font-semibold">{t('customers')}</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
          <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
        </div>
        <span className="font-semibold">{t('rating')}</span>
      </div>
    </div>
  );
}
