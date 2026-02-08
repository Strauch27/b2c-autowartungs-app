'use client';

import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TopBarProps {
  title: string;
  portal: 'customer' | 'jockey' | 'workshop';
  showBack?: boolean;
  onBack?: () => void;
  rightSlot?: React.ReactNode;
}

const portalStyles: Record<TopBarProps['portal'], string> = {
  customer: 'bg-white border-b border-neutral-200 text-foreground',
  jockey: 'bg-jockey text-white',
  workshop: 'bg-workshop text-white',
};

export function TopBar({ title, portal, showBack, onBack, rightSlot }: TopBarProps) {
  const isDark = portal === 'jockey' || portal === 'workshop';

  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex h-14 items-center px-4',
        portalStyles[portal]
      )}
      data-testid="top-bar"
    >
      <div className="flex w-10 items-center justify-start">
        {showBack && (
          <button
            onClick={onBack}
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-full transition-colors',
              isDark ? 'hover:bg-white/10' : 'hover:bg-neutral-100'
            )}
            aria-label="Back"
            data-testid="top-bar-back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
      </div>

      <h1 className="flex-1 text-center text-heading-4 truncate">
        {title}
      </h1>

      <div className="flex w-auto items-center justify-end gap-2">
        {rightSlot}
      </div>
    </header>
  );
}
