'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Car, ArrowLeft, ArrowRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n/useLovableTranslation";
import { StepIndicator } from "@/components/booking/StepIndicator";
import { ConciergeBanner } from "@/components/booking/ConciergeBanner";
import { VehicleStep } from "@/components/booking/VehicleStep";
import { ServiceStep } from "@/components/booking/ServiceStep";
import { PickupStep } from "@/components/booking/PickupStep";
import { ConfirmationStep } from "@/components/booking/ConfirmationStep";
import { toast } from "sonner";
import { ClipboardCheck, Droplets, Disc, Wind } from "lucide-react";
import { bookingsApi, CreateBookingRequest } from "@/lib/api/bookings";

const serviceConfig = [
  {
    id: "inspection",
    price: 149,
    icon: ClipboardCheck,
  },
  {
    id: "oil",
    price: 89,
    icon: Droplets,
  },
  {
    id: "brakes",
    price: 199,
    icon: Disc,
  },
  {
    id: "ac",
    price: 119,
    icon: Wind,
  },
];

export default function BookingPage() {
  const router = useRouter();
  const { t, language } = useLanguage();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    year: "",
    mileage: "",
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

  const services = serviceConfig.map((config) => ({
    ...config,
    name: t.booking.step2.services[config.id as keyof typeof t.booking.step2.services].name,
    description: t.booking.step2.services[config.id as keyof typeof t.booking.step2.services].description,
  }));

  const steps = [
    t.booking.steps.vehicle,
    t.booking.steps.service,
    t.booking.steps.pickup,
    t.booking.steps.confirm,
  ];

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    console.log('🔵 handleSubmit called');
    console.log('📝 Form data:', formData);

    try {
      setIsSubmitting(true);

      // Validate required fields
      if (!formData.date || !formData.time || !formData.returnDate || !formData.returnTime) {
        console.error('❌ Validation failed: Missing required fields');
        toast.error(language === "de" ? "Bitte füllen Sie alle Felder aus" : "Please fill all fields");
        return;
      }

      // Format data for API
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

      console.log('📤 Sending booking data:', bookingData);

      // Call API
      const result = await bookingsApi.create(bookingData);

      console.log('✅ Booking successful:', result);

      toast.success(
        language === "de" ? "Buchung erfolgreich!" : "Booking successful!",
        {
          description: language === "de"
            ? `Ihre Buchungsnummer: ${result.bookingNumber}`
            : `Your booking number: ${result.bookingNumber}`
        }
      );

      // Redirect to registration page with booking details
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
      console.error('❌ Booking error:', error);
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
        return formData.brand && formData.model && formData.year && formData.mileage;
      case 2:
        return formData.selectedServices.length > 0;
      case 3:
        return formData.date && formData.time && formData.returnDate && formData.returnTime && formData.street && formData.zip && formData.city;
      case 4:
        return formData.email && formData.firstName && formData.lastName && formData.phone && formData.acceptTerms;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-background">
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

      {/* Concierge Banner */}
      <ConciergeBanner
        title={t.booking.conciergeBanner.title}
        subtitle={t.booking.conciergeBanner.subtitle}
      />

      <main className="container mx-auto max-w-2xl px-4 py-8">
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
              saveVehicle: formData.saveVehicle,
            }}
            onUpdate={(data) => setFormData({ ...formData, ...data })}
            translations={t.booking.step1}
          />
        )}

        {/* Step 2: Service */}
        {step === 2 && (
          <ServiceStep
            selectedServices={formData.selectedServices}
            onUpdate={(services) => setFormData({ ...formData, selectedServices: services })}
            translations={t.booking.step2}
            language={language}
          />
        )}

        {/* Step 3: Date & Address - Concierge Pickup */}
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
            onUpdate={(data) => setFormData({ ...formData, ...data })}
            translations={t.booking.step3}
            language={language}
          />
        )}

        {/* Step 4: Payment */}
        {step === 4 && (
          <ConfirmationStep
            formData={formData}
            onUpdate={(data) => setFormData({ ...formData, ...data })}
            translations={t.booking.step4}
            services={services}
            language={language}
          />
        )}

        {/* Navigation */}
        <div className="mt-8 flex justify-between">
          {step > 1 ? (
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {language === "de" ? "Zurück" : "Back"}
            </Button>
          ) : (
            <div />
          )}
          {step < 4 ? (
            <Button variant="cta" onClick={handleNext} disabled={!isStepValid()}>
              {language === "de" ? "Weiter" : "Next"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="cta"
              size="lg"
              onClick={handleSubmit}
              disabled={!isStepValid() || isSubmitting}
            >
              {isSubmitting
                ? (language === "de" ? "Wird gebucht..." : "Booking...")
                : t.booking.step4.submit}
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
