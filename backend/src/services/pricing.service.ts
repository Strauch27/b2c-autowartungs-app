import { PriceMatrix } from '@prisma/client';
import { PriceMatrixRepository } from '../repositories/price-matrix.repository';

export type ServiceType = 'inspection' | 'oilService' | 'brakeServiceFront' | 'brakeServiceRear' | 'tuv' | 'climateService';

export interface PriceCalculationInput {
  brand: string;
  model: string;
  year: number;
  mileage: number;
  serviceType: ServiceType;
}

export interface PriceCalculationResult {
  basePrice: number;
  ageMultiplier: number;
  finalPrice: number;
  priceSource: 'exact' | 'fallback_brand' | 'fallback_default';
  mileageInterval: string;
}

/**
 * Pricing Service
 * Handles price calculation based on brand/model, mileage, and vehicle age
 *
 * Business Rules:
 * - Price calculation based on brand/model (NOT vehicle class!)
 * - Mileage influences price (30k, 60k, 90k, 120k+ intervals)
 * - Age multiplier: vehicles >10 years: +10%, >15 years: +20%
 * - Fallback logic for missing models
 */
export class PricingService {
  private priceMatrixRepository: PriceMatrixRepository;

  constructor(priceMatrixRepository: PriceMatrixRepository) {
    this.priceMatrixRepository = priceMatrixRepository;
  }

  /**
   * Calculate price for a service based on vehicle data
   * @param input Price calculation parameters
   * @returns Price calculation result with breakdown
   */
  async calculatePrice(input: PriceCalculationInput): Promise<PriceCalculationResult> {
    const { brand, model, year, mileage, serviceType } = input;

    // Step 1: Try to find exact match in PriceMatrix
    const priceEntry = await this.priceMatrixRepository.findByBrandModelYear({
      brand,
      model,
      year,
    });

    let basePrice: number;
    let priceSource: 'exact' | 'fallback_brand' | 'fallback_default';

    if (priceEntry) {
      // Exact match found
      basePrice = this.getPriceByMileage(priceEntry, mileage, serviceType);
      priceSource = 'exact';
    } else {
      // Fallback: Use average price for brand
      basePrice = await this.getFallbackPrice(brand, serviceType);
      priceSource = basePrice > 0 ? 'fallback_brand' : 'fallback_default';
    }

    // Step 2: Apply age multiplier
    const ageMultiplier = this.getAgeMultiplier(year);

    // Step 3: Calculate final price
    const finalPrice = Math.round(basePrice * ageMultiplier);

    // Determine mileage interval for transparency
    const mileageInterval = this.getMileageInterval(mileage);

    return {
      basePrice,
      ageMultiplier,
      finalPrice,
      priceSource,
      mileageInterval,
    };
  }

  /**
   * Get price from PriceMatrix based on mileage interval
   * @param priceEntry PriceMatrix entry
   * @param mileage Current vehicle mileage
   * @param serviceType Type of service
   * @returns Base price for the service
   */
  getPriceByMileage(priceEntry: PriceMatrix, mileage: number, serviceType: ServiceType): number {
    if (serviceType === 'inspection') {
      // Mileage-based inspection pricing
      if (mileage < 40000) {
        return priceEntry.inspection30k ? Number(priceEntry.inspection30k) : 0;
      } else if (mileage < 70000) {
        return priceEntry.inspection60k ? Number(priceEntry.inspection60k) : 0;
      } else if (mileage < 100000) {
        return priceEntry.inspection90k ? Number(priceEntry.inspection90k) : 0;
      } else {
        return priceEntry.inspection120k ? Number(priceEntry.inspection120k) : 0;
      }
    } else {
      // Other services don't depend on mileage
      const price = priceEntry[serviceType];
      return price ? Number(price) : 0;
    }
  }

  /**
   * Calculate age multiplier based on vehicle year
   * Business Rule:
   * - Vehicles > 15 years: +20% (multiplier 1.2)
   * - Vehicles > 10 years: +10% (multiplier 1.1)
   * - Vehicles <= 10 years: no surcharge (multiplier 1.0)
   *
   * @param year Vehicle build year
   * @returns Age multiplier
   */
  getAgeMultiplier(year: number): number {
    const currentYear = new Date().getFullYear();
    const age = currentYear - year;

    if (age > 15) {
      return 1.2; // +20% surcharge
    } else if (age > 10) {
      return 1.1; // +10% surcharge
    } else {
      return 1.0; // No surcharge
    }
  }

  /**
   * Get fallback price when specific model is not found
   * Strategy:
   * 1. Try to get average price for the brand
   * 2. If brand not found, use default price based on service type
   *
   * @param brand Vehicle brand
   * @param serviceType Type of service
   * @returns Fallback price
   */
  async getFallbackPrice(brand: string, serviceType: ServiceType): Promise<number> {
    // Try brand-specific fallback
    const brandAveragePrice = await this.priceMatrixRepository.getAveragePriceForBrand({
      brand,
      serviceType,
    });

    if (brandAveragePrice !== null) {
      return brandAveragePrice;
    }

    // Ultimate fallback: default prices per service type
    return this.getDefaultPrice(serviceType);
  }

  /**
   * Get default price when no brand/model match is found
   * These are conservative estimates to avoid underpricing
   *
   * @param serviceType Type of service
   * @returns Default price
   */
  private getDefaultPrice(serviceType: ServiceType): number {
    const defaultPrices: Record<ServiceType, number> = {
      inspection: 250, // Conservative estimate for 60k inspection
      oilService: 180,
      brakeServiceFront: 400,
      brakeServiceRear: 350,
      tuv: 120,
      climateService: 150,
    };

    return defaultPrices[serviceType];
  }

  /**
   * Determine mileage interval for display purposes
   * @param mileage Current vehicle mileage
   * @returns Mileage interval string
   */
  private getMileageInterval(mileage: number): string {
    if (mileage < 40000) {
      return '30k';
    } else if (mileage < 70000) {
      return '60k';
    } else if (mileage < 100000) {
      return '90k';
    } else {
      return '120k+';
    }
  }

  /**
   * Validate price calculation input
   * @param input Price calculation parameters
   * @throws Error if validation fails
   */
  validateInput(input: PriceCalculationInput): void {
    const { brand, model, year, mileage } = input;

    if (!brand || brand.trim().length === 0) {
      throw new Error('Brand is required');
    }

    if (!model || model.trim().length === 0) {
      throw new Error('Model is required');
    }

    const currentYear = new Date().getFullYear();
    if (year < 1994 || year > currentYear) {
      throw new Error(`Year must be between 1994 and ${currentYear}`);
    }

    if (mileage < 0 || mileage > 500000) {
      throw new Error('Mileage must be between 0 and 500,000 km');
    }
  }

  /**
   * Get available brands from price matrix
   * @returns Array of brand names
   */
  async getAvailableBrands(): Promise<string[]> {
    return await this.priceMatrixRepository.getAllBrands();
  }

  /**
   * Get available models for a specific brand
   * @param brand Brand name
   * @returns Array of model names
   */
  async getAvailableModels(brand: string): Promise<string[]> {
    return await this.priceMatrixRepository.getModelsByBrand(brand);
  }
}
