"use client";

import React from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Car, Wrench } from "lucide-react";
import { useTranslations } from "next-intl";
import { resolveVehicleDisplay } from "@/lib/constants/vehicles";

interface PaymentSummaryProps {
  booking: {
    bookingNumber: string;
    serviceType: string;
    totalPrice: number | string; // Backend may send string
    pickupDate: string;
    pickupTimeSlot: string;
    pickupAddress: string;
    pickupCity: string;
    pickupPostalCode: string;
    vehicle: {
      brand: string;
      model: string;
      year: number;
      licensePlate?: string;
    };
    priceBreakdown?: {
      basePrice: number | string;
      ageMultiplier: number | string;
      finalPrice: number | string;
    };
  };
}

export function PaymentSummary({ booking }: PaymentSummaryProps) {
  const params = useParams();
  const locale = (params.locale as string) || 'de';
  const t = useTranslations('payment.summary');
  const tServiceTypes = useTranslations('payment.serviceTypes');

  // Helper to safely convert string/number to number
  const toNumber = (value: number | string): number => {
    return typeof value === 'string' ? parseFloat(value) : value;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(locale === 'de' ? 'de-DE' : 'en-US', {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  const formatServiceType = (type: string) => {
    // Use translation keys for service types
    try {
      return tServiceTypes(type);
    } catch {
      return type; // Fallback to original if translation not found
    }
  };

  return (
    <Card className="p-6 space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold">{t('title')}</h2>
          <Badge variant="outline">{booking.bookingNumber}</Badge>
        </div>
        <p className="text-sm text-gray-600">
          {t('reviewDetails')}
        </p>
      </div>

      {/* Service Details */}
      <div className="space-y-4">
        <div className="flex items-start space-x-3">
          <Wrench className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <p className="font-medium">{t('service')}</p>
            <p className="text-sm text-gray-600">
              {formatServiceType(booking.serviceType)}
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <Car className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <p className="font-medium">{t('vehicle')}</p>
            <p className="text-sm text-gray-600">
              {(() => { const v = resolveVehicleDisplay(booking.vehicle.brand, booking.vehicle.model); return `${v.brandName} ${v.modelName} (${booking.vehicle.year})`; })()}
            </p>
            {booking.vehicle.licensePlate && (
              <p className="text-xs text-gray-500 mt-1">
                {t('licensePlate')}: {booking.vehicle.licensePlate}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <Calendar className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <p className="font-medium">{t('pickupDateTime')}</p>
            <p className="text-sm text-gray-600">{formatDate(booking.pickupDate)}</p>
            <p className="text-xs text-gray-500 mt-1">{booking.pickupTimeSlot}</p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <MapPin className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <p className="font-medium">{t('pickupAddress')}</p>
            <p className="text-sm text-gray-600">{booking.pickupAddress}</p>
            <p className="text-xs text-gray-500 mt-1">
              {booking.pickupPostalCode} {booking.pickupCity}
            </p>
          </div>
        </div>
      </div>

      {/* Price Breakdown */}
      {booking.priceBreakdown && (
        <div className="border-t pt-4 space-y-2">
          <h3 className="font-semibold mb-3">{t('priceBreakdown')}</h3>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">{t('basePrice')}:</span>
            <span>{toNumber(booking.priceBreakdown.basePrice).toFixed(2)} EUR</span>
          </div>
          {toNumber(booking.priceBreakdown.ageMultiplier) !== 1 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{t('ageAdjustment')}:</span>
              <span>
                × {toNumber(booking.priceBreakdown.ageMultiplier).toFixed(2)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Total */}
      <div className="border-t pt-4">
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold">{t('totalAmount')}:</span>
          <span className="text-3xl font-bold text-primary">
            {toNumber(booking.totalPrice).toFixed(2)} EUR
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {t('includesTaxes')}
        </p>
      </div>
    </Card>
  );
}
