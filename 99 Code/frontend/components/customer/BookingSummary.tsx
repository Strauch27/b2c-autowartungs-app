'use client';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatEuro, formatNumber } from '@/lib/utils/currency';
import { ServiceType, VehicleData, PriceBreakdown } from '@/lib/types/service';
import { Car, Gauge, Wrench, Receipt } from 'lucide-react';

export interface BookingSummaryProps {
  vehicle: VehicleData;
  serviceType: ServiceType;
  serviceName: string;
  priceBreakdown: PriceBreakdown;
  onConfirm: () => void;
  isLoading?: boolean;
}

const serviceTypeLabels: Record<ServiceType, string> = {
  [ServiceType.INSPECTION]: 'Inspektion/Wartung',
  [ServiceType.OIL_SERVICE]: 'Ölservice',
  [ServiceType.BRAKE_SERVICE]: 'Bremsservice',
  [ServiceType.TUV]: 'TÜV/HU',
  [ServiceType.CLIMATE_SERVICE]: 'Klimaservice',
  [ServiceType.DETAILING]: 'Fahrzeugaufbereitung',
};

export function BookingSummary({
  vehicle,
  serviceType,
  serviceName,
  priceBreakdown,
  onConfirm,
  isLoading = false,
}: BookingSummaryProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Buchungsübersicht</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Vehicle Information */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Car className="h-4 w-4" />
            <span>Fahrzeug</span>
          </div>
          <div className="pl-6 space-y-1">
            <p className="font-semibold text-lg">
              {vehicle.brand} {vehicle.model}
            </p>
            <p className="text-sm text-muted-foreground">
              Baujahr: {vehicle.year}
            </p>
          </div>
        </div>

        {/* Mileage */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Gauge className="h-4 w-4" />
            <span>Kilometerstand</span>
          </div>
          <div className="pl-6">
            <p className="font-semibold">{formatNumber(vehicle.mileage)} km</p>
          </div>
        </div>

        {/* Service */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Wrench className="h-4 w-4" />
            <span>Service</span>
          </div>
          <div className="pl-6">
            <p className="font-semibold">
              {serviceName || serviceTypeLabels[serviceType]}
            </p>
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="space-y-3 border-t pt-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Receipt className="h-4 w-4" />
            <span>Preis</span>
          </div>
          <div className="pl-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Basispreis:</span>
              <span>{formatEuro(priceBreakdown.basePrice)}</span>
            </div>

            {priceBreakdown.ageSurcharge && priceBreakdown.ageSurcharge > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Alter-Zuschlag:</span>
                <span className="text-amber-600">
                  +{formatEuro(priceBreakdown.ageSurcharge)}
                </span>
              </div>
            )}

            {priceBreakdown.mileageSurcharge &&
              priceBreakdown.mileageSurcharge > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Kilometerstand-Zuschlag:
                  </span>
                  <span className="text-amber-600">
                    +{formatEuro(priceBreakdown.mileageSurcharge)}
                  </span>
                </div>
              )}

            <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
              <span>Gesamtpreis:</span>
              <span className="text-primary">
                {formatEuro(priceBreakdown.total)}
              </span>
            </div>

            <p className="text-xs text-muted-foreground mt-2">
              Inkl. Hol- und Bringservice
            </p>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full text-lg h-12"
          onClick={onConfirm}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Wird verarbeitet...
            </>
          ) : (
            'Jetzt buchen'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
