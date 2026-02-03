import { Vehicle } from '@prisma/client';
import { VehiclesRepository, CreateVehicleParams, UpdateVehicleParams } from '../repositories/vehicles.repository';
import { PriceMatrixRepository } from '../repositories/price-matrix.repository';
import { ApiError } from '../middleware/errorHandler';
import { logger } from '../config/logger';

export interface VehicleValidationResult {
  isValid: boolean;
  existsInPriceMatrix: boolean;
  warnings: string[];
}

export class VehiclesService {
  private vehiclesRepository: VehiclesRepository;
  private priceMatrixRepository: PriceMatrixRepository;

  constructor(
    vehiclesRepository: VehiclesRepository,
    priceMatrixRepository: PriceMatrixRepository
  ) {
    this.vehiclesRepository = vehiclesRepository;
    this.priceMatrixRepository = priceMatrixRepository;
  }

  /**
   * Get all vehicles for a customer
   */
  async getCustomerVehicles(customerId: string): Promise<Vehicle[]> {
    return await this.vehiclesRepository.findByCustomerId(customerId);
  }

  /**
   * Get vehicle by ID
   */
  async getVehicleById(vehicleId: string, customerId: string): Promise<Vehicle> {
    const vehicle = await this.vehiclesRepository.findById(vehicleId);

    if (!vehicle) {
      throw new ApiError(404, 'Vehicle not found');
    }

    // Verify ownership
    if (vehicle.customerId !== customerId) {
      throw new ApiError(403, 'You do not have permission to access this vehicle');
    }

    return vehicle;
  }

  /**
   * Get vehicle details with bookings
   */
  async getVehicleWithBookings(vehicleId: string, customerId: string): Promise<Vehicle> {
    const vehicle = await this.vehiclesRepository.findByIdWithBookings(vehicleId);

    if (!vehicle) {
      throw new ApiError(404, 'Vehicle not found');
    }

    // Verify ownership
    if (vehicle.customerId !== customerId) {
      throw new ApiError(403, 'You do not have permission to access this vehicle');
    }

    return vehicle;
  }

  /**
   * Validate vehicle data
   */
  private validateVehicleData(params: CreateVehicleParams | UpdateVehicleParams): void {
    if ('brand' in params && params.brand) {
      if (params.brand.trim().length === 0) {
        throw new ApiError(400, 'Brand is required and cannot be empty');
      }
    }

    if ('model' in params && params.model) {
      if (params.model.trim().length === 0) {
        throw new ApiError(400, 'Model is required and cannot be empty');
      }
    }

    if ('year' in params && params.year !== undefined) {
      const currentYear = new Date().getFullYear();
      if (params.year < 1994 || params.year > currentYear + 1) {
        throw new ApiError(400, `Year must be between 1994 and ${currentYear + 1}`);
      }
    }

    if ('mileage' in params && params.mileage !== undefined) {
      if (params.mileage < 0 || params.mileage > 1000000) {
        throw new ApiError(400, 'Mileage must be between 0 and 1,000,000 km');
      }
    }
  }

  /**
   * Check if vehicle exists in price matrix
   */
  async checkVehicleInPriceMatrix(
    brand: string,
    model: string,
    year: number
  ): Promise<VehicleValidationResult> {
    const warnings: string[] = [];

    // Check if vehicle exists in price matrix
    const priceEntry = await this.priceMatrixRepository.findByBrandModelYear({
      brand,
      model,
      year
    });

    const existsInPriceMatrix = priceEntry !== null;

    if (!existsInPriceMatrix) {
      warnings.push(
        `Vehicle ${brand} ${model} (${year}) not found in price matrix. Fallback pricing will be used.`
      );
      logger.warn({
        message: 'Vehicle not in price matrix',
        brand,
        model,
        year
      });
    }

    return {
      isValid: true,
      existsInPriceMatrix,
      warnings
    };
  }

  /**
   * Create new vehicle
   */
  async createVehicle(params: CreateVehicleParams): Promise<{
    vehicle: Vehicle;
    validation: VehicleValidationResult;
  }> {
    // Validate input
    this.validateVehicleData(params);

    // Check if vehicle exists in price matrix
    const validation = await this.checkVehicleInPriceMatrix(
      params.brand,
      params.model,
      params.year
    );

    // Create vehicle
    const vehicle = await this.vehiclesRepository.create(params);

    logger.info({
      message: 'Vehicle created',
      vehicleId: vehicle.id,
      customerId: params.customerId,
      brand: params.brand,
      model: params.model
    });

    return {
      vehicle,
      validation
    };
  }

