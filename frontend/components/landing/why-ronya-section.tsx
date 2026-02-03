'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tag, ShieldCheck, Smartphone, Award, MapPin, CheckCircle2 } from 'lucide-react';

export function WhyRonyaSection() {
  const t = useTranslations('landing.fixedPrice.whyRonya');

  const features = [
    {
      icon: Tag,
      titleKey: 'transparent.title',
      descriptionKey: 'transparent.description',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: ShieldCheck,
      titleKey: 'noHidden.title',
      descriptionKey: 'noHidden.description',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      icon: Smartphone,
      titleKey: 'digitalApproval.title',
      descriptionKey: 'digitalApproval.description',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      icon: Award,
      titleKey: 'moneyBack.title',
      descriptionKey: 'moneyBack.description',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      icon: MapPin,
      titleKey: 'liveTracking.title',
      descriptionKey: 'liveTracking.description',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      isNew: true,
    },
  ];

  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="container mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t('headline')}
          </h2>
          <p className="text-xl text-gray-600">
            {t('subheadline')}
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="border-2 hover:shadow-lg transition-shadow duration-300"
              >
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${feature.bgColor}`}>
                      <Icon className={`h-6 w-6 ${feature.color}`} />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">
                        {t(feature.titleKey)}
                      </CardTitle>
                      <CardDescription className="text-base">
                        {t(feature.descriptionKey)}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                {feature.isNew && (
                  <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Echtzeit-GPS-Tracking auf interaktiver Karte</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Genaue ETA-Berechnung</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Benachrichtigungen bei Statusänderungen</span>
                      </li>
                    </ul>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
