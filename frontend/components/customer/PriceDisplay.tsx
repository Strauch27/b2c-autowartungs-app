'use client';

import { useState, useEffect } from 'react';
import { Info, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { formatEuro } from '@/lib/utils/currency';
import { calculatePrice } from '@/lib/api/pricing';
import { ServiceType, VehicleData, PriceResponse } from '@/lib/types/service';

export interface PriceDisplayProps {
  brand: string;
  model: string;
  year: number;
  mileage: number;
  serviceType: ServiceType;
}

export function PriceDisplay({
  brand,
  model,
  year,
  mileage,
  serviceType,
}: PriceDisplayProps) {
  const [priceData, setPriceData] = useState<PriceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [displayPrice, setDisplayPrice] = useState(0);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        setLoading(true);
        setError(null);

        const vehicle: VehicleData = { brand, model, year, mileage };
        const data = await calculatePrice(vehicle, serviceType);
        setPriceData(data);

        // Animate price transition
        animatePrice(data.breakdown.total);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Preis konnte nicht berechnet werden'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPrice();
  }, [brand, model, year, mileage, serviceType]);

  const animatePrice = (targetPrice: number) => {
    const duration = 800; // ms
    const steps = 30;
    const increment = targetPrice / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        setDisplayPrice(targetPrice);
        clearInterval(timer);
      } else {
        setDisplayPrice(Math.floor(increment * currentStep));
      }
    }, duration / steps);
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Preis wird berechnet...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !priceData) {
    return (
      <Card className="w-full border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Fehler</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {error || 'Preis nicht verfügbar'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-4xl font-bold text-primary mb-2">
              {formatEuro(displayPrice)}
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge variant="success" className="text-sm">
                Garantierter Festpreis
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Inkl. Hol- und Bringservice
            </p>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="shrink-0">
                  <Info className="h-5 w-5 text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>
                  Zusätzliche Arbeiten werden digital angeboten und erst nach
                  Ihrer Freigabe durchgeführt
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>

      <CardContent>
        <Button
          variant="ghost"
          className="w-full justify-between text-sm"
          onClick={() => setShowBreakdown(!showBreakdown)}
        >
          <span>Preisaufschlüsselung</span>
          {showBreakdown ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>

        {showBreakdown && (
          <div className="mt-4 space-y-2 border-t pt-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Basispreis:</span>
              <span className="font-medium">
                {formatEuro(priceData.breakdown.basePrice)}
              </span>
            </div>

            {priceData.breakdown.ageSurcharge && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Alter-Zuschlag:</span>
                <span className="font-medium text-amber-600">
                  +{formatEuro(priceData.breakdown.ageSurcharge)}
                </span>
              </div>
            )}

            {priceData.breakdown.mileageSurcharge && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Kilometerstand-Zuschlag:
                </span>
                <span className="font-medium text-amber-600">
                  +{formatEuro(priceData.breakdown.mileageSurcharge)}
                </span>
              </div>
            )}

            <div className="flex justify-between text-base font-bold border-t pt-2 mt-2">
              <span>Gesamt:</span>
              <span className="text-primary">
                {formatEuro(priceData.breakdown.total)}
              </span>
            </div>
          </div>
        )}

        {priceData.message && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
            <p className="text-xs text-amber-800">{priceData.message}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
