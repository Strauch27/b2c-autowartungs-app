import { PrismaClient, Vehicle } from '@prisma/client';

export interface CreateVehicleParams {
  customerId: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  licensePlate?: string;
  vin?: string;
}

export interface UpdateVehicleParams {
  brand?: string;
  model?: string;
  year?: number;
  mileage?: number;
  licensePlate?: string;
  vin?: string;
}

export class VehiclesRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Find vehicle by ID
   */
  async findById(id: string): Promise<Vehicle | null> {
    return await this.prisma.vehicle.findUnique({
      where: { id }
    });
  }

  /**
   * Find all vehicles for a customer
   */
  async findByCustomerId(customerId: string): Promise<Vehicle[]> {
    return await this.prisma.vehicle.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Create new vehicle
   */
  async create(params: CreateVehicleParams): Promise<Vehicle> {
    return await this.prisma.vehicle.create({
      data: params
    });
  }

  /**
   * Update vehicle
   */
  async update(id: string, params: UpdateVehicleParams): Promise<Vehicle> {
    return await this.prisma.vehicle.update({
      where: { id },
      data: params
    });
  }

  /**
   * Delete vehicle
   */
  async delete(id: string): Promise<Vehicle> {
    return await this.prisma.vehicle.delete({
      where: { id }
    });
  }

  /**
   * Check if vehicle belongs to customer
   */
  async belongsToCustomer(vehicleId: string, customerId: string): Promise<boolean> {
    const vehicle = await this.prisma.vehicle.findFirst({
      where: {
        id: vehicleId,
        customerId
      }
    });
    return vehicle !== null;
  }

  /**
   * Get vehicle with bookings
   */
  async findByIdWithBookings(id: string): Promise<Vehicle | null> {
    return await this.prisma.vehicle.findUnique({
      where: { id },
      include: {
        bookings: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });
  }

  /**
   * Find existing vehicle by brand, model, year, and customer
   */
  async findExisting(
    customerId: string,
    brand: string,
    model: string,
    year: number
  ): Promise<Vehicle | null> {
    return await this.prisma.vehicle.findFirst({
      where: {
        customerId,
        brand: {
          equals: brand,
          mode: 'insensitive'
        },
        model: {
          equals: model,
          mode: 'insensitive'
        },
        year
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Find or create vehicle
   * If a matching vehicle exists, update its mileage
   * If not, create a new vehicle
   */
  async findOrCreate(params: CreateVehicleParams): Promise<Vehicle> {
    const existing = await this.findExisting(
      params.customerId,
      params.brand,
      params.model,
      params.year
    );

    if (existing) {
      // Update mileage if the new value is higher
      if (params.mileage > existing.mileage) {
        return await this.update(existing.id, { mileage: params.mileage });
      }
      return existing;
    }

    return await this.create(params);
  }
}
