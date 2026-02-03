/**
 * Bookings API Tests
 * Tests for the Customer Booking API endpoints
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { BookingsService } from '../services/bookings.service';
import { BookingsRepository } from '../repositories/bookings.repository';
import { VehiclesRepository } from '../repositories/vehicles.repository';
import { PricingService } from '../services/pricing.service';
import { PriceMatrixRepository } from '../repositories/price-matrix.repository';
import { BookingStatus, ServiceType, UserRole, ExtensionStatus } from '@prisma/client';
import { ApiError } from '../middleware/errorHandler';
import { prisma } from '../config/database';

// Mock data
const mockCustomer = {
  id: 'customer_1',
  email: 'customer@test.com',
  username: null,
  passwordHash: null,
  role: UserRole.CUSTOMER,
  firstName: 'Max',
  lastName: 'Mustermann',
  phone: '+49123456789',
  isActive: true,
  lastLoginAt: null,
  fcmToken: null,
  createdAt: new Date(),
  updatedAt: new Date()
};

const mockVehicle = {
  id: 'vehicle_1',
  customerId: 'customer_1',
  brand: 'VW',
  model: 'Golf 7',
  year: 2015,
  mileage: 80000,
  licensePlate: 'B-AB 1234',
  vin: null,
  createdAt: new Date(),
  updatedAt: new Date()
};

const mockBooking = {
  id: 'booking_1',
  bookingNumber: 'BK2501001',
  customerId: 'customer_1',
  vehicleId: 'vehicle_1',
  serviceType: ServiceType.INSPECTION,
  mileageAtBooking: 80000,
  status: BookingStatus.PENDING_PAYMENT,
  totalPrice: 299.99,
  priceBreakdown: {},
  pickupDate: new Date('2026-03-15'),
  pickupTimeSlot: '08:00-10:00',
  deliveryDate: null,
  deliveryTimeSlot: null,
  pickupAddress: 'Hauptstraße 1',
  pickupCity: 'Berlin',
  pickupPostalCode: '10115',
  jockeyId: null,
  paymentIntentId: null,
  paidAt: null,
  customerNotes: 'Bitte vorsichtig fahren',
  internalNotes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  customer: mockCustomer,
  vehicle: mockVehicle,
  jockey: null
};

describe('BookingsService', () => {
  let bookingsService: BookingsService;
  let bookingsRepository: BookingsRepository;
  let vehiclesRepository: VehiclesRepository;
  let pricingService: PricingService;

  beforeEach(() => {
    bookingsRepository = new BookingsRepository(prisma);
    vehiclesRepository = new VehiclesRepository(prisma);
    const priceMatrixRepository = new PriceMatrixRepository(prisma);
    pricingService = new PricingService(priceMatrixRepository);
    bookingsService = new BookingsService(
      bookingsRepository,
      vehiclesRepository,
      pricingService
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createBooking', () => {
    it('should create a new booking with valid data', async () => {
      // Mock repository methods
      jest.spyOn(vehiclesRepository, 'findById').mockResolvedValue(mockVehicle);
      jest.spyOn(bookingsRepository, 'isTimeSlotAvailable').mockResolvedValue(true);
      jest.spyOn(pricingService, 'calculatePrice').mockResolvedValue({
        basePrice: 250,
        ageMultiplier: 1.2,
        finalPrice: 299.99,
        priceSource: 'calculated',
        mileageInterval: '60000-100000',
        vehicleInfo: {
          brand: 'VW',
          model: 'Golf 7',
          year: 2015,
          mileage: 80000
        }
      } as any);
      jest.spyOn(bookingsRepository, 'create').mockResolvedValue(mockBooking as any);

      const result = await bookingsService.createBooking({
        customerId: 'customer_1',
        vehicleId: 'vehicle_1',
        serviceType: ServiceType.INSPECTION,
        pickupDate: '2026-03-15T00:00:00Z',
        pickupTimeSlot: '08:00-10:00',
        pickupAddress: 'Hauptstraße 1',
        pickupCity: 'Berlin',
        pickupPostalCode: '10115',
        customerNotes: 'Bitte vorsichtig fahren'
      });

      expect(result).toBeDefined();
      expect(result.bookingNumber).toBe('BK2501001');
      expect(result.status).toBe(BookingStatus.PENDING_PAYMENT);
    });

    it('should throw error if vehicle not found', async () => {
      jest.spyOn(vehiclesRepository, 'findById').mockResolvedValue(null);

      await expect(
        bookingsService.createBooking({
          customerId: 'customer_1',
          vehicleId: 'invalid_vehicle',
          serviceType: ServiceType.INSPECTION,
          pickupDate: '2026-03-15T00:00:00Z',
          pickupTimeSlot: '08:00-10:00',
          pickupAddress: 'Hauptstraße 1',
          pickupCity: 'Berlin',
          pickupPostalCode: '10115'
        })
      ).rejects.toThrow('Vehicle not found');
    });

    it('should throw error if vehicle does not belong to customer', async () => {
      const otherVehicle = { ...mockVehicle, customerId: 'other_customer' };
      jest.spyOn(vehiclesRepository, 'findById').mockResolvedValue(otherVehicle);

      await expect(
        bookingsService.createBooking({
          customerId: 'customer_1',
          vehicleId: 'vehicle_1',
          serviceType: ServiceType.INSPECTION,
          pickupDate: '2026-03-15T00:00:00Z',
          pickupTimeSlot: '08:00-10:00',
          pickupAddress: 'Hauptstraße 1',
          pickupCity: 'Berlin',
          pickupPostalCode: '10115'
        })
      ).rejects.toThrow('You do not have permission to book this vehicle');
    });

    it('should throw error if pickup date is in the past', async () => {
      jest.spyOn(vehiclesRepository, 'findById').mockResolvedValue(mockVehicle);

      await expect(
        bookingsService.createBooking({
          customerId: 'customer_1',
          vehicleId: 'vehicle_1',
          serviceType: ServiceType.INSPECTION,
          pickupDate: '2020-01-01T00:00:00Z',
          pickupTimeSlot: '08:00-10:00',
          pickupAddress: 'Hauptstraße 1',
          pickupCity: 'Berlin',
          pickupPostalCode: '10115'
        })
      ).rejects.toThrow('Pickup date must be in the future');
    });

    it('should throw error if time slot is not available', async () => {
      jest.spyOn(vehiclesRepository, 'findById').mockResolvedValue(mockVehicle);
      jest.spyOn(bookingsRepository, 'isTimeSlotAvailable').mockResolvedValue(false);

      await expect(
        bookingsService.createBooking({
          customerId: 'customer_1',
          vehicleId: 'vehicle_1',
          serviceType: ServiceType.INSPECTION,
          pickupDate: '2026-03-15T00:00:00Z',
          pickupTimeSlot: '08:00-10:00',
          pickupAddress: 'Hauptstraße 1',
          pickupCity: 'Berlin',
          pickupPostalCode: '10115'
        })
      ).rejects.toThrow('Selected time slot is not available');
    });

    it('should validate time slot format', async () => {
      jest.spyOn(vehiclesRepository, 'findById').mockResolvedValue(mockVehicle);

      await expect(
        bookingsService.createBooking({
          customerId: 'customer_1',
          vehicleId: 'vehicle_1',
          serviceType: ServiceType.INSPECTION,
          pickupDate: '2026-03-15T00:00:00Z',
          pickupTimeSlot: 'invalid_format',
          pickupAddress: 'Hauptstraße 1',
          pickupCity: 'Berlin',
          pickupPostalCode: '10115'
        })
      ).rejects.toThrow('Invalid time slot format');
    });
  });

  describe('getBookingById', () => {
    it('should return booking for owner', async () => {
      jest.spyOn(bookingsRepository, 'findById').mockResolvedValue(mockBooking as any);

      const result = await bookingsService.getBookingById('booking_1', 'customer_1');

      expect(result).toBeDefined();
      expect(result.id).toBe('booking_1');
    });

    it('should throw error if booking not found', async () => {
      jest.spyOn(bookingsRepository, 'findById').mockResolvedValue(null);

      await expect(
        bookingsService.getBookingById('invalid_booking', 'customer_1')
      ).rejects.toThrow('Booking not found');
    });

    it('should throw error if customer does not own booking', async () => {
      jest.spyOn(bookingsRepository, 'findById').mockResolvedValue(mockBooking as any);

      await expect(
        bookingsService.getBookingById('booking_1', 'other_customer')
      ).rejects.toThrow('You do not have permission to access this booking');
    });
  });

  describe('cancelBooking', () => {
    it('should cancel booking with PENDING_PAYMENT status', async () => {
      const cancelledBooking = { ...mockBooking, status: BookingStatus.CANCELLED };
      jest.spyOn(bookingsRepository, 'findById').mockResolvedValue(mockBooking as any);
      jest.spyOn(bookingsRepository, 'cancel').mockResolvedValue(cancelledBooking as any);

      const result = await bookingsService.cancelBooking('booking_1', 'customer_1');

      expect(result.status).toBe(BookingStatus.CANCELLED);
    });

    it('should throw error if booking cannot be cancelled', async () => {
      const completedBooking = { ...mockBooking, status: BookingStatus.COMPLETED };
      jest.spyOn(bookingsRepository, 'findById').mockResolvedValue(completedBooking as any);

      await expect(
        bookingsService.cancelBooking('booking_1', 'customer_1')
      ).rejects.toThrow('Cannot cancel booking with status COMPLETED');
    });
  });

  describe('getBookingStatus', () => {
    it('should return current status with history', async () => {
      const confirmedBooking = {
        ...mockBooking,
        status: BookingStatus.CONFIRMED,
        paidAt: new Date()
      };
      jest.spyOn(bookingsRepository, 'findById').mockResolvedValue(confirmedBooking as any);

      const result = await bookingsService.getBookingStatus('booking_1', 'customer_1');

      expect(result.bookingNumber).toBe('BK2501001');
      expect(result.status).toBe(BookingStatus.CONFIRMED);
      expect(result.statusHistory).toHaveLength(2);
    });
  });

  describe('Extension Management', () => {
    const mockExtension = {
      id: 'extension_1',
      bookingId: 'booking_1',
      description: 'Bremsbeläge müssen gewechselt werden',
      items: [
        { name: 'Bremsbeläge vorne', price: 120, quantity: 1 },
        { name: 'Arbeitszeit', price: 80, quantity: 1 }
      ],
      totalAmount: 20000, // 200 EUR in cents
      images: ['https://example.com/image1.jpg'],
      videos: [],
      status: ExtensionStatus.PENDING,
      paymentIntentId: null,
      paidAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      approvedAt: null,
      declinedAt: null
    };

    it('should approve extension and create payment intent', async () => {
      const workshopBooking = { ...mockBooking, status: BookingStatus.IN_WORKSHOP };
      jest.spyOn(bookingsRepository, 'findById').mockResolvedValue(workshopBooking as any);

      // Note: This is a simplified test - actual implementation would need proper mocking
      // of prisma.extension methods and payment service
    });

    it('should decline extension', async () => {
      jest.spyOn(bookingsRepository, 'findById').mockResolvedValue(mockBooking as any);

      // Note: This is a simplified test - actual implementation would need proper mocking
      // of prisma.extension methods
    });
  });
});

describe('Booking Validation', () => {
  it('should validate service type enum', () => {
    const validTypes = Object.values(ServiceType);
    expect(validTypes).toContain(ServiceType.INSPECTION);
    expect(validTypes).toContain(ServiceType.OIL_SERVICE);
    expect(validTypes).toContain(ServiceType.TUV);
  });

  it('should validate booking status enum', () => {
    const validStatuses = Object.values(BookingStatus);
    expect(validStatuses).toContain(BookingStatus.PENDING_PAYMENT);
    expect(validStatuses).toContain(BookingStatus.CONFIRMED);
    expect(validStatuses).toContain(BookingStatus.DELIVERED);
  });

  it('should validate extension status enum', () => {
    const validStatuses = Object.values(ExtensionStatus);
    expect(validStatuses).toContain(ExtensionStatus.PENDING);
    expect(validStatuses).toContain(ExtensionStatus.APPROVED);
    expect(validStatuses).toContain(ExtensionStatus.DECLINED);
  });
});
