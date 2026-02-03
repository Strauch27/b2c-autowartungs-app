'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CalendarIcon, Car, Clock, MapPin, RotateCcw, Check, AlertCircle } from "lucide-react";
import { format, addDays, isWeekend, nextMonday, isBefore, startOfDay } from "date-fns";
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

const timeSlots = ["08:00", "10:00", "12:00", "14:00", "16:00"];
const returnTimeSlots = ["10:00", "12:00", "14:00", "16:00", "18:00"];

export function PickupStep({ formData, onUpdate, translations, language }: PickupStepProps) {
  const dateLocale = language === "de" ? de : enUS;
  const [pickupCalendarOpen, setPickupCalendarOpen] = useState(false);
  const [returnCalendarOpen, setReturnCalendarOpen] = useState(false);
  const [dateValidationError, setDateValidationError] = useState<string>("");

  // Smart Default: Auto-set return date to pickup +1 day when pickup is selected
  useEffect(() => {
    if (formData.date && !formData.returnDate) {
      const suggestedReturnDate = addDays(formData.date, 1);
      onUpdate({ returnDate: suggestedReturnDate });
    }
  }, [formData.date]);

  // Validate return date whenever dates change
  useEffect(() => {
    setDateValidationError("");
    if (formData.date && formData.returnDate) {
      const pickupDay = startOfDay(formData.date);
      const returnDay = startOfDay(formData.returnDate);

      if (isBefore(returnDay, pickupDay) || returnDay.getTime() === pickupDay.getTime()) {
        setDateValidationError(
          translations.return.validationError ||
          (language === "de"
            ? "Rückgabe muss nach der Abholung liegen"
            : "Return must be after pickup")
        );
      }
    }
  }, [formData.date, formData.returnDate, language]);

  // Format date with custom format for better readability
  const formatDateDisplay = (date: Date) => {
    // Format: "Di, 03.02.2026" (DE) or "Tue, Feb 3, 2026" (EN)
    const dayOfWeek = new Intl.DateTimeFormat(language === 'de' ? 'de-DE' : 'en-US', {
      weekday: 'short'
    }).format(date);

    const dateStr = new Intl.DateTimeFormat(language === 'de' ? 'de-DE' : 'en-US', {
      day: '2-digit',
      month: language === 'de' ? '2-digit' : 'short',
      year: 'numeric'
    }).format(date);

    return `${dayOfWeek}, ${dateStr}`;
  };

  // Quick select helpers
  const getNextWeekday = () => {
    const tomorrow = addDays(new Date(), 1);
    return isWeekend(tomorrow) ? nextMonday(tomorrow) : tomorrow;
  };

  const handlePickupQuickSelect = (days: number) => {
    const selectedDate = addDays(new Date(), days);
    onUpdate({ date: selectedDate });

    // Also update return date smartly
    if (!formData.returnDate || (formData.returnDate && isBefore(formData.returnDate, addDays(selectedDate, 1)))) {
      onUpdate({ returnDate: addDays(selectedDate, 1) });
    }
  };

  const handleReturnQuickSelect = (date: Date) => {
    onUpdate({ returnDate: date });
    setReturnCalendarOpen(false);
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Concierge Highlight Card */}
      <Card className="border-2 border-success/30 bg-gradient-to-br from-success/10 via-success/5 to-transparent">
        <CardContent className="flex items-start gap-4 p-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-success/20">
            <Car className="h-6 w-6 text-success" />
          </div>
          <div>
            <h3 className="font-semibold text-success">{translations.concierge.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {translations.concierge.step1}. {translations.concierge.step2}. {translations.concierge.step3}.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Pickup Date/Time Card */}
      <Card className="card-premium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            {translations.pickup.subtitle}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>{translations.pickup.date}</Label>

            {/* Quick Select Buttons */}
            {translations.pickup.quickSelect && (
              <div className="flex flex-wrap gap-2 mb-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handlePickupQuickSelect(0)}
                  className="text-xs"
                >
                  {translations.pickup.quickSelect.today}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handlePickupQuickSelect(1)}
                  className="text-xs"
                >
                  {translations.pickup.quickSelect.tomorrow}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onUpdate({ date: getNextWeekday() })}
                  className="text-xs"
                >
                  {translations.pickup.quickSelect.nextWeekday}
                </Button>
              </div>
            )}

            <Popover open={pickupCalendarOpen} onOpenChange={setPickupCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                  type="button"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.date ? (
                    <span>
                      <span className="font-medium">
                        {language === "de" ? "Abholung am" : "Pickup on"}:
                      </span>{" "}
                      {formatDateDisplay(formData.date)}
                    </span>
                  ) : (
                    translations.pickup.date
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.date}
                  onSelect={(d) => {
                    onUpdate({ date: d });
                    setPickupCalendarOpen(false);
                  }}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>{translations.pickup.time}</Label>
            <div className="grid grid-cols-5 gap-2">
              {timeSlots.map((time) => (
                <Button
                  key={time}
                  type="button"
                  variant={formData.time === time ? "default" : "outline"}
                  size="sm"
                  onClick={() => onUpdate({ time })}
                >
                  {time}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Return Date/Time Card */}
      <Card className="card-premium border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-primary" />
            {translations.return.subtitle}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>{translations.return.date}</Label>

            {/* Quick Select Buttons for Return */}
            {translations.return.quickSelect && formData.date && (
              <div className="flex flex-wrap gap-2 mb-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleReturnQuickSelect(addDays(formData.date!, 1))}
                  className="text-xs"
                >
                  {translations.return.quickSelect.tomorrow}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleReturnQuickSelect(addDays(formData.date!, 7))}
                  className="text-xs"
                >
                  {translations.return.quickSelect.nextWeek}
                </Button>
              </div>
            )}

            <Popover open={returnCalendarOpen} onOpenChange={setReturnCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                  type="button"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.returnDate ? (
                    <span>
                      <span className="font-medium">
                        {language === "de" ? "Rückgabe am" : "Return on"}:
                      </span>{" "}
                      {formatDateDisplay(formData.returnDate)}
                    </span>
                  ) : (
                    translations.return.date
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.returnDate}
                  onSelect={(d) => {
                    onUpdate({ returnDate: d });
                    setReturnCalendarOpen(false);
                  }}
                  disabled={(date) => !formData.date || date < addDays(formData.date, 1)}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>

            {/* Validation Error */}
            {dateValidationError && (
              <Alert variant="destructive" className="mt-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{dateValidationError}</AlertDescription>
              </Alert>
            )}

            <p className="text-xs text-muted-foreground">
              {translations.return.note}
            </p>
          </div>

          <div className="space-y-2">
            <Label>{translations.return.time}</Label>
            <div className="grid grid-cols-5 gap-2">
              {returnTimeSlots.map((time) => (
                <Button
                  key={time}
                  type="button"
                  variant={formData.returnTime === time ? "default" : "outline"}
                  size="sm"
                  onClick={() => onUpdate({ returnTime: time })}
                >
                  {time}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address Card */}
      <Card className="card-premium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            {translations.address.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="street">{translations.address.street}</Label>
            <Input
              id="street"
              placeholder={translations.address.streetPlaceholder}
              value={formData.street}
              onChange={(e) => onUpdate({ street: e.target.value })}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="zip">{translations.address.zip}</Label>
              <Input
                id="zip"
                placeholder={translations.address.zipPlaceholder}
                value={formData.zip}
                onChange={(e) => onUpdate({ zip: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">{translations.address.city}</Label>
              <Input
                id="city"
                placeholder={translations.address.cityPlaceholder}
                value={formData.city}
                onChange={(e) => onUpdate({ city: e.target.value })}
              />
            </div>
          </div>

          {/* Concierge Info */}
          <div className="mt-4 flex items-center gap-3 rounded-lg bg-success/10 p-3 border border-success/20">
            <Check className="h-5 w-5 text-success" />
            <span className="text-sm text-muted-foreground">
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
