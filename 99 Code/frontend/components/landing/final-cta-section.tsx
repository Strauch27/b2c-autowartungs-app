'use client';

import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowRight, Calendar } from 'lucide-react';

export function FinalCTASection() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string || 'de';

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800">
      <div className="container mx-auto max-w-4xl text-center">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
          Bereit für Ihren Werkstatt-Termin?
        </h2>
        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
          Über 15.000 zufriedene Kunden haben bereits gebucht. Werden Sie Teil der Ronya-Community!
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            size="lg"
            onClick={() => router.push(`/${locale}/customer/login`)}
            className="h-14 px-8 text-lg bg-orange-500 hover:bg-orange-600 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            <Calendar className="h-6 w-6 mr-2" />
            Jetzt Werkstatt-Termin buchen
            <ArrowRight className="ml-2 h-6 w-6" />
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={() => router.push(`/${locale}`)}
            className="h-14 px-8 text-lg bg-white/10 hover:bg-white/20 text-white border-2 border-white/50 backdrop-blur-sm"
          >
            Mehr erfahren
          </Button>
        </div>

        <div className="mt-12 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-white mb-1">200+</div>
            <div className="text-sm text-blue-200">Werkstätten</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-white mb-1">4.5★</div>
            <div className="text-sm text-blue-200">Bewertung</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-white mb-1">15k+</div>
            <div className="text-sm text-blue-200">Buchungen</div>
          </div>
        </div>
      </div>
    </section>
  );
}
