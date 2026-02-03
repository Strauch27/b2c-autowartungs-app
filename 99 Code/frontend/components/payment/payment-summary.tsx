"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Car, Wrench } from "lucide-react";

interface PaymentSummaryProps {
  booking: {
    bookingNumber: string;
    serviceType: string;
    totalPrice: number;
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
      basePrice: number;
      ageMultiplier: number;
      finalPrice: number;
    };
  };
}

export function PaymentSummary({ booking }: PaymentSummaryProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("de-DE", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  const formatServiceType = (type: string) => {
    const serviceNames: Record<string, string> = {
      INSPECTION: "Inspektion",
      OIL_SERVICE: "Ölwechsel",
      BRAKE_SERVICE: "Bremsendienst",
      TUV: "TÜV/HU",
      CLIMATE_SERVICE: "Klimaservice",
      CUSTOM: "Sonderleistung",
    };
    return serviceNames[type] || type;
  };

  return (
    <Card className="p-6 space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold">Booking Summary</h2>
          <Badge variant="outline">{booking.bookingNumber}</Badge>
        </div>
        <p className="text-sm text-gray-600">
          Please review your booking details before payment
        </p>
      </div>

      {/* Service Details */}
      <div className="space-y-4">
        <div className="flex items-start space-x-3">
          <Wrench className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <p className="font-medium">Service</p>
            <p className="text-sm text-gray-600">
              {formatServiceType(booking.serviceType)}
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <Car className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <p className="font-medium">Vehicle</p>
            <p className="text-sm text-gray-600">
              {booking.vehicle.brand} {booking.vehicle.model} ({booking.vehicle.year})
            </p>
            {booking.vehicle.licensePlate && (
              <p className="text-xs text-gray-500 mt-1">
                License Plate: {booking.vehicle.licensePlate}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <Calendar className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <p className="font-medium">Pickup Date & Time</p>
            <p className="text-sm text-gray-600">{formatDate(booking.pickupDate)}</p>
            <p className="text-xs text-gray-500 mt-1">{booking.pickupTimeSlot}</p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <MapPin className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <p className="font-medium">Pickup Address</p>
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
          <h3 className="font-semibold mb-3">Price Breakdown</h3>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Base Price:</span>
            <span>{booking.priceBreakdown.basePrice.toFixed(2)} EUR</span>
          </div>
          {booking.priceBreakdown.ageMultiplier !== 1 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Age Adjustment:</span>
              <span>
                × {booking.priceBreakdown.ageMultiplier.toFixed(2)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Total */}
      <div className="border-t pt-4">
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold">Total Amount:</span>
          <span className="text-3xl font-bold text-primary">
            {booking.totalPrice.toFixed(2)} EUR
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Includes all taxes and fees
        </p>
      </div>
    </Card>
  );
}
