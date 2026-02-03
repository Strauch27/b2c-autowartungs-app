/**
 * JWT Utility Functions
 * Handles JWT token generation and verification
 */

import jwt from 'jsonwebtoken';
import { JWTPayload, MagicLinkToken, TokenVerificationResult } from '../types/auth.types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const MAGIC_LINK_SECRET = process.env.MAGIC_LINK_SECRET || 'magic-link-secret-change-in-production';
const MAGIC_LINK_EXPIRES_IN = '15m';

/**
 * Generate JWT token for authenticated users
 */
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): TokenVerificationResult {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return {
      valid: true,
      payload: decoded
    };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Invalid token'
    };
  }
}

/**
 * Generate magic link token for customer authentication
 */
export function generateMagicLinkToken(email: string): string {
  const payload: MagicLinkToken = {
    email,
    type: 'magic_link',
    exp: Math.floor(Date.now() / 1000) + (15 * 60) // 15 minutes
  };

  return jwt.sign(payload, MAGIC_LINK_SECRET, {
    expiresIn: MAGIC_LINK_EXPIRES_IN
  });
}

/**
 * Verify magic link token
 */
export function verifyMagicLinkToken(token: string): { valid: boolean; email?: string; error?: string } {
  try {
    const decoded = jwt.verify(token, MAGIC_LINK_SECRET) as MagicLinkToken;

    if (decoded.type !== 'magic_link') {
      return {
        valid: false,
        error: 'Invalid token type'
      };
    }

    return {
      valid: true,
      email: decoded.email
    };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return {
        valid: false,
        error: 'Magic link has expired'
      };
    }
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Invalid magic link'
    };
  }
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(authHeader?: string): string | null {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}
