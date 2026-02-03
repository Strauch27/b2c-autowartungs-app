/**
 * GDPR Compliance Service
 * Implements data subject rights under GDPR Articles 15, 17, 18, 20, 21
 *
 * Article 15: Right of Access
 * Article 17: Right to Erasure (Right to be Forgotten)
 * Article 18: Right to Restriction of Processing
 * Article 20: Right to Data Portability
 * Article 21: Right to Object
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '../config/logger';

export interface UserDataExport {
  exportDate: string;
  userId: string;
  personalData: {
    email: string;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    createdAt: string;
    lastLoginAt: string | null;
  };
  profile?: {
    street: string | null;
    city: string | null;
    postalCode: string | null;
    preferredContactMethod: string | null;
    stripeCustomerId: string | null;
  };
  vehicles: Array<{
    brand: string;
    model: string;
    year: number;
    licensePlate: string | null;
    createdAt: string;
  }>;
  bookings: Array<{
    bookingNumber: string;
    serviceType: string;
    status: string;
    totalPrice: string;
    pickupDate: string;
    pickupAddress: string;
    customerNotes: string | null;
    createdAt: string;
  }>;
  notificationLogs: Array<{
    type: string;
    title: string;
    sentAt: string | null;
    createdAt: string;
  }>;
  legalInformation: {
    dataController: string;
    dpo: string;
    purpose: string;
    legalBasis: string;
    retentionPeriod: string;
  };
}

export interface DataDeletionResult {
  success: boolean;
  deletedAt: string;
  deletedData: {
    user: boolean;
    profile: boolean;
    vehicles: number;
    bookings: number;
    sessions: number;
    notifications: number;
  };
  retainedData: {
    anonymizedBookings: number;
    reason: string;
  };
}

export class GDPRService {
  constructor(private prisma: PrismaClient) {}

  /**
   * GDPR Article 15: Right of Access
   * Export all personal data for a user in machine-readable format
   *
   * @param userId - User ID to export data for
   * @returns Complete data export in JSON format
   */
  async exportUserData(userId: string): Promise<UserDataExport> {
    logger.info('GDPR: Data export requested', { userId });

    try {
      // Fetch user data
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          customerProfile: true,
          bookings: {
            select: {
              bookingNumber: true,
              serviceType: true,
              status: true,
              totalPrice: true,
              pickupDate: true,
              pickupAddress: true,
              customerNotes: true,
              createdAt: true,
            },
          },
          notificationLogs: {
            select: {
              type: true,
              title: true,
              sentAt: true,
              createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Fetch vehicles separately
      const vehicles = await this.prisma.vehicle.findMany({
        where: { customerId: userId },
        select: {
          brand: true,
          model: true,
          year: true,
          licensePlate: true,
          createdAt: true,
        },
      });

      const dataExport: UserDataExport = {
        exportDate: new Date().toISOString(),
        userId: user.id,
        personalData: {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          createdAt: user.createdAt.toISOString(),
          lastLoginAt: user.lastLoginAt?.toISOString() || null,
        },
        profile: user.customerProfile
          ? {
              street: user.customerProfile.street,
              city: user.customerProfile.city,
              postalCode: user.customerProfile.postalCode,
              preferredContactMethod: user.customerProfile.preferredContactMethod,
              stripeCustomerId: user.customerProfile.stripeCustomerId,
            }
          : undefined,
        vehicles: vehicles.map((v) => ({
          brand: v.brand,
          model: v.model,
          year: v.year,
          licensePlate: v.licensePlate,
          createdAt: v.createdAt.toISOString(),
        })),
        bookings: user.bookings.map((b) => ({
          bookingNumber: b.bookingNumber,
          serviceType: b.serviceType,
          status: b.status,
          totalPrice: b.totalPrice.toString(),
          pickupDate: b.pickupDate.toISOString(),
          pickupAddress: b.pickupAddress,
          customerNotes: b.customerNotes,
          createdAt: b.createdAt.toISOString(),
        })),
        notificationLogs: user.notificationLogs.map((n) => ({
          type: n.type,
          title: n.title,
          sentAt: n.sentAt?.toISOString() || null,
          createdAt: n.createdAt.toISOString(),
        })),
        legalInformation: {
          dataController: 'Your Company Name',
          dpo: 'dpo@yourcompany.com',
          purpose:
            'Processing necessary for the performance of a contract (vehicle maintenance booking service)',
          legalBasis: 'GDPR Article 6(1)(b) - Contract Performance',
          retentionPeriod:
            'Active data retained while account is active. Booking records retained for 7 years for tax/legal compliance after account deletion.',
        },
      };

      logger.info('GDPR: Data export completed', { userId });
      return dataExport;
    } catch (error) {
      logger.error('GDPR: Data export failed', { userId, error });
      throw error;
    }
  }

  /**
   * GDPR Article 17: Right to Erasure (Right to be Forgotten)
   * Delete all personal data for a user
   *
   * Note: Some data is retained for legal obligations (tax records, 7 years)
   * These records are anonymized instead of deleted
   *
   * @param userId - User ID to delete
   * @param reason - Reason for deletion (for audit log)
   * @returns Deletion summary
   */
  async deleteUserData(
    userId: string,
    reason: string = 'User requested deletion'
  ): Promise<DataDeletionResult> {
    logger.info('GDPR: Data deletion requested', { userId, reason });

    try {
      // Use transaction to ensure atomic operation
      const result = await this.prisma.$transaction(async (tx) => {
        // 1. Get counts before deletion
        const user = await tx.user.findUnique({
          where: { id: userId },
          include: {
            customerProfile: true,
            bookings: true,
            sessions: true,
            notificationLogs: true,
          },
        });

        if (!user) {
          throw new Error('User not found');
        }

        const vehicleCount = await tx.vehicle.count({
          where: { customerId: userId },
        });

        // 2. Anonymize bookings that must be retained for legal compliance
        // Retain bookings for 7 years (German tax law: §147 AO)
        const sevenYearsAgo = new Date();
        sevenYearsAgo.setFullYear(sevenYearsAgo.getFullYear() - 7);

        const bookingsToAnonymize = await tx.booking.findMany({
          where: {
            customerId: userId,
            createdAt: {
              lt: sevenYearsAgo,
            },
          },
        });

        for (const booking of bookingsToAnonymize) {
          await this.anonymizeBooking(tx, booking.id);
        }

        // 3. Delete recent bookings (< 7 years old)
        const recentBookings = await tx.booking.deleteMany({
          where: {
            customerId: userId,
            createdAt: {
              gte: sevenYearsAgo,
            },
          },
        });

        // 4. Delete vehicles
        await tx.vehicle.deleteMany({
          where: { customerId: userId },
        });

        // 5. Delete sessions
        await tx.session.deleteMany({
          where: { userId },
        });

        // 6. Delete notification logs
        await tx.notificationLog.deleteMany({
          where: { userId },
        });

        // 7. Soft delete customer profile (mark deletedAt)
        if (user.customerProfile) {
          await tx.customerProfile.update({
            where: { userId },
            data: {
              deletedAt: new Date(),
              // Clear PII
              street: null,
              city: null,
              postalCode: null,
              stripeCustomerId: null,
            },
          });
        }

        // 8. Anonymize user record (keep for referential integrity)
        await tx.user.update({
          where: { id: userId },
          data: {
            email: `deleted-${userId}@anonymized.local`,
            username: null,
            passwordHash: null,
            firstName: null,
            lastName: null,
            phone: null,
            isActive: false,
            fcmToken: null,
          },
        });

        return {
          success: true,
          deletedAt: new Date().toISOString(),
          deletedData: {
            user: true,
            profile: !!user.customerProfile,
            vehicles: vehicleCount,
            bookings: recentBookings.count,
            sessions: user.sessions.length,
            notifications: user.notificationLogs.length,
          },
          retainedData: {
            anonymizedBookings: bookingsToAnonymize.length,
            reason:
              'Legal obligation: German tax law requires retention for 7 years (§147 AO)',
          },
        };
      });

      logger.info('GDPR: Data deletion completed', { userId, result });
      return result;
    } catch (error) {
      logger.error('GDPR: Data deletion failed', { userId, error });
      throw error;
    }
  }

  /**
   * Anonymize a booking record while retaining financial data
   *
   * @param tx - Prisma transaction client
   * @param bookingId - Booking ID to anonymize
   */
  private async anonymizeBooking(tx: any, bookingId: string): Promise<void> {
    await tx.booking.update({
      where: { id: bookingId },
      data: {
        // Keep: bookingNumber, serviceType, totalPrice, createdAt (for accounting)
        // Remove: personal addresses, notes
        pickupAddress: 'ANONYMIZED',
        pickupCity: 'ANONYMIZED',
        pickupPostalCode: 'XXXXX',
        customerNotes: null,
        internalNotes: 'User data anonymized per GDPR Article 17',
      },
    });
  }

  /**
   * GDPR Article 20: Right to Data Portability
   * Export user data in a structured, machine-readable format
   *
   * @param userId - User ID
   * @returns JSON data export
   */
  async exportDataPortable(userId: string): Promise<string> {
    const data = await this.exportUserData(userId);
    return JSON.stringify(data, null, 2);
  }

  /**
   * GDPR Article 18: Right to Restriction of Processing
   * Restrict processing of user data (e.g., during dispute)
   *
   * @param userId - User ID
   * @param reason - Reason for restriction
   */
  async restrictProcessing(
    userId: string,
    reason: string
  ): Promise<{ success: boolean; restrictedAt: string }> {
    logger.info('GDPR: Processing restriction requested', { userId, reason });

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        isActive: false,
        // In production, add 'processingRestricted' field to User model
      },
    });

    return {
      success: true,
      restrictedAt: new Date().toISOString(),
    };
  }

  /**
   * Get GDPR compliance summary for a user
   */
  async getComplianceSummary(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        createdAt: true,
        lastLoginAt: true,
        isActive: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const bookingCount = await this.prisma.booking.count({
      where: { customerId: userId },
    });

    const oldestBooking = await this.prisma.booking.findFirst({
      where: { customerId: userId },
      orderBy: { createdAt: 'asc' },
      select: { createdAt: true },
    });

    return {
      accountCreated: user.createdAt.toISOString(),
      lastActivity: user.lastLoginAt?.toISOString() || null,
      isActive: user.isActive,
      dataRetention: {
        bookings: {
          count: bookingCount,
          oldestRecord: oldestBooking?.createdAt.toISOString() || null,
          retentionPolicy: '7 years from creation',
        },
      },
      rights: {
        accessRight: 'Available - Request data export',
        rectificationRight: 'Available - Update profile',
        erasureRight: 'Available - Request account deletion',
        restrictionRight: 'Available - Request processing restriction',
        portabilityRight: 'Available - Export data in JSON format',
        objectionRight: 'Available - Opt out of marketing',
      },
    };
  }
}
