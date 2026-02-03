'use client';

import { useState } from "react";
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
import { CalendarIcon, Car, Clock, MapPin, RotateCcw, Check } from "lucide-react";
import { format, addDays } from "date-fns";
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
    };
    return: {
      title: string;
      subtitle: string;
      date: string;
      time: string;
      note: string;
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

      <Card className="card-premium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            {translations.pickup.subtitle}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>{translations.pickup.date}</Label>
            <Popover open={pickupCalendarOpen} onOpenChange={setPickupCalendarOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.date ? format(formData.date, "PPP", { locale: dateLocale }) : translations.pickup.date}
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
          <div className="space-y-2">
            <Label>{translations.return.date}</Label>
            <Popover open={returnCalendarOpen} onOpenChange={setReturnCalendarOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.returnDate ? format(formData.returnDate, "PPP", { locale: dateLocale }) : translations.return.date}
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
