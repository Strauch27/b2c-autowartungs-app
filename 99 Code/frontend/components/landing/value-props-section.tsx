'use client';

import { Euro, MapPin, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/lib/i18n/useLovableTranslation';

const translations = {
  de: {
    heading: 'Warum Ronya?',
    subheading: 'Die moderne Art, Werkstatt-Termine zu buchen',
    props: [
      {
        title: 'Festpreis-Garantie',
        description: 'Transparente Preise ohne versteckte Kosten. Was Sie sehen, ist was Sie zahlen.',
      },
      {
        title: '200+ Qualitäts-Werkstätten',
        description: 'Nur geprüfte und zertifizierte Partner-Werkstätten in ganz Deutschland.',
      },
      {
        title: 'Buchung in 3 Minuten',
        description: 'Schneller Online-Buchungsprozess mit sofortiger Terminbestätigung.',
      },
    ],
  },
  en: {
    heading: 'Why Ronya?',
    subheading: 'The modern way to book workshop appointments',
    props: [
      {
        title: 'Fixed Price Guarantee',
        description: 'Transparent pricing with no hidden costs. What you see is what you pay.',
      },
      {
        title: '200+ Quality Workshops',
        description: 'Only vetted and certified partner workshops across Germany.',
      },
      {
        title: 'Book in 3 Minutes',
        description: 'Fast online booking process with instant appointment confirmation.',
      },
    ],
  },
};

const propStyles = [
  { icon: Euro, color: 'text-green-600', bgColor: 'bg-green-50' },
  { icon: MapPin, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  { icon: Clock, color: 'text-purple-600', bgColor: 'bg-purple-50' },
];

export function ValuePropsSection() {
  const { language } = useLanguage();
  const t = translations[language] || translations.de;

  return (
    <section className="py-20 px-4 bg-white">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t.heading}
          </h2>
          <p className="text-xl text-gray-600">
            {t.subheading}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {t.props.map((prop, index) => {
            const style = propStyles[index];
            const Icon = style.icon;
            return (
              <Card
                key={index}
                className="border-2 hover:shadow-strong hover:-translate-y-1 transition-all duration-300"
              >
                <CardHeader>
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full ${style.bgColor} flex items-center justify-center`}>
                    <Icon className={`h-8 w-8 ${style.color}`} />
                  </div>
                  <CardTitle className="text-center text-xl">
                    {prop.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-gray-600">
                    {prop.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
