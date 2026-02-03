/**
 * Database Service
 * Handles all database operations for authentication
 *
 * NOTE: This file requires Prisma to be set up with the User model.
 * Update the Prisma schema with the User model before using these functions.
 */

// import { PrismaClient } from '@prisma/client';
import { User, UserRole } from '../types/auth.types';

// const prisma = new PrismaClient();

/**
 * Find user by email
 */
export async function findUserByEmail(email: string): Promise<User | null> {
  // TODO: Implement with Prisma
  // return await prisma.user.findUnique({
  //   where: { email }
  // });

  throw new Error('Database not implemented. Please set up Prisma first.');
}

/**
 * Find user by username and role
 */
export async function findUserByUsername(username: string, role: UserRole): Promise<User | null> {
  // TODO: Implement with Prisma
  // return await prisma.user.findFirst({
  //   where: {
  //     username,
  //     role
  //   }
  // });

  throw new Error('Database not implemented. Please set up Prisma first.');
}

/**
 * Find user by ID
 */
export async function findUserById(id: string): Promise<User | null> {
  // TODO: Implement with Prisma
  // return await prisma.user.findUnique({
  //   where: { id }
  // });

  throw new Error('Database not implemented. Please set up Prisma first.');
}

/**
 * Create customer account
 */
export async function createCustomer(email: string): Promise<User> {
  // TODO: Implement with Prisma
  // return await prisma.user.create({
  //   data: {
  //     email,
  //     role: UserRole.CUSTOMER,
  //     isActive: true
  //   }
  // });

  throw new Error('Database not implemented. Please set up Prisma first.');
}

/**
 * Create jockey account
 */
export async function createJockey(username: string, email: string, passwordHash: string): Promise<User> {
  // TODO: Implement with Prisma
  // return await prisma.user.create({
  //   data: {
  //     username,
  //     email,
  //     passwordHash,
  //     role: UserRole.JOCKEY,
  //     isActive: true
  //   }
  // });

  throw new Error('Database not implemented. Please set up Prisma first.');
}

/**
 * Create workshop account
 */
export async function createWorkshop(username: string, email: string, passwordHash: string): Promise<User> {
  // TODO: Implement with Prisma
  // return await prisma.user.create({
  //   data: {
  //     username,
  //     email,
  //     passwordHash,
  //     role: UserRole.WORKSHOP,
  //     isActive: true
  //   }
  // });

  throw new Error('Database not implemented. Please set up Prisma first.');
}

/**
 * Update user's last login timestamp
 */
export async function updateLastLogin(userId: string): Promise<void> {
  // TODO: Implement with Prisma
  // await prisma.user.update({
  //   where: { id: userId },
  //   data: { lastLoginAt: new Date() }
  // });

  throw new Error('Database not implemented. Please set up Prisma first.');
}

/**
 * Deactivate user account
 */
export async function deactivateUser(userId: string): Promise<void> {
  // TODO: Implement with Prisma
  // await prisma.user.update({
  //   where: { id: userId },
  //   data: { isActive: false }
  // });

  throw new Error('Database not implemented. Please set up Prisma first.');
}

/**
 * Update user password
 */
export async function updatePassword(userId: string, passwordHash: string): Promise<void> {
  // TODO: Implement with Prisma
  // await prisma.user.update({
  //   where: { id: userId },
  //   data: { passwordHash }
  // });

  throw new Error('Database not implemented. Please set up Prisma first.');
}

// Export Prisma client for use in other services
// export { prisma };
