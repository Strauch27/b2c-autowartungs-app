/**
 * Database Service Instance
 *
 * Singleton wrapper for PrismaClient to ensure single database connection.
 */

import { PrismaClient } from '@prisma/client';
import { prisma } from '../config/database';

export class DatabaseService {
  private static instance: DatabaseService;
  private prismaClient: PrismaClient;

  private constructor() {
    this.prismaClient = prisma;
  }

  /**
   * Get singleton instance
   */
  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  /**
   * Get Prisma client
   */
  getClient(): PrismaClient {
    return this.prismaClient;
  }

  /**
   * Disconnect from database
   */
  async disconnect(): Promise<void> {
    await this.prismaClient.$disconnect();
  }
}

// Export singleton instance
export const databaseService = DatabaseService.getInstance();
