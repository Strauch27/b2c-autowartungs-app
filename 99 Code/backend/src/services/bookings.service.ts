import { Booking, BookingStatus, ServiceType, ExtensionStatus } from '@prisma/client';
import {
  BookingsRepository,
  CreateBookingParams,
  UpdateBookingParams,
  BookingWithRelations,
  BookingFilters
} from '../repositories/bookings.repository';
import { VehiclesRepository } from '../repositories/vehicles.repository';
import { VehiclesService } from './vehicles.service';
import { PricingService, PriceCalculationInput } from './pricing.service';
import { paymentService } from './payment.service';
import { demoPaymentService } from './demo-payment.service';
import { sendNotification } from './notification.service';
import { NotificationType } from '@prisma/client';
import { ApiError } from '../middleware/errorHandler';
import { logger } from '../config/logger';
import { prisma } from '../config/database';
import { CreateBookingDto, BookingService as BookingServiceType } from '../types/booking.types';
import { assertTransition, Actor, getNextPossibleStates, isCancellable } from '../domain/bookingFsm';

export interface CreateBookingInput {
  customerId: string;
  vehicleId: string;
  serviceType: ServiceType;
  pickupDate: string;
  pickupTimeSlot: string;
  pickupAddress: string;
  pickupCity: string;
  pickupPostalCode: string;
  customerNotes?: string;
}

