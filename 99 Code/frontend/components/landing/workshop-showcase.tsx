'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, MapPin, Clock, CheckCircle, ArrowRight } from 'lucide-react';

interface Workshop {
  id: string;
  name: string;
  image: string;
  rating: number;
  reviewCount: number;
  distance: string;
  city: string;
  certified: boolean;
  nextAvailable: string;
  priceFrom: number;
  specialties: string[];
}

const workshops: Workshop[] = [
  {
    id: '1',
    name: 'AutoService München Ost',
    image: '/placeholder-workshop.jpg',
    rating: 4.8,
    reviewCount: 234,
    distance: '2.3 km',
    city: 'München',
    certified: true,
    nextAvailable: 'Heute',
    priceFrom: 89,
    specialties: ['Inspektion', 'Bremsen', 'TÜV'],
  },
  {
    id: '2',
    name: 'Meisterwerkstatt Schmidt',
    image: '/placeholder-workshop.jpg',
    rating: 4.9,
    reviewCount: 187,
    distance: '3.1 km',
    city: 'München',
    certified: true,
    nextAvailable: 'Morgen',
    priceFrom: 95,
    specialties: ['Ölwechsel', 'Inspektion', 'Reparatur'],
  },
  {
    id: '3',
    name: 'KFZ Zentrum Berlin',
    image: '/placeholder-workshop.jpg',
    rating: 4.7,
    reviewCount: 312,
    distance: '1.8 km',
    city: 'Berlin',
    certified: true,
    nextAvailable: 'Heute',
    priceFrom: 85,
    specialties: ['Klimaanlage', 'Elektronik', 'Diagnose'],
  },
  {
    id: '4',
    name: 'Auto Plus Hamburg',
    image: '/placeholder-workshop.jpg',
    rating: 4.6,
    reviewCount: 156,
    distance: '4.2 km',
    city: 'Hamburg',
    certified: true,
    nextAvailable: 'In 2 Tagen',
    priceFrom: 79,
    specialties: ['Inspektion', 'Bremsen', 'Auspuff'],
  },
  {
    id: '5',
    name: 'Werkstatt Frankfurt Nord',
    image: '/placeholder-workshop.jpg',
    rating: 4.8,
    reviewCount: 203,
    distance: '2.9 km',
    city: 'Frankfurt',
    certified: true,
    nextAvailable: 'Heute',
    priceFrom: 92,
    specialties: ['Hauptuntersuchung', 'TÜV', 'AU'],
  },
  {
    id: '6',
    name: 'Premium KFZ Service',
    image: '/placeholder-workshop.jpg',
    rating: 4.9,
    reviewCount: 278,
    distance: '3.5 km',
    city: 'Stuttgart',
    certified: true,
    nextAvailable: 'Morgen',
    priceFrom: 99,
    specialties: ['Premium-Marken', 'Inspektion', 'Reparatur'],
  },
];

export function WorkshopShowcase() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string || 'de';

  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Unsere Top Werkstätten
          </h2>
          <p className="text-xl text-gray-600">
            Über 200 zertifizierte Partner-Werkstätten in ganz Deutschland
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workshops.map((workshop) => (
            <Card
              key={workshop.id}
              className="overflow-hidden hover:shadow-strong hover:scale-[1.02] transition-all duration-300 cursor-pointer"
              onClick={() => router.push(`/${locale}/customer/login`)}
            >
              <div className="relative h-48 bg-gradient-to-br from-blue-100 to-blue-200">
                {/* Placeholder for workshop image */}
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  <Wrench className="h-16 w-16" />
                </div>
                {workshop.certified && (
                  <div className="absolute top-3 right-3 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    TÜV Zertifiziert
                  </div>
                )}
              </div>

              <CardHeader className="pb-3">
                <h3 className="font-bold text-lg text-gray-900 mb-2">
                  {workshop.name}
                </h3>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="font-semibold">{workshop.rating}</span>
                    <span className="text-gray-500">({workshop.reviewCount})</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{workshop.distance}</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="flex items-center gap-2 mb-3 text-sm">
                  <Clock className="h-4 w-4 text-green-600" />
                  <span className="text-green-600 font-semibold">
                    Nächster Termin: {workshop.nextAvailable}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {workshop.specialties.slice(0, 3).map((specialty, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t">
                  <div>
                    <span className="text-sm text-gray-600">Ab</span>
                    <span className="text-2xl font-bold text-gray-900 ml-1">
                      {workshop.priceFrom}€
                    </span>
                  </div>
                  <ArrowRight className="h-5 w-5 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button
            size="lg"
            onClick={() => router.push(`/${locale}/customer/login`)}
            className="h-12 px-8 text-base"
          >
            Alle Werkstätten ansehen
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
}

// Fix missing import
import { Wrench } from 'lucide-react';
