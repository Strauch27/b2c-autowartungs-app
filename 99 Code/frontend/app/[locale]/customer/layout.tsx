'use client';

import { usePathname, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { PortalLayout } from '@/components/layout/PortalLayout';
import { NotificationCenter } from '@/components/customer/NotificationCenter';
import { useAuth } from '@/lib/auth-hooks';
import { useTranslations, useLocale } from 'next-intl';
import { LogOut } from 'lucide-react';

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isPublicPage =
    pathname.endsWith('/login') ||
    pathname.endsWith('/register') ||
    pathname.endsWith('/verify');

  if (isPublicPage) {
    return <>{children}</>;
  }

  return (
    <ProtectedRoute requiredRole="customer">
      <CustomerLayoutInner>{children}</CustomerLayoutInner>
    </ProtectedRoute>
  );
}

function CustomerLayoutInner({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const t = useTranslations('customerPortal.header');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: string) => {
    router.push(pathname.replace(`/${locale}`, `/${newLocale}`));
  };

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
          <div className="flex items-center gap-0.5 rounded-lg bg-neutral-100 p-0.5">
            <button
              onClick={() => switchLocale('de')}
              className={`px-2 py-1 text-[11px] font-semibold rounded-md transition-colors ${locale === 'de' ? 'bg-white text-foreground shadow-sm' : 'text-neutral-400 hover:text-foreground'}`}
            >DE</button>
            <button
              onClick={() => switchLocale('en')}
              className={`px-2 py-1 text-[11px] font-semibold rounded-md transition-colors ${locale === 'en' ? 'bg-white text-foreground shadow-sm' : 'text-neutral-400 hover:text-foreground'}`}
            >EN</button>
          </div>
          <NotificationCenter />
          <div
            className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold"
            data-testid="user-avatar"
          >
            {initials}
          </div>
          <button
            onClick={logout}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-neutral-100 transition-colors"
            aria-label="Logout"
            data-testid="logout-button"
          >
            <LogOut className="h-4 w-4 text-neutral-500" />
          </button>
        </div>
      }
    >
      <div className="px-4 py-4 max-w-2xl mx-auto" data-testid="customer-content">
        {children}
      </div>
    </PortalLayout>
  );
}
