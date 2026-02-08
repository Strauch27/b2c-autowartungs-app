'use client';

import { type ReactNode } from 'react';

interface LandingServiceCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  price: string;
  duration: string;
  colorClass: string;
  priceColorClass: string;
}

export function LandingServiceCard({
  icon,
  title,
  description,
  price,
  duration,
  colorClass,
  priceColorClass,
}: LandingServiceCardProps) {
  return (
    <div className="service-card-landing rounded-2xl p-6"
    >
      <div className={`w-14 h-14 rounded-xl ${colorClass} flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm mb-4">{description}</p>
      <div className="flex items-center justify-between">
        <span className={`${priceColorClass} font-bold text-lg`}>{price}</span>
        <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
          {duration}
        </span>
      </div>
    </div>
  );
}
