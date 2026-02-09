'use client';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatEuro, formatNumber } from '@/lib/utils/currency';
import { ServiceType, VehicleData, PriceBreakdown } from '@/lib/types/service';
import { Car, Gauge, Wrench, Receipt } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { resolveVehicleDisplay } from '@/lib/constants/vehicles';

export interface BookingSummaryProps {
  vehicle: VehicleData;
  serviceType: ServiceType;
  serviceName: string;
  priceBreakdown: PriceBreakdown;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function BookingSummary({
  vehicle,
  serviceType,
  serviceName,
  priceBreakdown,
  onConfirm,
  isLoading = false,
}: BookingSummaryProps) {
  const t = useTranslations('bookingSummary');

  const serviceTypeLabels: Record<ServiceType, string> = {
    [ServiceType.INSPECTION]: t('serviceTypes.INSPECTION'),
    [ServiceType.OIL_SERVICE]: t('serviceTypes.OIL_SERVICE'),
    [ServiceType.BRAKE_SERVICE]: t('serviceTypes.BRAKE_SERVICE'),
    [ServiceType.TUV]: t('serviceTypes.TUV'),
    [ServiceType.CLIMATE_SERVICE]: t('serviceTypes.CLIMATE_SERVICE'),
  };

  return (
    <Card data-testid="booking-summary" className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">{t('title')}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Vehicle Information */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Car className="h-4 w-4" />
            <span>{t('vehicle')}</span>
          </div>
          <div className="pl-6 space-y-1">
            <p className="font-semibold text-lg">
              {(() => { const v = resolveVehicleDisplay(vehicle.brand, vehicle.model); return `${v.brandName} ${v.modelName}`; })()}
            </p>
            <p className="text-sm text-muted-foreground">
              {t('buildYear')}: {vehicle.year}
            </p>
          </div>
        </div>

        {/* Mileage */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Gauge className="h-4 w-4" />
            <span>{t('mileage')}</span>
          </div>
          <div className="pl-6">
            <p className="font-semibold">{formatNumber(vehicle.mileage)} km</p>
          </div>
        </div>

        {/* Service */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Wrench className="h-4 w-4" />
            <span>{t('service')}</span>
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
            <span>{t('price')}</span>
          </div>
          <div className="pl-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('basePrice')}:</span>
              <span data-testid="price-base">{formatEuro(priceBreakdown.basePrice)}</span>
            </div>

            {priceBreakdown.ageSurcharge && priceBreakdown.ageSurcharge > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('ageSurcharge')}:</span>
                <span className="text-amber-600">
                  +{formatEuro(priceBreakdown.ageSurcharge)}
                </span>
              </div>
            )}

            {priceBreakdown.mileageSurcharge &&
              priceBreakdown.mileageSurcharge > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t('mileageSurcharge')}:
                  </span>
                  <span className="text-amber-600">
                    +{formatEuro(priceBreakdown.mileageSurcharge)}
                  </span>
                </div>
              )}

            <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
              <span>{t('totalPrice')}:</span>
              <span data-testid="price-total" className="text-primary">
                {formatEuro(priceBreakdown.total)}
              </span>
            </div>

            <p className="text-xs text-muted-foreground mt-2">
              {t('includesPickup')}
            </p>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          data-testid="booking-submit"
          className="w-full text-lg h-12"
          onClick={onConfirm}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {t('processing')}
            </>
          ) : (
            t('bookNow')
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
