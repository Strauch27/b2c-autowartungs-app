/**
 * Authentication Types
 * Defines all type interfaces for the multi-portal authentication system
 */

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  JOCKEY = 'JOCKEY',
  WORKSHOP = 'WORKSHOP',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  email: string;
  username?: string;
  passwordHash?: string;
  role: UserRole;
  isActive: boolean;
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
