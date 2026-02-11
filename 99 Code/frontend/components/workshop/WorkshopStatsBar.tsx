'use client';

import { Plus, Settings, CheckCircle, DollarSign } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface WorkshopStatsBarProps {
  newCount: number;
  inProgressCount: number;
  completedCount: number;
  revenue?: string;
}

export function WorkshopStatsBar({ newCount, inProgressCount, completedCount, revenue }: WorkshopStatsBarProps) {
  const t = useTranslations('workshopDashboard');

  const stats = [
    {
      value: newCount,
      label: t('kanban.new'),
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      icon: Plus,
    },
    {
      value: inProgressCount,
      label: t('stats.inProgress'),
      color: 'text-cta',
      bgColor: 'bg-cta/10',
      icon: Settings,
    },
    {
      value: completedCount,
      label: t('stats.completed'),
      color: 'text-success',
      bgColor: 'bg-success/10',
      icon: CheckCircle,
    },
    {
      value: revenue || '0',
      label: t('stats.revenueToday'),
      color: 'text-foreground',
      bgColor: 'bg-neutral-100',
      icon: DollarSign,
      isRevenue: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-4" data-testid="workshop-stats-bar">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div
            key={i}
            className="card-interactive rounded-xl border border-neutral-200 bg-card p-3 sm:p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xl font-bold sm:text-2xl ${stat.color}`}>
                  {stat.isRevenue ? `${stat.value} \u20AC` : stat.value}
                </p>
                <p className="mt-0.5 text-[10px] text-muted-foreground sm:text-xs">{stat.label}</p>
              </div>
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg sm:h-10 sm:w-10 ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.color}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
