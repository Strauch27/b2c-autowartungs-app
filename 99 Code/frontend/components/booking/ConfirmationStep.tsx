'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Car, Settings, CalendarIcon, CheckCircle, User } from "lucide-react";
import { format } from "date-fns";
import { de, enUS } from "date-fns/locale";
import Link from "next/link";
import { VEHICLE_BRANDS } from "@/lib/constants/vehicles";

interface ConfirmationStepProps {
  formData: {
    brand: string;
    model: string;
    year: string;
    mileage: string;
    licensePlate?: string;
    selectedServices: string[];
    date: Date | undefined;
    time: string;
    returnDate: Date | undefined;
    returnTime: string;
    street: string;
    zip: string;
    city: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    acceptTerms: boolean;
  };
  onUpdate: (data: Partial<ConfirmationStepProps['formData']>) => void;
  translations: {
    title: string;
    vehicle: string;
    service: string;
    timeline: {
      title: string;
      pickup: string;
      return: string;
      address: string;
    };
    conciergeIncluded: string;
    conciergeDescription: string;
    total: string;
    terms: string;
    contact: {
      title: string;
      email: string;
      emailPlaceholder: string;
      firstName: string;
      firstNamePlaceholder: string;
      lastName: string;
      lastNamePlaceholder: string;
      phone: string;
      phonePlaceholder: string;
      note: string;
    };
  };
  services: Array<{ id: string; name: string; price: number }>;
  language: 'de' | 'en';
}

export function ConfirmationStep({
  formData,
  onUpdate,
  translations,
  services,
  language,
}: ConfirmationStepProps) {
  const dateLocale = language === "de" ? de : enUS;
  const selectedServicesList = services.filter((s) => formData.selectedServices.includes(s.id));
  const totalPrice = selectedServicesList.reduce((sum, s) => sum + s.price, 0);

  const mileageDisplay = formData.mileage
    ? parseInt(formData.mileage, 10).toLocaleString(language === 'en' ? 'en-US' : 'de-DE')
    : '';

  return (
    <div className="animate-fade-in space-y-6" data-testid="confirmation-step">
      {/* Booking Summary */}
      <Card className="card-premium">
        <CardHeader>
          <CardTitle>{translations.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Vehicle Row */}
          <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-xl">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
              <Car className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">{translations.vehicle}</p>
              <p className="font-semibold">
                {VEHICLE_BRANDS.find(b => b.id === formData.brand)?.name || formData.brand} {formData.model}{formData.year ? `, ${formData.year}` : ''}
              </p>
              <p className="text-sm text-muted-foreground">
                {mileageDisplay ? `${mileageDisplay} km` : ''}
                {formData.licensePlate ? ` | ${formData.licensePlate}` : ''}
              </p>
            </div>
          </div>

          {/* Services Row */}
          <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-xl">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
              <Settings className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">{translations.service}</p>
              {selectedServicesList.map((service) => (
                <div key={service.id} className="flex justify-between items-center mt-1">
                  <p className="font-semibold">{service.name}</p>
                  <span className="font-semibold">
                    {service.price > 0
                      ? `${service.price} EUR`
                      : (language === 'de' ? 'Preis auf Anfrage' : 'Price on request')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Appointment Row */}
          <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-xl">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
              <CalendarIcon className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                {translations.timeline.pickup}
              </p>
              <p className="font-semibold">
                {formData.date
                  ? `${format(formData.date, "EE, dd.MM.yyyy", { locale: dateLocale })} ${language === 'de' ? 'um' : 'at'} ${formData.time}`
                  : ''}
              </p>
              <p className="text-sm text-muted-foreground">
                {formData.street}, {formData.zip} {formData.city}
              </p>
            </div>
          </div>

          {/* Concierge Highlight */}
          <div className="flex items-start gap-4 p-4 bg-green-50 rounded-xl border border-green-100">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-green-800">{translations.conciergeIncluded}</p>
                  <p className="text-sm text-green-600">{translations.conciergeDescription}</p>
                </div>
                <span className="font-bold text-green-600">0 EUR</span>
              </div>
            </div>
          </div>

          {/* Total */}
          <div className="border-t-2 border-border pt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold">{translations.total}</span>
              <span className="text-2xl font-bold text-amber-500">
                {totalPrice > 0
                  ? `${totalPrice} EUR`
                  : (language === 'de' ? 'Auf Anfrage' : 'On request')}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {language === 'de' ? 'inkl. MwSt. | Festpreis-Garantie' : 'incl. VAT | Fixed price guarantee'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card className="card-premium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-muted-foreground" />
            {translations.contact.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">{translations.contact.firstName}</Label>
              <Input
                id="firstName"
                placeholder={translations.contact.firstNamePlaceholder}
                value={formData.firstName}
                onChange={(e) => onUpdate({ firstName: e.target.value })}
                className="rounded-xl"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">{translations.contact.lastName}</Label>
              <Input
                id="lastName"
                placeholder={translations.contact.lastNamePlaceholder}
                value={formData.lastName}
                onChange={(e) => onUpdate({ lastName: e.target.value })}
                className="rounded-xl"
                required
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">{translations.contact.email}</Label>
              <Input
                id="email"
                type="email"
                placeholder={translations.contact.emailPlaceholder}
                value={formData.email}
                onChange={(e) => onUpdate({ email: e.target.value })}
                className="rounded-xl"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">{translations.contact.phone}</Label>
              <Input
                id="phone"
                type="tel"
                placeholder={translations.contact.phonePlaceholder}
                value={formData.phone}
                onChange={(e) => onUpdate({ phone: e.target.value })}
                className="rounded-xl"
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Terms */}
      <div className="flex items-start space-x-3">
        <Checkbox
          id="terms"
          checked={formData.acceptTerms}
          onCheckedChange={(c) => onUpdate({ acceptTerms: !!c })}
        />
        <Label htmlFor="terms" className="text-sm font-normal text-muted-foreground leading-relaxed">
          {language === 'de' ? (
            <>
              Ich akzeptiere die{' '}
              <Link href={`/${language}/terms`} className="text-blue-500 underline hover:text-blue-700">AGB</Link>
              {' '}und{' '}
              <Link href={`/${language}/privacy`} className="text-blue-500 underline hover:text-blue-700">Datenschutzbestimmungen</Link>
            </>
          ) : (
            <>
              I accept the{' '}
              <Link href={`/${language}/terms`} className="text-blue-500 underline hover:text-blue-700">Terms of Service</Link>
              {' '}and{' '}
              <Link href={`/${language}/privacy`} className="text-blue-500 underline hover:text-blue-700">Privacy Policy</Link>
            </>
          )}
        </Label>
      </div>
    </div>
  );
}