export interface BookingListResult {
  bookings: BookingWithRelations[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class BookingsService {
  private bookingsRepository: BookingsRepository;
  private vehiclesRepository: VehiclesRepository;
  private vehiclesService?: VehiclesService;
  private pricingService: PricingService;

  constructor(
    bookingsRepository: BookingsRepository,
    vehiclesRepository: VehiclesRepository,
    pricingService: PricingService,
    vehiclesService?: VehiclesService
  ) {
    this.bookingsRepository = bookingsRepository;
    this.vehiclesRepository = vehiclesRepository;
    this.pricingService = pricingService;
    this.vehiclesService = vehiclesService;
  }

  /**
   * Service mapping configuration
   * Maps frontend service IDs to ServiceType enum
   */
  private readonly SERVICE_MAPPING: Record<string, { type: ServiceType; fallbackPrice: number; pricingKey: string }> = {
    'inspection': {
      type: ServiceType.INSPECTION,
      fallbackPrice: 149,
      pricingKey: 'inspection'
    },
    'oil': {
      type: ServiceType.OIL_SERVICE,
      fallbackPrice: 89,
      pricingKey: 'oilService'
    },
    'brakes': {
      type: ServiceType.BRAKE_SERVICE,
      fallbackPrice: 199,
      pricingKey: 'brakeServiceFront'
    },
    'ac': {
      type: ServiceType.CLIMATE_SERVICE,
      fallbackPrice: 119,
      pricingKey: 'climateService'
    },
    'tuv': {
      type: ServiceType.TUV,
      fallbackPrice: 89,
      pricingKey: 'tuv'
    }
  };

  /**
   * Map ServiceType enum to pricing service type
   */
  private mapServiceTypeToPricingType(serviceType: ServiceType): string {
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
   * Calculate price for a booking
   */
  private async calculateBookingPrice(
    vehicleId: string,
    serviceType: ServiceType
  ): Promise<{
    totalPrice: number;
    priceBreakdown: any;
  }> {
    // Get vehicle details
    const vehicle = await this.vehiclesRepository.findById(vehicleId);
    if (!vehicle) {
      throw new ApiError(404, 'Vehicle not found');
    }

    // Map service type
    const pricingServiceType = this.mapServiceTypeToPricingType(serviceType);

    // Calculate price using pricing service
    const priceCalculation = await this.pricingService.calculatePrice({
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      mileage: vehicle.mileage,
      serviceType: pricingServiceType as any
    });

    return {
      totalPrice: priceCalculation.finalPrice,
      priceBreakdown: {
        basePrice: priceCalculation.basePrice,
        ageMultiplier: priceCalculation.ageMultiplier,
        finalPrice: priceCalculation.finalPrice,
        priceSource: priceCalculation.priceSource,
        mileageInterval: priceCalculation.mileageInterval,
        vehicle: {
          brand: vehicle.brand,
          model: vehicle.model,
          year: vehicle.year,
          mileage: vehicle.mileage
        },
        serviceType: serviceType
      }
    };
  }

  /**
   * Validate booking date and time
   */
  private validateBookingDateTime(pickupDate: string, pickupTimeSlot: string): Date {
    const date = new Date(pickupDate);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      throw new ApiError(400, 'Invalid pickup date format');
    }

    // Check if date is in the future
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (date < today) {
      throw new ApiError(400, 'Pickup date must be in the future');
    }

    // Validate time slot format (e.g., "08:00" or "08:00-10:00")
    const timeSlotRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](-([0-1]?[0-9]|2[0-3]):[0-5][0-9])?$/;
    if (!timeSlotRegex.test(pickupTimeSlot)) {
      throw new ApiError(400, 'Invalid time slot format. Expected format: HH:MM');
    }

    return date;
  }

  /**
   * Create booking from frontend DTO (new multi-service flow)
   */
  async createBookingFromDto(
    customerId: string,
    dto: CreateBookingDto
  ): Promise<BookingWithRelations> {
    // 1. Find or create vehicle
    if (!this.vehiclesService) {
      throw new ApiError(500, 'Vehicles service not initialized');
    }

    const { vehicle, isNew, validation } = await this.vehiclesService.findOrCreateVehicle(
      customerId,
      dto.vehicle
    );

    logger.info({
      message: isNew ? 'New vehicle created for booking' : 'Using existing vehicle for booking',
      vehicleId: vehicle.id,
      customerId,
      warnings: validation.warnings
    });

    // 2. Map and calculate prices for selected services
    const services: BookingServiceType[] = [];
    let totalPrice = 0;

    for (const serviceId of dto.services) {
      const serviceConfig = this.SERVICE_MAPPING[serviceId];
      if (!serviceConfig) {
        throw new ApiError(400, `Invalid service ID: ${serviceId}`);
      }

      try {
        // Calculate price using pricing service
        const priceCalculation = await this.pricingService.calculatePrice({
          brand: vehicle.brand,
          model: vehicle.model,
          year: vehicle.year,
          mileage: vehicle.mileage,
          serviceType: serviceConfig.pricingKey as any
        });

        services.push({
          type: serviceConfig.type,
          price: priceCalculation.finalPrice
        });

        totalPrice += priceCalculation.finalPrice;
      } catch (error) {
        // Fallback to base price if pricing calculation fails
        logger.warn({
          message: 'Using fallback price for service',
          serviceId,
          error: error instanceof Error ? error.message : 'Unknown error'
        });

        services.push({
          type: serviceConfig.type,
          price: serviceConfig.fallbackPrice
        });

        totalPrice += serviceConfig.fallbackPrice;
      }
    }

    // 3. Validate pickup date and time
    const pickupDate = this.validateBookingDateTime(dto.pickup.date, dto.pickup.timeSlot);

    // 4. Check time slot availability
    const isAvailable = await this.bookingsRepository.isTimeSlotAvailable(
      pickupDate,
      dto.pickup.timeSlot
    );

    if (!isAvailable) {
      throw new ApiError(409, 'Selected time slot is not available');
    }

    // 5. Parse delivery date
    let deliveryDate: Date | undefined;
    if (dto.delivery.date) {
      deliveryDate = new Date(dto.delivery.date);
      if (isNaN(deliveryDate.getTime())) {
        deliveryDate = undefined;
      }
    }

    // 6. Create booking with multiple services
    const primaryService = services[0]; // Use first service as primary for compatibility
    const bookingParams: CreateBookingParams = {
      customerId,
      vehicleId: vehicle.id,
      serviceType: primaryService.type,
      mileageAtBooking: vehicle.mileage,
      totalPrice,
      priceBreakdown: {
        services,
        totalPrice,
        vehicle: {
          brand: vehicle.brand,
          model: vehicle.model,
          year: vehicle.year,
          mileage: vehicle.mileage
        }
      },
      pickupDate,
      pickupTimeSlot: dto.pickup.timeSlot,
      pickupAddress: dto.pickup.street,
      pickupCity: dto.pickup.city,
      pickupPostalCode: dto.pickup.postalCode,
      deliveryDate,
      deliveryTimeSlot: dto.delivery.timeSlot,
      customerNotes: dto.customerNotes
    };

    const booking = await this.bookingsRepository.create(bookingParams);

    // 7. Update booking with services JSON field
    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        services: services as any // Store array of services
      }
    });

    logger.info({
      message: 'Booking created from DTO',
      bookingId: booking.id,
      bookingNumber: booking.bookingNumber,
      customerId,
      vehicleId: vehicle.id,
      servicesCount: services.length,
      totalPrice
    });

    return booking;
  }

  /**
   * Create new booking (legacy single-service flow)
   */
  async createBooking(input: CreateBookingInput): Promise<BookingWithRelations> {
    // Validate vehicle exists and belongs to customer
    const vehicle = await this.vehiclesRepository.findById(input.vehicleId);
    if (!vehicle) {
      throw new ApiError(404, 'Vehicle not found');
    }

    if (vehicle.customerId !== input.customerId) {
      throw new ApiError(403, 'You do not have permission to book this vehicle');
    }

    // Validate date and time
    const pickupDate = this.validateBookingDateTime(input.pickupDate, input.pickupTimeSlot);

    // Check time slot availability
    const isAvailable = await this.bookingsRepository.isTimeSlotAvailable(
      pickupDate,
      input.pickupTimeSlot
    );

    if (!isAvailable) {
      throw new ApiError(409, 'Selected time slot is not available');
    }

    // Calculate price
    const { totalPrice, priceBreakdown } = await this.calculateBookingPrice(
      input.vehicleId,
      input.serviceType
    );

    // Create booking
    const bookingParams: CreateBookingParams = {
      customerId: input.customerId,
      vehicleId: input.vehicleId,
      serviceType: input.serviceType,
      mileageAtBooking: vehicle.mileage,
      totalPrice,
      priceBreakdown,
      pickupDate,
      pickupTimeSlot: input.pickupTimeSlot,
      pickupAddress: input.pickupAddress,
      pickupCity: input.pickupCity,
      pickupPostalCode: input.pickupPostalCode,
      customerNotes: input.customerNotes
    };

    const booking = await this.bookingsRepository.create(bookingParams);

    logger.info({
      message: 'Booking created',
      bookingId: booking.id,
      bookingNumber: booking.bookingNumber,
      customerId: input.customerId,
      totalPrice
    });

    return booking;
  }

  /**
   * Get booking by ID
   */
  async getBookingById(bookingId: string, customerId?: string): Promise<BookingWithRelations> {
    const booking = await this.bookingsRepository.findById(bookingId);

    if (!booking) {
      throw new ApiError(404, 'Booking not found');
    }

    // If customerId is provided, verify ownership
    if (customerId && booking.customerId !== customerId) {
      throw new ApiError(403, 'You do not have permission to access this booking');
    }

    return booking;
  }

  /**
   * Get all bookings with filters
   */
  async getBookings(
    filters: BookingFilters,
    page = 1,
    limit = 20
  ): Promise<BookingListResult> {
    const { bookings, total } = await this.bookingsRepository.findAll(filters, page, limit);

    return {
      bookings,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Get customer's bookings
   */
  async getCustomerBookings(
    customerId: string,
    page = 1,
    limit = 20
  ): Promise<BookingListResult> {
    return await this.getBookings({ customerId }, page, limit);
  }

  /**
   * Update booking
   */
  async updateBooking(
    bookingId: string,
    customerId: string | undefined,
    params: UpdateBookingParams
  ): Promise<BookingWithRelations> {
    // Get existing booking
    const existingBooking = await this.getBookingById(bookingId, customerId);

    // Customers can only update certain fields
    if (customerId) {
      // Customers can only update their own bookings
      if (existingBooking.customerId !== customerId) {
        throw new ApiError(403, 'You do not have permission to update this booking');
      }

      // Customers can only update notes, not status or other fields
      const allowedFields: (keyof UpdateBookingParams)[] = ['customerNotes'];
      const updatedFields = Object.keys(params) as (keyof UpdateBookingParams)[];
      const invalidFields = updatedFields.filter(field => !allowedFields.includes(field));

      if (invalidFields.length > 0) {
        throw new ApiError(403, 'Customers can only update customer notes');
      }
    }

    // Validate status transitions
    if (params.status) {
      this.validateStatusTransition(existingBooking.status, params.status);
    }

    const booking = await this.bookingsRepository.update(bookingId, params);

    logger.info({
      message: 'Booking updated',
      bookingId,
      updates: Object.keys(params)
    });

    return booking;
  }

  /**
   * Validate booking status transitions using FSM
   * @deprecated Use transitionStatus method instead for full FSM support
   */
  private validateStatusTransition(currentStatus: BookingStatus, newStatus: BookingStatus): void {
    // Use FSM for validation
    assertTransition(currentStatus, newStatus);
  }

  /**
   * Transition booking status with FSM validation
   * This is the recommended method for changing booking status
   */
  async transitionStatus(
    bookingId: string,
    newStatus: BookingStatus,
    actor: Actor = Actor.SYSTEM
  ): Promise<BookingWithRelations> {
    // Get current booking
    const booking = await this.bookingsRepository.findById(bookingId);
    if (!booking) {
      throw new ApiError(404, 'Booking not found');
    }

    // Validate transition using FSM
    assertTransition(booking.status, newStatus, actor);

    // Perform the transition
    const updatedBooking = await this.bookingsRepository.update(bookingId, {
      status: newStatus
    });

    logger.info({
      message: 'Booking status transitioned',
      bookingId,
      from: booking.status,
      to: newStatus,
      actor
    });

    return updatedBooking;
  }

  /**
   * Cancel booking with refund processing
   */
  async cancelBooking(
    bookingId: string,
    customerId: string,
    reason?: string
  ): Promise<BookingWithRelations> {
    // Get existing booking
    const existingBooking = await this.getBookingById(bookingId, customerId);

    // Check if booking can be cancelled using FSM
    if (!isCancellable(existingBooking.status)) {
      throw new ApiError(
        400,
        `Cannot cancel booking with status ${existingBooking.status}`
      );
    }

    // Validate transition using FSM
    assertTransition(existingBooking.status, BookingStatus.CANCELLED, Actor.CUSTOMER);

    // Process refund if payment was made
    if (existingBooking.paymentIntentId && existingBooking.paidAt) {
      try {
        await paymentService.refundPayment({
          paymentIntentId: existingBooking.paymentIntentId,
          reason: 'requested_by_customer'
        });

        logger.info({
          message: 'Refund processed for cancelled booking',
          bookingId,
          paymentIntentId: existingBooking.paymentIntentId
        });
      } catch (error) {
        logger.error({
          message: 'Failed to process refund for cancelled booking',
          bookingId,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        // Continue with cancellation even if refund fails
      }
    }

    // Cancel the booking
    const booking = await this.bookingsRepository.cancel(bookingId);

    // Send cancellation notification
    try {
      await sendNotification({
        userId: customerId,
        type: NotificationType.STATUS_UPDATE,
        title: 'Buchung storniert',
        body: `Ihre Buchung ${booking.bookingNumber} wurde erfolgreich storniert.`,
        bookingId: bookingId,
        data: {
          bookingId,
          bookingNumber: booking.bookingNumber,
          status: BookingStatus.CANCELLED
        }
      });
    } catch (error) {
      logger.error({
        message: 'Failed to send cancellation notification',
        bookingId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    logger.info({
      message: 'Booking cancelled',
      bookingId,
      customerId,
      reason
    });

    return booking;
  }

  /**
   * Get booking status
   */
  async getBookingStatus(bookingId: string, customerId: string): Promise<{
    bookingNumber: string;
    status: BookingStatus;
    statusHistory: Array<{ status: BookingStatus; timestamp: Date }>;
    currentLocation?: string;
    estimatedDelivery?: Date;
  }> {
    const booking = await this.getBookingById(bookingId, customerId);

    // Build status history from booking data
    const statusHistory: Array<{ status: BookingStatus; timestamp: Date }> = [
      { status: BookingStatus.PENDING_PAYMENT, timestamp: booking.createdAt }
    ];

    if (booking.paidAt) {
      statusHistory.push({ status: BookingStatus.CONFIRMED, timestamp: booking.paidAt });
    }

    // Add current status if different
    if (booking.status !== BookingStatus.PENDING_PAYMENT &&
        booking.status !== BookingStatus.CONFIRMED) {
      statusHistory.push({ status: booking.status, timestamp: booking.updatedAt });
    }

    return {
      bookingNumber: booking.bookingNumber,
      status: booking.status,
      statusHistory,
      estimatedDelivery: booking.deliveryDate || undefined
    };
  }

  /**
   * Create extension request for a booking
   */
  async createExtension(
    bookingId: string,
    customerId: string,
    data: {
      description: string;
      items: Array<{ name: string; price: number; quantity: number }>;
      images?: string[];
      videos?: string[];
    }
  ) {
    // Verify booking ownership
    const booking = await this.getBookingById(bookingId, customerId);

    // Only allow extensions for bookings in workshop
    if (booking.status !== BookingStatus.IN_WORKSHOP) {
      throw new ApiError(
        400,
        'Extensions can only be requested for bookings currently in workshop'
      );
    }

    // Calculate total amount
    const totalAmount = data.items.reduce(
      (sum, item) => sum + (item.price * item.quantity),
      0
    );

    // Create extension
    const extension = await prisma.extension.create({
      data: {
        bookingId,
        description: data.description,
        items: data.items,
        totalAmount: Math.round(totalAmount * 100), // Convert to cents
        images: data.images || [],
        videos: data.videos || [],
        status: ExtensionStatus.PENDING
      }
    });

    // Send notification to customer
    try {
      await sendNotification({
        userId: customerId,
        type: NotificationType.SERVICE_EXTENSION,
        title: 'Auftragserweiterung vorgeschlagen',
        body: `Für Ihre Buchung ${booking.bookingNumber} wurde eine Erweiterung vorgeschlagen. Bitte überprüfen Sie die Details.`,
        bookingId: bookingId,
        data: {
          bookingId,
          extensionId: extension.id,
          totalAmount: extension.totalAmount
        }
      });
    } catch (error) {
      logger.error({
        message: 'Failed to send extension notification',
        extensionId: extension.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    logger.info({
      message: 'Extension created',
      extensionId: extension.id,
      bookingId,
      totalAmount
    });

    return extension;
  }

  /**
   * Approve extension and process payment
   */
  async approveExtension(
    bookingId: string,
    extensionId: string,
    customerId: string
  ) {
    // Verify booking ownership
    const booking = await this.getBookingById(bookingId, customerId);

    // Get extension
    const extension = await prisma.extension.findUnique({
      where: { id: extensionId }
    });

    if (!extension) {
      throw new ApiError(404, 'Extension not found');
    }

    if (extension.bookingId !== bookingId) {
      throw new ApiError(403, 'Extension does not belong to this booking');
    }

    if (extension.status !== ExtensionStatus.PENDING) {
      throw new ApiError(400, `Extension is already ${extension.status.toLowerCase()}`);
    }

    // Create payment intent for extension (demo or real)
    const isDemoMode = process.env.DEMO_MODE === 'true';
    let paymentIntentId: string;
    let clientSecret: string | null = null;
    let amount: number;

    if (isDemoMode) {
      const demoIntent = await demoPaymentService.createPaymentIntent({
        amount: extension.totalAmount,
        bookingId,
        customerId,
        customerEmail: booking.customer.email,
        metadata: { extensionId: extension.id, type: 'extension' }
      });
      await demoPaymentService.confirmPayment(demoIntent.id);
      paymentIntentId = demoIntent.id;
      clientSecret = demoIntent.client_secret;
      amount = demoIntent.amount;
    } else {
      const paymentIntent = await paymentService.createPaymentIntent({
        amount: extension.totalAmount,
        bookingId,
        customerId,
        customerEmail: booking.customer.email,
        metadata: { extensionId: extension.id, type: 'extension' }
      });
      paymentIntentId = paymentIntent.id;
      clientSecret = paymentIntent.client_secret;
      amount = paymentIntent.amount;
    }

    // Update extension with payment intent
    const updatedExtension = await prisma.extension.update({
      where: { id: extensionId },
      data: {
        status: ExtensionStatus.APPROVED,
        approvedAt: new Date(),
        paymentIntentId
      }
    });

    logger.info({
      message: 'Extension approved',
      extensionId,
      bookingId,
      paymentIntentId
    });

    return {
      extension: updatedExtension,
      paymentIntent: {
        id: paymentIntentId,
        clientSecret,
        amount
      }
    };
  }

  /**
   * Decline extension
   */
  async declineExtension(
    bookingId: string,
    extensionId: string,
    customerId: string,
    reason?: string
  ) {
    // Verify booking ownership
    await this.getBookingById(bookingId, customerId);

    // Get extension
    const extension = await prisma.extension.findUnique({
      where: { id: extensionId }
    });

    if (!extension) {
      throw new ApiError(404, 'Extension not found');
    }

    if (extension.bookingId !== bookingId) {
      throw new ApiError(403, 'Extension does not belong to this booking');
    }

    if (extension.status !== ExtensionStatus.PENDING) {
      throw new ApiError(400, `Extension is already ${extension.status.toLowerCase()}`);
    }

    // Decline extension
    const updatedExtension = await prisma.extension.update({
      where: { id: extensionId },
      data: {
        status: ExtensionStatus.DECLINED,
        declinedAt: new Date()
      }
    });

    logger.info({
      message: 'Extension declined',
      extensionId,
      bookingId,
      reason
    });

    return updatedExtension;
  }

  /**
   * Respond to extension with per-item accept/reject
   */
  async respondToExtension(
    bookingId: string,
    extensionId: string,
    customerId: string,
    acceptedItemIndices: number[]
  ) {
    // Verify booking ownership
    const booking = await this.getBookingById(bookingId, customerId);

    // Get extension
    const extension = await prisma.extension.findUnique({
      where: { id: extensionId }
    });

    if (!extension) {
      throw new ApiError(404, 'Extension not found');
    }

    if (extension.bookingId !== bookingId) {
      throw new ApiError(403, 'Extension does not belong to this booking');
    }

    if (extension.status !== ExtensionStatus.PENDING) {
      throw new ApiError(400, `Extension is already ${extension.status.toLowerCase()}`);
    }

    // Get items and mark accepted/rejected
    const items = extension.items as any[];
    const updatedItems = items.map((item: any, index: number) => ({
      ...item,
      accepted: acceptedItemIndices.includes(index)
    }));

    // Calculate approved amount from accepted items only
    const approvedAmount = updatedItems
      .filter((item: any) => item.accepted)
      .reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

    // If no items accepted, decline
    if (approvedAmount === 0) {
      const updatedExtension = await prisma.extension.update({
        where: { id: extensionId },
        data: {
          status: ExtensionStatus.DECLINED,
          items: updatedItems,
          declinedAt: new Date()
        }
      });

      logger.info({
        message: 'Extension declined (no items accepted)',
        extensionId,
        bookingId,
      });

      return { extension: updatedExtension };
    }

    // Create payment intent for approved amount
    const isDemoMode = process.env.DEMO_MODE === 'true';
    let paymentIntentId: string;
    let clientSecret: string | null = null;
    let amount: number;

    if (isDemoMode) {
      const demoIntent = await demoPaymentService.createPaymentIntent({
        amount: approvedAmount,
        bookingId,
        customerId,
        customerEmail: booking.customer.email,
        metadata: { extensionId: extension.id, type: 'extension' }
      });
      await demoPaymentService.confirmPayment(demoIntent.id);
      paymentIntentId = demoIntent.id;
      clientSecret = demoIntent.client_secret;
      amount = demoIntent.amount;
    } else {
      const paymentIntent = await paymentService.createPaymentIntent({
        amount: approvedAmount,
        bookingId,
        customerId,
        customerEmail: booking.customer.email,
        metadata: { extensionId: extension.id, type: 'extension' }
      });
      paymentIntentId = paymentIntent.id;
      clientSecret = paymentIntent.client_secret;
      amount = paymentIntent.amount;
    }

    // Update extension with modified items, new total, and payment info
    const updatedExtension = await prisma.extension.update({
      where: { id: extensionId },
      data: {
        status: ExtensionStatus.APPROVED,
        items: updatedItems,
        totalAmount: approvedAmount,
        approvedAt: new Date(),
        paymentIntentId
      }
    });

    logger.info({
      message: 'Extension partially approved',
      extensionId,
      bookingId,
      acceptedItems: acceptedItemIndices.length,
      totalItems: items.length,
      approvedAmount,
      paymentIntentId
    });

    return {
      extension: updatedExtension,
      paymentIntent: {
        id: paymentIntentId,
        clientSecret,
        amount
      }
    };
  }

  /**
   * Get booking extensions
   */
  async getBookingExtensions(bookingId: string, customerId: string) {
    // Verify booking ownership
    await this.getBookingById(bookingId, customerId);

    const extensions = await prisma.extension.findMany({
      where: { bookingId },
      orderBy: { createdAt: 'desc' }
    });

    return extensions;
  }
}
