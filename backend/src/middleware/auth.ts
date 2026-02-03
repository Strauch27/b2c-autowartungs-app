/**
 * Authentication Middleware
 * Verifies JWT tokens and attaches user data to requests
 */

import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractTokenFromHeader } from '../utils/jwt';
import { JWTPayload } from '../types/auth.types';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

/**
 * Middleware to verify JWT token
 * Attaches decoded user data to req.user if token is valid
 */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = extractTokenFromHeader(authHeader);

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'No authentication token provided'
    });
    return;
  }

  const result = verifyToken(token);

  if (!result.valid || !result.payload) {
    res.status(401).json({
      success: false,
      message: result.error || 'Invalid authentication token'
    });
    return;
  }

  // Attach user data to request
  req.user = result.payload;
  next();
}

/**
 * Optional authentication middleware
 * Attaches user data if token is present, but doesn't require it
 */
export function optionalAuthenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = extractTokenFromHeader(authHeader);

  if (!token) {
    next();
    return;
  }

  const result = verifyToken(token);

  if (result.valid && result.payload) {
    req.user = result.payload;
  }

  next();
}

/**
 * Middleware to check if user is authenticated
 * Use this after authenticate() to ensure user is present
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
    return;
  }

  next();
}
