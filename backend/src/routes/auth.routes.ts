/**
 * Authentication Routes
 * Defines all authentication endpoints for the multi-portal system
 */

import { Router } from 'express';
import {
  loginCustomer,
  loginJockey,
  loginWorkshop,
  logout,
  getCurrentUser,
  registerCustomer
} from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { loginRateLimiter } from '../utils/rateLimiter';

const router = Router();

/**
 * Customer Authentication (Email/Password)
 */

// Register new customer
// POST /auth/customer/register
router.post('/customer/register', loginRateLimiter, registerCustomer);

// Login customer
// POST /auth/customer/login
router.post('/customer/login', loginRateLimiter, loginCustomer);

/**
 * Jockey Authentication (Username/Password)
 */

// Login jockey
// POST /auth/jockey/login
router.post('/jockey/login', loginRateLimiter, loginJockey);

/**
 * Workshop Authentication (Username/Password)
 */

// Login workshop
// POST /auth/workshop/login
router.post('/workshop/login', loginRateLimiter, loginWorkshop);

/**
 * Common Authentication Endpoints
 */

// Logout (client-side token removal)
// POST /auth/logout
router.post('/logout', logout);

// Get current authenticated user
// GET /auth/me
router.get('/me', authenticate, getCurrentUser);

export default router;
