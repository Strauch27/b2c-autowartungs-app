/**
 * Auth & RBAC Middleware Unit Tests
 */

import { Request, Response, NextFunction } from 'express';
import { authenticate, optionalAuthenticate, requireAuth } from '../auth';
import { requireRole, requireCustomer, requireJockey, requireWorkshop, requireAdmin, requireStaff, requireOwnership } from '../rbac';
import { generateToken } from '../../utils/jwt';
import { UserRole, JWTPayload } from '../../types/auth.types';

// Helper to create mock req/res/next
function createMocks(overrides: Partial<Request> = {}) {
  const req = {
    headers: {},
    user: undefined,
    ...overrides,
  } as unknown as Request;

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as Response;

  const next = jest.fn() as NextFunction;

  return { req, res, next };
}

function makeToken(payload: JWTPayload): string {
  return generateToken(payload);
}

const customerPayload: JWTPayload = {
  userId: 'cust-1',
  email: 'cust@test.de',
  role: UserRole.CUSTOMER,
};

const jockeyPayload: JWTPayload = {
  userId: 'jock-1',
  email: 'jock@test.de',
  role: UserRole.JOCKEY,
};

const workshopPayload: JWTPayload = {
  userId: 'work-1',
  email: 'work@test.de',
  role: UserRole.WORKSHOP,
};

const adminPayload: JWTPayload = {
  userId: 'admin-1',
  email: 'admin@test.de',
  role: UserRole.ADMIN,
};

describe('authenticate middleware', () => {
  it('should attach user to req for valid token', () => {
    const token = makeToken(customerPayload);
    const { req, res, next } = createMocks({
      headers: { authorization: `Bearer ${token}` } as any,
    });

    authenticate(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
    expect(req.user!.userId).toBe('cust-1');
    expect(req.user!.role).toBe(UserRole.CUSTOMER);
  });

  it('should return 401 for missing token', () => {
    const { req, res, next } = createMocks();

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
    }));
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 for invalid token', () => {
    const { req, res, next } = createMocks({
      headers: { authorization: 'Bearer invalidtoken123' } as any,
    });

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 for malformed authorization header', () => {
    const { req, res, next } = createMocks({
      headers: { authorization: 'NotBearer token' } as any,
    });

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('should return 401 for expired token', () => {
    // Create a token that's already expired
    const jwt = require('jsonwebtoken');
    const expiredToken = jwt.sign(
      { userId: 'u1', email: 'e@e.de', role: 'CUSTOMER' },
      process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      { expiresIn: '-1s' }
    );

    const { req, res, next } = createMocks({
      headers: { authorization: `Bearer ${expiredToken}` } as any,
    });

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});

describe('optionalAuthenticate middleware', () => {
  it('should attach user if valid token present', () => {
    const token = makeToken(jockeyPayload);
    const { req, res, next } = createMocks({
      headers: { authorization: `Bearer ${token}` } as any,
    });

    optionalAuthenticate(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
    expect(req.user!.role).toBe(UserRole.JOCKEY);
  });

  it('should call next without user if no token', () => {
    const { req, res, next } = createMocks();

    optionalAuthenticate(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toBeUndefined();
  });

  it('should call next without user if invalid token', () => {
    const { req, res, next } = createMocks({
      headers: { authorization: 'Bearer badtoken' } as any,
    });

    optionalAuthenticate(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toBeUndefined();
  });
});

describe('requireAuth middleware', () => {
  it('should call next if user is present', () => {
    const { req, res, next } = createMocks();
    req.user = customerPayload;

    requireAuth(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('should return 401 if no user', () => {
    const { req, res, next } = createMocks();

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});

describe('RBAC middleware', () => {
  describe('requireRole', () => {
    it('should allow matching role', () => {
      const { req, res, next } = createMocks();
      req.user = customerPayload;

      requireRole(UserRole.CUSTOMER)(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should allow multiple matching roles', () => {
      const { req, res, next } = createMocks();
      req.user = jockeyPayload;

      requireRole(UserRole.JOCKEY, UserRole.ADMIN)(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should return 403 for wrong role', () => {
      const { req, res, next } = createMocks();
      req.user = customerPayload;

      requireRole(UserRole.WORKSHOP)(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if no user', () => {
      const { req, res, next } = createMocks();

      requireRole(UserRole.CUSTOMER)(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
    });
  });

  describe('requireCustomer', () => {
    it('should allow CUSTOMER role', () => {
      const { req, res, next } = createMocks();
      req.user = customerPayload;

      requireCustomer(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should reject JOCKEY role', () => {
      const { req, res, next } = createMocks();
      req.user = jockeyPayload;

      requireCustomer(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
    });
  });

  describe('requireJockey', () => {
    it('should allow JOCKEY role', () => {
      const { req, res, next } = createMocks();
      req.user = jockeyPayload;

      requireJockey(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should reject CUSTOMER role', () => {
      const { req, res, next } = createMocks();
      req.user = customerPayload;

      requireJockey(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
    });
  });

  describe('requireWorkshop', () => {
    it('should allow WORKSHOP role', () => {
      const { req, res, next } = createMocks();
      req.user = workshopPayload;

      requireWorkshop(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should reject CUSTOMER role', () => {
      const { req, res, next } = createMocks();
      req.user = customerPayload;

      requireWorkshop(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
    });
  });

  describe('requireAdmin', () => {
    it('should allow ADMIN role', () => {
      const { req, res, next } = createMocks();
      req.user = adminPayload;

      requireAdmin(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should reject WORKSHOP role', () => {
      const { req, res, next } = createMocks();
      req.user = workshopPayload;

      requireAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
    });
  });

  describe('requireStaff', () => {
    it('should allow JOCKEY', () => {
      const { req, res, next } = createMocks();
      req.user = jockeyPayload;

      requireStaff(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should allow WORKSHOP', () => {
      const { req, res, next } = createMocks();
      req.user = workshopPayload;

      requireStaff(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should allow ADMIN', () => {
      const { req, res, next } = createMocks();
      req.user = adminPayload;

      requireStaff(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should reject CUSTOMER', () => {
      const { req, res, next } = createMocks();
      req.user = customerPayload;

      requireStaff(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
    });
  });

  describe('requireOwnership', () => {
    const getUserId = (req: Request) => (req.params as any)?.userId as string | undefined;

    it('should allow access to own resource', () => {
      const { req, res, next } = createMocks();
      req.user = customerPayload;
      (req as any).params = { userId: 'cust-1' };

      requireOwnership(getUserId)(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should deny access to other user resource', () => {
      const { req, res, next } = createMocks();
      req.user = customerPayload;
      (req as any).params = { userId: 'other-user' };

      requireOwnership(getUserId)(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('should allow ADMIN to access any resource', () => {
      const { req, res, next } = createMocks();
      req.user = adminPayload;
      (req as any).params = { userId: 'other-user' };

      requireOwnership(getUserId)(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should return 401 if no user', () => {
      const { req, res, next } = createMocks();
      (req as any).params = { userId: 'some-user' };

      requireOwnership(getUserId)(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should return 400 if resource user ID is undefined', () => {
      const { req, res, next } = createMocks();
      req.user = customerPayload;
      (req as any).params = {};

      requireOwnership(getUserId)(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});
