'use client';

import { Settings, AlertCircle, Check, CheckCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { BookingResponse, ExtensionResponse } from '@/lib/api/bookings';
import { cn } from '@/lib/utils';

interface TimelineEntry {
  type: 'current' | 'extension' | 'completed' | 'info';
  title: string;
  description: string;
  timestamp: string;
}

interface BookingActivityTimelineProps {
  booking: BookingResponse;
  extensions: ExtensionResponse[];
}

const statusOrder = [
  'PENDING_PAYMENT', 'CONFIRMED', 'PICKUP_ASSIGNED', 'PICKED_UP',
  'AT_WORKSHOP', 'IN_SERVICE', 'READY_FOR_RETURN', 'RETURN_ASSIGNED',
  'RETURNED', 'DELIVERED', 'COMPLETED',
];

function buildTimeline(
  booking: BookingResponse,
  extensions: ExtensionResponse[],
  t: any,
  locale: string,
): TimelineEntry[] {
  const entries: TimelineEntry[] = [];
  const isCompleted = ['DELIVERED', 'RETURNED', 'COMPLETED'].includes(booking.status);

  // Current status entry
  const statusIdx = statusOrder.indexOf(booking.status);

  if (['AT_WORKSHOP', 'IN_SERVICE'].includes(booking.status)) {
    entries.push({
      type: 'current',
      title: t('inWorkshop'),
      description: t('serviceInProgress'),
      timestamp: booking.updatedAt,
    });
  } else if (['READY_FOR_RETURN', 'RETURN_ASSIGNED'].includes(booking.status)) {
    entries.push({
      type: isCompleted ? 'completed' : 'current',
      title: t('serviceCompleted'),
      description: '',
      timestamp: booking.updatedAt,
    });
  } else if (isCompleted) {
    entries.push({
      type: 'completed',
      title: t('vehicleReturned'),
      description: '',
      timestamp: booking.updatedAt,
    });
  }

  // Extension events (in reverse chronological)
  const sortedExt = [...extensions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  for (const ext of sortedExt) {
    if (ext.approvedAt) {
      entries.push({
        type: 'completed',
        title: t('extensionApproved'),
        description: `${ext.description}`,
        timestamp: ext.approvedAt,
      });
    }
    if (ext.declinedAt) {
      entries.push({
        type: 'completed',
        title: t('extensionDeclined'),
        description: `${ext.description}`,
        timestamp: ext.declinedAt,
      });
    }
    entries.push({
      type: 'extension',
      title: t('extensionCreated'),
      description: `${ext.description} — ${(ext.totalAmount / 100).toFixed(2)} €`,
      timestamp: ext.createdAt,
    });
  }

  // Pickup event
  if (statusIdx >= statusOrder.indexOf('PICKED_UP')) {
    entries.push({
      type: 'completed',
      title: t('vehiclePickedUp'),
      description: booking.jockey
        ? t('jockeyPickedUp', { name: `${booking.jockey.firstName || ''} ${(booking.jockey.lastName || '').charAt(0)}.`.trim() })
        : '',
      timestamp: booking.pickupDate,
    });
  }

  if (statusIdx >= statusOrder.indexOf('PICKUP_ASSIGNED')) {
    entries.push({
      type: 'completed',
      title: t('jockeyEnRoute'),
      description: '',
      timestamp: booking.pickupDate,
    });
  }

  // Booking confirmed
  entries.push({
    type: 'info',
    title: t('bookingConfirmed'),
    description: t('bookingCreatedDesc', { bookingNumber: booking.bookingNumber }),
    timestamp: booking.createdAt,
  });

  // Sort by timestamp descending
  entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return entries;
}

export function BookingActivityTimeline({ booking, extensions }: BookingActivityTimelineProps) {
  const t = useTranslations('customerPortal.activities');
  const params = useParams();
  const locale = (params.locale as string) || 'de';

  const entries = buildTimeline(booking, extensions, t, locale);

  const formatTimestamp = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleDateString(locale === 'de' ? 'de-DE' : 'en-US', {
      day: '2-digit',
      month: '2-digit',
    }) + ' · ' + d.toLocaleTimeString(locale === 'de' ? 'de-DE' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const dotStyles = {
    current: 'bg-blue-500 animate-timeline-pulse',
    extension: 'bg-amber-400',
    completed: 'bg-emerald-500',
    info: 'bg-blue-500',
  };

  const iconMap = {
    current: <Settings className="w-4 h-4 text-white" />,
    extension: <AlertCircle className="w-4 h-4 text-white" />,
    completed: <Check className="w-4 h-4 text-white" strokeWidth={2.5} />,
    info: <CheckCircle className="w-4 h-4 text-white" />,
  };

  return (
    <div className="animate-card bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5" data-testid="activities-timeline">
      <h3 className="font-semibold text-gray-900 mb-6">{t('title')}</h3>
      <div className="relative">
        <div className="absolute left-4 top-3 bottom-3 w-0.5 bg-gray-200" />
        <div className="space-y-6">
          {entries.map((entry, i) => (
            <div key={i} className="relative flex gap-4" data-testid={`timeline-entry-${i}`}>
              <div className={cn('w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10', dotStyles[entry.type])}>
                {iconMap[entry.type]}
              </div>
              <div className="pt-0.5">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs text-gray-400 font-mono">{formatTimestamp(entry.timestamp)}</span>
                  {i === 0 && entry.type === 'current' && (
                    <span className="inline-flex px-1.5 py-0.5 bg-blue-50 text-blue-500 text-[10px] font-medium rounded">
                      {t('current')}
                    </span>
                  )}
                </div>
                <p className="text-sm font-semibold text-gray-900">{entry.title}</p>
                {entry.description && (
                  <p className="text-sm text-gray-500">{entry.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
