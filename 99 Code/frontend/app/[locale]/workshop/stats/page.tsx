'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card, CardContent } from "@/components/ui/card";
import {
  ClipboardList,
  Euro,
  Clock,
  TrendingUp,
} from "lucide-react";
import { useTranslations } from "next-intl";

function StatsContent() {
  const t = useTranslations('workshopStats');

  // Placeholder KPI data
  const kpis = [
    {
      label: t('ordersThisMonth'),
      value: "47",
      icon: ClipboardList,
      color: "text-workshop",
      bgColor: "bg-workshop/10",
      borderColor: "border-l-workshop",
    },
    {
      label: t('revenue'),
      value: "12.450 \u20AC",
      icon: Euro,
      color: "text-success",
      bgColor: "bg-success/10",
      borderColor: "border-l-success",
    },
    {
      label: t('avgTurnaround'),
      value: `2.3 ${t('days')}`,
      icon: Clock,
      color: "text-cta",
      bgColor: "bg-cta/10",
      borderColor: "border-l-cta",
    },
    {
      label: t('utilization'),
      value: "78%",
      icon: TrendingUp,
      color: "text-primary",
      bgColor: "bg-primary/10",
      borderColor: "border-l-primary",
    },
  ];

  return (
    <div className="bg-background">
      <main className="container mx-auto px-4 py-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <Card key={kpi.label} className={`card-premium border-l-4 ${kpi.borderColor}`}>
                <CardContent className="flex items-center gap-4 p-6">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${kpi.bgColor}`}>
                    <Icon className={`h-7 w-7 ${kpi.color}`} />
                  </div>
                  <div>
                    <p className="text-3xl font-bold">{kpi.value}</p>
                    <p className="text-sm text-muted-foreground">{kpi.label}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}

export default function WorkshopStatsPage() {
  return (
    <ProtectedRoute requiredRole="workshop">
      <StatsContent />
    </ProtectedRoute>
  );
}
