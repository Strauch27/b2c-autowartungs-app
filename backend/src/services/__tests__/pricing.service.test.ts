import { PricingService, PriceCalculationInput } from '../pricing.service';
import { PriceMatrixRepository } from '../../repositories/price-matrix.repository';
import { PriceMatrix } from '@prisma/client';

// Mock PriceMatrixRepository
class MockPriceMatrixRepository extends PriceMatrixRepository {
  private mockData: PriceMatrix[];

  constructor() {
    // Pass undefined to satisfy constructor, we won't use prisma in tests
    super(undefined as any);
    this.mockData = this.createMockData();
  }

  private createMockData(): PriceMatrix[] {
    return [
      {
        id: '1',
        brand: 'VW',
        model: 'Golf',
        yearFrom: 2012,
        yearTo: 2019,
        inspection30k: 189,
        inspection60k: 219,
        inspection90k: 289,
        inspection120k: 349,
        oilService: 159,
        brakeServiceFront: 349,
        brakeServiceRear: 299,
        tuv: 120,
        climateService: 140,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        brand: 'Mercedes',
        model: 'S-Class',
        yearFrom: 2013,
        yearTo: 2020,
        inspection30k: 349,
        inspection60k: 399,
        inspection90k: 499,
        inspection120k: 599,
        oilService: 249,
        brakeServiceFront: 649,
        brakeServiceRear: 549,
        tuv: 150,
        climateService: 180,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '3',
        brand: 'BMW',
        model: '3er',
        yearFrom: 2015,
        yearTo: 2022,
        inspection30k: 269,
        inspection60k: 309,
        inspection90k: 379,
        inspection120k: 449,
        oilService: 219,
        brakeServiceFront: 479,
        brakeServiceRear: 429,
        tuv: 130,
        climateService: 160,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }

  async findByBrandModelYear(params: {
    brand: string;
    model: string;
    year: number;
  }): Promise<PriceMatrix | null> {
    const { brand, model, year } = params;
    return (
      this.mockData.find(
        (entry) =>
          entry.brand === brand &&
          entry.model === model &&
          entry.yearFrom <= year &&
          entry.yearTo >= year
      ) || null
    );
  }

  async findByBrand(brand: string): Promise<PriceMatrix[]> {
    return this.mockData.filter((entry) => entry.brand === brand);
  }

  async getAveragePriceForBrand(params: {
    brand: string;
    serviceType: string;
  }): Promise<number | null> {
    const entries = await this.findByBrand(params.brand);

    if (entries.length === 0) {
      return null;
    }

    // For inspection, use 60k as baseline
    if (params.serviceType === 'inspection') {
      const prices = entries
        .map((entry) => (entry.inspection60k ? Number(entry.inspection60k) : null))
        .filter((price): price is number => price !== null);

      if (prices.length === 0) return null;

      const sum = prices.reduce((acc, price) => acc + price, 0);
      return Math.round(sum / prices.length);
    }

    // For other services
    const prices = entries
      .map((entry) => {
        const price = entry[params.serviceType as keyof PriceMatrix];
        return price && typeof price === 'object' && 'toNumber' in price
          ? (price as any).toNumber()
          : typeof price === 'number'
          ? price
          : null;
      })
      .filter((price): price is number => price !== null);

    if (prices.length === 0) return null;

    const sum = prices.reduce((acc, price) => acc + price, 0);
    return Math.round(sum / prices.length);
  }

  async getAllBrands(): Promise<string[]> {
    return Array.from(new Set(this.mockData.map((entry) => entry.brand)));
  }

  async getModelsByBrand(brand: string): Promise<string[]> {
    return Array.from(
      new Set(this.mockData.filter((entry) => entry.brand === brand).map((entry) => entry.model))
    );
  }
}

describe('PricingService', () => {
  let pricingService: PricingService;
  let mockRepository: MockPriceMatrixRepository;

  beforeEach(() => {
    mockRepository = new MockPriceMatrixRepository();
    pricingService = new PricingService(mockRepository);
  });

  describe('calculatePrice', () => {
    it('should calculate correct price for VW Golf with 60k km', async () => {
      const input: PriceCalculationInput = {
        brand: 'VW',
        model: 'Golf',
        year: 2015,
        mileage: 60000,
        serviceType: 'inspection',
      };

      const result = await pricingService.calculatePrice(input);

      expect(result.basePrice).toBe(219);
      expect(result.ageMultiplier).toBe(1.1); // Vehicle is 11 years old (2026 - 2015)
      expect(result.finalPrice).toBe(241); // 219 * 1.1 = 240.9, rounded to 241
      expect(result.priceSource).toBe('exact');
      expect(result.mileageInterval).toBe('60k');
    });

    it('should calculate higher price for Mercedes S-Class with 90k km', async () => {
      const input: PriceCalculationInput = {
        brand: 'Mercedes',
        model: 'S-Class',
        year: 2018,
        mileage: 90000,
        serviceType: 'inspection',
      };

      const result = await pricingService.calculatePrice(input);

      expect(result.basePrice).toBe(499);
      expect(result.ageMultiplier).toBe(1.0); // Vehicle is 8 years old
      expect(result.finalPrice).toBe(499);
      expect(result.priceSource).toBe('exact');
      expect(result.mileageInterval).toBe('90k');
    });

    it('should apply 20% surcharge for vehicles older than 15 years', async () => {
      const input: PriceCalculationInput = {
        brand: 'VW',
        model: 'Golf',
        year: 2008, // 18 years old
        mileage: 120000,
        serviceType: 'inspection',
      };

      const result = await pricingService.calculatePrice(input);

      expect(result.ageMultiplier).toBe(1.2); // +20% for >15 years
      expect(result.finalPrice).toBe(419); // 349 * 1.2 = 418.8, rounded to 419
    });

    it('should use fallback price when model is not found', async () => {
      const input: PriceCalculationInput = {
        brand: 'VW',
        model: 'Unknown Model',
        year: 2018,
        mileage: 60000,
        serviceType: 'inspection',
      };

      const result = await pricingService.calculatePrice(input);

      // Should use brand average (VW Golf average is 219)
      expect(result.basePrice).toBe(219);
      expect(result.priceSource).toBe('fallback_brand');
    });

    it('should use default price when brand is not found', async () => {
      const input: PriceCalculationInput = {
        brand: 'Unknown Brand',
        model: 'Unknown Model',
        year: 2018,
        mileage: 60000,
        serviceType: 'inspection',
      };

      const result = await pricingService.calculatePrice(input);

      // Should use default inspection price
      expect(result.basePrice).toBe(250);
      expect(result.priceSource).toBe('fallback_default');
    });

    it('should calculate oil service price correctly', async () => {
      const input: PriceCalculationInput = {
        brand: 'VW',
        model: 'Golf',
        year: 2015,
        mileage: 60000,
        serviceType: 'oilService',
      };

      const result = await pricingService.calculatePrice(input);

      expect(result.basePrice).toBe(159);
      expect(result.finalPrice).toBe(175); // 159 * 1.1 = 174.9, rounded to 175
    });

    it('should calculate brake service price correctly', async () => {
      const input: PriceCalculationInput = {
        brand: 'BMW',
        model: '3er',
        year: 2020,
        mileage: 45000,
        serviceType: 'brakeServiceFront',
      };

      const result = await pricingService.calculatePrice(input);

      expect(result.basePrice).toBe(479);
      expect(result.ageMultiplier).toBe(1.0); // Vehicle is 6 years old
      expect(result.finalPrice).toBe(479);
    });
  });

  describe('getPriceByMileage', () => {
    it('should return 30k inspection price for mileage < 40000', () => {
      const priceEntry: PriceMatrix = {
        id: '1',
        brand: 'VW',
        model: 'Golf',
        yearFrom: 2012,
        yearTo: 2019,
        inspection30k: 189,
        inspection60k: 219,
        inspection90k: 289,
        inspection120k: 349,
        oilService: null,
        brakeServiceFront: null,
        brakeServiceRear: null,
        tuv: null,
        climateService: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const price = pricingService.getPriceByMileage(priceEntry, 30000, 'inspection');
      expect(price).toBe(189);
    });

    it('should return 60k inspection price for mileage between 40000 and 70000', () => {
      const priceEntry: PriceMatrix = {
        id: '1',
        brand: 'VW',
        model: 'Golf',
        yearFrom: 2012,
        yearTo: 2019,
        inspection30k: 189,
        inspection60k: 219,
        inspection90k: 289,
        inspection120k: 349,
        oilService: null,
        brakeServiceFront: null,
        brakeServiceRear: null,
        tuv: null,
        climateService: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const price = pricingService.getPriceByMileage(priceEntry, 60000, 'inspection');
      expect(price).toBe(219);
    });

    it('should return 90k inspection price for mileage between 70000 and 100000', () => {
      const priceEntry: PriceMatrix = {
        id: '1',
        brand: 'VW',
        model: 'Golf',
        yearFrom: 2012,
        yearTo: 2019,
        inspection30k: 189,
        inspection60k: 219,
        inspection90k: 289,
        inspection120k: 349,
        oilService: null,
        brakeServiceFront: null,
        brakeServiceRear: null,
        tuv: null,
        climateService: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const price = pricingService.getPriceByMileage(priceEntry, 90000, 'inspection');
      expect(price).toBe(289);
    });

    it('should return 120k+ inspection price for mileage >= 100000', () => {
      const priceEntry: PriceMatrix = {
        id: '1',
        brand: 'VW',
        model: 'Golf',
        yearFrom: 2012,
        yearTo: 2019,
        inspection30k: 189,
        inspection60k: 219,
        inspection90k: 289,
        inspection120k: 349,
        oilService: null,
        brakeServiceFront: null,
        brakeServiceRear: null,
        tuv: null,
        climateService: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const price = pricingService.getPriceByMileage(priceEntry, 120000, 'inspection');
      expect(price).toBe(349);
    });
  });

  describe('getAgeMultiplier', () => {
    const currentYear = new Date().getFullYear();

    it('should return 1.0 for vehicles 10 years or newer', () => {
      const year = currentYear - 10;
      const multiplier = pricingService.getAgeMultiplier(year);
      expect(multiplier).toBe(1.0);
    });

    it('should return 1.1 for vehicles between 11 and 15 years old', () => {
      const year = currentYear - 11;
      const multiplier = pricingService.getAgeMultiplier(year);
      expect(multiplier).toBe(1.1);
    });

    it('should return 1.2 for vehicles older than 15 years', () => {
      const year = currentYear - 16;
      const multiplier = pricingService.getAgeMultiplier(year);
      expect(multiplier).toBe(1.2);
    });

    it('should return 1.2 for vehicles 20 years old', () => {
      const year = currentYear - 20;
      const multiplier = pricingService.getAgeMultiplier(year);
      expect(multiplier).toBe(1.2);
    });
  });

  describe('getFallbackPrice', () => {
    it('should return average price for brand when available', async () => {
      const price = await pricingService.getFallbackPrice('VW', 'inspection');
      // VW Golf 60k inspection is 219
      expect(price).toBe(219);
    });

    it('should return default price when brand not found', async () => {
      const price = await pricingService.getFallbackPrice('Unknown Brand', 'inspection');
      expect(price).toBe(250); // Default inspection price
    });

    it('should return correct default prices for different services', async () => {
      const inspectionPrice = await pricingService.getFallbackPrice('Unknown', 'inspection');
      expect(inspectionPrice).toBe(250);

      const oilServicePrice = await pricingService.getFallbackPrice('Unknown', 'oilService');
      expect(oilServicePrice).toBe(180);

      const brakePrice = await pricingService.getFallbackPrice('Unknown', 'brakeServiceFront');
      expect(brakePrice).toBe(400);
    });
  });

  describe('validateInput', () => {
    it('should throw error for empty brand', () => {
      const input: PriceCalculationInput = {
        brand: '',
        model: 'Golf',
        year: 2015,
        mileage: 60000,
        serviceType: 'inspection',
      };

      expect(() => pricingService.validateInput(input)).toThrow('Brand is required');
    });

    it('should throw error for empty model', () => {
      const input: PriceCalculationInput = {
        brand: 'VW',
        model: '',
        year: 2015,
        mileage: 60000,
        serviceType: 'inspection',
      };

      expect(() => pricingService.validateInput(input)).toThrow('Model is required');
    });

    it('should throw error for year too old', () => {
      const input: PriceCalculationInput = {
        brand: 'VW',
        model: 'Golf',
        year: 1990,
        mileage: 60000,
        serviceType: 'inspection',
      };

      expect(() => pricingService.validateInput(input)).toThrow('Year must be between 1994');
    });

    it('should throw error for year in the future', () => {
      const input: PriceCalculationInput = {
        brand: 'VW',
        model: 'Golf',
        year: 2030,
        mileage: 60000,
        serviceType: 'inspection',
      };

      expect(() => pricingService.validateInput(input)).toThrow('Year must be between 1994');
    });

    it('should throw error for negative mileage', () => {
      const input: PriceCalculationInput = {
        brand: 'VW',
        model: 'Golf',
        year: 2015,
        mileage: -1000,
        serviceType: 'inspection',
      };

      expect(() => pricingService.validateInput(input)).toThrow('Mileage must be between 0 and 500,000 km');
    });

    it('should throw error for mileage too high', () => {
      const input: PriceCalculationInput = {
        brand: 'VW',
        model: 'Golf',
        year: 2015,
        mileage: 600000,
        serviceType: 'inspection',
      };

      expect(() => pricingService.validateInput(input)).toThrow('Mileage must be between 0 and 500,000 km');
    });

    it('should not throw error for valid input', () => {
      const input: PriceCalculationInput = {
        brand: 'VW',
        model: 'Golf',
        year: 2015,
        mileage: 60000,
        serviceType: 'inspection',
      };

      expect(() => pricingService.validateInput(input)).not.toThrow();
    });
  });

  describe('getAvailableBrands', () => {
    it('should return list of available brands', async () => {
      const brands = await pricingService.getAvailableBrands();
      expect(brands).toContain('VW');
      expect(brands).toContain('Mercedes');
      expect(brands).toContain('BMW');
    });
  });

  describe('getAvailableModels', () => {
    it('should return models for specific brand', async () => {
      const models = await pricingService.getAvailableModels('VW');
      expect(models).toContain('Golf');
    });

    it('should return empty array for unknown brand', async () => {
      const models = await pricingService.getAvailableModels('Unknown Brand');
      expect(models).toEqual([]);
    });
  });

  describe('Edge Cases', () => {
    it('should handle exact 40000 km mileage (boundary between 30k and 60k)', async () => {
      const input: PriceCalculationInput = {
        brand: 'VW',
        model: 'Golf',
        year: 2015,
        mileage: 40000,
        serviceType: 'inspection',
      };

      const result = await pricingService.calculatePrice(input);
      expect(result.mileageInterval).toBe('60k');
    });

    it('should handle exact 70000 km mileage (boundary between 60k and 90k)', async () => {
      const input: PriceCalculationInput = {
        brand: 'VW',
        model: 'Golf',
        year: 2015,
        mileage: 70000,
        serviceType: 'inspection',
      };

      const result = await pricingService.calculatePrice(input);
      expect(result.mileageInterval).toBe('90k');
    });

    it('should handle exact 100000 km mileage (boundary between 90k and 120k+)', async () => {
      const input: PriceCalculationInput = {
        brand: 'VW',
        model: 'Golf',
        year: 2015,
        mileage: 100000,
        serviceType: 'inspection',
      };

      const result = await pricingService.calculatePrice(input);
      expect(result.mileageInterval).toBe('120k+');
    });

    it('should handle very high mileage (500000 km)', async () => {
      const input: PriceCalculationInput = {
        brand: 'VW',
        model: 'Golf',
        year: 2015,
        mileage: 500000,
        serviceType: 'inspection',
      };

      const result = await pricingService.calculatePrice(input);
      expect(result.mileageInterval).toBe('120k+');
      expect(result.basePrice).toBe(349); // 120k+ price
    });
  });
});
