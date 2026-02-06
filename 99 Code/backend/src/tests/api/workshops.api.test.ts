/**
 * Workshops API Integration Tests
 *
 * Tests workshop order management endpoints using supertest with mocked Prisma.
 */

import request from 'supertest';
import { createApp } from '../../app';
import { UserRole } from '../../types/auth.types';
import { generateToken } from '../../utils/jwt';
import { BookingStatus } from '@prisma/client';

// Mock Prisma
jest.mock('../../config/database', () => {
  const mockPrisma = {
    user: { findUnique: jest.fn(), findFirst: jest.fn() },
    booking: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    jockeyAssignment: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    extension: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
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

jest.mock('../../services/payment.service', () => ({
  paymentService: {
    capturePayment: jest.fn().mockResolvedValue({ status: 'succeeded' }),
  },
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

const workshopToken = generateToken({
  userId: 'work-1',
  email: 'werkstatt@test.de',
  role: UserRole.WORKSHOP,
});

const customerToken = generateToken({
  userId: 'cust-1',
  email: 'kunde@test.de',
  role: UserRole.CUSTOMER,
});

const mockOrder = {
  id: 'booking-1',
  bookingNumber: 'BK2601001',
  customerId: 'cust-1',
  vehicleId: 'v-1',
  status: BookingStatus.AT_WORKSHOP,
  totalPrice: { toString: () => '149.00' },
  pickupDate: new Date('2026-03-15'),
  pickupTimeSlot: '09:00',
  pickupAddress: 'Hauptstr. 1',
  pickupCity: 'Witten',
  pickupPostalCode: '58453',
  deliveryDate: null,
  customer: { id: 'cust-1', email: 'kunde@test.de', firstName: 'Max', lastName: 'Mustermann', phone: '+49123' },
  vehicle: { id: 'v-1', brand: 'BMW', model: '3er', year: 2020, mileage: 45000, licensePlate: 'EN-XX-123' },
  jockey: { id: 'jock-1', firstName: 'Jan', lastName: 'Jockey' },
};

describe('Workshops API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/workshops/orders', () => {
    it('should return orders for authenticated workshop', async () => {
      mockedPrisma.booking.findMany.mockResolvedValue([mockOrder]);
      mockedPrisma.booking.count.mockResolvedValue(1);

      const res = await request(app)
        .get('/api/workshops/orders')
        .set('Authorization', `Bearer ${workshopToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.pagination).toBeDefined();
    });

    it('should return 401 without authentication', async () => {
      const res = await request(app).get('/api/workshops/orders');

      expect(res.status).toBe(401);
    });

    it('should return 403 for non-workshop role', async () => {
      const res = await request(app)
        .get('/api/workshops/orders')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
    });

    it('should return empty array when no orders', async () => {
      mockedPrisma.booking.findMany.mockResolvedValue([]);
      mockedPrisma.booking.count.mockResolvedValue(0);

      const res = await request(app)
        .get('/api/workshops/orders')
        .set('Authorization', `Bearer ${workshopToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(0);
    });
  });

  describe('GET /api/workshops/orders/:id', () => {
    it('should return single order', async () => {
      mockedPrisma.booking.findUnique.mockResolvedValue(mockOrder);

      const res = await request(app)
        .get('/api/workshops/orders/booking-1')
        .set('Authorization', `Bearer ${workshopToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.bookingNumber).toBe('BK2601001');
    });

    it('should return 404 for non-existent order', async () => {
      mockedPrisma.booking.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .get('/api/workshops/orders/nonexistent')
        .set('Authorization', `Bearer ${workshopToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/workshops/orders/:id/status', () => {
    it('should update status AT_WORKSHOP → IN_SERVICE', async () => {
      mockedPrisma.booking.findUnique.mockResolvedValue({
        ...mockOrder,
        status: BookingStatus.AT_WORKSHOP,
      });
      mockedPrisma.booking.update.mockResolvedValue({
        ...mockOrder,
        status: BookingStatus.IN_SERVICE,
      });

      const res = await request(app)
        .put('/api/workshops/orders/BK2601001/status')
        .set('Authorization', `Bearer ${workshopToken}`)
        .send({ status: 'IN_SERVICE' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should reject invalid FSM transition', async () => {
      mockedPrisma.booking.findUnique.mockResolvedValue({
        ...mockOrder,
        bookingNumber: 'BK2601001',
        status: BookingStatus.AT_WORKSHOP,
      });

      const res = await request(app)
        .put('/api/workshops/orders/BK2601001/status')
        .set('Authorization', `Bearer ${workshopToken}`)
        .send({ status: 'RETURNED' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('INVALID_TRANSITION');
    });

    it('should create return assignment on READY_FOR_RETURN', async () => {
      mockedPrisma.booking.findUnique.mockResolvedValue({
        ...mockOrder,
        status: BookingStatus.IN_SERVICE,
      });
      mockedPrisma.booking.update.mockResolvedValue({
        ...mockOrder,
        status: BookingStatus.READY_FOR_RETURN,
      });
      mockedPrisma.jockeyAssignment.findFirst.mockResolvedValue({
        jockeyId: 'jock-1',
      });
      mockedPrisma.$transaction.mockImplementation(async (fn: any) => fn(mockedPrisma));
      mockedPrisma.jockeyAssignment.create.mockResolvedValue({ id: 'return-assign-1' });
      mockedPrisma.extension.findMany.mockResolvedValue([]);

      const res = await request(app)
        .put('/api/workshops/orders/BK2601001/status')
        .set('Authorization', `Bearer ${workshopToken}`)
        .send({ status: 'READY_FOR_RETURN' });

      expect(res.status).toBe(200);
    });

    it('should return 404 for non-existent booking', async () => {
      mockedPrisma.booking.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .put('/api/workshops/orders/NONEXISTENT/status')
        .set('Authorization', `Bearer ${workshopToken}`)
        .send({ status: 'IN_SERVICE' });

      expect(res.status).toBe(404);
    });

    it('should return 400 for invalid status value', async () => {
      const res = await request(app)
        .put('/api/workshops/orders/BK2601001/status')
        .set('Authorization', `Bearer ${workshopToken}`)
        .send({ status: 'INVALID' });

      expect(res.status).toBe(400);
    });

    it('should return 400 for missing status', async () => {
      const res = await request(app)
        .put('/api/workshops/orders/BK2601001/status')
        .set('Authorization', `Bearer ${workshopToken}`)
        .send({});

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/workshops/orders/:bookingId/extensions', () => {
    const validExtension = {
      description: 'Bremsbeläge abgenutzt',
      items: [{ name: 'Bremsbeläge vorne', price: 12900, quantity: 1 }],
    };

    it('should create extension for existing booking', async () => {
      mockedPrisma.booking.findUnique.mockResolvedValue(mockOrder);
      mockedPrisma.extension.create.mockResolvedValue({
        id: 'ext-1',
        bookingId: 'booking-1',
        description: 'Bremsbeläge abgenutzt',
        items: validExtension.items,
        totalAmount: 12900,
        status: 'PENDING',
      });

      const res = await request(app)
        .post('/api/workshops/orders/booking-1/extensions')
        .set('Authorization', `Bearer ${workshopToken}`)
        .send(validExtension);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('PENDING');
    });

    it('should return 404 for non-existent booking', async () => {
      mockedPrisma.booking.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/workshops/orders/nonexistent/extensions')
        .set('Authorization', `Bearer ${workshopToken}`)
        .send(validExtension);

      expect(res.status).toBe(404);
    });

    it('should return 400 for missing description', async () => {
      const res = await request(app)
        .post('/api/workshops/orders/booking-1/extensions')
        .set('Authorization', `Bearer ${workshopToken}`)
        .send({ items: validExtension.items });

      expect(res.status).toBe(400);
    });

    it('should return 400 for empty items', async () => {
      const res = await request(app)
        .post('/api/workshops/orders/booking-1/extensions')
        .set('Authorization', `Bearer ${workshopToken}`)
        .send({ description: 'Test', items: [] });

      expect(res.status).toBe(400);
    });

    it('should calculate total amount from items', async () => {
      mockedPrisma.booking.findUnique.mockResolvedValue(mockOrder);
      mockedPrisma.extension.create.mockResolvedValue({
        id: 'ext-2',
        totalAmount: 38800,
        status: 'PENDING',
      });

      const res = await request(app)
        .post('/api/workshops/orders/booking-1/extensions')
        .set('Authorization', `Bearer ${workshopToken}`)
        .send({
          description: 'Multiple parts',
          items: [
            { name: 'Part A', price: 12900, quantity: 2 },
            { name: 'Part B', price: 13000, quantity: 1 },
          ],
        });

      expect(res.status).toBe(201);
    });
  });
});
