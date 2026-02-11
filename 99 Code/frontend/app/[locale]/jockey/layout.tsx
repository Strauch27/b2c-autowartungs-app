'use client';

import { usePathname, useRouter } from 'next/navigation';
import { PortalLayout } from '@/components/layout/PortalLayout';
import { useAuth } from '@/lib/auth-hooks';
import { useTranslations, useLocale } from 'next-intl';
import { Bell } from 'lucide-react';

function JockeyLanguageToggle() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const switchLocale = (newLocale: string) => {
    router.push(pathname.replace(`/${locale}`, `/${newLocale}`));
  };
  return (
    <div className="flex items-center gap-0.5 rounded-lg bg-white/15 p-0.5">
      <button
        onClick={() => switchLocale('de')}
        className={`px-2 py-1 text-[11px] font-semibold rounded-md transition-colors ${locale === 'de' ? 'bg-white/25 text-white' : 'text-white/60 hover:text-white'}`}
      >DE</button>
      <button
        onClick={() => switchLocale('en')}
        className={`px-2 py-1 text-[11px] font-semibold rounded-md transition-colors ${locale === 'en' ? 'bg-white/25 text-white' : 'text-white/60 hover:text-white'}`}
      >EN</button>
    </div>
  );
}

export default function JockeyLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Don't wrap login page with portal layout
  const isLoginPage = pathname.includes('/jockey/login');
  if (isLoginPage) {
    return <>{children}</>;
  }

  return <JockeyLayoutInner>{children}</JockeyLayoutInner>;
}

function JockeyLayoutInner({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const td = useTranslations('jockeyDashboard');

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
      portal="jockey"
      title={td('title')}
      rightSlot={
        <div className="flex items-center gap-2">
          <JockeyLanguageToggle />
          <button
            className="relative flex h-11 w-11 items-center justify-center"
            aria-label={td('notifications')}
            data-testid="notification-bell"
          >
            <Bell className="w-5 h-5 text-white/80" />
            <span className="absolute top-1 right-1 w-4 h-4 bg-destructive rounded-full text-white text-[9px] flex items-center justify-center font-bold">
              3
            </span>
          </button>
          <div
            className="w-8 h-8 rounded-full bg-primary/30 border-2 border-primary flex items-center justify-center text-white text-xs font-bold"
            data-testid="user-avatar"
          >
            {initials}
          </div>
        </div>
      }
    >
      {children}
    </PortalLayout>
  );
}
