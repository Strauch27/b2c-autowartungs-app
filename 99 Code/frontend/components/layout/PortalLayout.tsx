'use client';

import { TopBar } from './TopBar';
import { BottomNav } from './BottomNav';

interface PortalLayoutProps {
  children: React.ReactNode;
  portal: 'customer' | 'jockey' | 'workshop';
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  rightSlot?: React.ReactNode;
}

export function PortalLayout({
  children,
  portal,
  title,
  showBack,
  onBack,
  rightSlot,
}: PortalLayoutProps) {
  return (
    <div className="min-h-screen bg-background" data-testid="portal-layout">
      <TopBar
        portal={portal}
        title={title}
        showBack={showBack}
        onBack={onBack}
        rightSlot={rightSlot}
      />
      <main className="pb-20 md:pb-0">
        {children}
      </main>
      <BottomNav portal={portal} />
    </div>
  );
}
