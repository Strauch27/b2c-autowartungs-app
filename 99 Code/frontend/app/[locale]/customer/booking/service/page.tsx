'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { ServiceCard } from '@/components/customer/ServiceCard';
import { AVAILABLE_SERVICES } from '@/lib/constants/services';
import { ServiceType, VehicleData } from '@/lib/types/service';
import { calculateMultiplePrices } from '@/lib/api/pricing';

export default function ServiceSelectionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const locale = (params.locale as string) || 'de';

  // Get vehicle data from URL params (from previous step)
  const [vehicle, setVehicle] = useState<VehicleData | null>(null);
  const [prices, setPrices] = useState<Record<ServiceType, number>>({} as Record<ServiceType, number>);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);

  useEffect(() => {
    // Parse vehicle data from URL params
    const brand = searchParams.get('brand');
    const model = searchParams.get('model');
    const year = searchParams.get('year');
    const mileage = searchParams.get('mileage');

    if (brand && model && year && mileage) {
      const vehicleData: VehicleData = {
        brand,
        model,
        year: parseInt(year),
        mileage: parseInt(mileage),
      };
      setVehicle(vehicleData);
      fetchPrices(vehicleData);
    } else {
      // Redirect back to vehicle selection if missing data
      router.push(`/${locale}/booking/vehicle`);
    }
  }, [searchParams, router, locale]);

  const fetchPrices = async (vehicleData: VehicleData) => {
    try {
      setLoading(true);
      const serviceTypes = AVAILABLE_SERVICES.map((s) => s.type);
      const priceData = await calculateMultiplePrices(vehicleData, serviceTypes);

      const priceMap: Record<ServiceType, number> = {} as Record<ServiceType, number>;
      Object.entries(priceData).forEach(([type, response]) => {
        priceMap[type as ServiceType] = response.breakdown.total;
      });

      setPrices(priceMap);
    } catch (error) {
      console.error('Failed to fetch prices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleServiceSelect = (serviceType: ServiceType) => {
    setSelectedService(serviceType);

    // Navigate to next step with all data
    const params = new URLSearchParams({
      brand: vehicle!.brand,
      model: vehicle!.model,
      year: vehicle!.year.toString(),
      mileage: vehicle!.mileage.toString(),
      serviceType,
    });

    router.push(`/de/booking/appointment?${params.toString()}`);
  };

  if (!vehicle) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Wählen Sie Ihren Service</h1>
          <p className="text-muted-foreground">
            für Ihren {vehicle.brand} {vehicle.model} ({vehicle.year})
          </p>
        </div>

        {/* Service Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {AVAILABLE_SERVICES.map((service) => (
            <ServiceCard
              key={service.type}
              name={service.name}
              description={service.description}
              icon={service.icon}
              price={prices[service.type]}
              featured={service.featured}
              loading={loading}
              selected={selectedService === service.type}
              onSelect={() => handleServiceSelect(service.type)}
            />
          ))}
        </div>

        {/* Info Box */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">
            Garantierter Festpreis
          </h3>
          <p className="text-sm text-blue-800">
            Alle Preise sind fahrzeugspezifisch kalkuliert und garantiert.
            Zusätzliche Arbeiten werden Ihnen digital angeboten und erst nach
            Ihrer Freigabe durchgeführt. Der Hol- und Bringservice ist bereits
            im Preis enthalten.
          </p>
        </div>
      </div>
    </div>
  );
}
