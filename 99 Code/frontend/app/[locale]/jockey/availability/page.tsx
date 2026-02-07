'use client';

import { useState } from "react";
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Check } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/useLovableTranslation";
import { toast } from "sonner";

type TimeSlot = 'morning' | 'afternoon' | 'fullDay' | null;

interface DayAvailability {
  available: boolean;
  timeSlot: TimeSlot;
}

type WeekAvailability = Record<string, DayAvailability>;

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

function AvailabilityContent() {
  const { t, language } = useLanguage();

  // TODO: Load from backend when endpoint is available
  const [availability, setAvailability] = useState<WeekAvailability>(
    Object.fromEntries(
      DAYS.map((day) => [day, { available: day !== 'sunday', timeSlot: 'fullDay' as TimeSlot }])
    )
  );

  const dayLabels: Record<string, string> = {
    monday: t.jockeyAvailability.monday,
    tuesday: t.jockeyAvailability.tuesday,
    wednesday: t.jockeyAvailability.wednesday,
    thursday: t.jockeyAvailability.thursday,
    friday: t.jockeyAvailability.friday,
    saturday: t.jockeyAvailability.saturday,
    sunday: t.jockeyAvailability.sunday,
  };

  const toggleDay = (day: string) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        available: !prev[day].available,
        timeSlot: !prev[day].available ? 'fullDay' : null,
      },
    }));
  };

  const setTimeSlot = (day: string, slot: TimeSlot) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: { ...prev[day], timeSlot: slot },
    }));
  };

  const handleSave = () => {
    // TODO: Send to backend when endpoint is available
    toast.success(t.jockeyAvailability.saved);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-jockey text-jockey-foreground">
        <div className="container mx-auto flex h-14 sm:h-16 items-center gap-3 px-4">
          <Link href={`/${language}/jockey/dashboard`}>
            <Button
              variant="ghost"
              size="icon"
              className="text-jockey-foreground hover:bg-jockey-foreground/10"
              aria-label={t.jockeyAvailability.backToDashboard}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-lg font-semibold">{t.jockeyAvailability.title}</h1>
            <p className="text-xs text-jockey-foreground/70">{t.jockeyAvailability.subtitle}</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="space-y-3">
          {DAYS.map((day) => {
            const dayData = availability[day];
            return (
              <Card key={day} className="card-premium">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm sm:text-base">{dayLabels[day]}</span>
                    <Button
                      variant={dayData.available ? "default" : "outline"}
                      size="sm"
                      className="min-h-[44px] min-w-[120px]"
                      onClick={() => toggleDay(day)}
                      aria-label={`${dayLabels[day]}: ${dayData.available ? t.jockeyAvailability.available : t.jockeyAvailability.notAvailable}`}
                      aria-pressed={dayData.available}
                    >
                      {dayData.available ? t.jockeyAvailability.available : t.jockeyAvailability.notAvailable}
                    </Button>
                  </div>

                  {dayData.available && (
                    <div className="mt-3 flex gap-2 flex-wrap">
                      {(['morning', 'afternoon', 'fullDay'] as const).map((slot) => (
                        <Button
                          key={slot}
                          variant={dayData.timeSlot === slot ? "default" : "outline"}
                          size="sm"
                          className="min-h-[44px]"
                          onClick={() => setTimeSlot(day, slot)}
                          aria-label={t.jockeyAvailability[slot]}
                          aria-pressed={dayData.timeSlot === slot}
                        >
                          {t.jockeyAvailability[slot]}
                        </Button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Button
          variant="jockey"
          className="mt-6 w-full min-h-[44px]"
          onClick={handleSave}
          aria-label={t.jockeyAvailability.saved}
        >
          <Check className="mr-2 h-4 w-4" />
          {language === "de" ? "Speichern" : "Save"}
        </Button>
      </main>
    </div>
  );
}

export default function JockeyAvailabilityPage() {
  return (
    <ProtectedRoute requiredRole="jockey">
      <AvailabilityContent />
    </ProtectedRoute>
  );
}
