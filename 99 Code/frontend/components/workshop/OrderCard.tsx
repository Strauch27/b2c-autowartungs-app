'use client';

import { Badge } from '@/components/ui/badge';
import { useTranslations } from 'next-intl';

interface OrderCardProps {
  bookingNumber: string;
  vehicle: string;
  vehiclePlate: string;
  service: string;
  customer: string;
  date: string;
  column: 'new' | 'inProgress' | 'completed';
  extensionApproved?: boolean;
  progress?: string;
  onAccept?: () => void;
  onComplete?: () => void;
  onExtension?: () => void;
  onViewDetails?: () => void;
}

export function OrderCard({
  bookingNumber,
  vehicle,
  vehiclePlate,
  service,
  customer,
  date,
  column,
  extensionApproved,
  onAccept,
  onComplete,
  onExtension,
  onViewDetails,
}: OrderCardProps) {
  const t = useTranslations('workshopDashboard');

  if (column === 'new') {
    return (
      <div
        className="card-interactive overflow-hidden rounded-xl border border-neutral-200 bg-card shadow-sm"
        data-testid={`kanban-card-${bookingNumber}`}
      >
        <div className="p-4">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-mono text-muted-foreground">{bookingNumber}</span>
            </div>
            <Badge className="badge-pending text-[10px]">{t('kanban.new')}</Badge>
          </div>
          <p className="text-sm font-semibold text-foreground">
            {vehicle} {vehiclePlate && <span className="font-normal text-muted-foreground">· {vehiclePlate}</span>}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span className="rounded bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-600">
              {service}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>{customer}</span>
            <span>{date}</span>
          </div>
        </div>
        <button
          onClick={onAccept}
          className="w-full bg-primary py-2.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          data-testid={`kanban-action-${bookingNumber}`}
        >
          {t('kanban.accept')}
        </button>
      </div>
    );
  }

  if (column === 'inProgress') {
    return (
      <div
        className="card-interactive overflow-hidden rounded-xl border-l-4 border-l-cta bg-card shadow-sm"
        data-testid={`kanban-card-${bookingNumber}`}
      >
        <div className="p-4">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-mono text-muted-foreground">{bookingNumber}</span>
            </div>
            <Badge className="badge-in-progress text-[10px]">{t('kanban.inProgress')}</Badge>
          </div>
          <p className="text-sm font-semibold text-foreground">
            {vehicle} {vehiclePlate && <span className="font-normal text-muted-foreground">· {vehiclePlate}</span>}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span className="rounded bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-600">
              {service}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>{customer}</span>
            <span>{date}</span>
          </div>
          {/* Progress bar */}
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-neutral-100">
            <div className="h-full animate-pulse rounded-full bg-cta" style={{ width: '50%' }} />
          </div>
          {extensionApproved && (
            <div className="mt-2">
              <span className="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-medium text-success">
                {t('detail.extensionApproved')}
              </span>
            </div>
          )}
        </div>
        <div className="flex border-t border-neutral-200">
          <button
            onClick={onExtension}
            className="flex-1 border-r border-neutral-200 py-2.5 text-xs font-medium text-cta transition-colors hover:bg-cta/5"
          >
            {t('kanban.addExtension')}
          </button>
          <button
            onClick={onComplete}
            className="flex-1 py-2.5 text-xs font-semibold text-success transition-colors hover:bg-success/5"
            data-testid={`kanban-action-${bookingNumber}`}
          >
            {t('kanban.complete')}
          </button>
        </div>
      </div>
    );
  }

  // completed
  return (
    <div
      className="overflow-hidden rounded-xl border border-neutral-200 bg-card/60 shadow-sm"
      data-testid={`kanban-card-${bookingNumber}`}
    >
      <div className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-mono text-muted-foreground">{bookingNumber}</span>
          <svg className="h-5 w-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-muted-foreground">
          {vehicle} {vehiclePlate && <span>· {vehiclePlate}</span>}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <span className="rounded bg-neutral-50 px-2 py-0.5 text-[10px] font-medium text-neutral-400">
            {service}
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <span>{customer}</span>
          <span>{date}</span>
        </div>
      </div>
      <button
        onClick={onViewDetails}
        className="w-full border-t border-neutral-200 py-2 text-xs text-muted-foreground transition-colors hover:bg-primary/5 hover:text-primary"
        data-testid={`kanban-action-${bookingNumber}`}
      >
        {t('kanban.viewDetails')}
      </button>
    </div>
  );
}
