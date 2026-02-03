/**
 * Authentication Controller
 * Handles all authentication-related requests
 */

import { Request, Response } from 'express';
import {
  isValidEmail,
  comparePassword,
  validateLoginCredentials,
  canUserAuthenticate,
  generateAuthToken,
  sanitizeUserForResponse,
  hashPassword
} from '../services/auth.service';
import { UserRole, LoginCredentials } from '../types/auth.types';
import { prisma } from '../config/database';

/**
 * Login customer with email/password
 * POST /auth/customer/login
 */
export async function loginCustomer(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    // Validate email format
    if (!email || !isValidEmail(email)) {
      res.status(400).json({
        success: false,
        message: 'Valid email address is required'
      });
      return;
    }

    // Validate password
    if (!password || password.length < 6) {
      res.status(400).json({
        success: false,
        message: 'Password is required and must be at least 6 characters'
      });
      return;
    }

    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.passwordHash || user.role !== UserRole.CUSTOMER) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
      return;
    }

    // Verify password
    const passwordValid = await comparePassword(password, user.passwordHash);

    if (!passwordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
      return;
    }

    // Verify user can authenticate
    const authCheck = canUserAuthenticate(user);
    if (!authCheck.canAuth) {
      res.status(403).json({
        success: false,
        message: authCheck.reason || 'Cannot authenticate'
      });
      return;
    }

    // Generate JWT token
    const authToken = generateAuthToken(user);

    res.status(200).json({
      success: true,
      token: authToken,
      user: sanitizeUserForResponse(user)
    });
  } catch (error) {
    console.error('Error logging in customer:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
}

/**
 * Login jockey with username/password
 * POST /auth/jockey/login
 */
export async function loginJockey(req: Request, res: Response): Promise<void> {
  await loginWithCredentials(req, res, UserRole.JOCKEY);
}

/**
 * Login workshop with username/password
 * POST /auth/workshop/login
 */
export async function loginWorkshop(req: Request, res: Response): Promise<void> {
  await loginWithCredentials(req, res, UserRole.WORKSHOP);
}

/**
 * Generic login function for username/password authentication
 */
async function loginWithCredentials(req: Request, res: Response, role: UserRole): Promise<void> {
  try {
    const credentials: LoginCredentials = req.body;

    // Validate credentials format
    const validation = validateLoginCredentials(credentials);
    if (!validation.valid) {
      res.status(400).json({
        success: false,
        message: validation.error
      });
      return;
    }

    // Find user by username and role
    const user = await prisma.user.findFirst({
      where: {
        username: credentials.username,
        role: role.toUpperCase() as any,
      },
    });

    if (!user || !user.passwordHash) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
      return;
    }

    // Verify password
    const passwordValid = await comparePassword(credentials.password, user.passwordHash);

    if (!passwordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
      return;
    }

    // Verify user can authenticate
    const authCheck = canUserAuthenticate(user);
    if (!authCheck.canAuth) {
      res.status(403).json({
        success: false,
        message: authCheck.reason || 'Cannot authenticate'
      });
      return;
    }

    // Generate JWT token
    const authToken = generateAuthToken(user);

    res.status(200).json({
      success: true,
      token: authToken,
      user: sanitizeUserForResponse(user)
    });
  } catch (error) {
    console.error(`Error logging in ${role}:`, error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
}

/**
 * Logout user (client-side token removal)
 * POST /auth/logout
 */
export async function logout(req: Request, res: Response): Promise<void> {
  // With JWT, logout is primarily client-side (remove token)
  // Optionally, implement token blacklist for additional security

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
}

/**
 * Get current user info
 * GET /auth/me
 */
export async function getCurrentUser(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
      return;
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: req.user.email }
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      user: sanitizeUserForResponse(user)
    });
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user data'
    });
  }
}

/**
 * Register new customer account
 * POST /auth/customer/register
 */
export async function registerCustomer(req: Request, res: Response): Promise<void> {
  try {
    const { email, password, firstName, lastName, phone, bookingId } = req.body;

    // Validate required fields
    if (!email || !isValidEmail(email)) {
      res.status(400).json({
        success: false,
        message: 'Valid email address is required'
      });
      return;
    }

    if (!password || password.length < 8) {
      res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters'
      });
      return;
    }

    if (!firstName || !lastName) {
      res.status(400).json({
        success: false,
        message: 'First name and last name are required'
      });
      return;
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'An account with this email already exists'
      });
      return;
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user with customer profile
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        phone,
        role: UserRole.CUSTOMER,
        isActive: true,
        customerProfile: {
          create: {}
        }
      },
      include: {
        customerProfile: true
      }
    });

    // If bookingId is provided, link the booking to this customer
    if (bookingId) {
      await prisma.booking.update({
        where: { id: bookingId },
        data: { customerId: user.id }
      });
    }

    // Generate JWT token
    const authToken = generateAuthToken(user);

    res.status(201).json({
      success: true,
      token: authToken,
      user: sanitizeUserForResponse(user),
      message: 'Account created successfully'
    });
  } catch (error) {
    console.error('Error registering customer:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed'
    });
  }
}
