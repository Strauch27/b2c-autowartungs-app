/**
 * Role-Based Access Control (RBAC) Middleware
 * Enforces role-based permissions for protected routes
 */

import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types/auth.types';

/**
 * Middleware to check if user has required role
 * Must be used after authenticate() middleware
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
      return;
    }

    next();
  };
}

/**
 * Middleware to check if user is a customer
 */
export function requireCustomer(req: Request, res: Response, next: NextFunction): void {
  requireRole(UserRole.CUSTOMER)(req, res, next);
}

/**
 * Middleware to check if user is a jockey
 */
export function requireJockey(req: Request, res: Response, next: NextFunction): void {
  requireRole(UserRole.JOCKEY)(req, res, next);
}

/**
 * Middleware to check if user is a workshop
 */
export function requireWorkshop(req: Request, res: Response, next: NextFunction): void {
  requireRole(UserRole.WORKSHOP)(req, res, next);
}

/**
 * Middleware to check if user is an admin
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  requireRole(UserRole.ADMIN)(req, res, next);
}

/**
 * Middleware to check if user is staff (jockey, workshop, or admin)
 */
export function requireStaff(req: Request, res: Response, next: NextFunction): void {
  requireRole(UserRole.JOCKEY, UserRole.WORKSHOP, UserRole.ADMIN)(req, res, next);
}

/**
 * Middleware to check if user can access their own resource
 * Compares user ID from token with resource owner ID
 */
export function requireOwnership(getUserIdFromResource: (req: Request) => string | undefined) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const resourceUserId = getUserIdFromResource(req);

    if (!resourceUserId) {
      res.status(400).json({
        success: false,
        message: 'Invalid resource'
      });
      return;
    }

    // Admin can access all resources
    if (req.user.role === UserRole.ADMIN) {
      next();
      return;
    }

    // User can only access their own resources
    if (req.user.userId !== resourceUserId) {
      res.status(403).json({
        success: false,
        message: 'You can only access your own resources'
      });
      return;
    }

    next();
  };
}
