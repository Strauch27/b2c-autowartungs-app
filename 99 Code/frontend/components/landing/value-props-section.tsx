'use client';

import { Euro, MapPin, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const valueProps = [
  {
    icon: Euro,
    title: 'Festpreis-Garantie',
    description: 'Transparente Preise ohne versteckte Kosten. Was Sie sehen, ist was Sie zahlen.',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    icon: MapPin,
    title: '200+ Qualitäts-Werkstätten',
    description: 'Nur geprüfte und zertifizierte Partner-Werkstätten in ganz Deutschland.',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    icon: Clock,
    title: 'Buchung in 3 Minuten',
    description: 'Schneller Online-Buchungsprozess mit sofortiger Terminbestätigung.',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
];

export function ValuePropsSection() {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Warum Ronya?
          </h2>
          <p className="text-xl text-gray-600">
            Die moderne Art, Werkstatt-Termine zu buchen
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {valueProps.map((prop, index) => {
            const Icon = prop.icon;
            return (
              <Card
                key={index}
                className="border-2 hover:shadow-strong hover:-translate-y-1 transition-all duration-300"
              >
                <CardHeader>
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full ${prop.bgColor} flex items-center justify-center`}>
                    <Icon className={`h-8 w-8 ${prop.color}`} />
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
