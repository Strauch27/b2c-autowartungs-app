'use client';

import Image from 'next/image';
import { Car, Calendar, Clock, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { BookingResponse } from '@/lib/api/bookings';
import { resolveVehicleDisplay } from '@/lib/constants/vehicles';

interface UpcomingAppointmentCardProps {
  booking: BookingResponse;
}

export function UpcomingAppointmentCard({ booking }: UpcomingAppointmentCardProps) {
  const t = useTranslations('customerPortal.upcomingAppointments');
  const tService = useTranslations('payment.serviceTypes');
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || 'de';

  const serviceLabel = (() => {
    try {
      return tService(booking.serviceType as any);
    } catch {
      return booking.serviceType;
    }
  })();

  const pickupDateStr = new Date(booking.pickupDate).toLocaleDateString(
    locale === 'de' ? 'de-DE' : 'en-US',
    { weekday: 'short', day: 'numeric', month: 'short' }
  );

  const deliveryDateStr = booking.deliveryDate
    ? new Date(booking.deliveryDate).toLocaleDateString(
        locale === 'de' ? 'de-DE' : 'en-US',
        { weekday: 'short', day: 'numeric', month: 'short' }
      )
    : null;

  const resolved = booking.vehicle
    ? resolveVehicleDisplay(booking.vehicle.brand, booking.vehicle.model)
    : null;

  return (
    <div
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3.5 cursor-pointer hover-lift"
      onClick={() => router.push(`/${locale}/customer/bookings/${booking.id}`)}
      data-testid="upcoming-appointment-card"
    >
      <div className="flex items-center gap-3">
        {/* Vehicle icon / brand logo */}
        <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
          {resolved?.brandLogo ? (
            <Image src={resolved.brandLogo} alt={resolved.brandName} width={28} height={28} className="object-contain" unoptimized />
          ) : (
            <Car className="w-6 h-6 text-blue-500" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">{serviceLabel}</p>
          <p className="text-xs text-gray-500">
            {resolved ? `${resolved.brandName} ${resolved.modelName}` : ''}
            {booking.vehicle?.year ? ` (${booking.vehicle.year})` : ''}
          </p>
        </div>

        {/* Date & time */}
        <div className="flex-shrink-0 text-right">
          <div className="flex items-center gap-1.5 justify-end">
            <Calendar className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-sm font-medium text-gray-900">{pickupDateStr}</span>
          </div>
          {booking.pickupTimeSlot && (
            <div className="flex items-center gap-1.5 justify-end mt-0.5">
              <Clock className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-500">{booking.pickupTimeSlot}</span>
            </div>
          )}
        </div>

        <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
      </div>

      {/* Pickup / Return dates row */}
      {deliveryDateStr && (
        <div className="mt-2.5 pt-2.5 border-t border-gray-50 flex items-center gap-4 text-xs text-gray-500">
          <span>
            <span className="font-medium text-gray-600">{t('pickup')}:</span> {pickupDateStr}
            {booking.pickupTimeSlot ? `, ${booking.pickupTimeSlot}` : ''}
          </span>
          <span>
            <span className="font-medium text-gray-600">{t('return')}:</span> {deliveryDateStr}
            {booking.deliveryTimeSlot ? `, ${booking.deliveryTimeSlot}` : ''}
          </span>
        </div>
      )}
    </div>
  );
}
