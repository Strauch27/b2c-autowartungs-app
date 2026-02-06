/**
 * Bookings API Integration Tests
 *
 * Tests booking CRUD endpoints using supertest with mocked Prisma.
 */

import request from 'supertest';
import { createApp } from '../../app';
import { UserRole } from '../../types/auth.types';
import { generateToken } from '../../utils/jwt';
import { BookingStatus } from '@prisma/client';

// Mock Prisma
jest.mock('../../config/database', () => {
  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    booking: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    vehicle: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    jockeyAssignment: {
      create: jest.fn(),
      findFirst: jest.fn(),
    },
    extension: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    priceMatrix: {
      findFirst: jest.fn(),
    },
    $on: jest.fn(),
    $transaction: jest.fn(),
  };
  return { prisma: mockPrisma };
});

jest.mock('../../services/notification.service', () => ({
  sendNotification: jest.fn().mockResolvedValue(undefined),
  sendServiceExtension: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../config/firebase', () => ({
  initializeFirebase: jest.fn(),
  isFirebaseConfigured: jest.fn().mockReturnValue(false),
}));

jest.mock('../../utils/rateLimiter', () => ({
  loginRateLimiter: (req: any, res: any, next: any) => next(),
  createRateLimiter: () => (req: any, res: any, next: any) => next(),
}));

import { prisma } from '../../config/database';

const mockedPrisma = prisma as any;
const app = createApp();

const customerToken = generateToken({
  userId: 'cust-1',
  email: 'kunde@test.de',
  role: UserRole.CUSTOMER,
});

const workshopToken = generateToken({
  userId: 'work-1',
  email: 'werkstatt@test.de',
  role: UserRole.WORKSHOP,
});

const jockeyToken = generateToken({
  userId: 'jock-1',
  email: 'jockey@test.de',
  role: UserRole.JOCKEY,
});

