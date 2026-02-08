'use client';

import { usePathname } from 'next/navigation';
import { BottomNav } from '@/components/layout/BottomNav';

export default function JockeyLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Don't wrap login page with portal layout
  const isLoginPage = pathname.includes('/jockey/login');
  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background" data-testid="jockey-portal-layout">
      {children}
      <BottomNav portal="jockey" />
    </div>
  );
}
