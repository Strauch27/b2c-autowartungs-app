/**
 * Analytics Service
 *
 * Handles all analytics and metrics tracking for Business Intelligence.
 * Provides methods to track bookings, payments, user activity, and performance metrics.
 */

import { PrismaClient, Booking, BookingStatus, ServiceType, UserRole } from '@prisma/client';
import { DatabaseService } from './database.service.instance';
import { AnalyticsCacheService } from './analytics-cache.service';
import { logger } from '../config/logger';
import { ApiError } from '../middleware/errorHandler';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface BookingMetrics {
  bookingId: string;
  customerId: string;
  serviceType: ServiceType;
  totalPrice: number;
  status: BookingStatus;
  pickupDate: Date;
  createdAt: Date;
}

export interface PaymentMetrics {
  bookingId: string;
  customerId: string;
  amount: number;
  paymentIntentId: string;
  paidAt: Date;
}

export interface UserActivityMetrics {
  userId: string;
  action: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

export interface JockeyPerformanceMetrics {
  jockeyId: string;
  completedBookings: number;
  averageRating: number;
  totalRevenue: number;
  onTimeDeliveryRate: number;
}

export interface WorkshopPerformanceMetrics {
  workshopId: string;
  completedServices: number;
  averageServiceTime: number;
  capacity: number;
  utilizationRate: number;
}

export interface BookingStatistics {
  totalBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  averageBookingValue: number;
  conversionRate: number;
  byServiceType: Record<ServiceType, number>;
  byStatus: Record<BookingStatus, number>;
}

export interface RevenueStatistics {
  totalRevenue: number;
  paidRevenue: number;
  pendingRevenue: number;
  averageOrderValue: number;
  revenueByServiceType: Record<ServiceType, number>;
  revenueByMonth: Array<{ month: string; revenue: number }>;
  revenueByDay: Array<{ day: string; revenue: number }>;
}

export interface UserMetrics {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  usersByRole: Record<UserRole, number>;
  retentionRate: number;
  churnRate: number;
}

export interface PerformanceDashboard {
  bookings: BookingStatistics;
  revenue: RevenueStatistics;
  users: UserMetrics;
  topJockeys: Array<{
    jockeyId: string;
    name: string;
    completedBookings: number;
    rating: number;
  }>;
  topWorkshops: Array<{
    workshopId: string;
    name: string;
    completedServices: number;
    utilizationRate: number;
  }>;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface AnalyticsFilters {
  dateRange?: DateRange;
  serviceType?: ServiceType;
  status?: BookingStatus;
  customerId?: string;
  jockeyId?: string;
}

// ============================================================================
// ANALYTICS SERVICE
// ============================================================================

export class AnalyticsService {
  private db: PrismaClient;
  private cacheService: AnalyticsCacheService;

  constructor(databaseService: DatabaseService) {
    this.db = databaseService.getClient();
    this.cacheService = AnalyticsCacheService.getInstance();
  }

  // ==========================================================================
  // TRACKING METHODS
  // ==========================================================================

  /**
   * Track booking metrics
   * Logs booking creation and updates for analytics
   */
  async trackBooking(booking: Booking): Promise<void> {
    try {
      logger.info({
        event: 'booking_tracked',
        bookingId: booking.id,
        customerId: booking.customerId,
        serviceType: booking.serviceType,
        totalPrice: booking.totalPrice.toString(),
        status: booking.status,
        pickupDate: booking.pickupDate,
        createdAt: booking.createdAt
      });

      // In production, this would send to analytics platform (Mixpanel, Segment, etc.)
      // For now, we log to our structured logger
    } catch (error) {
      logger.error('Failed to track booking', { error, bookingId: booking.id });
    }
  }

  /**
   * Track payment metrics
   * Logs successful payments for revenue analytics
   */
  async trackPayment(payment: PaymentMetrics): Promise<void> {
    try {
      logger.info({
        event: 'payment_tracked',
        bookingId: payment.bookingId,
        customerId: payment.customerId,
        amount: payment.amount,
        paymentIntentId: payment.paymentIntentId,
        paidAt: payment.paidAt
      });
    } catch (error) {
      logger.error('Failed to track payment', { error, bookingId: payment.bookingId });
    }
  }

