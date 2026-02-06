/**
 * Test Setup Helper
 * Provides JWT token generation and utilities for integration tests
 */

import { generateToken } from '../utils/jwt';
import { UserRole, JWTPayload } from '../types/auth.types';

// Test user data
export const TEST_USERS = {
  customer: {
    userId: 'test-customer-id',
    email: 'kunde@test.de',
    role: UserRole.CUSTOMER,
  },
  jockey: {
    userId: 'test-jockey-id',
    email: 'jockey@test.de',
    role: UserRole.JOCKEY,
  },
  workshop: {
    userId: 'test-workshop-id',
    email: 'werkstatt@test.de',
    role: UserRole.WORKSHOP,
  },
  admin: {
    userId: 'test-admin-id',
    email: 'admin@test.de',
    role: UserRole.ADMIN,
  },
} as const;

/**
 * Generate a valid JWT token for a test role
 */
export function generateTestToken(role: keyof typeof TEST_USERS): string {
  const user = TEST_USERS[role];
  return generateToken({
    userId: user.userId,
    email: user.email,
    role: user.role,
  });
}

/**
 * Generate a JWT token from a custom payload
 */
export function generateCustomToken(payload: JWTPayload): string {
  return generateToken(payload);
}

/**
 * Get Authorization header value for a test role
 */
export function authHeader(role: keyof typeof TEST_USERS): string {
  return `Bearer ${generateTestToken(role)}`;
}
