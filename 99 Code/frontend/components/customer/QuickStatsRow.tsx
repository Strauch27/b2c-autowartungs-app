'use client';

import { ClipboardList, Calendar, Star } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface QuickStatsRowProps {
  servicesCount: number;
  nextAppointment: string;
  rating: number;
}

export function QuickStatsRow({ servicesCount, nextAppointment, rating }: QuickStatsRowProps) {
  const t = useTranslations('customerPortal.stats');

  return (
    <div className="grid grid-cols-3 gap-2 mb-4" data-testid="quick-stats-row">
      <div className="animate-card bg-white rounded-2xl shadow-sm border border-gray-100 p-3 text-center" data-testid="stat-services">
        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-1.5">
          <ClipboardList className="w-4 h-4 text-blue-500" />
        </div>
        <p className="text-xl font-bold text-gray-900">{servicesCount}</p>
        <p className="text-[10px] text-gray-500 mt-0.5">{t('services')}</p>
      </div>
      <div className="animate-card bg-white rounded-2xl shadow-sm border border-gray-100 p-3 text-center" data-testid="stat-next-appointment">
        <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center mx-auto mb-1.5">
          <Calendar className="w-4 h-4 text-emerald-500" />
        </div>
        <p className="text-sm font-bold text-gray-900">{nextAppointment || '-'}</p>
        <p className="text-[10px] text-gray-500 mt-0.5">{t('nextAppointment')}</p>
      </div>
      <div className="animate-card bg-white rounded-2xl shadow-sm border border-gray-100 p-3 text-center" data-testid="stat-rating">
        <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center mx-auto mb-1.5">
          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
        </div>
        <p className="text-xl font-bold text-gray-900">{rating > 0 ? rating.toFixed(1) : '-'}</p>
        <p className="text-[10px] text-gray-500 mt-0.5">{t('rating')}</p>
      </div>
    </div>
  );
}
