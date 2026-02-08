'use client';

import { Car, Settings, Clock, Phone, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { BookingResponse } from '@/lib/api/bookings';
import { BookingProgressTimeline } from './BookingProgressTimeline';

const statusProgress: Record<string, number> = {
  PENDING_PAYMENT: 0,
  CONFIRMED: 0,
  PICKUP_ASSIGNED: 1,
  PICKED_UP: 1,
  AT_WORKSHOP: 2,
  IN_SERVICE: 2,
  READY_FOR_RETURN: 3,
  RETURN_ASSIGNED: 3,
  RETURNED: 4,
  DELIVERED: 4,
  JOCKEY_ASSIGNED: 1,
  IN_TRANSIT_TO_WORKSHOP: 1,
  IN_WORKSHOP: 2,
  COMPLETED: 4,
  IN_TRANSIT_TO_CUSTOMER: 3,
};

interface ActiveBookingHeroCardProps {
  booking: BookingResponse;
}

export function ActiveBookingHeroCard({ booking }: ActiveBookingHeroCardProps) {
  const t = useTranslations('customerPortal.activeBooking');
  const tService = useTranslations('payment.serviceTypes');
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || 'de';

  const currentStep = statusProgress[booking.status] ?? 0;

  const serviceLabel = (() => {
    try {
      return tService(booking.serviceType as any);
    } catch {
      return booking.serviceType;
    }
  })();

  return (
    <div className="mb-4 animate-card" data-testid="active-booking-hero">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex">
          <div className="w-1.5 bg-gradient-to-b from-blue-500 to-blue-600 flex-shrink-0 rounded-l-2xl" />
          <div className="flex-1 p-4">
            {/* Header */}
            <div className="flex items-start justify-between mb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-500 text-sm font-medium rounded-full">
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse-dot" />
                    {t('inProgress')}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mt-2">{t('title')}</h3>
              </div>
              <span className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded">
                {booking.bookingNumber}
              </span>
            </div>

            {/* Progress Timeline */}
            <BookingProgressTimeline currentStep={currentStep} />

            {/* Info rows */}
            <div className="grid grid-cols-1 gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Car className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {booking.vehicle
                      ? `${booking.vehicle.brand} ${booking.vehicle.model} · ${booking.vehicle.year}`
                      : '-'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {booking.vehicle?.licensePlate || ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Settings className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{serviceLabel}</p>
                  <p className="text-xs text-gray-500">
                    {booking.services && booking.services.length > 1
                      ? `${booking.services.length} Services`
                      : ''}
                  </p>
                </div>
              </div>
              {booking.deliveryDate && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {new Date(booking.deliveryDate).toLocaleDateString(
                        locale === 'de' ? 'de-DE' : 'en-US',
                        { day: 'numeric', month: 'short' }
                      )}
                      {booking.deliveryTimeSlot ? `, ${booking.deliveryTimeSlot}` : ''}
                    </p>
                    <p className="text-xs text-gray-500">{t('estimatedCompletion')}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => router.push(`/${locale}/customer/bookings/${booking.id}`)}
                className="btn-hover bg-blue-500 hover:bg-blue-600 text-white font-medium px-5 py-2.5 rounded-xl text-sm flex items-center gap-2"
                data-testid="hero-view-details"
              >
                {t('viewDetails')}
                <ChevronRight className="w-4 h-4" />
              </button>
              <button className="btn-hover border border-gray-300 hover:border-gray-400 text-gray-700 font-medium px-5 py-2.5 rounded-xl text-sm flex items-center gap-2">
                <Phone className="w-4 h-4" />
                {t('contactWorkshop')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
