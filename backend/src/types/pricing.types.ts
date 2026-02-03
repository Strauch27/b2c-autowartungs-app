/**
 * Pricing Service Type Definitions
 *
 * This file contains all type definitions used by the pricing service
 * to ensure type safety across the application.
 */

/**
 * Service types supported by the pricing service
 */
export type ServiceType =
  | 'inspection'          // Inspection/Maintenance service
  | 'oilService'          // Oil service
  | 'brakeServiceFront'   // Brake service (front)
  | 'brakeServiceRear'    // Brake service (rear)
  | 'tuv'                 // TÜV/HU
  | 'climateService';     // Climate service

/**
 * Mileage intervals for inspection pricing
 */
export type MileageInterval = '30k' | '60k' | '90k' | '120k+';

/**
 * Price source indicator
 */
export type PriceSource =
  | 'exact'              // Exact match found in PriceMatrix
  | 'fallback_brand'     // Brand average used as fallback
  | 'fallback_default';  // Default price used as ultimate fallback

/**
 * Input parameters for price calculation
 */
export interface PriceCalculationInput {
  /** Vehicle brand (e.g., VW, Mercedes, BMW) */
  brand: string;

  /** Vehicle model (e.g., Golf, S-Class, 3er) */
  model: string;

  /** Vehicle build year (1994-current year) */
  year: number;

  /** Current vehicle mileage in km (0-500,000) */
  mileage: number;

  /** Type of service to calculate price for */
  serviceType: ServiceType;
}

/**
 * Result of price calculation with breakdown
 */
export interface PriceCalculationResult {
  /** Base price from PriceMatrix (before age multiplier) */
  basePrice: number;

  /** Age multiplier applied (1.0, 1.1, or 1.2) */
  ageMultiplier: number;

  /** Final calculated price (rounded) in EUR */
  finalPrice: number;

  /** Source of the price (exact match, brand fallback, or default) */
  priceSource: PriceSource;

  /** Mileage interval used for inspection pricing */
  mileageInterval: MileageInterval;
}

/**
 * PriceMatrix search parameters
 */
export interface PriceMatrixSearchParams {
  /** Vehicle brand */
  brand: string;

  /** Vehicle model */
  model: string;

  /** Vehicle year */
  year: number;
}

/**
 * Fallback price search parameters
 */
export interface FallbackPriceParams {
  /** Vehicle brand */
  brand: string;

  /** Service type for price lookup */
  serviceType: ServiceType;
}

/**
 * Mileage thresholds for price calculation
 */
export const MILEAGE_THRESHOLDS = {
  /** Threshold between 30k and 60k inspection */
  TO_60K: 40000,

  /** Threshold between 60k and 90k inspection */
  TO_90K: 70000,

  /** Threshold between 90k and 120k+ inspection */
  TO_120K: 100000,
} as const;

/**
 * Age thresholds for multiplier calculation
 */
export const AGE_THRESHOLDS = {
  /** Age threshold for 10% surcharge */
  TEN_YEARS: 10,

  /** Age threshold for 20% surcharge */
  FIFTEEN_YEARS: 15,
} as const;

/**
 * Age multipliers
 */
export const AGE_MULTIPLIERS = {
  /** No surcharge for vehicles ≤ 10 years */
  STANDARD: 1.0,

  /** 10% surcharge for vehicles > 10 years */
  TEN_PERCENT: 1.1,

  /** 20% surcharge for vehicles > 15 years */
  TWENTY_PERCENT: 1.2,
} as const;

/**
 * Default prices used when no brand/model match is found
 * These are conservative estimates to avoid underpricing
 */
export const DEFAULT_PRICES: Record<ServiceType, number> = {
  inspection: 250,         // Conservative estimate for 60k inspection
  oilService: 180,
  brakeServiceFront: 400,
  brakeServiceRear: 350,
  tuv: 120,
  climateService: 150,
} as const;

/**
 * Validation constraints
 */
export const VALIDATION_CONSTRAINTS = {
  /** Minimum allowed year */
  MIN_YEAR: 1994,

  /** Maximum allowed year (current year) */
  MAX_YEAR: new Date().getFullYear(),

  /** Minimum allowed mileage */
  MIN_MILEAGE: 0,

  /** Maximum allowed mileage */
  MAX_MILEAGE: 500000,
} as const;

/**
 * Price calculation error types
 */
export class PriceCalculationError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'PriceCalculationError';
  }
}

/**
 * Error codes for price calculation
 */
export enum PriceErrorCode {
  INVALID_BRAND = 'INVALID_BRAND',
  INVALID_MODEL = 'INVALID_MODEL',
  INVALID_YEAR = 'INVALID_YEAR',
  INVALID_MILEAGE = 'INVALID_MILEAGE',
  INVALID_SERVICE_TYPE = 'INVALID_SERVICE_TYPE',
  PRICE_NOT_FOUND = 'PRICE_NOT_FOUND',
  DATABASE_ERROR = 'DATABASE_ERROR',
}

/**
 * Service type display names (for UI)
 */
export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  inspection: 'Inspektion/Wartung',
  oilService: 'Ölservice',
  brakeServiceFront: 'Bremsservice (Vorne)',
  brakeServiceRear: 'Bremsservice (Hinten)',
  tuv: 'TÜV/HU',
  climateService: 'Klimaservice',
} as const;

/**
 * Mileage interval display names (for UI)
 */
export const MILEAGE_INTERVAL_LABELS: Record<MileageInterval, string> = {
  '30k': '30.000 km Inspektion',
  '60k': '60.000 km Inspektion',
  '90k': '90.000 km Inspektion',
  '120k+': '120.000+ km Inspektion',
} as const;

/**
 * Price source display names (for debugging/logging)
 */
export const PRICE_SOURCE_LABELS: Record<PriceSource, string> = {
  exact: 'Exakte Übereinstimmung (Marke/Modell)',
  fallback_brand: 'Marken-Durchschnitt (Fallback)',
  fallback_default: 'Standard-Preis (Fallback)',
} as const;
