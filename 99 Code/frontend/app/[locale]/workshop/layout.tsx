'use client';

import { PortalLayout } from '@/components/layout/PortalLayout';
import { useTranslations } from 'next-intl';

export default function WorkshopLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations('workshopDashboard');

  return (
    <PortalLayout portal="workshop" title={t('orders')}>
      {children}
    </PortalLayout>
  );
}
