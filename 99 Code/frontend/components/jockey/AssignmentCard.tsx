'use client';

import { MapPin, Car, Phone, Navigation } from 'lucide-react';
import { useTranslations } from 'next-intl';

export interface AssignmentCardAssignment {
  id: string;
  customer: string;
  customerPhone: string;
  address: string;
  time: string;
  scheduledDate: string;
  vehicle: string;
  vehicleBrandLogo?: string;
  licensePlate?: string;
  status: 'upcoming' | 'inProgress' | 'atLocation' | 'completed' | 'cancelled';
  type: 'pickup' | 'return';
}

interface AssignmentCardProps {
  assignment: AssignmentCardAssignment;
  variant: 'active' | 'upcoming' | 'completed';
  onAction?: (id: string, action: string) => void;
  onTap?: (assignment: AssignmentCardAssignment) => void;
  getMapsUrl: (address: string) => string;
}

export function AssignmentCard({ assignment, variant, onAction, onTap, getMapsUrl }: AssignmentCardProps) {
  const t = useTranslations('jockeyDashboard');

  const isPickup = assignment.type === 'pickup';
  const accentColor = isPickup ? 'border-primary' : 'border-[hsl(262,83%,58%)]';
  const badgeBg = isPickup ? 'bg-primary/10 text-primary' : 'bg-[hsl(262,83%,58%)]/10 text-[hsl(262,83%,58%)]';
  const actionBg = isPickup ? 'bg-primary hover:bg-primary/90' : 'bg-[hsl(262,83%,58%)] hover:bg-[hsl(262,83%,58%)]/90';

  // Determine action button text based on assignment status
  const getActionText = () => {
    if (assignment.status === 'upcoming') return t('startRoute');
    if (assignment.status === 'inProgress') return t('arrived');
    if (assignment.status === 'atLocation') return t('completeHandover');
    return '';
  };

  const getActionKey = () => {
    if (assignment.status === 'upcoming') return 'start_route';
    if (assignment.status === 'inProgress') return 'arrived';
    if (assignment.status === 'atLocation') return 'complete_handover';
    return '';
  };

  if (variant === 'completed') {
    return (
      <div
        className={`bg-white/60 rounded-2xl border-l-4 border-success p-4 shadow-sm ${onTap ? 'cursor-pointer' : ''}`}
        onClick={() => onTap?.(assignment)}
        data-testid={`jockey-card-${assignment.id}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 text-[11px] font-semibold rounded-full ${badgeBg}`}>
              {isPickup ? t('pickup') : t('return')}
            </span>
            <span className="text-sm font-medium text-neutral-500">{assignment.customer}</span>
          </div>
          <span className="text-xs text-neutral-400">{assignment.time}</span>
        </div>
      </div>
    );
  }

  const isUpcoming = variant === 'upcoming';

  return (
    <div
      className={`bg-white rounded-2xl border-l-4 ${accentColor} shadow-${isUpcoming ? 'sm' : 'md'} overflow-hidden ${isUpcoming ? 'opacity-80' : ''}`}
      data-testid={`jockey-card-${assignment.id}`}
    >
      <div
        className={`p-4 ${onTap ? 'cursor-pointer' : ''}`}
        onClick={() => onTap?.(assignment)}
      >
        {/* Top row: Type badge + status + time */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 text-[11px] font-semibold rounded-full ${badgeBg}`}>
              {isPickup ? t('pickup') : t('return')}
            </span>
            {!isUpcoming && (
              <span className="flex items-center gap-1 text-[11px] text-success font-medium">
                <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse-dot-jockey" />
                {t('assigned')}
              </span>
            )}
          </div>
          <span className="text-xs text-neutral-400 font-medium">{assignment.time}</span>
        </div>

        {/* Customer name */}
        <p className={`font-semibold text-sm ${isUpcoming ? 'text-neutral-600' : 'text-foreground'}`}>
          {assignment.customer}
        </p>

        {/* Address */}
        <div className="flex items-center gap-1.5 mt-1.5 text-xs text-neutral-500">
          <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
          <span>{assignment.address}</span>
        </div>

        {/* Vehicle */}
        <div className="flex items-center gap-1.5 mt-1 text-xs text-neutral-500">
          {assignment.vehicleBrandLogo ? (
            <img src={assignment.vehicleBrandLogo} alt="" className="w-4 h-4 object-contain shrink-0" />
          ) : (
            <Car className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
          )}
          <span>{assignment.vehicle}{assignment.licensePlate ? ` \u00B7 ${assignment.licensePlate}` : ''}</span>
        </div>
      </div>

      {/* Action button - only for active assignments */}
      {!isUpcoming && getActionText() && (
        <button
          className={`w-full py-3.5 ${actionBg} text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors min-h-[56px]`}
          onClick={() => onAction?.(assignment.id, getActionKey())}
          data-testid={`jockey-action-${assignment.id}`}
        >
          {getActionText()}
        </button>
      )}

      {/* Secondary actions - only for active assignments */}
      {!isUpcoming && (
        <div className="flex divide-x divide-neutral-100 bg-neutral-50">
          {assignment.customerPhone ? (
            <a
              href={`tel:${assignment.customerPhone}`}
              className="flex-1 py-2.5 text-xs font-medium text-neutral-500 hover:text-primary hover:bg-primary/5 flex items-center justify-center gap-1.5 transition-colors min-h-[44px]"
              data-testid={`jockey-call-${assignment.id}`}
            >
              <Phone className="w-3.5 h-3.5" />
              {t('callCustomer')}
            </a>
          ) : (
            <span className="flex-1 py-2.5 text-xs font-medium text-neutral-300 flex items-center justify-center gap-1.5 min-h-[44px]">
              <Phone className="w-3.5 h-3.5" />
              {t('callCustomer')}
            </span>
          )}
          <a
            href={getMapsUrl(assignment.address)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2.5 text-xs font-medium text-neutral-500 hover:text-primary hover:bg-primary/5 flex items-center justify-center gap-1.5 transition-colors min-h-[44px]"
            data-testid={`jockey-navigate-${assignment.id}`}
          >
            <Navigation className="w-3.5 h-3.5" />
            {t('navigateTo')}
          </a>
        </div>
      )}
    </div>
  );
}
