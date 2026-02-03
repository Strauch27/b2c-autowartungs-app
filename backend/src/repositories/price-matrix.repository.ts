import { PrismaClient, PriceMatrix } from '@prisma/client';

export interface PriceMatrixSearchParams {
  brand: string;
  model: string;
  year: number;
}

export interface FallbackPriceParams {
  brand: string;
  serviceType: 'inspection' | 'oilService' | 'brakeServiceFront' | 'brakeServiceRear' | 'tuv' | 'climateService';
}

export class PriceMatrixRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Find price matrix entry for a specific brand/model/year combination
   * @param params Search parameters with brand, model, and year
   * @returns PriceMatrix entry or null if not found
   */
  async findByBrandModelYear(params: PriceMatrixSearchParams): Promise<PriceMatrix | null> {
    const { brand, model, year } = params;

    return await this.prisma.priceMatrix.findFirst({
      where: {
        brand: brand,
        model: model,
        yearFrom: { lte: year },
        yearTo: { gte: year },
      },
    });
  }

  /**
   * Find all price matrix entries for a specific brand
   * Used for fallback price calculation
   * @param brand Brand name
   * @returns Array of PriceMatrix entries
   */
  async findByBrand(brand: string): Promise<PriceMatrix[]> {
    return await this.prisma.priceMatrix.findMany({
      where: {
        brand: brand,
      },
    });
  }

  /**
   * Get all price matrix entries for a specific model (across all years)
   * @param brand Brand name
   * @param model Model name
   * @returns Array of PriceMatrix entries
   */
  async findByBrandAndModel(brand: string, model: string): Promise<PriceMatrix[]> {
    return await this.prisma.priceMatrix.findMany({
      where: {
        brand: brand,
        model: model,
      },
      orderBy: {
        yearFrom: 'desc',
      },
    });
  }

  /**
   * Calculate average price for a brand across all models
   * Used as fallback when specific model is not found
   * @param params Brand and service type
   * @returns Average price or null if no data found
   */
  async getAveragePriceForBrand(params: FallbackPriceParams): Promise<number | null> {
    const { brand, serviceType } = params;

    const priceMatrixEntries = await this.findByBrand(brand);

    if (priceMatrixEntries.length === 0) {
      return null;
    }

    // Filter out null values and calculate average
    const prices = priceMatrixEntries
      .map((entry) => {
        // Map service type to the correct field based on mileage
        // For fallback, we use 60k inspection as baseline
        if (serviceType === 'inspection') {
          return entry.inspection60k ? Number(entry.inspection60k) : null;
        }
        return entry[serviceType] ? Number(entry[serviceType]) : null;
      })
      .filter((price): price is number => price !== null);

    if (prices.length === 0) {
      return null;
    }

    const sum = prices.reduce((acc, price) => acc + price, 0);
    return Math.round(sum / prices.length);
  }

  /**
   * Get all brands available in the price matrix
   * @returns Array of unique brand names
   */
  async getAllBrands(): Promise<string[]> {
    const priceMatrixEntries = await this.prisma.priceMatrix.findMany({
      select: {
        brand: true,
      },
      distinct: ['brand'],
      orderBy: {
        brand: 'asc',
      },
    });

    return priceMatrixEntries.map((entry) => entry.brand);
  }

  /**
   * Get all models for a specific brand
   * @param brand Brand name
   * @returns Array of unique model names
   */
  async getModelsByBrand(brand: string): Promise<string[]> {
    const priceMatrixEntries = await this.prisma.priceMatrix.findMany({
      where: {
        brand: brand,
      },
      select: {
        model: true,
      },
      distinct: ['model'],
      orderBy: {
        model: 'asc',
      },
    });

    return priceMatrixEntries.map((entry) => entry.model);
  }
}
