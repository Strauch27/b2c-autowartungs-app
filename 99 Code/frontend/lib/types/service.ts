/**
 * Service type definitions
 */

export enum ServiceType {
  INSPECTION = 'inspection',
  OIL_SERVICE = 'oil_service',
  BRAKE_SERVICE = 'brake_service',
  TUV = 'tuv',
  CLIMATE_SERVICE = 'climate_service',
  DETAILING = 'detailing',
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
  basePrice: number; // in cents
  ageSurcharge?: number; // in cents
  mileageSurcharge?: number; // in cents
  total: number; // in cents
}

export interface PriceResponse {
  serviceType: ServiceType;
  vehicle: VehicleData;
  breakdown: PriceBreakdown;
  message?: string;
}
