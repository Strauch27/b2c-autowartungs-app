import { Request, Response, NextFunction } from 'express';
import { PricingService } from '../services/pricing.service';
import { PriceMatrixRepository } from '../repositories/price-matrix.repository';
import { prisma } from '../config/database';
import { ApiError } from '../middleware/errorHandler';
import { ServiceType } from '@prisma/client';
import { z } from 'zod';

// Initialize service
const priceMatrixRepository = new PriceMatrixRepository(prisma);
const pricingService = new PricingService(priceMatrixRepository);

// Service descriptions
const SERVICE_DESCRIPTIONS: Record<ServiceType, string> = {
  INSPECTION: 'Complete vehicle inspection and maintenance service based on manufacturer specifications',
  OIL_SERVICE: 'Oil and filter change service',
  BRAKE_SERVICE: 'Brake inspection and service (front and rear)',
  TUV: 'Official German TÜV/HU vehicle inspection',
  CLIMATE_SERVICE: 'Air conditioning system maintenance and service',
  CUSTOM: 'Custom service tailored to your specific needs'
};

// Validation schema for price calculation
const priceCalculationSchema = z.object({
  brand: z.string().min(1, 'Brand is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.number().int().min(1994).max(new Date().getFullYear() + 1),
  mileage: z.number().int().min(0).max(1000000)
});

/**
 * Get all available service types
 * GET /api/services
 */
export async function listServices(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const services = Object.values(ServiceType).map(type => ({
      type,
      name: formatServiceName(type),
      description: SERVICE_DESCRIPTIONS[type]
    }));

    res.status(200).json({
      success: true,
      data: services
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get price for a specific service type
 * GET /api/services/:type/price
 * Query params: brand, model, year, mileage
 */
export async function getServicePrice(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { type } = req.params;

    // Validate service type
    if (!Object.values(ServiceType).includes(type as ServiceType)) {
      throw new ApiError(400, 'Invalid service type');
    }

    // Parse and validate query parameters
    const brand = req.query.brand as string;
    const model = req.query.model as string;
    const year = parseInt(req.query.year as string);
    const mileage = parseInt(req.query.mileage as string);

    if (!brand || !model || isNaN(year) || isNaN(mileage)) {
      throw new ApiError(400, 'Missing required parameters: brand, model, year, mileage');
    }

    // Validate parameters
    const validatedData = priceCalculationSchema.parse({ brand, model, year, mileage });

    // Map ServiceType to pricing service type
    const pricingServiceType = mapServiceTypeToPricingType(type as ServiceType);

    // Calculate price
    const priceCalculation = await pricingService.calculatePrice({
      brand: validatedData.brand,
      model: validatedData.model,
      year: validatedData.year,
      mileage: validatedData.mileage,
      serviceType: pricingServiceType as any
    });

    res.status(200).json({
      success: true,
      data: {
        serviceType: type,
        serviceName: formatServiceName(type as ServiceType),
        price: priceCalculation.finalPrice,
        breakdown: {
          basePrice: priceCalculation.basePrice,
          ageMultiplier: priceCalculation.ageMultiplier,
          mileageInterval: priceCalculation.mileageInterval,
          priceSource: priceCalculation.priceSource
        },
        vehicle: {
          brand: validatedData.brand,
          model: validatedData.model,
          year: validatedData.year,
          mileage: validatedData.mileage
        }
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new ApiError(400, error.errors[0].message));
    } else {
      next(error);
    }
  }
}

/**
 * Get available brands
 * GET /api/services/brands
 */
export async function getBrands(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const brands = await pricingService.getAvailableBrands();

    res.status(200).json({
      success: true,
      data: brands
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get available models for a brand
 * GET /api/services/brands/:brand/models
 */
export async function getModels(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const brand = req.params.brand as string;

    if (!brand) {
      throw new ApiError(400, 'Brand is required');
    }

    const models = await pricingService.getAvailableModels(brand);

    res.status(200).json({
      success: true,
      data: models
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Map ServiceType enum to pricing service type
 */
function mapServiceTypeToPricingType(serviceType: ServiceType): string {
  const mapping: Record<ServiceType, string> = {
    INSPECTION: 'inspection',
    OIL_SERVICE: 'oilService',
    BRAKE_SERVICE: 'brakeServiceFront',
    TUV: 'tuv',
    CLIMATE_SERVICE: 'climateService',
    CUSTOM: 'inspection' // Fallback to inspection for custom
  };
  return mapping[serviceType];
}

/**
 * Format service type name for display
 */
function formatServiceName(type: ServiceType): string {
  const names: Record<ServiceType, string> = {
    INSPECTION: 'Inspection & Maintenance',
    OIL_SERVICE: 'Oil Service',
    BRAKE_SERVICE: 'Brake Service',
    TUV: 'TÜV/HU Inspection',
    CLIMATE_SERVICE: 'Climate Service',
    CUSTOM: 'Custom Service'
  };
  return names[type];
}
