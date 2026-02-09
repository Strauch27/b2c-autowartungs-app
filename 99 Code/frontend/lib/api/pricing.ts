import { apiClient } from './client';
import { ServiceType, VehicleData, PriceResponse } from '../types/service';

/**
 * Calculate price for a specific service and vehicle.
 * The backend returns {success, data: {price, breakdown: {basePrice, ageMultiplier, ...}}},
 * which we unwrap and map to the frontend PriceResponse shape.
 */
export async function calculatePrice(
  vehicle: VehicleData,
  serviceType: ServiceType
): Promise<PriceResponse> {
  const params = new URLSearchParams({
    brand: vehicle.brand,
    model: vehicle.model,
    year: vehicle.year.toString(),
    mileage: vehicle.mileage.toString(),
  });

  const response = await apiClient.get<{ success: boolean; data: any }>(
    `/api/services/${serviceType}/price?${params.toString()}`
  );

  const data = response.data;
  return {
    serviceType,
    vehicle,
    breakdown: {
      basePrice: data.breakdown?.basePrice ?? data.price ?? 0,
      ageSurcharge: data.breakdown?.ageMultiplier ?? data.breakdown?.ageSurcharge ?? 0,
      mileageSurcharge: data.breakdown?.mileageSurcharge ?? 0,
      total: data.price ?? data.breakdown?.total ?? 0,
    },
    message: data.message,
  };
}

/**
 * Get all available services.
 * The backend returns {success, data: [...]}, which we unwrap.
 */
export async function getAvailableServices(): Promise<ServiceType[]> {
  const response = await apiClient.get<{ success: boolean; data: ServiceType[] }>(
    '/api/services'
  );
  return response.data;
}

/**
 * Calculate prices for multiple services at once
 */
export async function calculateMultiplePrices(
  vehicle: VehicleData,
  serviceTypes: ServiceType[]
): Promise<Record<ServiceType, PriceResponse>> {
  const promises = serviceTypes.map(async (serviceType) => {
    const price = await calculatePrice(vehicle, serviceType);
    return [serviceType, price] as const;
  });

  const results = await Promise.all(promises);
  return Object.fromEntries(results) as Record<ServiceType, PriceResponse>;
}

/** Maps wizard service IDs to backend ServiceType route params */
const WIZARD_TO_BACKEND: Record<string, string> = {
  inspection: 'INSPECTION',
  oil: 'OIL_SERVICE',
  brakes: 'BRAKE_SERVICE',
  tuv: 'TUV',
  ac: 'CLIMATE_SERVICE',
};

/** Conservative fallback prices (match backend defaults) */
const FALLBACK_PRICES: Record<string, number> = {
  inspection: 250,
  oil: 180,
  brakes: 400,
  tuv: 120,
  ac: 150,
};

/**
 * Calculate prices for all wizard services in one go.
 * Returns a map of wizard service ID → price in EUR.
 * Falls back to hardcoded estimates on error.
 */
export async function calculateWizardServicePrices(
  vehicle: { brand: string; model: string; year: number; mileage: number },
  wizardServiceIds: string[]
): Promise<Record<string, number>> {
  const prices: Record<string, number> = {};

  const params = new URLSearchParams({
    brand: vehicle.brand,
    model: vehicle.model,
    year: vehicle.year.toString(),
    mileage: vehicle.mileage.toString(),
  });

  await Promise.all(
    wizardServiceIds.map(async (wizardId) => {
      const backendType = WIZARD_TO_BACKEND[wizardId];
      if (!backendType) return;

      try {
        const response = await apiClient.get<{
          success: boolean;
          data: { price: number };
        }>(`/api/services/${backendType}/price?${params.toString()}`);

        prices[wizardId] = response.data.price;
      } catch {
        prices[wizardId] = FALLBACK_PRICES[wizardId] ?? 0;
      }
    })
  );

  return prices;
}
