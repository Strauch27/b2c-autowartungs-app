'use client';

import { useState, useMemo } from "react";
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

// Placeholder order data for calendar skeleton
interface CalendarOrder {
  id: string;
  customer: string;
  service: string;
  status: "pending" | "inProgress" | "completed";
  date: string; // ISO date string
}

const PLACEHOLDER_ORDERS: CalendarOrder[] = [
  { id: "BK-001", customer: "Max Mustermann", service: "Inspektion", status: "pending", date: new Date().toISOString() },
  { id: "BK-002", customer: "Anna Schmidt", service: "Ölwechsel", status: "inProgress", date: new Date().toISOString() },
  { id: "BK-003", customer: "Peter Weber", service: "Bremsservice", status: "completed", date: new Date(Date.now() + 86400000).toISOString() },
  { id: "BK-004", customer: "Lisa Müller", service: "TÜV", status: "pending", date: new Date(Date.now() + 2 * 86400000).toISOString() },
];

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  // Monday = 1, Sunday = 0 -> shift to Monday start
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getWeekDays(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });
}

function formatDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 border-yellow-300 text-yellow-800",
  inProgress: "bg-blue-100 border-blue-300 text-blue-800",
  completed: "bg-green-100 border-green-300 text-green-800",
};

function CalendarContent() {
  const t = useTranslations('workshopCalendar');
  const language = useLocale();
  const [weekOffset, setWeekOffset] = useState(0);

  const weekStart = useMemo(() => {
    const now = new Date();
    now.setDate(now.getDate() + weekOffset * 7);
    return getWeekStart(now);
  }, [weekOffset]);

  const weekDays = useMemo(() => getWeekDays(weekStart), [weekStart]);

  const dayLabels = [
    t('days.mon'), t('days.tue'), t('days.wed'), t('days.thu'),
    t('days.fri'), t('days.sat'), t('days.sun'),
  ];

  // Group orders by day
  const ordersByDay = useMemo(() => {
    const map: Record<string, CalendarOrder[]> = {};
    PLACEHOLDER_ORDERS.forEach(order => {
      const key = formatDateKey(new Date(order.date));
      if (!map[key]) map[key] = [];
      map[key].push(order);
    });
    return map;
  }, []);

  const todayKey = formatDateKey(new Date());

  const weekStartFormatted = weekStart.toLocaleDateString(
    language === "de" ? "de-DE" : "en-US",
    { day: "numeric", month: "long", year: "numeric" }
  );

  return (
    <div className="bg-background">
      <main className="container mx-auto px-4 py-6">
        {/* Week navigation */}
        <div className="mb-6 flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={() => setWeekOffset(o => o - 1)}>
            <ChevronLeft className="mr-1 h-4 w-4" />
            {t('previousWeek')}
          </Button>
          <div className="text-center">
            <p className="font-semibold">{t('weekOf')} {weekStartFormatted}</p>
            {weekOffset !== 0 && (
              <Button variant="link" size="sm" onClick={() => setWeekOffset(0)} className="text-xs">
                {t('today')}
              </Button>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={() => setWeekOffset(o => o + 1)}>
            {t('nextWeek')}
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Day headers */}
          {dayLabels.map((label, i) => (
            <div key={label} className="text-center">
              <p className="text-sm font-medium text-muted-foreground">{label}</p>
              <p className={`text-lg font-bold ${formatDateKey(weekDays[i]) === todayKey ? "text-workshop" : ""}`}>
                {weekDays[i].getDate()}
              </p>
            </div>
          ))}

          {/* Day columns */}
          {weekDays.map((day, i) => {
            const dayKey = formatDateKey(day);
            const dayOrders = ordersByDay[dayKey] || [];
            const isToday = dayKey === todayKey;

            return (
              <Card
                key={dayKey}
                className={`min-h-[120px] ${isToday ? "border-workshop border-2" : ""}`}
              >
                <CardContent className="p-2 space-y-1">
                  {dayOrders.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">{t('noOrders')}</p>
                  ) : (
                    dayOrders.map(order => (
                      <div
                        key={order.id}
                        className={`rounded border px-2 py-1 text-xs ${statusColors[order.status]}`}
                      >
                        <p className="font-medium truncate">{order.customer}</p>
                        <p className="truncate">{order.service}</p>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}

export default function WorkshopCalendarPage() {
  return (
    <ProtectedRoute requiredRole="workshop">
      <CalendarContent />
    </ProtectedRoute>
  );
}