  /**
   * Track user activity
   * Logs user actions for behavior analysis
   */
  async trackUserActivity(userId: string, action: string, metadata?: Record<string, any>): Promise<void> {
    try {
      logger.info({
        event: 'user_activity_tracked',
        userId,
        action,
        metadata,
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Failed to track user activity', { error, userId, action });
    }
  }

  /**
   * Track jockey performance metrics
   */
  async trackJockeyPerformance(jockeyId: string, metrics: Partial<JockeyPerformanceMetrics>): Promise<void> {
    try {
      logger.info({
        event: 'jockey_performance_tracked',
        jockeyId,
        ...metrics
      });
    } catch (error) {
      logger.error('Failed to track jockey performance', { error, jockeyId });
    }
  }

  /**
   * Track workshop performance metrics
   */
  async trackWorkshopPerformance(workshopId: string, metrics: Partial<WorkshopPerformanceMetrics>): Promise<void> {
    try {
      logger.info({
        event: 'workshop_performance_tracked',
        workshopId,
        ...metrics
      });
    } catch (error) {
      logger.error('Failed to track workshop performance', { error, workshopId });
    }
  }

  // ==========================================================================
  // BOOKING ANALYTICS
  // ==========================================================================

  /**
   * Get booking statistics for a date range
   */
  async getBookingStatistics(filters: AnalyticsFilters = {}): Promise<BookingStatistics> {
    // Use cache for improved performance
    return this.cacheService.getBookingStatistics(filters, async () => {
      return this.fetchBookingStatistics(filters);
    });
  }

  /**
   * Internal method to fetch booking statistics (cacheable)
   */
  private async fetchBookingStatistics(filters: AnalyticsFilters = {}): Promise<BookingStatistics> {
    const { dateRange, serviceType, status } = filters;

    const where: any = {};

    if (dateRange) {
      where.createdAt = {
        gte: dateRange.startDate,
        lte: dateRange.endDate
      };
    }

    if (serviceType) {
      where.serviceType = serviceType;
    }

    if (status) {
      where.status = status;
    }

    // Get total bookings
    const totalBookings = await this.db.booking.count({ where });

    // Get bookings by status
    const confirmedBookings = await this.db.booking.count({
      where: { ...where, status: BookingStatus.CONFIRMED }
    });

    const completedBookings = await this.db.booking.count({
      where: { ...where, status: { in: [BookingStatus.COMPLETED, BookingStatus.DELIVERED] } }
    });

    const cancelledBookings = await this.db.booking.count({
      where: { ...where, status: BookingStatus.CANCELLED }
    });

    // Get average booking value
    const avgBookingValue = await this.db.booking.aggregate({
      where,
      _avg: { totalPrice: true }
    });

    // Get bookings by service type
    const bookingsByServiceType = await this.db.booking.groupBy({
      by: ['serviceType'],
      where,
      _count: { _all: true }
    });

    const byServiceType: Record<ServiceType, number> = {} as Record<ServiceType, number>;
    bookingsByServiceType.forEach(item => {
      byServiceType[item.serviceType] = item._count._all;
    });

    // Get bookings by status
    const bookingsByStatus = await this.db.booking.groupBy({
      by: ['status'],
      where,
      _count: { _all: true }
    });

    const byStatus: Record<BookingStatus, number> = {} as Record<BookingStatus, number>;
    bookingsByStatus.forEach(item => {
      byStatus[item.status] = item._count._all;
    });

    // Calculate conversion rate (completed / total)
    const conversionRate = totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0;

    return {
      totalBookings,
      confirmedBookings,
      completedBookings,
      cancelledBookings,
      averageBookingValue: Number(avgBookingValue._avg.totalPrice || 0),
      conversionRate,
      byServiceType,
      byStatus
    };
  }

  // ==========================================================================
  // REVENUE ANALYTICS
  // ==========================================================================

  /**
   * Get revenue statistics for a date range
   */
  async getRevenueStatistics(filters: AnalyticsFilters = {}): Promise<RevenueStatistics> {
    // Use cache for improved performance
    return this.cacheService.getRevenueStatistics(filters, async () => {
      return this.fetchRevenueStatistics(filters);
    });
  }

  /**
   * Internal method to fetch revenue statistics (cacheable)
   */
  private async fetchRevenueStatistics(filters: AnalyticsFilters = {}): Promise<RevenueStatistics> {
    const { dateRange, serviceType } = filters;

    const where: any = {};

    if (dateRange) {
      where.createdAt = {
        gte: dateRange.startDate,
        lte: dateRange.endDate
      };
    }

    if (serviceType) {
      where.serviceType = serviceType;
    }

    // Total revenue (all bookings)
    const totalRevenueResult = await this.db.booking.aggregate({
      where,
      _sum: { totalPrice: true }
    });

    // Paid revenue (only paid bookings)
    const paidRevenueResult = await this.db.booking.aggregate({
      where: {
        ...where,
        paidAt: { not: null }
      },
      _sum: { totalPrice: true }
    });

    // Pending revenue (unpaid bookings)
    const pendingRevenueResult = await this.db.booking.aggregate({
      where: {
        ...where,
        paidAt: null,
        status: { not: BookingStatus.CANCELLED }
      },
      _sum: { totalPrice: true }
    });

    // Average order value
    const avgOrderValue = await this.db.booking.aggregate({
      where: {
        ...where,
        paidAt: { not: null }
      },
      _avg: { totalPrice: true }
    });

    // Revenue by service type
    const revenueByServiceTypeData = await this.db.booking.groupBy({
      by: ['serviceType'],
      where: {
        ...where,
        paidAt: { not: null }
      },
      _sum: { totalPrice: true }
    });

    const revenueByServiceType: Record<ServiceType, number> = {} as Record<ServiceType, number>;
    revenueByServiceTypeData.forEach(item => {
      revenueByServiceType[item.serviceType] = Number(item._sum.totalPrice || 0);
    });

    // Revenue by month (last 12 months)
    const revenueByMonth = await this.getRevenueByMonth(dateRange);

    // Revenue by day (last 30 days)
    const revenueByDay = await this.getRevenueByDay(dateRange);

    return {
      totalRevenue: Number(totalRevenueResult._sum.totalPrice || 0),
      paidRevenue: Number(paidRevenueResult._sum.totalPrice || 0),
      pendingRevenue: Number(pendingRevenueResult._sum.totalPrice || 0),
      averageOrderValue: Number(avgOrderValue._avg.totalPrice || 0),
      revenueByServiceType,
      revenueByMonth,
      revenueByDay
    };
  }

  /**
   * Get revenue grouped by month
   */
  private async getRevenueByMonth(dateRange?: DateRange): Promise<Array<{ month: string; revenue: number }>> {
    const startDate = dateRange?.startDate || new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    const endDate = dateRange?.endDate || new Date();

    const bookings = await this.db.booking.findMany({
      where: {
        paidAt: { not: null },
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      select: {
        createdAt: true,
        totalPrice: true
      }
    });

    // Group by month
    const monthlyRevenue = new Map<string, number>();

    bookings.forEach(booking => {
      const monthKey = booking.createdAt.toISOString().substring(0, 7); // YYYY-MM
      const current = monthlyRevenue.get(monthKey) || 0;
      monthlyRevenue.set(monthKey, current + Number(booking.totalPrice));
    });

    return Array.from(monthlyRevenue.entries())
      .map(([month, revenue]) => ({ month, revenue }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  /**
   * Get revenue grouped by day
   */
  private async getRevenueByDay(dateRange?: DateRange): Promise<Array<{ day: string; revenue: number }>> {
    const startDate = dateRange?.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = dateRange?.endDate || new Date();

    const bookings = await this.db.booking.findMany({
      where: {
        paidAt: { not: null },
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      select: {
        createdAt: true,
        totalPrice: true
      }
    });

    // Group by day
    const dailyRevenue = new Map<string, number>();

    bookings.forEach(booking => {
      const dayKey = booking.createdAt.toISOString().substring(0, 10); // YYYY-MM-DD
      const current = dailyRevenue.get(dayKey) || 0;
      dailyRevenue.set(dayKey, current + Number(booking.totalPrice));
    });

    return Array.from(dailyRevenue.entries())
      .map(([day, revenue]) => ({ day, revenue }))
      .sort((a, b) => a.day.localeCompare(b.day));
  }

  // ==========================================================================
  // USER ANALYTICS
  // ==========================================================================

  /**
   * Get user metrics
   */
  async getUserMetrics(dateRange?: DateRange): Promise<UserMetrics> {
    // Use cache for improved performance
    const filters = dateRange ? { dateRange } : {};
    return this.cacheService.getUserMetrics(filters, async () => {
      return this.fetchUserMetrics(dateRange);
    });
  }

  /**
   * Internal method to fetch user metrics (cacheable)
   */
  private async fetchUserMetrics(dateRange?: DateRange): Promise<UserMetrics> {
    // Total users
    const totalUsers = await this.db.user.count({
      where: { isActive: true }
    });

    // Active users (logged in last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const activeUsers = await this.db.user.count({
      where: {
        isActive: true,
        lastLoginAt: { gte: thirtyDaysAgo }
      }
    });

    // New users this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const newUsersThisMonth = await this.db.user.count({
      where: {
        createdAt: { gte: startOfMonth }
      }
    });

    // Users by role
    const usersByRoleData = await this.db.user.groupBy({
      by: ['role'],
      where: { isActive: true },
      _count: { _all: true }
    });

    const usersByRole: Record<UserRole, number> = {} as Record<UserRole, number>;
    usersByRoleData.forEach(item => {
      usersByRole[item.role] = item._count._all;
    });

    // Retention rate (users who made a booking in last 30 days vs total users)
    const usersWithRecentBookings = await this.db.booking.findMany({
      where: {
        createdAt: { gte: thirtyDaysAgo }
      },
      distinct: ['customerId'],
      select: { customerId: true }
    });

    const retentionRate = totalUsers > 0
      ? (usersWithRecentBookings.length / totalUsers) * 100
      : 0;

    // Churn rate (inverse of retention)
    const churnRate = 100 - retentionRate;

    return {
      totalUsers,
      activeUsers,
      newUsersThisMonth,
      usersByRole,
      retentionRate,
      churnRate
    };
  }

  // ==========================================================================
  // PERFORMANCE ANALYTICS
  // ==========================================================================

  /**
   * Get complete performance dashboard
   */
  async getPerformanceDashboard(filters: AnalyticsFilters = {}): Promise<PerformanceDashboard> {
    // Use cache for improved performance
    return this.cacheService.getPerformanceDashboard(filters, async () => {
      return this.fetchPerformanceDashboard(filters);
    });
  }

  /**
   * Internal method to fetch performance dashboard (cacheable)
   */
  private async fetchPerformanceDashboard(filters: AnalyticsFilters = {}): Promise<PerformanceDashboard> {
    const bookings = await this.fetchBookingStatistics(filters);
    const revenue = await this.fetchRevenueStatistics(filters);
    const users = await this.fetchUserMetrics(filters.dateRange);
    const topJockeys = await this.fetchTopJockeys(5);
    const topWorkshops = await this.fetchTopWorkshops(5);

    return {
      bookings,
      revenue,
      users,
      topJockeys,
      topWorkshops
    };
  }

  /**
   * Get top performing jockeys
   */
  async getTopJockeys(limit = 10): Promise<Array<{
    jockeyId: string;
    name: string;
    completedBookings: number;
    rating: number;
  }>> {
    // Use cache for improved performance
    return this.cacheService.getTopPerformers('jockeys', limit, async () => {
      return this.fetchTopJockeys(limit);
    });
  }

  /**
   * Internal method to fetch top jockeys (cacheable)
   */
  private async fetchTopJockeys(limit = 10): Promise<Array<{
    jockeyId: string;
    name: string;
    completedBookings: number;
    rating: number;
  }>> {
    const jockeys = await this.db.user.findMany({
      where: {
        role: UserRole.JOCKEY,
        isActive: true
      },
      include: {
        jockeyProfile: true,
        jockeyAssignments: {
          where: {
            status: { in: [BookingStatus.COMPLETED, BookingStatus.DELIVERED] }
          }
        }
      },
      take: limit
    });

    return jockeys
      .map(jockey => ({
        jockeyId: jockey.id,
        name: `${jockey.firstName || ''} ${jockey.lastName || ''}`.trim() || jockey.email,
        completedBookings: jockey.jockeyAssignments.length,
        rating: jockey.jockeyProfile?.rating || 5.0
      }))
      .sort((a, b) => b.completedBookings - a.completedBookings);
  }

  /**
   * Get top performing workshops
   */
  async getTopWorkshops(limit = 10): Promise<Array<{
    workshopId: string;
    name: string;
    completedServices: number;
    utilizationRate: number;
  }>> {
    // Use cache for improved performance
    return this.cacheService.getTopPerformers('workshops', limit, async () => {
      return this.fetchTopWorkshops(limit);
    });
  }

  /**
   * Internal method to fetch top workshops (cacheable)
   */
  private async fetchTopWorkshops(limit = 10): Promise<Array<{
    workshopId: string;
    name: string;
    completedServices: number;
    utilizationRate: number;
  }>> {
    const workshops = await this.db.user.findMany({
      where: {
        role: UserRole.WORKSHOP,
        isActive: true
      },
      include: {
        workshopProfile: {
          include: {
            slots: {
              where: {
                date: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
              }
            }
          }
        }
      },
      take: limit
    });

    return workshops
      .map(workshop => {
        const totalSlots = workshop.workshopProfile?.slots.length || 0;
        const bookedSlots = workshop.workshopProfile?.slots.filter(
          slot => slot.currentBookings > 0
        ).length || 0;

        const utilizationRate = totalSlots > 0
          ? (bookedSlots / totalSlots) * 100
          : 0;

        return {
          workshopId: workshop.id,
          name: workshop.workshopProfile?.workshopName || workshop.email,
          completedServices: bookedSlots,
          utilizationRate
        };
      })
      .sort((a, b) => b.completedServices - a.completedServices);
  }

  // ==========================================================================
  // ADVANCED ANALYTICS
  // ==========================================================================

  /**
   * Get customer lifetime value (CLV)
   */
  async getCustomerLifetimeValue(customerId: string): Promise<number> {
    // Use cache for improved performance
    return this.cacheService.getCustomerLifetimeValue(customerId, async () => {
      return this.fetchCustomerLifetimeValue(customerId);
    });
  }

  /**
   * Internal method to fetch customer lifetime value (cacheable)
   */
  private async fetchCustomerLifetimeValue(customerId: string): Promise<number> {
    const result = await this.db.booking.aggregate({
      where: {
        customerId,
        paidAt: { not: null }
      },
      _sum: { totalPrice: true }
    });

    return Number(result._sum.totalPrice || 0);
  }

  /**
   * Get cohort analysis (users grouped by signup month)
   */
  async getCohortAnalysis(months = 12): Promise<Array<{
    cohort: string;
    userCount: number;
    retentionRate: number;
  }>> {
    // Use cache for improved performance
    return this.cacheService.getCohortAnalysis(months, async () => {
      return this.fetchCohortAnalysis(months);
    });
  }

  /**
   * Internal method to fetch cohort analysis (cacheable)
   */
  private async fetchCohortAnalysis(months = 12): Promise<Array<{
    cohort: string;
    userCount: number;
    retentionRate: number;
  }>> {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const users = await this.db.user.findMany({
      where: {
        createdAt: { gte: startDate }
      },
      include: {
        bookings: {
          select: {
            createdAt: true
          }
        }
      }
    });

    // Group users by signup month
    const cohorts = new Map<string, { users: Set<string>; retained: Set<string> }>();

    users.forEach(user => {
      const cohortMonth = user.createdAt.toISOString().substring(0, 7);

      if (!cohorts.has(cohortMonth)) {
        cohorts.set(cohortMonth, { users: new Set(), retained: new Set() });
      }

      const cohort = cohorts.get(cohortMonth)!;
      cohort.users.add(user.id);

      // Check if user made a booking in the last 30 days
      const hasRecentBooking = user.bookings.some(booking => {
        const daysSinceBooking = (Date.now() - booking.createdAt.getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceBooking <= 30;
      });

      if (hasRecentBooking) {
        cohort.retained.add(user.id);
      }
    });

    return Array.from(cohorts.entries())
      .map(([cohort, data]) => ({
        cohort,
        userCount: data.users.size,
        retentionRate: data.users.size > 0
          ? (data.retained.size / data.users.size) * 100
          : 0
      }))
      .sort((a, b) => a.cohort.localeCompare(b.cohort));
  }
}
