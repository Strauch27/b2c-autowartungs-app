'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ArrowRight, MapPin, RotateCcw, Sparkles, User, Mail, Phone } from "lucide-react";
import { format } from "date-fns";
import { de, enUS } from "date-fns/locale";

interface ConfirmationStepProps {
  formData: {
    brand: string;
    model: string;
    year: string;
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

  return (
    <div className="animate-fade-in space-y-6">
      <Card className="card-premium">
        <CardHeader>
          <CardTitle>{translations.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-b border-border pb-3">
            <span className="text-muted-foreground">{translations.service}</span>
            <div className="mt-1 space-y-1">
              {selectedServicesList.map((service) => (
                <div key={service.id} className="flex justify-between">
                  <span className="font-medium">{service.name}</span>
                  <span className="text-muted-foreground">{service.price}€</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-between border-b border-border pb-3">
            <span className="text-muted-foreground">{translations.vehicle}</span>
            <span className="font-medium">
              {formData.brand} {formData.model}
            </span>
          </div>
          {/* Pickup & Return Timeline */}
          <div className="rounded-xl border border-border bg-muted/30 p-4">
            <div className="flex items-start gap-4">
              {/* Pickup */}
              <div className="flex-1">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {translations.timeline.pickup}
                </div>
                <p className="mt-1 font-semibold">
                  {formData.date && format(formData.date, "dd.MM.yyyy", { locale: dateLocale })}
                </p>
                <p className="text-sm text-muted-foreground">{formData.time}</p>
              </div>

              {/* Arrow/Divider */}
              <div className="flex flex-col items-center pt-4">
                <div className="h-8 w-0.5 bg-success/50"></div>
                <ArrowRight className="h-4 w-4 rotate-90 text-success" />
                <div className="h-8 w-0.5 bg-success/50"></div>
              </div>

              {/* Return */}
              <div className="flex-1 text-right">
                <div className="flex items-center justify-end gap-2 text-sm font-medium text-muted-foreground">
                  {translations.timeline.return}
                  <RotateCcw className="h-4 w-4" />
                </div>
                <p className="mt-1 font-semibold">
                  {formData.returnDate && format(formData.returnDate, "dd.MM.yyyy", { locale: dateLocale })}
                </p>
                <p className="text-sm text-muted-foreground">{formData.returnTime}</p>
              </div>
            </div>

            <div className="mt-3 border-t border-border pt-3">
              <p className="text-center text-sm text-muted-foreground">
                <MapPin className="mr-1 inline h-3 w-3" />
                {formData.street}, {formData.zip} {formData.city}
              </p>
            </div>
          </div>

          {/* Concierge Highlight */}
          <div className="rounded-xl border-2 border-success/30 bg-gradient-to-r from-success/10 to-transparent p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/20">
                <Sparkles className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="font-semibold text-success">{translations.conciergeIncluded}</p>
                <p className="text-sm text-muted-foreground">
                  {translations.conciergeDescription}
                </p>
              </div>
              <span className="ml-auto font-bold text-success">0€</span>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <span className="text-lg font-semibold">{translations.total}</span>
            <span className="text-2xl font-bold text-cta">{totalPrice}€</span>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card className="card-premium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {translations.contact.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {translations.contact.firstName}
              </Label>
              <Input
                id="firstName"
                placeholder={translations.contact.firstNamePlaceholder}
                value={formData.firstName}
                onChange={(e) => onUpdate({ firstName: e.target.value })}
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
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              {translations.contact.email}
            </Label>
            <Input
              id="email"
              type="email"
              placeholder={translations.contact.emailPlaceholder}
              value={formData.email}
              onChange={(e) => onUpdate({ email: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              {translations.contact.phone}
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder={translations.contact.phonePlaceholder}
              value={formData.phone}
              onChange={(e) => onUpdate({ phone: e.target.value })}
              required
            />
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-sm text-muted-foreground">
              {translations.contact.note}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="card-premium">
        <CardHeader>
          <CardTitle>{language === "de" ? "Zahlungsmethode" : "Payment Method"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-border bg-muted/50 p-4 text-center text-muted-foreground">
            <p className="text-sm">{language === "de" ? "Stripe Zahlungsintegration wird hier angezeigt" : "Stripe payment integration will be shown here"}</p>
          </div>
          <div className="flex items-start space-x-2">
            <Checkbox
              id="terms"
              checked={formData.acceptTerms}
              onCheckedChange={(c) => onUpdate({ acceptTerms: !!c })}
            />
            <Label htmlFor="terms" className="text-sm font-normal text-muted-foreground">
              {translations.terms}
            </Label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
