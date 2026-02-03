/**
 * Bookings API Integration Tests
 * Tests the complete booking flow from creation to completion
 *
 * Run with: npm test -- bookings.integration.test.ts
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { prisma } from '../config/database';
import { BookingsService } from '../services/bookings.service';
import { BookingsRepository } from '../repositories/bookings.repository';
import { VehiclesRepository } from '../repositories/vehicles.repository';
import { PricingService } from '../services/pricing.service';
import { PriceMatrixRepository } from '../repositories/price-matrix.repository';
import { BookingStatus, ServiceType, UserRole } from '@prisma/client';

describe('Bookings Integration Tests', () => {
  let testCustomer: any;
  let testVehicle: any;
  let bookingsService: BookingsService;

  beforeAll(async () => {
    // Create test customer
    testCustomer = await prisma.user.create({
      data: {
        email: `integration-test-${Date.now()}@test.com`,
        role: UserRole.CUSTOMER,
        firstName: 'Integration',
        lastName: 'Test',
        phone: '+491234567890',
        customerProfile: {
          create: {
            street: 'Test Street 1',
            city: 'Berlin',
            postalCode: '10115'
          }
        }
      }
    });

    // Create test vehicle
    testVehicle = await prisma.vehicle.create({
      data: {
        customerId: testCustomer.id,
        brand: 'VW',
        model: 'Golf 7',
        year: 2015,
        mileage: 75000,
        licensePlate: 'B-TEST-123'
      }
    });

    // Initialize services
    const bookingsRepository = new BookingsRepository(prisma);
    const vehiclesRepository = new VehiclesRepository(prisma);
    const priceMatrixRepository = new PriceMatrixRepository(prisma);
    const pricingService = new PricingService(priceMatrixRepository);

    bookingsService = new BookingsService(
      bookingsRepository,
      vehiclesRepository,
      pricingService
    );
  });

  afterAll(async () => {
    // Cleanup: Delete test data
    await prisma.booking.deleteMany({
      where: { customerId: testCustomer.id }
    });
    await prisma.vehicle.deleteMany({
      where: { customerId: testCustomer.id }
    });
    await prisma.customerProfile.deleteMany({
      where: { userId: testCustomer.id }
    });
    await prisma.user.delete({
      where: { id: testCustomer.id }
    });

    await prisma.$disconnect();
  });

  describe('Complete Booking Flow', () => {
    let createdBooking: any;

    it('Step 1: Create a new booking', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      createdBooking = await bookingsService.createBooking({
        customerId: testCustomer.id,
        vehicleId: testVehicle.id,
        serviceType: ServiceType.INSPECTION,
        pickupDate: futureDate.toISOString(),
        pickupTimeSlot: '09:00-11:00',
        pickupAddress: 'Test Street 1',
        pickupCity: 'Berlin',
        pickupPostalCode: '10115',
        customerNotes: 'Please be careful with my car'
      });

      expect(createdBooking).toBeDefined();
      expect(createdBooking.bookingNumber).toMatch(/^BK\d{6}$/);
      expect(createdBooking.status).toBe(BookingStatus.PENDING_PAYMENT);
      expect(createdBooking.customerId).toBe(testCustomer.id);
      expect(createdBooking.vehicleId).toBe(testVehicle.id);
    });

    it('Step 2: Retrieve the created booking', async () => {
      const booking = await bookingsService.getBookingById(
        createdBooking.id,
        testCustomer.id
      );

      expect(booking).toBeDefined();
      expect(booking.id).toBe(createdBooking.id);
      expect(booking.customer).toBeDefined();
      expect(booking.vehicle).toBeDefined();
    });

    it('Step 3: List customer bookings', async () => {
      const result = await bookingsService.getCustomerBookings(
        testCustomer.id,
        1,
        10
      );

      expect(result.bookings).toBeDefined();
      expect(result.bookings.length).toBeGreaterThan(0);
      expect(result.total).toBeGreaterThan(0);
      expect(result.page).toBe(1);
    });

    it('Step 4: Update booking notes', async () => {
      const updatedBooking = await bookingsService.updateBooking(
        createdBooking.id,
        testCustomer.id,
        { customerNotes: 'Updated notes' }
      );

      expect(updatedBooking.customerNotes).toBe('Updated notes');
    });

    it('Step 5: Get booking status', async () => {
      const statusInfo = await bookingsService.getBookingStatus(
        createdBooking.id,
        testCustomer.id
      );

      expect(statusInfo).toBeDefined();
      expect(statusInfo.bookingNumber).toBe(createdBooking.bookingNumber);
      expect(statusInfo.status).toBe(BookingStatus.PENDING_PAYMENT);
      expect(statusInfo.statusHistory).toBeDefined();
      expect(statusInfo.statusHistory.length).toBeGreaterThan(0);
    });

    it('Step 6: Cancel the booking', async () => {
      const cancelledBooking = await bookingsService.cancelBooking(
        createdBooking.id,
        testCustomer.id,
        'Changed my mind'
      );

      expect(cancelledBooking.status).toBe(BookingStatus.CANCELLED);
    });

    it('Step 7: Verify booking is cancelled', async () => {
      const booking = await bookingsService.getBookingById(
        createdBooking.id,
        testCustomer.id
      );

      expect(booking.status).toBe(BookingStatus.CANCELLED);
    });
  });

  describe('Extension Flow', () => {
    let workshopBooking: any;

    beforeAll(async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 14);

      // Create a booking and simulate it being in workshop
      workshopBooking = await prisma.booking.create({
        data: {
          customerId: testCustomer.id,
          vehicleId: testVehicle.id,
          bookingNumber: `BK${Date.now()}`,
          serviceType: ServiceType.INSPECTION,
          mileageAtBooking: testVehicle.mileage,
          status: BookingStatus.IN_WORKSHOP,
          totalPrice: 299.99,
          pickupDate: futureDate,
          pickupTimeSlot: '10:00-12:00',
          pickupAddress: 'Test Street 1',
          pickupCity: 'Berlin',
          pickupPostalCode: '10115'
        }
      });
    });

    it('Step 1: Create extension request', async () => {
      const extension = await bookingsService.createExtension(
        workshopBooking.id,
        testCustomer.id,
        {
          description: 'Brake pads need replacement',
          items: [
            { name: 'Front brake pads', price: 120, quantity: 1 },
            { name: 'Labor', price: 80, quantity: 1 }
          ],
          images: ['https://example.com/brake-image.jpg'],
          videos: []
        }
      );

      expect(extension).toBeDefined();
      expect(extension.bookingId).toBe(workshopBooking.id);
      expect(extension.totalAmount).toBe(20000); // 200 EUR in cents
      expect(extension.status).toBe('PENDING');
    });

    it('Step 2: Get booking extensions', async () => {
      const extensions = await bookingsService.getBookingExtensions(
        workshopBooking.id,
        testCustomer.id
      );

      expect(extensions).toBeDefined();
      expect(extensions.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should reject booking with invalid vehicle ID', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      await expect(
        bookingsService.createBooking({
          customerId: testCustomer.id,
          vehicleId: 'invalid_vehicle_id',
          serviceType: ServiceType.INSPECTION,
          pickupDate: futureDate.toISOString(),
          pickupTimeSlot: '09:00-11:00',
          pickupAddress: 'Test Street 1',
          pickupCity: 'Berlin',
          pickupPostalCode: '10115'
        })
      ).rejects.toThrow('Vehicle not found');
    });

    it('should reject booking with past date', async () => {
      const pastDate = new Date('2020-01-01');

      await expect(
        bookingsService.createBooking({
          customerId: testCustomer.id,
          vehicleId: testVehicle.id,
          serviceType: ServiceType.INSPECTION,
          pickupDate: pastDate.toISOString(),
          pickupTimeSlot: '09:00-11:00',
          pickupAddress: 'Test Street 1',
          pickupCity: 'Berlin',
          pickupPostalCode: '10115'
        })
      ).rejects.toThrow('Pickup date must be in the future');
    });

    it('should reject access to other customer booking', async () => {
      // Create another customer
      const otherCustomer = await prisma.user.create({
        data: {
          email: `other-customer-${Date.now()}@test.com`,
          role: UserRole.CUSTOMER,
          firstName: 'Other',
          lastName: 'Customer'
        }
      });

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const booking = await prisma.booking.create({
        data: {
          customerId: testCustomer.id,
          vehicleId: testVehicle.id,
          bookingNumber: `BK${Date.now()}`,
          serviceType: ServiceType.INSPECTION,
          mileageAtBooking: testVehicle.mileage,
          status: BookingStatus.PENDING_PAYMENT,
          totalPrice: 299.99,
          pickupDate: futureDate,
          pickupTimeSlot: '10:00-12:00',
          pickupAddress: 'Test Street 1',
          pickupCity: 'Berlin',
          pickupPostalCode: '10115'
        }
      });

      await expect(
        bookingsService.getBookingById(booking.id, otherCustomer.id)
      ).rejects.toThrow('You do not have permission to access this booking');

      // Cleanup
      await prisma.booking.delete({ where: { id: booking.id } });
      await prisma.user.delete({ where: { id: otherCustomer.id } });
    });
  });

  describe('Pagination', () => {
    beforeAll(async () => {
      // Create multiple bookings for pagination testing
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);

      for (let i = 0; i < 5; i++) {
        await prisma.booking.create({
          data: {
            customerId: testCustomer.id,
            vehicleId: testVehicle.id,
            bookingNumber: `BK${Date.now()}${i}`,
            serviceType: ServiceType.INSPECTION,
            mileageAtBooking: testVehicle.mileage,
            status: BookingStatus.PENDING_PAYMENT,
            totalPrice: 299.99,
            pickupDate: futureDate,
            pickupTimeSlot: '10:00-12:00',
            pickupAddress: 'Test Street 1',
            pickupCity: 'Berlin',
            pickupPostalCode: '10115'
          }
        });
      }
    });

    it('should return paginated results', async () => {
      const page1 = await bookingsService.getCustomerBookings(
        testCustomer.id,
        1,
        3
      );

      expect(page1.bookings.length).toBeLessThanOrEqual(3);
      expect(page1.page).toBe(1);
      expect(page1.limit).toBe(3);
      expect(page1.totalPages).toBeGreaterThan(0);
    });

    it('should return second page', async () => {
      const page2 = await bookingsService.getCustomerBookings(
        testCustomer.id,
        2,
        3
      );

      expect(page2.page).toBe(2);
      expect(page2.limit).toBe(3);
    });
  });

  describe('Time Slot Validation', () => {
    it('should validate time slot format', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      await expect(
        bookingsService.createBooking({
          customerId: testCustomer.id,
          vehicleId: testVehicle.id,
          serviceType: ServiceType.INSPECTION,
          pickupDate: futureDate.toISOString(),
          pickupTimeSlot: 'invalid-format',
          pickupAddress: 'Test Street 1',
          pickupCity: 'Berlin',
          pickupPostalCode: '10115'
        })
      ).rejects.toThrow('Invalid time slot format');
    });

    it('should accept valid time slot formats', async () => {
      const validFormats = [
        '08:00-10:00',
        '10:00-12:00',
        '12:00-14:00',
        '14:00-16:00'
      ];

      for (const timeSlot of validFormats) {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + (validFormats.indexOf(timeSlot) + 1) * 7);

        const booking = await bookingsService.createBooking({
          customerId: testCustomer.id,
          vehicleId: testVehicle.id,
          serviceType: ServiceType.INSPECTION,
          pickupDate: futureDate.toISOString(),
          pickupTimeSlot: timeSlot,
          pickupAddress: 'Test Street 1',
          pickupCity: 'Berlin',
          pickupPostalCode: '10115'
        });

        expect(booking.pickupTimeSlot).toBe(timeSlot);

        // Cleanup
        await prisma.booking.delete({ where: { id: booking.id } });
      }
    });
  });
});
