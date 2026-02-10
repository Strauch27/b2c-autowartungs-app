'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from 'next-intl';
import { Clock, Truck } from 'lucide-react';

interface OrderCardProps {
  bookingNumber: string;
  vehicle: string;
  vehicleBrandLogo?: string;
  vehiclePlate: string;
  vehicleMileage?: number;
  vehicleYear?: number;
  service: string;
  customer: string;
  date: string;
  column: 'new' | 'inProgress' | 'completed';
  backendStatus?: string;
  deliveryDeadline?: Date;
  extensionApproved?: boolean;
  progress?: string;
  onAccept?: () => void;
  onComplete?: () => void;
  onExtension?: () => void;
  onViewDetails?: () => void;
}

function DeadlineCountdown({ deadline }: { deadline: Date }) {
  const t = useTranslations('workshopDashboard');
  const [remaining, setRemaining] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [isOverdue, setIsOverdue] = useState(false);

  useEffect(() => {
    function update() {
      const now = new Date().getTime();
      const diff = deadline.getTime() - now;

      if (diff <= 0) {
        setRemaining(t('deadline.overdue'));
        setIsOverdue(true);
        setIsUrgent(true);
        return;
      }

      setIsOverdue(false);
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (hours < 2) {
        setIsUrgent(true);
      } else {
        setIsUrgent(false);
      }

      if (hours >= 24) {
        const days = Math.floor(hours / 24);
        const remainingHours = hours % 24;
        setRemaining(`${days}d ${remainingHours}h`);
      } else {
        setRemaining(`${hours}h ${minutes}min`);
      }
    }

    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [deadline, t]);

  return (
    <div className={`flex items-center gap-1.5 mt-2 text-[11px] font-medium ${
      isOverdue ? 'text-destructive' : isUrgent ? 'text-amber-600' : 'text-muted-foreground'
    }`}>
      <Clock className="h-3 w-3" />
      <span>{t('deadline.label')}: {remaining}</span>
    </div>
  );
}

export function OrderCard({
  bookingNumber,
  vehicle,
  vehicleBrandLogo,
  vehiclePlate,
  vehicleMileage,
  vehicleYear,
  service,
  customer,
  date,
  column,
  backendStatus,
  deliveryDeadline,
  extensionApproved,
  onAccept,
  onComplete,
  onExtension,
  onViewDetails,
}: OrderCardProps) {
  const t = useTranslations('workshopDashboard');

  const isWaitingForPickup = backendStatus === 'PICKUP_ASSIGNED';

  const mileageStr = vehicleMileage ? vehicleMileage.toLocaleString('de-DE') : null;

  const vehicleDisplay = (
    <div>
      <p className="text-sm font-semibold text-foreground flex items-center gap-2">
        {vehicleBrandLogo && (
          <img src={vehicleBrandLogo} alt="" className="w-5 h-5 object-contain shrink-0" />
        )}
        <span>
          {vehicle}
          {vehicleYear ? <span className="font-normal text-muted-foreground">, {vehicleYear}</span> : null}
        </span>
      </p>
      {(vehiclePlate || mileageStr) && (
        <p className="text-xs text-muted-foreground mt-0.5 ml-7">
          {vehiclePlate}
          {vehiclePlate && mileageStr && ' · '}
          {mileageStr && `${mileageStr} km`}
        </p>
      )}
    </div>
  );

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
            {isWaitingForPickup ? (
              <Badge className="bg-blue-50 text-blue-600 border-blue-200 text-[10px]">
                <Truck className="h-3 w-3 mr-1" />
                {t('kanban.waitingPickup')}
              </Badge>
            ) : (
              <Badge className="badge-pending text-[10px]">{t('kanban.new')}</Badge>
            )}
          </div>
          {vehicleDisplay}
          <div className="mt-2 flex items-center gap-2">
            <span className="rounded bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-600">
              {service}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>{customer}</span>
            <span>{date}</span>
          </div>
          {deliveryDeadline && <DeadlineCountdown deadline={deliveryDeadline} />}
        </div>
        {isWaitingForPickup ? (
          <div className="w-full bg-neutral-100 py-2.5 text-xs font-medium text-muted-foreground text-center">
            <Truck className="h-3.5 w-3.5 inline mr-1.5" />
            {t('kanban.awaitingJockey')}
          </div>
        ) : (
          <button
            onClick={onAccept}
            className="w-full bg-primary py-2.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            data-testid={`kanban-action-${bookingNumber}`}
          >
            {backendStatus === 'PICKED_UP' ? t('kanban.accept') : t('kanban.startWork')}
          </button>
        )}
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
          {vehicleDisplay}
          <div className="mt-2 flex items-center gap-2">
            <span className="rounded bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-600">
              {service}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>{customer}</span>
            <span>{date}</span>
          </div>
          {deliveryDeadline && <DeadlineCountdown deadline={deliveryDeadline} />}
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
        <div>
          <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            {vehicleBrandLogo && (
              <img src={vehicleBrandLogo} alt="" className="w-5 h-5 object-contain shrink-0" />
            )}
            <span>
              {vehicle}
              {vehicleYear ? <span>, {vehicleYear}</span> : null}
            </span>
          </p>
          {(vehiclePlate || mileageStr) && (
            <p className="text-[11px] text-muted-foreground mt-0.5 ml-7">
              {vehiclePlate}
              {vehiclePlate && mileageStr && ' · '}
              {mileageStr && `${mileageStr} km`}
            </p>
          )}
        </div>
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
