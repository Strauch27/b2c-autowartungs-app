'use client';

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Info, CalendarIcon, MapPin, Check } from "lucide-react";
import { addDays } from "date-fns";
import { de, enUS } from "date-fns/locale";

interface PickupStepProps {
  formData: {
    date: Date | undefined;
    time: string;
    returnDate: Date | undefined;
    returnTime: string;
    street: string;
    zip: string;
    city: string;
  };
  onUpdate: (data: Partial<PickupStepProps['formData']>) => void;
  translations: {
    concierge: {
      title: string;
      step1: string;
      step2: string;
      step3: string;
    };
    pickup: {
      title: string;
      subtitle: string;
      date: string;
      time: string;
      quickSelect?: {
        today: string;
        tomorrow: string;
        nextWeekday: string;
      };
    };
    return: {
      title: string;
      subtitle: string;
      date: string;
      time: string;
      note: string;
      quickSelect?: {
        tomorrow: string;
        nextWeek: string;
      };
      validationError?: string;
    };
    address: {
      title: string;
      street: string;
      streetPlaceholder: string;
      zip: string;
      zipPlaceholder: string;
      city: string;
      cityPlaceholder: string;
    };
  };
  language: 'de' | 'en';
}

const timeSlots = [
  "08:00", "08:30", "09:00", "09:30", "10:00",
  "10:30", "11:00", "12:00", "14:00", "16:00",
];

export function PickupStep({ formData, onUpdate, translations, language }: PickupStepProps) {
  const dateLocale = language === "de" ? de : enUS;

  // Auto-set return date when pickup is selected
  useEffect(() => {
    if (formData.date && !formData.returnDate) {
      onUpdate({ returnDate: addDays(formData.date, 1) });
    }
  }, [formData.date]);

  // Auto-set return time to match pickup time offset
  useEffect(() => {
    if (formData.time && !formData.returnTime) {
      onUpdate({ returnTime: "18:00" });
    }
  }, [formData.time]);

  return (
    <div className="animate-fade-in space-y-6" data-testid="pickup-step">
      {/* Concierge Info Banner */}
      <div className="bg-blue-50 rounded-xl p-4 flex gap-3">
        <Info className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
        <div>
          <p className="font-semibold text-blue-900 text-sm">{translations.concierge.title}</p>
          <p className="text-blue-700 text-xs mt-1">
            {translations.concierge.step1}. {translations.concierge.step2}. {translations.concierge.step3}.
          </p>
        </div>
      </div>

      {/* Calendar + Time Card */}
      <Card className="card-premium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-muted-foreground" />
            {translations.pickup.subtitle}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Inline calendar */}
          <div className="bg-muted/30 rounded-xl p-4">
            <Calendar
              mode="single"
              selected={formData.date}
              onSelect={(d) => {
                onUpdate({ date: d });
                // Update return date when changing pickup date
                if (d) {
                  onUpdate({ returnDate: addDays(d, 1) });
                }
              }}
              disabled={(date) => date < new Date()}
              locale={dateLocale}
              className="pointer-events-auto mx-auto"
            />
          </div>

          {/* Time slot pills */}
          <div className="space-y-3">
            <Label>{translations.pickup.time}</Label>
            <div className="flex flex-wrap gap-2">
              {timeSlots.map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => onUpdate({ time })}
                  className={`time-pill ${formData.time === time ? 'time-pill-selected' : ''}`}
                  data-testid={`time-slot-${time}`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address Card */}
      <Card className="card-premium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            {translations.address.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="street">{translations.address.street}</Label>
              <Input
                id="street"
                placeholder={translations.address.streetPlaceholder}
                value={formData.street}
                onChange={(e) => onUpdate({ street: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zip">{translations.address.zip}</Label>
              <Input
                id="zip"
                placeholder={translations.address.zipPlaceholder}
                value={formData.zip}
                onChange={(e) => onUpdate({ zip: e.target.value })}
                className="rounded-xl"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">{translations.address.city}</Label>
            <Input
              id="city"
              placeholder={translations.address.cityPlaceholder}
              value={formData.city}
              onChange={(e) => onUpdate({ city: e.target.value })}
              className="rounded-xl"
            />
          </div>

          {/* Same address note */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Check className="w-5 h-5 text-green-500" />
            <span>
              {language === "de"
                ? "Ihr Fahrzeug wird an dieselbe Adresse zurückgebracht"
                : "Your vehicle will be returned to the same address"}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