  /**
   * Update vehicle
   */
  async updateVehicle(
    vehicleId: string,
    customerId: string,
    params: UpdateVehicleParams
  ): Promise<{
    vehicle: Vehicle;
    validation?: VehicleValidationResult;
  }> {
    // Check if vehicle exists and belongs to customer
    const existingVehicle = await this.getVehicleById(vehicleId, customerId);

    // Validate input
    this.validateVehicleData(params);

    // If brand, model, or year changed, check price matrix
    let validation: VehicleValidationResult | undefined;
    const brand = params.brand || existingVehicle.brand;
    const model = params.model || existingVehicle.model;
    const year = params.year || existingVehicle.year;

    if (params.brand || params.model || params.year) {
      validation = await this.checkVehicleInPriceMatrix(brand, model, year);
    }

    // Update vehicle
    const vehicle = await this.vehiclesRepository.update(vehicleId, params);

    logger.info({
      message: 'Vehicle updated',
      vehicleId,
      customerId
    });

    return {
      vehicle,
      validation
    };
  }

  /**
   * Delete vehicle
   */
  async deleteVehicle(vehicleId: string, customerId: string): Promise<void> {
    // Check if vehicle exists and belongs to customer
    await this.getVehicleById(vehicleId, customerId);

    // Check if vehicle has active bookings
    const vehicleWithBookings = await this.vehiclesRepository.findByIdWithBookings(vehicleId);

    if (vehicleWithBookings?.bookings && vehicleWithBookings.bookings.length > 0) {
      const activeBookings = vehicleWithBookings.bookings.filter(
        booking => booking.status !== 'CANCELLED' && booking.status !== 'DELIVERED'
      );

      if (activeBookings.length > 0) {
        throw new ApiError(
          400,
          'Cannot delete vehicle with active bookings. Please cancel all bookings first.'
        );
      }
    }

    // Delete vehicle
    await this.vehiclesRepository.delete(vehicleId);

    logger.info({
      message: 'Vehicle deleted',
      vehicleId,
      customerId
    });
  }

  /**
   * Find or create vehicle
   * Used during booking creation to automatically handle vehicle registration
   */
  async findOrCreateVehicle(
    customerId: string,
    vehicleData: {
      brand: string;
      model: string;
      year: number;
      mileage: number;
      saveVehicle?: boolean;
    }
  ): Promise<{
    vehicle: Vehicle;
    isNew: boolean;
    validation: VehicleValidationResult;
  }> {
    // Validate input
    this.validateVehicleData(vehicleData);

    // Check if vehicle exists in price matrix
    const validation = await this.checkVehicleInPriceMatrix(
      vehicleData.brand,
      vehicleData.model,
      vehicleData.year
    );

    // Find or create vehicle
    const existing = await this.vehiclesRepository.findExisting(
      customerId,
      vehicleData.brand,
      vehicleData.model,
      vehicleData.year
    );

    let vehicle: Vehicle;
    let isNew = false;

    if (existing) {
      // Update mileage if the new value is higher
      if (vehicleData.mileage > existing.mileage) {
        vehicle = await this.vehiclesRepository.update(existing.id, {
          mileage: vehicleData.mileage
        });
        logger.info({
          message: 'Vehicle mileage updated',
          vehicleId: vehicle.id,
          oldMileage: existing.mileage,
          newMileage: vehicleData.mileage
        });
      } else {
        vehicle = existing;
      }
    } else {
      // Create new vehicle
      vehicle = await this.vehiclesRepository.create({
        customerId,
        brand: vehicleData.brand,
        model: vehicleData.model,
        year: vehicleData.year,
        mileage: vehicleData.mileage
      });
      isNew = true;

      logger.info({
        message: 'New vehicle created during booking',
        vehicleId: vehicle.id,
        customerId,
        brand: vehicleData.brand,
        model: vehicleData.model
      });
    }

    return {
      vehicle,
      isNew,
      validation
    };
  }
}
