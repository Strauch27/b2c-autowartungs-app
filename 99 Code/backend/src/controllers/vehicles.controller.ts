import { Request, Response, NextFunction } from 'express';
import { VehiclesService } from '../services/vehicles.service';
import { VehiclesRepository } from '../repositories/vehicles.repository';
import { PriceMatrixRepository } from '../repositories/price-matrix.repository';
import { prisma } from '../config/database';
import { ApiError } from '../middleware/errorHandler';
import { z } from 'zod';

// Validation schemas
const createVehicleSchema = z.object({
  brand: z.string().min(1, 'Brand is required').trim(),
  model: z.string().min(1, 'Model is required').trim(),
  year: z.number().int().min(1994).max(new Date().getFullYear() + 1),
  mileage: z.number().int().min(0).max(1000000),
  licensePlate: z.string().optional(),
  vin: z.string().optional()
});

const updateVehicleSchema = z.object({
  brand: z.string().min(1).trim().optional(),
  model: z.string().min(1).trim().optional(),
  year: z.number().int().min(1994).max(new Date().getFullYear() + 1).optional(),
  mileage: z.number().int().min(0).max(1000000).optional(),
  licensePlate: z.string().optional(),
  vin: z.string().optional()
});

// Initialize service
const vehiclesRepository = new VehiclesRepository(prisma);
const priceMatrixRepository = new PriceMatrixRepository(prisma);
const vehiclesService = new VehiclesService(vehiclesRepository, priceMatrixRepository);

/**
 * Get all vehicles for authenticated customer
 * GET /api/vehicles
 */
export async function listVehicles(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Authentication required');
    }

    const vehicles = await vehiclesService.getCustomerVehicles(req.user.userId);

    res.status(200).json({
      success: true,
      data: vehicles
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get single vehicle by ID
 * GET /api/vehicles/:id
 */
export async function getVehicle(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Authentication required');
    }

    const { id } = req.params;
    const includeBookings = req.query.includeBookings === 'true';

    let vehicle;
    if (includeBookings) {
      vehicle = await vehiclesService.getVehicleWithBookings(id, req.user.userId);
    } else {
      vehicle = await vehiclesService.getVehicleById(id, req.user.userId);
    }

    res.status(200).json({
      success: true,
      data: vehicle
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Create new vehicle
 * POST /api/vehicles
 */
export async function createVehicle(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Authentication required');
    }

    // Validate request body
    const validatedData = createVehicleSchema.parse(req.body);

    // Create vehicle
    const result = await vehiclesService.createVehicle({
      ...validatedData,
      customerId: req.user.userId
    });

    res.status(201).json({
      success: true,
      data: result.vehicle,
      warnings: result.validation.warnings
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
 * Update vehicle
 * PATCH /api/vehicles/:id
 */
export async function updateVehicle(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Authentication required');
    }

    const { id } = req.params;

    // Validate request body
    const validatedData = updateVehicleSchema.parse(req.body);

    // Ensure at least one field is being updated
    if (Object.keys(validatedData).length === 0) {
      throw new ApiError(400, 'At least one field must be provided for update');
    }

    // Update vehicle
    const result = await vehiclesService.updateVehicle(id, req.user.userId, validatedData);

    res.status(200).json({
      success: true,
      data: result.vehicle,
      warnings: result.validation?.warnings
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
 * Delete vehicle
 * DELETE /api/vehicles/:id
 */
export async function deleteVehicle(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Authentication required');
    }

    const { id } = req.params;

    await vehiclesService.deleteVehicle(id, req.user.userId);

    res.status(200).json({
      success: true,
      message: 'Vehicle deleted successfully'
    });
  } catch (error) {
    next(error);
  }
}
