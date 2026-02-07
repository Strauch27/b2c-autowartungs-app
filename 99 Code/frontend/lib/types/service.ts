/**
 * Service type definitions
 */

export enum ServiceType {
  INSPECTION = 'inspection',
  OIL_SERVICE = 'oil_service',
  BRAKE_SERVICE = 'brake_service',
  TUV = 'tuv',
  CLIMATE_SERVICE = 'climate_service',
}

export interface ServiceInfo {
  type: ServiceType;
  name: string;
  description: string;
  icon: string;
}

export interface VehicleData {
  brand: string;
  model: string;
  year: number;
  mileage: number;
}

export interface PriceBreakdown {
  basePrice: number; // in EUR
  ageSurcharge?: number; // in EUR
  mileageSurcharge?: number; // in EUR
  total: number; // in EUR
}

export interface PriceResponse {
  serviceType: ServiceType;
  vehicle: VehicleData;
  breakdown: PriceBreakdown;
  message?: string;
}
