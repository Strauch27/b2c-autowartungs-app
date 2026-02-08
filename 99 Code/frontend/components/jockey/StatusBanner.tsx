'use client';

import { useTranslations } from 'next-intl';

interface StatusBannerProps {
  type: 'pickup' | 'return';
  status: 'upcoming' | 'inProgress' | 'atLocation' | 'completed';
}

export function StatusBanner({ type, status }: StatusBannerProps) {
  const t = useTranslations('jockeyDashboard.detail');

  const isPickup = type === 'pickup';
  const gradient = isPickup
    ? 'from-primary to-primary/80'
    : 'from-[hsl(262,83%,58%)] to-[hsl(262,83%,50%)]';

  const getStatusText = () => {
    if (status === 'inProgress') {
      return isPickup ? t('enRouteToCustomer') : t('enRouteToWorkshop');
    }
    if (status === 'atLocation') return t('atCustomerLocation');
    return t('currentStatus');
  };

  return (
    <div
      className={`relative bg-gradient-to-r ${gradient} px-5 py-4 overflow-hidden`}
      data-testid="status-banner"
    >
      <div className="relative z-10">
        <p className="text-white/70 text-[10px] uppercase tracking-wider font-medium">
          {t('currentStatus')}
        </p>
        <p className="text-white font-bold text-base mt-0.5">
          {getStatusText()}
        </p>
      </div>
      {/* Animated car */}
      {status === 'inProgress' && (
        <div className="absolute bottom-2 w-full h-4 left-0 px-5">
          <div className="relative w-full h-full">
            <div className="absolute bottom-0 left-0 right-0 border-b border-dashed border-white/30" />
            <div className="animate-car-move absolute text-lg" style={{ top: '-8px' }}>
              &#128663;
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
