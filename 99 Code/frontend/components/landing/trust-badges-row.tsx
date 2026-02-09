'use client';

import { Shield, Euro, Calendar, Users } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/useLovableTranslation';

const translations = {
  de: {
    badges: ['TÜV Zertifiziert', 'Festpreis-Garantie', 'Kostenlose Stornierung', '200+ Werkstätten'],
  },
  en: {
    badges: ['TÜV Certified', 'Fixed Price Guarantee', 'Free Cancellation', '200+ Workshops'],
  },
};

const badgeStyles = [
  { icon: Shield, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  { icon: Euro, color: 'text-green-600', bgColor: 'bg-green-50' },
  { icon: Calendar, color: 'text-purple-600', bgColor: 'bg-purple-50' },
  { icon: Users, color: 'text-orange-600', bgColor: 'bg-orange-50' },
];

export function TrustBadgesRow() {
  const { language } = useLanguage();
  const t = translations[language] || translations.de;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto py-8">
      {badgeStyles.map((badge, index) => {
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
              {t.badges[index]}
            </span>
          </div>
        );
      })}
    </div>
  );
}
