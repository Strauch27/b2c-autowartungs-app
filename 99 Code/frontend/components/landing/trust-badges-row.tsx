'use client';

import { Shield, Euro, Calendar, Award, Lock, Zap, CheckCircle, Users } from 'lucide-react';

const badges = [
  {
    icon: Shield,
    text: 'TÜV Zertifiziert',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    icon: Euro,
    text: 'Festpreis-Garantie',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    icon: Calendar,
    text: 'Kostenlose Stornierung',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    icon: Users,
    text: '200+ Werkstätten',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
];

export function TrustBadgesRow() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto py-8">
      {badges.map((badge, index) => {
        const Icon = badge.icon;
        return (
          <div
            key={index}
            className="flex flex-col items-center gap-2 p-4 rounded-lg bg-white shadow-subtle hover:shadow-medium transition-shadow"
          >
            <div className={`p-3 rounded-full ${badge.bgColor}`}>
              <Icon className={`h-6 w-6 ${badge.color}`} />
            </div>
            <span className="text-sm font-semibold text-center text-gray-700">
              {badge.text}
            </span>
          </div>
        );
      })}
    </div>
  );
}
