'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Car, ArrowLeft, ArrowRight, Lock } from "lucide-react";
import { useLanguage } from "@/lib/i18n/useLovableTranslation";
import { StepIndicator } from "@/components/booking/StepIndicator";
import { VehicleStep } from "@/components/booking/VehicleStep";
import { ServiceStep, serviceConfig } from "@/components/booking/ServiceStep";
import { PickupStep } from "@/components/booking/PickupStep";
import { ConfirmationStep } from "@/components/booking/ConfirmationStep";
import { toast } from "sonner";
import { bookingsApi, CreateBookingRequest } from "@/lib/api/bookings";
import { calculateWizardServicePrices } from "@/lib/api/pricing";

export default function BookingPage() {
  const router = useRouter();
  const { t, language } = useLanguage();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dynamicPrices, setDynamicPrices] = useState<Record<string, number>>({});
  const [pricesLoading, setPricesLoading] = useState(false);
  const [pricesCacheKey, setPricesCacheKey] = useState('');
  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    year: "",
    mileage: "",
    licensePlate: "",
    saveVehicle: false,
    selectedServices: [] as string[],
    date: undefined as Date | undefined,
    time: "",
    returnDate: undefined as Date | undefined,
    returnTime: "",
    street: "",
    zip: "",
    city: "",
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    acceptTerms: false,
  });

  const services = serviceConfig.map((config) => {
    const serviceTranslation = t.booking?.step2?.services?.[config.id as keyof typeof t.booking.step2.services];
    return {
      id: config.id,
      name: serviceTranslation?.name || config.id,
      description: serviceTranslation?.description || '',
      price: dynamicPrices[config.id] ?? 0,
    };
  });

  const steps = [
    language === 'de' ? 'Fahrzeug' : 'Vehicle',
    language === 'de' ? 'Service' : 'Service',
    language === 'de' ? 'Termin' : 'Appointment',
    language === 'de' ? 'Übersicht' : 'Summary',
  ];

  const handleNext = () => {
    if (step === 1) {
      // Moving to services step – fetch dynamic prices
      const cacheKey = `${formData.brand}-${formData.model}-${formData.year}-${formData.mileage}`;
      if (cacheKey !== pricesCacheKey) {
        setPricesLoading(true);
        const vehicle = {
          brand: formData.brand,
          model: formData.model,
          year: parseInt(formData.year),
          mileage: parseInt(formData.mileage),
        };
        const allServiceIds = serviceConfig.map((s) => s.id);
        calculateWizardServicePrices(vehicle, allServiceIds)
          .then((prices) => {
            setDynamicPrices(prices);
            setPricesCacheKey(cacheKey);
          })
          .catch(() => {
            // Fallback: prices stay empty, ServiceStep shows '–'
          })
          .finally(() => {
            setPricesLoading(false);
          });
      }
    }
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      if (!formData.date || !formData.time || !formData.returnDate || !formData.returnTime) {
        toast.error(language === "de" ? "Bitte füllen Sie alle Felder aus" : "Please fill all fields");
        return;
      }

      const bookingData: CreateBookingRequest = {
        customer: {
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone
        },
        vehicle: {
          brand: formData.brand,
          model: formData.model,
          year: parseInt(formData.year),
          mileage: parseInt(formData.mileage),
          licensePlate: formData.licensePlate || undefined,
          saveVehicle: formData.saveVehicle
        },
        services: formData.selectedServices,
        pickup: {
          date: formData.date.toISOString(),
          timeSlot: formData.time,
          street: formData.street,
          city: formData.city,
          postalCode: formData.zip
        },
        delivery: {
          date: formData.returnDate.toISOString(),
          timeSlot: formData.returnTime
        }
      };

      const result = await bookingsApi.create(bookingData);

      toast.success(
        language === "de" ? "Buchung erfolgreich!" : "Booking successful!",
        {
          description: language === "de"
            ? `Ihre Buchungsnummer: ${result.bookingNumber}`
            : `Your booking number: ${result.bookingNumber}`
        }
      );

      setTimeout(() => {
        const params = new URLSearchParams({
          bookingNumber: result.bookingNumber,
          bookingId: result.id,
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone
        });
        router.push(`/${language}/booking/register?${params.toString()}`);
      }, 1500);
    } catch (error) {
      toast.error(
        language === "de" ? "Buchung fehlgeschlagen" : "Booking failed",
        {
          description: error instanceof Error
            ? error.message
            : (language === "de"
              ? "Bitte versuchen Sie es später erneut"
              : "Please try again later")
        }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.brand && formData.brand !== 'andere' && formData.model && formData.year && formData.mileage;
      case 2:
        return formData.selectedServices.length > 0;
      case 3:
        return formData.date && formData.time && formData.street && formData.zip && formData.city;
      case 4:
        return formData.email && formData.firstName && formData.lastName && formData.phone && formData.acceptTerms;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-background" data-testid="booking-page">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href={`/${language}`} className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Car className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">AutoConcierge</span>
          </Link>
          <Link href={`/${language}`}>
            <Button variant="ghost" size="sm">
              {language === "de" ? "Abbrechen" : "Cancel"}
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto max-w-2xl px-4 py-8">
        {/* Section heading */}
        <div className="text-center mb-8">
          <span className="text-blue-500 font-semibold text-sm uppercase tracking-widest">
            {language === 'de' ? 'Buchung' : 'Booking'}
          </span>
          <h2 className="text-2xl md:text-3xl font-bold mt-2">
            {language === 'de' ? 'Service buchen' : 'Book a service'}
          </h2>
          <p className="text-muted-foreground mt-2 text-sm">
            {language === 'de' ? 'In wenigen Schritten zum Wunschtermin.' : 'Your preferred appointment in just a few steps.'}
          </p>
        </div>

        {/* Progress */}
        <StepIndicator currentStep={step} steps={steps} />

        {/* Step 1: Vehicle */}
        {step === 1 && (
          <VehicleStep
            formData={{
              brand: formData.brand,
              model: formData.model,
              year: formData.year,
              mileage: formData.mileage,
              licensePlate: formData.licensePlate,
              saveVehicle: formData.saveVehicle,
            }}
            onUpdate={(data) => setFormData(prev => ({ ...prev, ...data }))}
            translations={t.booking.step1}
          />
        )}

        {/* Step 2: Service */}
        {step === 2 && (
          <ServiceStep
            selectedServices={formData.selectedServices}
            onUpdate={(services) => setFormData(prev => ({ ...prev, selectedServices: services }))}
            translations={t.booking.step2}
            language={language}
            prices={dynamicPrices}
            pricesLoading={pricesLoading}
          />
        )}

        {/* Step 3: Appointment */}
        {step === 3 && (
          <PickupStep
            formData={{
              date: formData.date,
              time: formData.time,
              returnDate: formData.returnDate,
              returnTime: formData.returnTime,
              street: formData.street,
              zip: formData.zip,
              city: formData.city,
            }}
            onUpdate={(data) => setFormData(prev => ({ ...prev, ...data }))}
            translations={t.booking.step3}
            language={language}
          />
        )}

        {/* Step 4: Summary */}
        {step === 4 && (
          <ConfirmationStep
            formData={formData}
            onUpdate={(data) => setFormData(prev => ({ ...prev, ...data }))}
            translations={t.booking.step4}
            services={services}
            language={language}
          />
        )}

        {/* Navigation */}
        <div className="mt-8 flex justify-between">
          {step > 1 ? (
            <button
              onClick={handleBack}
              className="px-6 py-3.5 rounded-xl font-semibold border-2 border-gray-200 text-gray-600 hover:bg-gray-50 transition inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {language === "de" ? "Zurück" : "Back"}
            </button>
          ) : (
            <div />
          )}
          {step < 4 ? (
            <button
              onClick={handleNext}
              disabled={!isStepValid()}
              className="btn-primary-landing px-8 py-3.5 rounded-xl font-semibold inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {language === "de" ? "Weiter" : "Next"}
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!isStepValid() || isSubmitting}
              className="btn-primary-landing px-8 py-3.5 rounded-xl font-bold inline-flex items-center gap-2 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Lock className="w-5 h-5" />
              {isSubmitting
                ? (language === "de" ? "Wird gebucht..." : "Booking...")
                : (language === "de" ? "Jetzt kostenpflichtig buchen" : "Book now (paid)")}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
