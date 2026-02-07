'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/useLovableTranslation';
import { useAuth } from '@/lib/auth-hooks';
import { PickupStep } from '@/components/booking/PickupStep';
import { bookingsApi, CreateBookingRequest } from '@/lib/api/bookings';
import { toast } from 'sonner';
import { Suspense } from 'react';

function AppointmentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const locale = (params.locale as string) || 'de';
  const { t, language } = useLanguage();
  const { user } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Vehicle + service from URL params
  const brand = searchParams.get('brand') || '';
  const model = searchParams.get('model') || '';
  const year = searchParams.get('year') || '';
  const mileage = searchParams.get('mileage') || '';
  const serviceType = searchParams.get('serviceType') || '';

  // Pickup form state
  const [formData, setFormData] = useState({
    date: undefined as Date | undefined,
    time: '',
    returnDate: undefined as Date | undefined,
    returnTime: '',
    street: '',
    zip: '',
    city: '',
  });

  // Redirect if missing data
  useEffect(() => {
    if (!brand || !model || !serviceType) {
      router.push(`/${locale}/customer/booking`);
    }
  }, [brand, model, serviceType, router, locale]);

  const isValid =
    formData.date &&
    formData.time &&
    formData.returnDate &&
    formData.returnTime &&
    formData.street &&
    formData.zip &&
    formData.city;

  const handleSubmit = async () => {
    if (!isValid || !formData.date || !formData.returnDate) return;

    try {
      setIsSubmitting(true);

      const bookingData: CreateBookingRequest = {
        customer: {
          email: user?.email || '',
          firstName: user?.name?.split(' ')[0] || '',
          lastName: user?.name?.split(' ').slice(1).join(' ') || '',
          phone: '',
        },
        vehicle: {
          brand,
          model,
          year: parseInt(year),
          mileage: parseInt(mileage),
          saveVehicle: false,
        },
        services: [serviceType],
        pickup: {
          date: formData.date.toISOString(),
          timeSlot: formData.time,
          street: formData.street,
          city: formData.city,
          postalCode: formData.zip,
        },
        delivery: {
          date: formData.returnDate.toISOString(),
          timeSlot: formData.returnTime,
        },
      };

      const result = await bookingsApi.create(bookingData);

      toast.success(
        language === 'de' ? 'Buchung erstellt!' : 'Booking created!',
        {
          description:
            language === 'de'
              ? `Buchungsnummer: ${result.bookingNumber}`
              : `Booking number: ${result.bookingNumber}`,
        }
      );

      router.push(
        `/${locale}/customer/booking/payment?bookingId=${result.id}`
      );
    } catch (error) {
      console.error('Booking error:', error);
      toast.error(
        language === 'de' ? 'Buchung fehlgeschlagen' : 'Booking failed',
        {
          description:
            error instanceof Error
              ? error.message
              : language === 'de'
                ? 'Bitte versuchen Sie es erneut'
                : 'Please try again',
        }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!brand || !model || !serviceType) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 opacity-50">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 font-semibold">
                1
              </div>
              <span className="text-sm font-medium">
                {t.bookingPage.step1Label}
              </span>
            </div>
            <div className="flex-1 mx-4 border-t-2 border-gray-300" />
            <div className="flex items-center space-x-2 opacity-50">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 font-semibold">
                2
              </div>
              <span className="text-sm font-medium">
                {t.bookingPage.step2Label}
              </span>
            </div>
            <div className="flex-1 mx-4 border-t-2 border-gray-300" />
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                3
              </div>
              <span className="text-sm font-medium">
                {t.bookingPage.step3Label}
              </span>
            </div>
          </div>
        </div>

        {/* Vehicle + Service summary */}
        <div className="mb-6 rounded-lg bg-white p-4 border text-sm text-muted-foreground">
          <span className="font-medium text-foreground">
            {brand} {model}
          </span>{' '}
          ({year}, {parseInt(mileage).toLocaleString()} km) &middot;{' '}
          <span className="capitalize">{serviceType.replace(/_/g, ' ')}</span>
        </div>

        {/* Pickup Step */}
        <PickupStep
          formData={formData}
          onUpdate={(data) => setFormData((prev) => ({ ...prev, ...data }))}
          translations={t.booking.step3}
          language={language as 'de' | 'en'}
        />

        {/* Navigation */}
        <div className="mt-8 flex justify-between">
          <Button
            variant="outline"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {language === 'de' ? 'Zurück' : 'Back'}
          </Button>
          <Button
            variant="cta"
            size="lg"
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {language === 'de' ? 'Wird gebucht...' : 'Booking...'}
              </>
            ) : (
              <>
                {language === 'de' ? 'Weiter zur Zahlung' : 'Continue to Payment'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function AppointmentPage() {
  return (
    <Suspense fallback={null}>
      <AppointmentContent />
    </Suspense>
  );
}
