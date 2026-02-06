import { PrismaClient, Booking, BookingStatus, ServiceType, User, Vehicle } from '@prisma/client';

export interface CreateBookingParams {
  customerId: string;
  vehicleId: string;
  serviceType: ServiceType;
  mileageAtBooking: number;
  totalPrice: number;
  priceBreakdown?: any;
  pickupDate: Date;
  pickupTimeSlot: string;
  pickupAddress: string;
  pickupCity: string;
  pickupPostalCode: string;
  deliveryDate?: Date;
  deliveryTimeSlot?: string;
  customerNotes?: string;
}

export interface UpdateBookingParams {
  status?: BookingStatus;
  jockeyId?: string;
  deliveryDate?: Date;
  deliveryTimeSlot?: string;
  paymentIntentId?: string;
  paidAt?: Date;
  internalNotes?: string;
  customerNotes?: string;
}

export interface BookingFilters {
  customerId?: string;
  status?: BookingStatus;
  fromDate?: Date;
  toDate?: Date;
}

export type BookingWithRelations = Booking & {
  customer: User;
  vehicle: Vehicle;
  jockey?: User | null;
};

export class BookingsRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Generate unique booking number
   */
  private async generateBookingNumber(): Promise<string> {
    const prefix = 'BK';
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const datePrefix = `${prefix}${year}${month}`;

    // Find the highest existing booking number for this month
    const lastBooking = await this.prisma.booking.findFirst({
      where: {
        bookingNumber: { startsWith: datePrefix }
      },
      orderBy: { bookingNumber: 'desc' },
      select: { bookingNumber: true }
    });

    let sequence = 1;
    if (lastBooking) {
      const lastSeq = parseInt(lastBooking.bookingNumber.slice(datePrefix.length), 10);
      if (!isNaN(lastSeq)) {
        sequence = lastSeq + 1;
      }
    }

    return `${datePrefix}${sequence.toString().padStart(4, '0')}`;
  }

  /**
   * Create new booking
   */
  async create(params: CreateBookingParams): Promise<BookingWithRelations> {
    const bookingNumber = await this.generateBookingNumber();

    const booking = await this.prisma.booking.create({
      data: {
        ...params,
        bookingNumber,
        priceBreakdown: params.priceBreakdown || {}
      },
      include: {
        customer: true,
        vehicle: true,
        jockey: true
      }
    });

    return booking;
  }

  /**
   * Find booking by ID
   */
  async findById(id: string): Promise<BookingWithRelations | null> {
    return await this.prisma.booking.findUnique({
      where: { id },
      include: {
        customer: true,
        vehicle: true,
        jockey: true
      }
    });
  }

  /**
   * Find booking by booking number
   */
  async findByBookingNumber(bookingNumber: string): Promise<BookingWithRelations | null> {
    return await this.prisma.booking.findUnique({
      where: { bookingNumber },
      include: {
        customer: true,
        vehicle: true,
        jockey: true
      }
    });
  }

  /**
   * Find booking by payment intent ID
   */
  async findByPaymentIntentId(paymentIntentId: string): Promise<BookingWithRelations | null> {
    return await this.prisma.booking.findFirst({
      where: { paymentIntentId },
      include: {
        customer: true,
        vehicle: true,
        jockey: true
      }
    });
  }

  /**
   * Find all bookings with optional filters
   */
  async findAll(filters: BookingFilters = {}, page = 1, limit = 20): Promise<{
    bookings: BookingWithRelations[];
    total: number;
  }> {
    const where: any = {};

    if (filters.customerId) {
      where.customerId = filters.customerId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.fromDate || filters.toDate) {
      where.pickupDate = {};
      if (filters.fromDate) {
        where.pickupDate.gte = filters.fromDate;
      }
      if (filters.toDate) {
        where.pickupDate.lte = filters.toDate;
      }
    }

    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        include: {
          customer: true,
          vehicle: true,
          jockey: true
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      this.prisma.booking.count({ where })
    ]);

    return { bookings, total };
  }

  /**
   * Update booking
   */
  async update(id: string, params: UpdateBookingParams): Promise<BookingWithRelations> {
    return await this.prisma.booking.update({
      where: { id },
      data: params,
      include: {
        customer: true,
        vehicle: true,
        jockey: true
      }
    });
  }

  /**
   * Cancel booking (soft delete)
   */
  async cancel(id: string): Promise<BookingWithRelations> {
    return await this.update(id, { status: BookingStatus.CANCELLED });
  }

  /**
   * Check if booking belongs to customer
   */
  async belongsToCustomer(bookingId: string, customerId: string): Promise<boolean> {
    const booking = await this.prisma.booking.findFirst({
      where: {
        id: bookingId,
        customerId
      }
    });
    return booking !== null;
  }

  /**
   * Get customer's bookings
   */
  async findByCustomerId(customerId: string, page = 1, limit = 20): Promise<{
    bookings: BookingWithRelations[];
    total: number;
  }> {
    return await this.findAll({ customerId }, page, limit);
  }

  /**
   * Get bookings by status
   */
  async findByStatus(status: BookingStatus, page = 1, limit = 20): Promise<{
    bookings: BookingWithRelations[];
    total: number;
  }> {
    return await this.findAll({ status }, page, limit);
  }

  /**
   * Check if time slot is available for booking
   */
  async isTimeSlotAvailable(pickupDate: Date, timeSlot: string, excludeBookingId?: string): Promise<boolean> {
    const where: any = {
      pickupDate,
      pickupTimeSlot: timeSlot,
      status: {
        not: BookingStatus.CANCELLED
      }
    };

    if (excludeBookingId) {
      where.id = { not: excludeBookingId };
    }

    const count = await this.prisma.booking.count({ where });

    // For now, we'll allow up to 10 bookings per time slot
    // This should be configurable based on workshop capacity
    return count < 10;
  }
}
