/**
 * Pricing Controller Example
 *
 * This file demonstrates how to integrate the PricingService
 * into an Express.js controller for API endpoints.
 *
 * IMPORTANT: This is an EXAMPLE file. You'll need to integrate
 * this into your actual controller structure.
 */

import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { PricingService } from '../services/pricing.service';
import { PriceMatrixRepository } from '../repositories/price-matrix.repository';
import {
  PriceCalculationInput,
  ServiceType,
  PriceCalculationError,
  PriceErrorCode,
} from '../types/pricing.types';

// Initialize dependencies
const prisma = new PrismaClient();
const priceMatrixRepository = new PriceMatrixRepository(prisma);
const pricingService = new PricingService(priceMatrixRepository);

/**
 * POST /api/pricing/calculate
 *
 * Calculate price for a service based on vehicle data
 *
 * Request body:
 * {
 *   "brand": "VW",
 *   "model": "Golf",
 *   "year": 2015,
 *   "mileage": 60000,
 *   "serviceType": "inspection"
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "basePrice": 219,
 *     "ageMultiplier": 1.1,
 *     "finalPrice": 241,
 *     "priceSource": "exact",
 *     "mileageInterval": "60k"
 *   }
 * }
 */
export async function calculatePrice(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { brand, model, year, mileage, serviceType } = req.body;

    // Validate required fields
    if (!brand || !model || !year || !mileage || !serviceType) {
      res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'All fields are required: brand, model, year, mileage, serviceType',
        },
      });
      return;
    }

    // Prepare input
    const input: PriceCalculationInput = {
      brand: brand.trim(),
      model: model.trim(),
      year: parseInt(year, 10),
      mileage: parseInt(mileage, 10),
      serviceType: serviceType as ServiceType,
    };

    // Validate input
    try {
      pricingService.validateInput(input);
    } catch (validationError: any) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: validationError.message,
        },
      });
      return;
    }

    // Calculate price
    const result = await pricingService.calculatePrice(input);

    // Return result
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Error calculating price:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to calculate price',
      },
    });
  }
}

/**
 * GET /api/pricing/brands
 *
 * Get list of all available brands
 *
 * Response:
 * {
 *   "success": true,
 *   "data": ["VW", "Mercedes", "BMW", "Audi"]
 * }
 */
export async function getAvailableBrands(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const brands = await pricingService.getAvailableBrands();

    res.status(200).json({
      success: true,
      data: brands,
    });
  } catch (error: any) {
    console.error('Error fetching brands:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch available brands',
      },
    });
  }
}

/**
 * GET /api/pricing/models/:brand
 *
 * Get list of available models for a specific brand
 *
 * Response:
 * {
 *   "success": true,
 *   "data": ["Golf", "Passat", "Polo"]
 * }
 */
export async function getAvailableModels(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { brand } = req.params;

    if (!brand) {
      res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_BRAND',
          message: 'Brand parameter is required',
        },
      });
      return;
    }

    const models = await pricingService.getAvailableModels(brand.trim());

    res.status(200).json({
      success: true,
      data: models,
    });
  } catch (error: any) {
    console.error('Error fetching models:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch available models',
      },
    });
  }
}

/**
 * POST /api/pricing/batch-calculate
 *
 * Calculate prices for multiple service types at once
 * Useful for displaying all available services with prices
 *
 * Request body:
 * {
 *   "brand": "VW",
 *   "model": "Golf",
 *   "year": 2015,
 *   "mileage": 60000,
 *   "serviceTypes": ["inspection", "oilService", "brakeServiceFront"]
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "inspection": { "finalPrice": 241, ... },
 *     "oilService": { "finalPrice": 175, ... },
 *     "brakeServiceFront": { "finalPrice": 384, ... }
 *   }
 * }
 */
export async function batchCalculatePrices(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { brand, model, year, mileage, serviceTypes } = req.body;

    // Validate required fields
    if (!brand || !model || !year || !mileage || !serviceTypes || !Array.isArray(serviceTypes)) {
      res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'All fields are required: brand, model, year, mileage, serviceTypes (array)',
        },
      });
      return;
    }

    const results: Record<string, any> = {};

    // Calculate price for each service type
    for (const serviceType of serviceTypes) {
      const input: PriceCalculationInput = {
        brand: brand.trim(),
        model: model.trim(),
        year: parseInt(year, 10),
        mileage: parseInt(mileage, 10),
        serviceType: serviceType as ServiceType,
      };

      try {
        pricingService.validateInput(input);
        const result = await pricingService.calculatePrice(input);
        results[serviceType] = result;
      } catch (error: any) {
        results[serviceType] = {
          error: error.message,
        };
      }
    }

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error: any) {
    console.error('Error batch calculating prices:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to batch calculate prices',
      },
    });
  }
}

/**
 * Example: Express.js route registration
 *
 * import express from 'express';
 * import * as pricingController from './controllers/pricing.controller';
 *
 * const router = express.Router();
 *
 * router.post('/pricing/calculate', pricingController.calculatePrice);
 * router.get('/pricing/brands', pricingController.getAvailableBrands);
 * router.get('/pricing/models/:brand', pricingController.getAvailableModels);
 * router.post('/pricing/batch-calculate', pricingController.batchCalculatePrices);
 *
 * export default router;
 */

/**
 * Example: Usage in booking creation flow
 *
 * When a customer creates a booking, you would:
 *
 * 1. Get vehicle data from request
 * 2. Calculate price using PricingService
 * 3. Store calculated price in Booking record
 * 4. Create Stripe payment intent with the price
 * 5. Return booking confirmation to customer
 */
export async function createBookingWithPricing(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { customerId, vehicleData, serviceType, pickupSlot, pickupAddress } = req.body;

    // Step 1: Calculate price
    const priceResult = await pricingService.calculatePrice({
      brand: vehicleData.brand,
      model: vehicleData.model,
      year: vehicleData.year,
      mileage: vehicleData.mileage,
      serviceType: serviceType,
    });

    // Step 2: Create booking with calculated price
    const booking = await prisma.booking.create({
      data: {
        customerId,
        serviceType,
        price: priceResult.finalPrice,
        mileageAtBooking: vehicleData.mileage,
        pickupSlotStart: pickupSlot.start,
        pickupSlotEnd: pickupSlot.end,
        pickupAddress: pickupAddress,
        status: 'PENDING',
        // ... other fields
      },
    });

    // Step 3: Create Stripe payment intent
    // (See Stripe integration documentation)

    res.status(201).json({
      success: true,
      data: {
        booking,
        price: priceResult,
      },
    });
  } catch (error: any) {
    console.error('Error creating booking:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create booking',
      },
    });
  }
}

/**
 * Cleanup on application shutdown
 */
export async function cleanup(): Promise<void> {
  await prisma.$disconnect();
}
