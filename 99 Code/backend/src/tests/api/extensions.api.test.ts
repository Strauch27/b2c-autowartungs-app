/**
 * Extensions & Demo Payment API Integration Tests
 *
 * Tests extension approval/decline and demo payment endpoints.
 */

import request from 'supertest';
import { createApp } from '../../app';
import { UserRole } from '../../types/auth.types';
import { generateToken } from '../../utils/jwt';
import { BookingStatus } from '@prisma/client';

// Mock Prisma
jest.mock('../../config/database', () => {
  const mockPrisma = {
    user: { findUnique: jest.fn(), findFirst: jest.fn(), create: jest.fn() },
    booking: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    vehicle: { findUnique: jest.fn(), findFirst: jest.fn(), create: jest.fn() },
    extension: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    jockeyAssignment: { create: jest.fn(), findFirst: jest.fn() },
    priceMatrix: { findFirst: jest.fn() },
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

const mockBooking = {
  id: 'booking-1',
  bookingNumber: 'BK2601001',
  customerId: 'cust-1',
  status: BookingStatus.IN_SERVICE,
  totalPrice: { toString: () => '149.00' },
  pickupDate: new Date(),
  pickupTimeSlot: '09:00',
  pickupAddress: 'Hauptstr. 1',
  pickupCity: 'Witten',
  pickupPostalCode: '58453',
  customer: { id: 'cust-1', email: 'kunde@test.de', firstName: 'Max', lastName: 'Mustermann' },
  vehicle: { id: 'v-1', brand: 'BMW', model: '3er', year: 2020, mileage: 45000, licensePlate: 'EN-XX-123' },
};

const mockExtension = {
  id: 'ext-1',
  bookingId: 'booking-1',
  description: 'Bremsbeläge',
  items: [{ name: 'Bremsbeläge vorne', price: 12900, quantity: 1 }],
  totalAmount: 12900,
  status: 'PENDING',
  paymentIntentId: null,
  paidAt: null,
};

describe('Extensions API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/bookings/:id/extensions/:extId/approve', () => {
    it('should return 401 without authentication', async () => {
      const res = await request(app)
        .post('/api/bookings/booking-1/extensions/ext-1/approve');

      expect(res.status).toBe(401);
    });

    it('should return 403 for non-customer role', async () => {
      const res = await request(app)
        .post('/api/bookings/booking-1/extensions/ext-1/approve')
        .set('Authorization', `Bearer ${workshopToken}`);

      expect(res.status).toBe(403);
    });

    it('should require authentication for approval', async () => {
      const res = await request(app)
        .post('/api/bookings/booking-1/extensions/ext-1/approve')
        .set('Authorization', 'Bearer invalid-token');

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/bookings/:id/extensions/:extId/decline', () => {
    it('should decline extension for booking owner', async () => {
      mockedPrisma.booking.findUnique.mockResolvedValue(mockBooking);
      mockedPrisma.extension.findUnique.mockResolvedValue(mockExtension);
      mockedPrisma.extension.update.mockResolvedValue({
        ...mockExtension,
        status: 'DECLINED',
      });

      const res = await request(app)
        .post('/api/bookings/booking-1/extensions/ext-1/decline')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ reason: 'Too expensive' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should decline without reason', async () => {
      mockedPrisma.booking.findUnique.mockResolvedValue(mockBooking);
      mockedPrisma.extension.findUnique.mockResolvedValue(mockExtension);
      mockedPrisma.extension.update.mockResolvedValue({
        ...mockExtension,
        status: 'DECLINED',
      });

      const res = await request(app)
        .post('/api/bookings/booking-1/extensions/ext-1/decline')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({});

      expect(res.status).toBe(200);
    });

    it('should return 401 without authentication', async () => {
      const res = await request(app)
        .post('/api/bookings/booking-1/extensions/ext-1/decline')
        .send({ reason: 'test' });

      expect(res.status).toBe(401);
    });
  });
});

describe('Health Check', () => {
  it('should return ok status', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('autowartungs-app-backend');
    expect(res.body.timestamp).toBeDefined();
  });
});
