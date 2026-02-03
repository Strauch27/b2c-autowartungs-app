/**
 * Authentication Service
 * Handles authentication logic including password hashing, user validation, and token generation
 */

import bcrypt from 'bcryptjs';
import { User, UserRole, JWTPayload, LoginCredentials } from '../types/auth.types';
import { generateToken, generateMagicLinkToken } from '../utils/jwt';

const BCRYPT_SALT_ROUNDS = 10;

/**
 * Hash password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
}

/**
 * Compare password with hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * Password must be at least 8 characters
 */
export function isValidPassword(password: string): boolean {
  return password.length >= 8;
}

/**
 * Create JWT payload from user
 */
export function createJWTPayload(user: User): JWTPayload {
  return {
    userId: user.id,
    email: user.email,
    role: user.role
  };
}

/**
 * Generate authentication token for user
 */
export function generateAuthToken(user: User): string {
  const payload = createJWTPayload(user);
  return generateToken(payload);
}

/**
 * Generate magic link for customer authentication
 */
export function generateMagicLink(email: string, baseUrl: string): string {
  const token = generateMagicLinkToken(email);
  return `${baseUrl}/auth/customer/verify?token=${token}`;
}

/**
 * Validate login credentials format
 */
export function validateLoginCredentials(credentials: LoginCredentials): { valid: boolean; error?: string } {
  const { username, password } = credentials;

  if (!username || username.trim().length === 0) {
    return { valid: false, error: 'Username is required' };
  }

  if (!password || password.trim().length === 0) {
    return { valid: false, error: 'Password is required' };
  }

  return { valid: true };
}

/**
 * Check if user is active and can authenticate
 */
export function canUserAuthenticate(user: User): { canAuth: boolean; reason?: string } {
  if (!user.isActive) {
    return { canAuth: false, reason: 'Account is inactive' };
  }

  return { canAuth: true };
}

/**
 * Sanitize user data for response (remove sensitive fields)
 */
export function sanitizeUserForResponse(user: User): { id: string; email: string; role: UserRole } {
  return {
    id: user.id,
    email: user.email,
    role: user.role
  };
}
