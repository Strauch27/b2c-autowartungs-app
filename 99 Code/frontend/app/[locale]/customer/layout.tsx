'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { PortalLayout } from '@/components/layout/PortalLayout';
import { NotificationCenter } from '@/components/customer/NotificationCenter';
import { useAuth } from '@/lib/auth-hooks';
import { useTranslations } from 'next-intl';

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requiredRole="customer">
      <CustomerLayoutInner>{children}</CustomerLayoutInner>
    </ProtectedRoute>
  );
}

function CustomerLayoutInner({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const t = useTranslations('customerPortal.header');

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  return (
    <PortalLayout
      portal="customer"
      title={t('title')}
      rightSlot={
        <div className="flex items-center gap-2">
          <NotificationCenter />
          <div
            className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold"
            data-testid="user-avatar"
          >
            {initials}
          </div>
        </div>
      }
    >
      <div className="px-4 py-4 max-w-2xl mx-auto" data-testid="customer-content">
        {children}
      </div>
    </PortalLayout>
  );
}
