/**
 * Authentication Types
 * Defines all type interfaces for the multi-portal authentication system
 */

import { UserRole as PrismaUserRole } from '@prisma/client';

export type UserRole = PrismaUserRole;
export const UserRole = {
  CUSTOMER: 'CUSTOMER' as PrismaUserRole,
  JOCKEY: 'JOCKEY' as PrismaUserRole,
  WORKSHOP: 'WORKSHOP' as PrismaUserRole,
  ADMIN: 'ADMIN' as PrismaUserRole,
};

export interface User {
  id: string;
  email: string;
  username?: string | null;
  passwordHash?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  role: PrismaUserRole;
  isActive: boolean;
  lastLoginAt?: Date | null;
  fcmToken?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface MagicLinkToken {
  email: string;
  type: 'magic_link';
  exp: number;
}

export interface AuthRequest extends Request {
  user?: JWTPayload;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface MagicLinkRequest {
  email: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
  message?: string;
}

export interface TokenVerificationResult {
  valid: boolean;
  payload?: JWTPayload;
  error?: string;
}
