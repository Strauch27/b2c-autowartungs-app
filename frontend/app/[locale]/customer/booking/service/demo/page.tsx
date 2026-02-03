'use client';

import { useState } from 'react';
import { PriceDisplay } from '@/components/customer/PriceDisplay';
import { BookingSummary } from '@/components/customer/BookingSummary';
import { ServiceType } from '@/lib/types/service';

/**
 * Demo page to showcase the PriceDisplay and BookingSummary components
 * This demonstrates US-004 implementation
 */
export default function PriceDisplayDemo() {
  const [isBooking, setIsBooking] = useState(false);

  // Example vehicle data
  const exampleVehicle = {
    brand: 'VW',
    model: 'Golf',
    year: 2015,
    mileage: 60000,
  };

  // Example price breakdown (normally from API)
  const examplePriceBreakdown = {
    basePrice: 21900, // 219.00 EUR in cents
    ageSurcharge: 3000, // 30.00 EUR
    total: 24900, // 249.00 EUR
  };

  const handleConfirmBooking = () => {
    setIsBooking(true);
    // Simulate API call
    setTimeout(() => {
      alert('Buchung erfolgreich!');
      setIsBooking(false);
    }, 2000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">
          Price Display Component Demo (US-004)
        </h1>
        <p className="text-muted-foreground mb-8">
          Demonstration of the guaranteed fixed price display with breakdown
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Price Display */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Price Display</h2>
            <PriceDisplay
              brand={exampleVehicle.brand}
              model={exampleVehicle.model}
              year={exampleVehicle.year}
              mileage={exampleVehicle.mileage}
              serviceType={ServiceType.INSPECTION}
            />

            <div className="space-y-4 p-4 bg-muted rounded-lg">
              <h3 className="font-semibold">Component Features:</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Large, prominent price display with animation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Guaranteed fixed price badge</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Included pickup and delivery service note</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>
                    Info tooltip explaining additional work approval process
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Expandable price breakdown</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Loading state while fetching price</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Error handling for unavailable prices</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column - Booking Summary */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Booking Summary</h2>
            <BookingSummary
              vehicle={exampleVehicle}
              serviceType={ServiceType.INSPECTION}
              serviceName="Inspektion/Wartung"
              priceBreakdown={examplePriceBreakdown}
              onConfirm={handleConfirmBooking}
              isLoading={isBooking}
            />

            <div className="space-y-4 p-4 bg-muted rounded-lg">
              <h3 className="font-semibold">Summary Features:</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Vehicle information display</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Mileage with German number formatting</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Selected service type</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Detailed price breakdown</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Total price with primary highlight</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Confirm booking button with loading state</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* API Integration Info */}
        <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-3">
            API Integration (lib/api/pricing.ts)
          </h3>
          <div className="space-y-2 text-sm text-blue-800">
            <p>
              <strong>Endpoint:</strong>{' '}
              <code className="bg-blue-100 px-2 py-1 rounded">
                GET /api/services/{'{serviceType}'}/price
              </code>
            </p>
            <p>
              <strong>Query Parameters:</strong> brand, model, year, mileage
            </p>
            <p>
              <strong>Response:</strong> Price breakdown with basePrice,
              ageSurcharge, mileageSurcharge, and total (in cents)
            </p>
            <p className="mt-2">
              <strong>Functions available:</strong>
            </p>
            <ul className="list-disc list-inside ml-4 mt-1">
              <li>calculatePrice(vehicle, serviceType)</li>
              <li>getAvailableServices()</li>
              <li>calculateMultiplePrices(vehicle, serviceTypes[])</li>
            </ul>
          </div>
        </div>

        {/* Currency Formatting Info */}
        <div className="mt-4 p-6 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-semibold text-green-900 mb-3">
            Currency Formatting (lib/utils/currency.ts)
          </h3>
          <div className="space-y-2 text-sm text-green-800">
            <p>
              <strong>formatEuro(cents):</strong> Converts cents to German EUR
              format (e.g., 24900 → "249,00 €")
            </p>
            <p>
              <strong>formatCents(euro):</strong> Converts euro to cents (e.g.,
              249.00 → 24900)
            </p>
            <p>
              <strong>formatNumber(value):</strong> German thousand separator
              (e.g., 90000 → "90.000")
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
