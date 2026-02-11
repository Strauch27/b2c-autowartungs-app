'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface AvailabilityToggleProps {
  initialAvailable?: boolean;
  onToggle?: (available: boolean) => void;
}

export function AvailabilityToggle({ initialAvailable = true, onToggle }: AvailabilityToggleProps) {
  const [available, setAvailable] = useState(initialAvailable);
  const t = useTranslations('jockeyDashboard');

  const handleToggle = () => {
    const next = !available;
    setAvailable(next);
    onToggle?.(next);
  };

  return (
    <div
      className="flex items-center justify-between px-5 py-3 bg-white border-b border-neutral-200"
      data-testid="availability-toggle"
    >
      <span className="text-sm font-medium text-neutral-700">{t('statusLabel')}</span>
      <div className="flex items-center gap-2">
        <span
          className={`text-sm font-semibold ${available ? 'text-success' : 'text-neutral-400'}`}
          data-testid="availability-label"
        >
          {available ? t('available') : t('busy')}
        </span>
        <button
          onClick={handleToggle}
          className="relative w-14 h-8 cursor-pointer"
          role="switch"
          aria-checked={available}
          aria-label={t('statusLabel')}
          data-testid="availability-switch"
        >
          <div
            className={`toggle-track-transition w-14 h-8 rounded-full ${
              available ? 'bg-success' : 'bg-neutral-300'
            }`}
          />
          <div
            className={`toggle-knob-transition absolute top-1 w-6 h-6 bg-white rounded-full shadow-md ${
              available ? 'left-[28px]' : 'left-1'
            }`}
          />
        </button>
      </div>
    </div>
  );
}