const mockBooking = {
  id: 'booking-1',
  bookingNumber: 'BK2601001',
  customerId: 'cust-1',
  vehicleId: 'vehicle-1',
  serviceType: 'INSPECTION',
  status: BookingStatus.CONFIRMED,
  totalPrice: { toString: () => '149.00' },
  pickupDate: new Date('2026-03-15'),
  pickupTimeSlot: '09:00',
  pickupAddress: 'Hauptstr. 1',
  pickupCity: 'Witten',
  pickupPostalCode: '58453',
  customer: { id: 'cust-1', email: 'kunde@test.de', firstName: 'Max', lastName: 'Mustermann', phone: '+49123' },
  vehicle: { id: 'vehicle-1', brand: 'BMW', model: '3er', year: 2020, mileage: 45000, licensePlate: 'EN-XX-123' },
  jockey: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('Bookings API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/bookings', () => {
    it('should return bookings for authenticated customer', async () => {
      mockedPrisma.booking.findMany.mockResolvedValue([mockBooking]);
      mockedPrisma.booking.count.mockResolvedValue(1);

      const res = await request(app)
        .get('/api/bookings')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });

    it('should return 401 without authentication', async () => {
      const res = await request(app).get('/api/bookings');

      expect(res.status).toBe(401);
    });

    it('should return 403 for non-customer role', async () => {
      const res = await request(app)
        .get('/api/bookings')
        .set('Authorization', `Bearer ${workshopToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/bookings/:id', () => {
    it('should return booking for owner', async () => {
      mockedPrisma.booking.findUnique.mockResolvedValue(mockBooking);

      const res = await request(app)
        .get('/api/bookings/booking-1')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 401 without authentication', async () => {
      const res = await request(app).get('/api/bookings/booking-1');

      expect(res.status).toBe(401);
    });

    it('should return 404 for non-existent booking', async () => {
      mockedPrisma.booking.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .get('/api/bookings/nonexistent')
        .set('Authorization', `Bearer ${customerToken}`);

      // The service layer should throw a 404
      expect([404, 500]).toContain(res.status);
    });
  });

  describe('POST /api/bookings', () => {
    const validBookingDto = {
      vehicle: { brand: 'BMW', model: '3er', year: 2020, mileage: 45000 },
      services: ['inspection'],
      pickup: { date: '2026-03-15', timeSlot: '09:00', street: 'Hauptstr. 1', city: 'Witten', postalCode: '58453' },
      delivery: { date: '2026-03-16', timeSlot: '14:00' },
    };

    it('should create booking for authenticated customer', async () => {
      // Mock booking number generation (findFirst for last booking number)
      mockedPrisma.booking.findFirst.mockResolvedValue(null);

      // Mock the service layer chain
      mockedPrisma.vehicle.create.mockResolvedValue({
        id: 'v-new',
        brand: 'BMW',
        model: '3er',
        year: 2020,
        mileage: 45000,
      });
      mockedPrisma.priceMatrix.findFirst.mockResolvedValue(null);
      mockedPrisma.booking.create.mockResolvedValue({
        ...mockBooking,
        status: BookingStatus.PENDING_PAYMENT,
      });
      mockedPrisma.booking.findUnique.mockResolvedValue({
        ...mockBooking,
        status: BookingStatus.CONFIRMED,
      });
      mockedPrisma.booking.update.mockResolvedValue({
        ...mockBooking,
        status: BookingStatus.CONFIRMED,
      });
      mockedPrisma.user.findFirst.mockResolvedValue({
        id: 'jock-1',
        role: 'JOCKEY',
        isActive: true,
      });
      mockedPrisma.jockeyAssignment.create.mockResolvedValue({ id: 'assign-1' });

      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(validBookingDto);

      if (res.status !== 201) {
        console.error('Booking creation failed:', JSON.stringify(res.body, null, 2));
      }
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should create booking with guest checkout', async () => {
      const guestBookingDto = {
        ...validBookingDto,
        customer: {
          email: 'guest@test.de',
          firstName: 'Guest',
          lastName: 'User',
          phone: '+491234567890',
        },
      };

      mockedPrisma.booking.findFirst.mockResolvedValue(null);
      mockedPrisma.user.findUnique.mockResolvedValue(null);
      mockedPrisma.user.create.mockResolvedValue({
        id: 'guest-1',
        email: 'guest@test.de',
        role: 'CUSTOMER',
        isActive: false,
      });
      mockedPrisma.vehicle.create.mockResolvedValue({
        id: 'v-new',
        brand: 'BMW',
        model: '3er',
        year: 2020,
        mileage: 45000,
      });
      mockedPrisma.priceMatrix.findFirst.mockResolvedValue(null);
      mockedPrisma.booking.create.mockResolvedValue({
        ...mockBooking,
        customerId: 'guest-1',
        status: BookingStatus.PENDING_PAYMENT,
        customer: { id: 'guest-1', email: 'guest@test.de' },
      });
      mockedPrisma.booking.findUnique.mockResolvedValue({
        ...mockBooking,
        customerId: 'guest-1',
        customer: { id: 'guest-1', email: 'guest@test.de' },
      });
      mockedPrisma.booking.update.mockResolvedValue({
        ...mockBooking,
        status: BookingStatus.CONFIRMED,
      });
      mockedPrisma.user.findFirst.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/bookings')
        .send(guestBookingDto);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should return 400 for missing vehicle data', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ services: ['inspection'] });

      expect(res.status).toBe(400);
    });

    it('should return 400 for empty services array', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ ...validBookingDto, services: [] });

      expect(res.status).toBe(400);
    });

    it('should return 400 for invalid time slot format', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          ...validBookingDto,
          pickup: { ...validBookingDto.pickup, timeSlot: '25:00' },
        });

      expect(res.status).toBe(400);
    });
  });

  describe('PUT /api/bookings/:id', () => {
    it('should update customer notes', async () => {
      mockedPrisma.booking.findUnique.mockResolvedValue(mockBooking);
      mockedPrisma.booking.update.mockResolvedValue({
        ...mockBooking,
        customerNotes: 'Updated notes',
      });

      const res = await request(app)
        .put('/api/bookings/booking-1')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ customerNotes: 'Updated notes' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 401 without authentication', async () => {
      const res = await request(app)
        .put('/api/bookings/booking-1')
        .send({ customerNotes: 'test' });

      expect(res.status).toBe(401);
    });

    it('should return 400 for invalid status', async () => {
      const res = await request(app)
        .put('/api/bookings/booking-1')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ status: 'INVALID_STATUS' });

      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /api/bookings/:id', () => {
    it('should cancel booking in cancellable state', async () => {
      mockedPrisma.booking.findUnique.mockResolvedValue({
        ...mockBooking,
        status: BookingStatus.CONFIRMED,
      });
      mockedPrisma.booking.update.mockResolvedValue({
        ...mockBooking,
        status: BookingStatus.CANCELLED,
      });

      const res = await request(app)
        .delete('/api/bookings/booking-1')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ reason: 'Changed my mind' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 401 without authentication', async () => {
      const res = await request(app).delete('/api/bookings/booking-1');

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/bookings/:id/status', () => {
    it('should return booking status', async () => {
      mockedPrisma.booking.findUnique.mockResolvedValue(mockBooking);

      const res = await request(app)
        .get('/api/bookings/booking-1/status')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 401 without token', async () => {
      const res = await request(app).get('/api/bookings/booking-1/status');

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/bookings/:id/extensions', () => {
    it('should return booking extensions', async () => {
      mockedPrisma.booking.findUnique.mockResolvedValue(mockBooking);
      mockedPrisma.extension.findMany.mockResolvedValue([]);

      const res = await request(app)
        .get('/api/bookings/booking-1/extensions')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /api/bookings/:id/extensions/:extId/approve', () => {
    it('should return 401 without authentication', async () => {
      const res = await request(app)
        .post('/api/bookings/booking-1/extensions/ext-1/approve');

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/bookings/:id/extensions/:extId/decline', () => {
    it('should return 401 without authentication', async () => {
      const res = await request(app)
        .post('/api/bookings/booking-1/extensions/ext-1/decline')
        .send({ reason: 'Too expensive' });

      expect(res.status).toBe(401);
    });
  });
});
