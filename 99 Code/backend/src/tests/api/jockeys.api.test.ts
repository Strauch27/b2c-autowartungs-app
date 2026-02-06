/**
 * Jockeys API Integration Tests
 *
 * Tests jockey assignment endpoints using supertest with mocked Prisma.
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
    booking: { findUnique: jest.fn(), update: jest.fn() },
    jockeyAssignment: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    $on: jest.fn(),
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

const jockeyToken = generateToken({
  userId: 'jock-1',
  email: 'jockey@test.de',
  role: UserRole.JOCKEY,
});

const customerToken = generateToken({
  userId: 'cust-1',
  email: 'kunde@test.de',
  role: UserRole.CUSTOMER,
});

const mockAssignment = {
  id: 'assign-1',
  bookingId: 'booking-1',
  jockeyId: 'jock-1',
  type: 'PICKUP',
  status: 'ASSIGNED',
  scheduledTime: new Date('2026-03-15T09:00:00'),
  customerName: 'Max Mustermann',
  customerPhone: '+49123',
  customerAddress: 'Hauptstr. 1',
  customerCity: 'Witten',
  customerPostalCode: '58453',
  vehicleBrand: 'BMW',
  vehicleModel: '3er',
  vehicleLicensePlate: 'EN-XX-123',
  arrivedAt: null,
  completedAt: null,
  departedAt: null,
  handoverData: null,
  booking: {
    id: 'booking-1',
    status: BookingStatus.PICKUP_ASSIGNED,
    customer: { id: 'cust-1', firstName: 'Max', lastName: 'Mustermann', phone: '+49123', email: 'kunde@test.de' },
    vehicle: { id: 'v-1', brand: 'BMW', model: '3er', licensePlate: 'EN-XX-123', year: 2020, mileage: 45000 },
  },
};

describe('Jockeys API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/jockeys/assignments', () => {
    it('should return assignments for authenticated jockey', async () => {
      mockedPrisma.jockeyAssignment.findMany.mockResolvedValue([mockAssignment]);

      const res = await request(app)
        .get('/api/jockeys/assignments')
        .set('Authorization', `Bearer ${jockeyToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.assignments).toHaveLength(1);
    });

    it('should return 401 without authentication', async () => {
      const res = await request(app).get('/api/jockeys/assignments');

      expect(res.status).toBe(401);
    });

    it('should return 403 for non-jockey role', async () => {
      const res = await request(app)
        .get('/api/jockeys/assignments')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
    });

    it('should return empty array when no assignments', async () => {
      mockedPrisma.jockeyAssignment.findMany.mockResolvedValue([]);

      const res = await request(app)
        .get('/api/jockeys/assignments')
        .set('Authorization', `Bearer ${jockeyToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.assignments).toHaveLength(0);
    });
  });

  describe('GET /api/jockeys/assignments/:id', () => {
    it('should return single assignment for owner', async () => {
      mockedPrisma.jockeyAssignment.findFirst.mockResolvedValue(mockAssignment);

      const res = await request(app)
        .get('/api/jockeys/assignments/assign-1')
        .set('Authorization', `Bearer ${jockeyToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.assignment.id).toBe('assign-1');
    });

    it('should return 404 for non-existent assignment', async () => {
      mockedPrisma.jockeyAssignment.findFirst.mockResolvedValue(null);

      const res = await request(app)
        .get('/api/jockeys/assignments/nonexistent')
        .set('Authorization', `Bearer ${jockeyToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /api/jockeys/assignments/:id/status', () => {
    it('should update assignment status ASSIGNED → EN_ROUTE', async () => {
      mockedPrisma.jockeyAssignment.findFirst.mockResolvedValue(mockAssignment);
      mockedPrisma.jockeyAssignment.update.mockResolvedValue({
        ...mockAssignment,
        status: 'EN_ROUTE',
      });

      const res = await request(app)
        .patch('/api/jockeys/assignments/assign-1/status')
        .set('Authorization', `Bearer ${jockeyToken}`)
        .send({ status: 'EN_ROUTE' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should reject invalid transition ASSIGNED → COMPLETED', async () => {
      mockedPrisma.jockeyAssignment.findFirst.mockResolvedValue(mockAssignment);

      const res = await request(app)
        .patch('/api/jockeys/assignments/assign-1/status')
        .set('Authorization', `Bearer ${jockeyToken}`)
        .send({ status: 'COMPLETED' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('INVALID_TRANSITION');
    });

    it('should update booking status on COMPLETED pickup', async () => {
      const inProgressAssignment = { ...mockAssignment, status: 'AT_LOCATION' };
      mockedPrisma.jockeyAssignment.findFirst.mockResolvedValue(inProgressAssignment);
      mockedPrisma.jockeyAssignment.update.mockResolvedValue({
        ...inProgressAssignment,
        status: 'COMPLETED',
        completedAt: new Date(),
      });
      mockedPrisma.booking.findUnique.mockResolvedValue({
        id: 'booking-1',
        status: BookingStatus.PICKUP_ASSIGNED,
      });
      mockedPrisma.booking.update.mockResolvedValue({
        id: 'booking-1',
        status: BookingStatus.PICKED_UP,
      });

      const res = await request(app)
        .patch('/api/jockeys/assignments/assign-1/status')
        .set('Authorization', `Bearer ${jockeyToken}`)
        .send({ status: 'COMPLETED' });

      expect(res.status).toBe(200);
      expect(mockedPrisma.booking.update).toHaveBeenCalled();
    });

    it('should return 400 for invalid status value', async () => {
      const res = await request(app)
        .patch('/api/jockeys/assignments/assign-1/status')
        .set('Authorization', `Bearer ${jockeyToken}`)
        .send({ status: 'INVALID' });

      expect(res.status).toBe(400);
    });

    it('should return 404 for assignment not owned by jockey', async () => {
      mockedPrisma.jockeyAssignment.findFirst.mockResolvedValue(null);

      const res = await request(app)
        .patch('/api/jockeys/assignments/other-assign/status')
        .set('Authorization', `Bearer ${jockeyToken}`)
        .send({ status: 'EN_ROUTE' });

      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/jockeys/assignments/:id/complete', () => {
    it('should complete assignment with handover data', async () => {
      mockedPrisma.jockeyAssignment.findFirst.mockResolvedValue({
        ...mockAssignment,
        status: 'AT_LOCATION',
      });
      mockedPrisma.jockeyAssignment.update.mockResolvedValue({
        ...mockAssignment,
        status: 'COMPLETED',
        completedAt: new Date(),
      });
      mockedPrisma.booking.findUnique.mockResolvedValue({
        id: 'booking-1',
        status: BookingStatus.PICKUP_ASSIGNED,
      });
      mockedPrisma.booking.update.mockResolvedValue({
        id: 'booking-1',
        status: BookingStatus.PICKED_UP,
      });

      const res = await request(app)
        .post('/api/jockeys/assignments/assign-1/complete')
        .set('Authorization', `Bearer ${jockeyToken}`)
        .send({
          handoverData: {
            notes: 'Vehicle in good condition',
            photos: ['photo1.jpg'],
          },
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should complete without handover data', async () => {
      mockedPrisma.jockeyAssignment.findFirst.mockResolvedValue({
        ...mockAssignment,
        status: 'IN_PROGRESS',
      });
      mockedPrisma.jockeyAssignment.update.mockResolvedValue({
        ...mockAssignment,
        status: 'COMPLETED',
      });
      mockedPrisma.booking.findUnique.mockResolvedValue({
        id: 'booking-1',
        status: BookingStatus.PICKUP_ASSIGNED,
      });
      mockedPrisma.booking.update.mockResolvedValue({
        id: 'booking-1',
        status: BookingStatus.PICKED_UP,
      });

      const res = await request(app)
        .post('/api/jockeys/assignments/assign-1/complete')
        .set('Authorization', `Bearer ${jockeyToken}`)
        .send({});

      expect(res.status).toBe(200);
    });

    it('should return 404 for non-owned assignment', async () => {
      mockedPrisma.jockeyAssignment.findFirst.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/jockeys/assignments/other/complete')
        .set('Authorization', `Bearer ${jockeyToken}`)
        .send({});

      expect(res.status).toBe(404);
    });
  });
});
