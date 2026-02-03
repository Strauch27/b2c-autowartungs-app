"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-hooks";
import { VehicleSelectionForm } from "@/components/customer/VehicleSelectionForm";
import { VehicleFormData } from "@/lib/validations/vehicle-schema";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Car, ChevronRight, UserPlus } from "lucide-react";

export default function BookingPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string || 'de';
  const { isAuthenticated, isLoading } = useAuth();
  const [isFormValid, setIsFormValid] = useState(false);
  const [vehicleData, setVehicleData] = useState<VehicleFormData | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    // Redirect to registration if not authenticated
    if (!isLoading && !isAuthenticated) {
      router.push(`/${locale}/customer/register`);
    }
  }, [isLoading, isAuthenticated, router, locale]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render the form if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  const handleVehicleSubmit = (data: VehicleFormData) => {
    console.log("Vehicle data submitted:", data);
    setVehicleData(data);

    // TODO: Navigate to next step (service selection)
    // For now, just log the data
    alert(
      `Fahrzeug gespeichert:\n${data.brand} ${data.model}\nBaujahr: ${data.year}\nKM: ${data.mileage.toLocaleString("de-DE")}`
    );
  };

  const handleContinue = () => {
    // Trigger form submission
    if (formRef.current) {
      const submitButton = formRef.current.querySelector(
        'button[type="submit"]'
      ) as HTMLButtonElement;
      submitButton?.click();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                1
              </div>
              <span className="text-sm font-medium">Fahrzeug auswählen</span>
            </div>
            <div className="flex-1 mx-4 border-t-2 border-gray-300" />
            <div className="flex items-center space-x-2 opacity-50">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 font-semibold">
                2
              </div>
              <span className="text-sm font-medium">Service wählen</span>
            </div>
            <div className="flex-1 mx-4 border-t-2 border-gray-300" />
            <div className="flex items-center space-x-2 opacity-50">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 font-semibold">
                3
              </div>
              <span className="text-sm font-medium">Termin buchen</span>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Car className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Fahrzeug auswählen</CardTitle>
                <CardDescription>
                  Bitte geben Sie die Daten Ihres Fahrzeugs ein
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div ref={formRef as any}>
              <VehicleSelectionForm
                onSubmit={handleVehicleSubmit}
                onValidationChange={setIsFormValid}
              />
            </div>

            {/* Information Box */}
            <div className="mt-6 rounded-lg bg-blue-50 p-4 border border-blue-200">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">
                Warum diese Daten?
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>
                    <strong>Marke & Modell:</strong> Für präzise
                    Preiskalkulation nach Ihrem Fahrzeug
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>
                    <strong>Baujahr:</strong> Zur Berücksichtigung
                    fahrzeugspezifischer Wartungsintervalle
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>
                    <strong>Kilometerstand:</strong> Bestimmt den
                    Wartungsumfang (30k, 60k, 90k km Inspektion)
                  </span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Continue Button */}
        <div className="mt-6 flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Schritt 1 von 3: Fahrzeugdaten
          </p>
          <Button
            size="lg"
            onClick={handleContinue}
            disabled={!isFormValid}
            className="gap-2"
          >
            Weiter
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Privacy Notice */}
        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">
            Ihre Daten werden sicher verarbeitet und nicht an Dritte
            weitergegeben.
            <br />
            Weitere Informationen in unserer{" "}
            <a href="/datenschutz" className="underline hover:text-primary">
              Datenschutzerklärung
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
