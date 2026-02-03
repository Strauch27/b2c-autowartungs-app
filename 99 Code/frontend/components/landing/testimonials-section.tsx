'use client';

import { Star, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface Testimonial {
  id: string;
  author: string;
  authorInitials: string;
  rating: number;
  date: string;
  text: string;
  service: string;
  vehicle: string;
  verified: boolean;
}

const testimonials: Testimonial[] = [
  {
    id: '1',
    author: 'Michael Schmidt',
    authorInitials: 'MS',
    rating: 5,
    date: '15.01.2026',
    text: 'Fantastischer Service! Die Buchung war super einfach und der Festpreis hat genau gestimmt. Werkstatt war professionell und freundlich.',
    service: 'Inspektion',
    vehicle: 'VW Golf',
    verified: true,
  },
  {
    id: '2',
    author: 'Sarah Müller',
    authorInitials: 'SM',
    rating: 5,
    date: '10.01.2026',
    text: 'Endlich eine Plattform die hält was sie verspricht. Keine versteckten Kosten, transparente Preise und schnelle Terminvergabe.',
    service: 'Ölwechsel',
    vehicle: 'BMW 3er',
    verified: true,
  },
  {
    id: '3',
    author: 'Thomas Weber',
    authorInitials: 'TW',
    rating: 5,
    date: '08.01.2026',
    text: 'Kann ich nur empfehlen! Die Werkstatt war top, der Preis fair und die digitale Freigabe hat mir viel Zeit gespart.',
    service: 'Bremsen',
    vehicle: 'Audi A4',
    verified: true,
  },
  {
    id: '4',
    author: 'Julia Klein',
    authorInitials: 'JK',
    rating: 5,
    date: '05.01.2026',
    text: 'Super Erfahrung! Besonders gut fand ich die kostenlose Stornierung. Musste meinen Termin verlegen und das ging problemlos.',
    service: 'Hauptuntersuchung',
    vehicle: 'Mercedes C-Klasse',
    verified: true,
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-5 w-5 ${
            star <= rating
              ? 'fill-amber-400 text-amber-400'
              : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );
}

export function TestimonialsSection() {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Das sagen unsere Kunden
          </h2>
          <p className="text-xl text-gray-600">
            Über 1.200 verifizierte Bewertungen mit ⌀ 4.5★
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="border-2 hover:shadow-strong transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
                    {testimonial.authorInitials}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900">{testimonial.author}</h4>
                      {testimonial.verified && (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                    <StarRating rating={testimonial.rating} />
                  </div>
                </div>

                <p className="text-gray-700 mb-4 leading-relaxed">
                  {testimonial.text}
                </p>

                <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full">
                    {testimonial.service}
                  </span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
                    {testimonial.vehicle}
                  </span>
                  <span className="ml-auto text-gray-500">{testimonial.date}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
