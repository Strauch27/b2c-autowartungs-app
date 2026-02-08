'use client';

import { AlertCircle, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ExtensionAlertBannerProps {
  count: number;
  description: string;
  amount: string;
  onReview: () => void;
}

export function ExtensionAlertBanner({
  count,
  description,
  amount,
  onReview,
}: ExtensionAlertBannerProps) {
  const t = useTranslations('customerPortal.extensionAlert');

  return (
    <div
      className="mb-4 animate-card animate-glow-amber bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-3.5 cursor-pointer"
      onClick={onReview}
      data-testid="extension-alert-banner"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <AlertCircle className="w-5 h-5 text-amber-600" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-amber-900 text-sm">
            {count === 1 ? t('title', { count }) : t('titlePlural', { count })}
          </p>
          <p className="text-amber-700 text-xs mt-0.5 truncate">
            {description} &mdash; {amount}
          </p>
        </div>
      </div>
      <button
        className="btn-hover w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2"
        onClick={(e) => {
          e.stopPropagation();
          onReview();
        }}
        data-testid="extension-alert-cta"
      >
        {t('cta')}
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
