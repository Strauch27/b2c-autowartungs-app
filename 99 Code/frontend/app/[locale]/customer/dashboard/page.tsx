'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-hooks';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { bookingsApi, BookingResponse, ExtensionResponse } from '@/lib/api/bookings';
import { Loader2 } from 'lucide-react';
import { ActiveBookingHeroCard } from '@/components/customer/ActiveBookingHeroCard';
import { ExtensionAlertBanner } from '@/components/customer/ExtensionAlertBanner';
import { QuickStatsRow } from '@/components/customer/QuickStatsRow';
import { PastBookingCard } from '@/components/customer/PastBookingCard';
import { UpcomingAppointmentCard } from '@/components/customer/UpcomingAppointmentCard';

const COMPLETED_STATUSES = ['DELIVERED', 'RETURNED', 'COMPLETED'];
const TERMINAL_STATUSES = [...COMPLETED_STATUSES, 'CANCELLED'];

function getGreetingKey(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
}

export default function CustomerDashboardPage() {
  const { user } = useAuth();
  const t = useTranslations('customerPortal');
  const params = useParams();
  const locale = (params.locale as string) || 'de';
  const router = useRouter();

  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingExtensions, setPendingExtensions] = useState<{
    count: number;
    description: string;
    amount: string;
    bookingId: string;
  } | null>(null);

  useEffect(() => {
    async function fetchBookings() {
      try {
        setIsLoading(true);
        const result = await bookingsApi.getAll({ limit: 50 });
        setBookings(result.bookings);
      } catch (error) {
        console.error('Failed to fetch bookings:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchBookings();

    // Poll for status updates every 15 seconds
    const interval = setInterval(() => {
      bookingsApi.getAll({ limit: 50 }).then((result) => {
        setBookings(result.bookings);
      }).catch(() => {});
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  // Fetch pending extension counts for active bookings
  useEffect(() => {
    async function fetchPendingExtensions() {
      const activeList = bookings.filter(
        (b) => !TERMINAL_STATUSES.includes(b.status)
      );
      for (const booking of activeList) {
        try {
          const exts = await bookingsApi.getExtensions(booking.id);
          const pending = exts.filter((e) => e.status === 'PENDING');
          if (pending.length > 0) {
            const first = pending[0];
            setPendingExtensions({
              count: pending.length,
              description: first.description,
              amount: `${(first.totalAmount / 100).toFixed(2)} \u20AC`,
              bookingId: booking.id,
            });
            return;
          }
        } catch {
          // ignore per-booking errors
        }
      }
    }
    if (bookings.length > 0) fetchPendingExtensions();
  }, [bookings]);

  const activeBooking = bookings.find(
    (b) => !TERMINAL_STATUSES.includes(b.status)
  );

  const pastBookings = bookings.filter((b) =>
    COMPLETED_STATUSES.includes(b.status)
  );

  // Upcoming bookings: non-terminal, non-active (i.e. future pickups), sorted by date
  const upcomingBookings = bookings
    .filter((b) => {
      if (TERMINAL_STATUSES.includes(b.status)) return false;
      if (activeBooking && b.id === activeBooking.id) return false;
      const pickupDate = new Date(b.pickupDate);
      return pickupDate >= new Date(new Date().toDateString());
    })
    .sort((a, b) => new Date(a.pickupDate).getTime() - new Date(b.pickupDate).getTime());

  const completedCount = pastBookings.length;

  const nextAppointment = (() => {
    if (!activeBooking?.deliveryDate) return '';
    return new Date(activeBooking.deliveryDate).toLocaleDateString(
      locale === 'de' ? 'de-DE' : 'en-US',
      { day: 'numeric', month: 'short' }
    );
  })();

  const firstName = user?.name?.split(' ')[0] || user?.email?.split('@')[0] || '';
  const greetingKey = getGreetingKey();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24" data-testid="dashboard-loading">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div data-testid="customer-dashboard">
      {/* Greeting */}
      <div className="mb-4 animate-card" data-testid="greeting-section">
        <h1 className="text-xl font-bold text-gray-900">
          {t(`greeting.${greetingKey}`, { name: firstName })}
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">{t('greeting.subtitle')}</p>
      </div>

      {/* Extension Alert Banner */}
      {pendingExtensions && (
        <ExtensionAlertBanner
          count={pendingExtensions.count}
          description={pendingExtensions.description}
          amount={pendingExtensions.amount}
          onReview={() =>
            router.push(
              `/${locale}/customer/bookings/${pendingExtensions.bookingId}?tab=extensions`
            )
          }
        />
      )}

      {/* Active Booking Hero */}
      {activeBooking && <ActiveBookingHeroCard booking={activeBooking} />}

      {/* Upcoming Appointments */}
      {upcomingBookings.length > 0 && (
        <div className="mb-4 animate-card" data-testid="upcoming-appointments-section">
          <h2 className="font-semibold text-gray-900 mb-3">
            {t('upcomingAppointments.title')}
          </h2>
          <div className="space-y-2">
            {upcomingBookings.slice(0, 3).map((booking) => (
              <UpcomingAppointmentCard key={booking.id} booking={booking} />
            ))}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <QuickStatsRow
        servicesCount={completedCount}
        nextAppointment={nextAppointment}
        rating={0}
      />

      {/* Past Bookings */}
      {pastBookings.length > 0 && (
        <div className="animate-card" data-testid="past-bookings-section">
          <h2 className="font-semibold text-gray-900 mb-3">
            {t('pastBookings.title')}
          </h2>
          <div className="space-y-2">
            {pastBookings.slice(0, 5).map((booking, index) => (
              <PastBookingCard key={booking.id} booking={booking} index={index} />
            ))}
          </div>
        </div>
      )}

      {/* Empty state - no bookings at all */}
      {bookings.length === 0 && (
        <div className="animate-card bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center" data-testid="empty-state">
          <p className="text-gray-500 text-sm">{t('greeting.noBookings')}</p>
        </div>
      )}
    </div>
  );
}
