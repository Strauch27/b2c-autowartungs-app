import { PrismaClient, ServiceType } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Price Calculator Utility
 *
 * Calculates service prices based on vehicle brand/model and mileage.
 * Replaces the old vehicle class-based pricing system.
 */

interface PriceCalculationInput {
  brand: string;
  model: string;
  year: number;
  mileage: number;
  serviceType: ServiceType;
}

interface PriceCalculationResult {
  price: number | null;
  priceMatrixEntry: any | null;
  error?: string;
}

/**
 * Calculate price for a service based on vehicle details
 *
 * @param input Vehicle and service details
 * @returns Price calculation result
 */
export async function calculateServicePrice(
  input: PriceCalculationInput
): Promise<PriceCalculationResult> {
  const { brand, model, year, mileage, serviceType } = input;

  // Find matching price matrix entry
  const priceMatrix = await prisma.priceMatrix.findFirst({
    where: {
      brand: brand,
      model: model,
      yearFrom: { lte: year },
      yearTo: { gte: year },
    },
  });

  if (!priceMatrix) {
    return {
      price: null,
      priceMatrixEntry: null,
      error: `No pricing found for ${brand} ${model} (${year})`,
    };
  }

  let price: number | null = null;

  // Determine price based on service type
  switch (serviceType) {
    case 'INSPECTION':
      price = getInspectionPrice(mileage, priceMatrix);
      break;
    case 'OIL_SERVICE':
      price = priceMatrix.oilService?.toNumber() || null;
      break;
    case 'BRAKE_SERVICE':
      // Use front brake service price by default
      price = priceMatrix.brakeServiceFront?.toNumber() || null;
      break;
    case 'TUV':
      price = priceMatrix.tuv?.toNumber() || null;
      break;
    case 'CLIMATE_SERVICE':
      price = priceMatrix.climateService?.toNumber() || null;
      break;
    default:
      return {
        price: null,
        priceMatrixEntry: priceMatrix,
        error: `Unknown service type: ${serviceType}`,
      };
  }

  if (price === null) {
    return {
      price: null,
      priceMatrixEntry: priceMatrix,
      error: `Price not available for ${serviceType}`,
    };
  }

  return {
    price,
    priceMatrixEntry: priceMatrix,
  };
}

/**
 * Get inspection price based on mileage tier
 *
 * @param mileage Current vehicle mileage
 * @param priceMatrix Price matrix entry
 * @returns Price for appropriate inspection tier
 */
function getInspectionPrice(mileage: number, priceMatrix: any): number | null {
  // Determine mileage tier
  if (mileage < 45000) {
    // 0-45k km → 30k inspection
    return priceMatrix.inspection30k?.toNumber() || null;
  } else if (mileage < 75000) {
    // 45k-75k km → 60k inspection
    return priceMatrix.inspection60k?.toNumber() || null;
  } else if (mileage < 105000) {
    // 75k-105k km → 90k inspection
    return priceMatrix.inspection90k?.toNumber() || null;
  } else {
    // 105k+ km → 120k inspection
    return priceMatrix.inspection120k?.toNumber() || null;
  }
}

/**
 * Get all available services and prices for a vehicle
 *
 * @param brand Vehicle brand
 * @param model Vehicle model
 * @param year Vehicle year
 * @param mileage Vehicle mileage
 * @returns Map of service types to prices
 */
export async function getAvailableServices(
  brand: string,
  model: string,
  year: number,
  mileage: number
): Promise<Map<ServiceType, number>> {
  const priceMatrix = await prisma.priceMatrix.findFirst({
    where: {
      brand: brand,
      model: model,
      yearFrom: { lte: year },
      yearTo: { gte: year },
    },
  });

  const services = new Map<ServiceType, number>();

  if (!priceMatrix) {
    return services;
  }

  // Add inspection price
  const inspectionPrice = getInspectionPrice(mileage, priceMatrix);
  if (inspectionPrice !== null) {
    services.set('INSPECTION', inspectionPrice);
  }

  // Add oil service
  if (priceMatrix.oilService) {
    services.set('OIL_SERVICE', priceMatrix.oilService.toNumber());
  }

  // Add brake service
  if (priceMatrix.brakeServiceFront) {
    services.set('BRAKE_SERVICE', priceMatrix.brakeServiceFront.toNumber());
  }

  // Add TÜV
  if (priceMatrix.tuv) {
    services.set('TUV', priceMatrix.tuv.toNumber());
  }

  // Add climate service
  if (priceMatrix.climateService) {
    services.set('CLIMATE_SERVICE', priceMatrix.climateService.toNumber());
  }

  return services;
}

/**
 * Check if pricing is available for a vehicle
 *
 * @param brand Vehicle brand
 * @param model Vehicle model
 * @param year Vehicle year
 * @returns True if pricing exists
 */
export async function isPricingAvailable(
  brand: string,
  model: string,
  year: number
): Promise<boolean> {
  const count = await prisma.priceMatrix.count({
    where: {
      brand: brand,
      model: model,
      yearFrom: { lte: year },
      yearTo: { gte: year },
    },
  });

  return count > 0;
}

/**
 * Get recommended inspection mileage tier for a vehicle
 *
 * @param mileage Current mileage
 * @returns Recommended inspection tier description
 */
export function getInspectionTier(mileage: number): string {
  if (mileage < 45000) {
    return '30.000 km Inspektion';
  } else if (mileage < 75000) {
    return '60.000 km Inspektion';
  } else if (mileage < 105000) {
    return '90.000 km Inspektion';
  } else {
    return '120.000 km Inspektion';
  }
}

/**
 * Example usage:
 *
 * const result = await calculateServicePrice({
 *   brand: 'VW',
 *   model: 'Golf 7',
 *   year: 2016,
 *   mileage: 75000,
 *   serviceType: 'INSPECTION'
 * });
 *
 * if (result.price) {
 *   console.log(`Price: ${result.price} EUR`);
 * } else {
 *   console.error(result.error);
 * }
 */
