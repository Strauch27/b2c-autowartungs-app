import { apiClient } from './client';
import { ServiceType, VehicleData, PriceResponse } from '../types/service';

/**
 * Calculate price for a specific service and vehicle
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

  return apiClient.get<PriceResponse>(
    `/api/services/${serviceType}/price?${params.toString()}`
  );
}

/**
 * Get all available services
 */
export async function getAvailableServices(): Promise<ServiceType[]> {
  return apiClient.get<ServiceType[]>('/api/services');
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
