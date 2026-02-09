'use client';

import Image from 'next/image';
import { Car, Check, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { BookingResponse } from '@/lib/api/bookings';
import { formatEuro } from '@/lib/utils/currency';
import { resolveVehicleDisplay } from '@/lib/constants/vehicles';

interface PastBookingCardProps {
  booking: BookingResponse;
  index: number;
}

export function PastBookingCard({ booking, index }: PastBookingCardProps) {
  const t = useTranslations('customerPortal.pastBookings');
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

  const dateStr = new Date(booking.pickupDate).toLocaleDateString(
    locale === 'de' ? 'de-DE' : 'en-US',
    { day: 'numeric', month: 'short', year: 'numeric' }
  );

  const resolved = booking.vehicle
    ? resolveVehicleDisplay(booking.vehicle.brand, booking.vehicle.model)
    : null;
  const vehicleStr = resolved
    ? `${resolved.brandName} ${resolved.modelName}`
    : '';

  return (
    <div
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3.5 cursor-pointer flex items-center gap-3 hover-lift"
      onClick={() => router.push(`/${locale}/customer/bookings/${booking.id}`)}
      data-testid={`past-booking-card-${index}`}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-11 h-11 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
          {resolved?.brandLogo ? (
            <Image src={resolved.brandLogo} alt={resolved.brandName} width={28} height={28} className="object-contain" unoptimized />
          ) : (
            <Car className="w-6 h-6 text-gray-500" />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900">{serviceLabel}</p>
          <p className="text-xs text-gray-500">
            {vehicleStr} · {dateStr}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-emerald-500 text-xs font-medium rounded-full">
          <Check className="w-3 h-3" strokeWidth={2.5} />
          {t('completed')}
        </span>
        <span className="text-sm font-semibold text-gray-700 hidden sm:inline">
          {formatEuro(typeof booking.totalPrice === 'string' ? parseFloat(booking.totalPrice) : booking.totalPrice)}
        </span>
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </div>
    </div>
  );
}
