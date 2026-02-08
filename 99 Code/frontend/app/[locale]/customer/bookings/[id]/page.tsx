'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { bookingsApi, BookingResponse, ExtensionResponse } from '@/lib/api/bookings';
import { formatEuro } from '@/lib/utils/currency';
import {
  Car,
  Calendar,
  MapPin,
  Settings,
  Clock,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { PillTabs } from '@/components/customer/PillTabs';
import { BookingProgressTimeline } from '@/components/customer/BookingProgressTimeline';
import { BookingActivityTimeline } from '@/components/customer/BookingActivityTimeline';
import { ExtensionList } from '@/components/customer/ExtensionList';
import { toast } from 'sonner';

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

function BookingDetailContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('customerPortal.bookingDetail');
  const tService = useTranslations('payment.serviceTypes');
  const locale = (params.locale as string) || 'de';
  const bookingId = params.id as string;

  const defaultTab = searchParams.get('tab') || 'details';
  const [activeTab, setActiveTab] = useState(defaultTab);

  const [booking, setBooking] = useState<BookingResponse | null>(null);
  const [extensions, setExtensions] = useState<ExtensionResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBooking();
    fetchExtensions();
  }, [bookingId]);

  useEffect(() => {
    if (activeTab === 'extensions') {
      fetchExtensions();
    }
  }, [activeTab]);

  const fetchBooking = async () => {
    try {
      setIsLoading(true);
      const data = await bookingsApi.getById(bookingId);
      setBooking(data);
    } catch (error) {
      console.error('Error fetching booking:', error);
      toast.error(t('error'));
    } finally {
      setIsLoading(false);
    }
  };

  const fetchExtensions = async () => {
    try {
      const data = await bookingsApi.getExtensions(bookingId);
      setExtensions(data);
    } catch (error) {
      console.error('Error fetching extensions:', error);
    }
  };

  const handleExtensionUpdated = () => {
    fetchExtensions();
    fetchBooking();
  };

  const pendingExtCount = extensions.filter((e) => e.status === 'PENDING').length;

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString(
      locale === 'de' ? 'de-DE' : 'en-US',
      { day: '2-digit', month: '2-digit', year: 'numeric' }
    );

  const serviceLabel = (booking: BookingResponse) => {
    try {
      return tService(booking.serviceType as any);
    } catch {
      return booking.serviceType;
    }
  };

  const tabs = [
    { id: 'details', label: t('tabs.details') },
    { id: 'extensions', label: t('tabs.extensions'), badge: pendingExtCount },
    { id: 'activities', label: t('tabs.activities') },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24" data-testid="booking-detail-loading">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex flex-col items-center justify-center py-24" data-testid="booking-detail-error">
        <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
        <p className="text-gray-600 font-medium">{t('error')}</p>
      </div>
    );
  }

  const currentStep = statusProgress[booking.status] ?? 0;

  return (
    <div data-testid="booking-detail-page">
      {/* Header card with status and progress */}
      <div className="animate-card bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4" data-testid="booking-header-card">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs text-gray-400 font-mono">{booking.bookingNumber}</p>
            <h2 className="text-lg font-bold text-gray-900 mt-1">{serviceLabel(booking)}</h2>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-500 text-sm font-medium rounded-full">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse-dot" />
            {t(`status.${booking.status}`)}
          </span>
        </div>
        <BookingProgressTimeline currentStep={currentStep} />
      </div>

      {/* Pill Tabs */}
      <PillTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Content */}
      {activeTab === 'details' && (
        <div className="space-y-3" data-testid="tab-details">
          {/* Vehicle */}
          <div className="animate-card bg-white rounded-2xl shadow-sm border border-gray-100 p-4" data-testid="vehicle-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Car className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {booking.vehicle
                    ? `${booking.vehicle.brand} ${booking.vehicle.model}`
                    : '-'}
                </p>
                <p className="text-xs text-gray-500">
                  {booking.vehicle
                    ? `${booking.vehicle.year} \u00B7 ${booking.vehicle.mileage?.toLocaleString()} km \u00B7 ${booking.vehicle.licensePlate || ''}`
                    : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Service */}
          <div className="animate-card bg-white rounded-2xl shadow-sm border border-gray-100 p-4" data-testid="service-card">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Settings className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{serviceLabel(booking)}</p>
                <p className="text-xs text-gray-500">
                  {booking.services?.length
                    ? `${booking.services.length} ${booking.services.length === 1 ? 'Service' : 'Services'}`
                    : ''}
                </p>
              </div>
            </div>
            {booking.services && booking.services.length > 0 && (
              <div className="space-y-1 ml-13">
                {booking.services.map((service, i) => (
                  <div key={i} className="flex justify-between text-sm px-3 py-1.5 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">{service.type}</span>
                    <span className="font-medium text-gray-900">
                      {formatEuro(typeof service.price === 'string' ? parseFloat(service.price) : service.price)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pickup & Delivery */}
          <div className="animate-card bg-white rounded-2xl shadow-sm border border-gray-100 p-4" data-testid="schedule-card">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{t('pickup')}</p>
                  <p className="text-xs text-gray-500">
                    {formatDate(booking.pickupDate)}
                    {booking.pickupTimeSlot ? ` \u00B7 ${booking.pickupTimeSlot}` : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{t('address')}</p>
                  <p className="text-xs text-gray-500">
                    {booking.pickupAddress}, {booking.pickupPostalCode} {booking.pickupCity}
                  </p>
                </div>
              </div>
              {booking.deliveryDate && (
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{t('delivery')}</p>
                    <p className="text-xs text-gray-500">
                      {formatDate(booking.deliveryDate)}
                      {booking.deliveryTimeSlot ? ` \u00B7 ${booking.deliveryTimeSlot}` : ''}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Price */}
          <div className="animate-card bg-white rounded-2xl shadow-sm border border-gray-100 p-4" data-testid="price-card">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-900">{t('totalPrice')}</span>
              <span className="text-xl font-bold text-blue-500">
                {formatEuro(typeof booking.totalPrice === 'string' ? parseFloat(booking.totalPrice) : booking.totalPrice)}
              </span>
            </div>
          </div>

          {/* Notes */}
          {booking.customerNotes && (
            <div className="animate-card bg-white rounded-2xl shadow-sm border border-gray-100 p-4" data-testid="notes-card">
              <p className="text-sm font-semibold text-gray-900 mb-1">{t('notes')}</p>
              <p className="text-sm text-gray-500">{booking.customerNotes}</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'extensions' && (
        <div data-testid="tab-extensions">
          <ExtensionList
            bookingId={bookingId}
            extensions={extensions}
            onExtensionUpdated={handleExtensionUpdated}
          />
        </div>
      )}

      {activeTab === 'activities' && (
        <div data-testid="tab-activities">
          <BookingActivityTimeline booking={booking} extensions={extensions} />
        </div>
      )}
    </div>
  );
}

export default function BookingDetailPage() {
  return (
    <Suspense fallback={null}>
      <BookingDetailContent />
    </Suspense>
  );
}
