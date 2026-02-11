'use client';

import { AlertCircle, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

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
      <Button
        variant="cta"
        className="w-full rounded-xl"
        size="lg"
        onClick={(e) => {
          e.stopPropagation();
          onReview();
        }}
        data-testid="extension-alert-cta"
      >
        {t('cta')}
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}
