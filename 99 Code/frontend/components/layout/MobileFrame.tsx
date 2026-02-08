import { cn } from '@/lib/utils';

interface MobileFrameProps {
  children: React.ReactNode;
  className?: string;
  showFrame?: boolean;
}

export function MobileFrame({ children, className, showFrame = false }: MobileFrameProps) {
  if (showFrame) {
    return (
      <div className={cn('phone-frame md:my-8', className)}>
        <div className="phone-notch" />
        <div className="phone-content pt-7">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'max-w-md mx-auto min-h-screen pb-20',
        className
      )}
      style={{ paddingBottom: 'max(5rem, env(safe-area-inset-bottom))' }}
      data-testid="mobile-frame"
    >
      {children}
    </div>
  );
}
