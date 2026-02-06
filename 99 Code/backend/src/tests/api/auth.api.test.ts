/**
 * Auth API Integration Tests
 *
 * Tests authentication endpoints using supertest.
 * Mocks Prisma to avoid database dependency.
 */

import request from 'supertest';
import { createApp } from '../../app';
import { UserRole } from '../../types/auth.types';
import { generateToken } from '../../utils/jwt';
import bcrypt from 'bcryptjs';

// Mock Prisma
jest.mock('../../config/database', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    booking: {
      update: jest.fn(),
    },
    $on: jest.fn(),
  },
}));

// Mock notification service
jest.mock('../../services/notification.service', () => ({
  sendNotification: jest.fn().mockResolvedValue(undefined),
  sendServiceExtension: jest.fn().mockResolvedValue(undefined),
}));

// Mock firebase
jest.mock('../../config/firebase', () => ({
  initializeFirebase: jest.fn(),
  isFirebaseConfigured: jest.fn().mockReturnValue(false),
}));

// Mock rate limiter
jest.mock('../../utils/rateLimiter', () => ({
  loginRateLimiter: (req: any, res: any, next: any) => next(),
  createRateLimiter: () => (req: any, res: any, next: any) => next(),
}));

import { prisma } from '../../config/database';

const mockedPrisma = prisma as jest.Mocked<typeof prisma>;
const app = createApp();

const TEST_PASSWORD = 'password123';
let hashedPassword: string;

beforeAll(async () => {
  hashedPassword = await bcrypt.hash(TEST_PASSWORD, 10);
});

describe('Auth API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/customer/login', () => {
    it('should login customer with valid credentials', async () => {
      (mockedPrisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'cust-1',
        email: 'kunde@test.de',
        passwordHash: hashedPassword,
        role: UserRole.CUSTOMER,
        isActive: true,
        firstName: 'Max',
        lastName: 'Mustermann',
      });

      const res = await request(app)
        .post('/api/auth/customer/login')
        .send({ email: 'kunde@test.de', password: TEST_PASSWORD });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe('kunde@test.de');
      expect(res.body.user.role).toBe(UserRole.CUSTOMER);
    });

    it('should return 401 for wrong password', async () => {
      (mockedPrisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'cust-1',
        email: 'kunde@test.de',
        passwordHash: hashedPassword,
        role: UserRole.CUSTOMER,
        isActive: true,
      });

      const res = await request(app)
        .post('/api/auth/customer/login')
        .send({ email: 'kunde@test.de', password: 'wrongpassword' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return 401 for non-existent user', async () => {
      (mockedPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .post('/api/auth/customer/login')
        .send({ email: 'nonexistent@test.de', password: 'password123' });

      expect(res.status).toBe(401);
    });

    it('should return 400 for invalid email format', async () => {
      const res = await request(app)
        .post('/api/auth/customer/login')
        .send({ email: 'not-an-email', password: 'password123' });

      expect(res.status).toBe(400);
    });

    it('should return 400 for missing password', async () => {
      const res = await request(app)
        .post('/api/auth/customer/login')
        .send({ email: 'test@test.de' });

      expect(res.status).toBe(400);
    });

    it('should return 403 for inactive user', async () => {
      (mockedPrisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'cust-1',
        email: 'inactive@test.de',
        passwordHash: hashedPassword,
        role: UserRole.CUSTOMER,
        isActive: false,
      });

      const res = await request(app)
        .post('/api/auth/customer/login')
        .send({ email: 'inactive@test.de', password: TEST_PASSWORD });

      expect(res.status).toBe(403);
    });
  });

  describe('POST /api/auth/jockey/login', () => {
    it('should login jockey with valid credentials', async () => {
      (mockedPrisma.user.findFirst as jest.Mock).mockResolvedValue({
        id: 'jock-1',
        email: 'jockey@test.de',
        username: 'jockey1',
        passwordHash: hashedPassword,
        role: UserRole.JOCKEY,
        isActive: true,
      });

      const res = await request(app)
        .post('/api/auth/jockey/login')
        .send({ username: 'jockey1', password: TEST_PASSWORD });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
    });

    it('should return 401 for wrong jockey credentials', async () => {
      (mockedPrisma.user.findFirst as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .post('/api/auth/jockey/login')
        .send({ username: 'wronguser', password: 'wrongpass' });

      expect(res.status).toBe(401);
    });

    it('should return 400 for missing username', async () => {
      const res = await request(app)
        .post('/api/auth/jockey/login')
        .send({ password: 'password123' });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/workshop/login', () => {
    it('should login workshop with valid credentials', async () => {
      (mockedPrisma.user.findFirst as jest.Mock).mockResolvedValue({
        id: 'work-1',
        email: 'werkstatt@test.de',
        username: 'werkstatt1',
        passwordHash: hashedPassword,
        role: UserRole.WORKSHOP,
        isActive: true,
      });

      const res = await request(app)
        .post('/api/auth/workshop/login')
        .send({ username: 'werkstatt1', password: TEST_PASSWORD });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
    });

    it('should return 401 for wrong workshop credentials', async () => {
      (mockedPrisma.user.findFirst as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .post('/api/auth/workshop/login')
        .send({ username: 'wrong', password: 'wrong' });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user for valid token', async () => {
      const token = generateToken({
        userId: 'cust-1',
        email: 'kunde@test.de',
        role: UserRole.CUSTOMER,
      });

      (mockedPrisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'cust-1',
        email: 'kunde@test.de',
        role: UserRole.CUSTOMER,
      });

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.email).toBe('kunde@test.de');
    });

    it('should return 401 without token', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.status).toBe(401);
    });

    it('should return 401 for invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should return success', async () => {
      const res = await request(app).post('/api/auth/logout');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
