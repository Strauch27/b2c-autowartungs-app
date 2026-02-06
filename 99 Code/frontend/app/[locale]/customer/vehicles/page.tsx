'use client';

import { useParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useLanguage } from '@/lib/i18n/useLovableTranslation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Car, ArrowLeft, Plus } from 'lucide-react';
import Link from 'next/link';

function VehiclesContent() {
  const params = useParams();
  const locale = (params.locale as string) || 'de';
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href={`/${locale}/customer/dashboard`}>
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {language === 'de' ? 'Zurück zum Dashboard' : 'Back to Dashboard'}
          </Button>
        </Link>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">
            {language === 'de' ? 'Meine Fahrzeuge' : 'My Vehicles'}
          </h1>
          <Button size="sm" disabled>
            <Plus className="mr-2 h-4 w-4" />
            {language === 'de' ? 'Hinzufügen' : 'Add'}
          </Button>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Car className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground mb-2">
              {language === 'de'
                ? 'Noch keine Fahrzeuge gespeichert.'
                : 'No vehicles saved yet.'}
            </p>
            <p className="text-sm text-muted-foreground">
              {language === 'de'
                ? 'Fahrzeuge werden automatisch gespeichert wenn Sie bei einer Buchung "Fahrzeug speichern" auswählen.'
                : 'Vehicles are saved automatically when you select "Save vehicle" during a booking.'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function VehiclesPage() {
  return (
    <ProtectedRoute requiredRole="customer">
      <VehiclesContent />
    </ProtectedRoute>
  );
}
