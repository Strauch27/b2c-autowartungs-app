/**
 * Analytics Routes
 *
 * Provides endpoints for business intelligence and reporting.
 * All routes require admin authentication.
 */

import { Router } from 'express';
import {
  getBookingAnalytics,
  getRevenueAnalytics,
  getUserAnalytics,
  getPerformanceDashboard,
  getTopJockeys,
  getTopWorkshops,
  getCustomerLifetimeValue,
  getCohortAnalysis,
  exportAnalytics
} from '../controllers/analytics.controller';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/rbac';

const router = Router();

/**
 * All routes require authentication and admin role
 */
router.use(authenticate);
router.use(requireAdmin);

// ============================================================================
// CORE ANALYTICS ENDPOINTS
// ============================================================================

/**
 * GET /api/analytics/bookings
 * Get booking statistics and analytics
 *
 * Query params:
 * - startDate: ISO date string (optional) - Filter from this date
 * - endDate: ISO date string (optional) - Filter until this date
 * - serviceType: ServiceType enum (optional) - Filter by service type
 * - status: BookingStatus enum (optional) - Filter by booking status
 *
 * Response:
 * {
 *   success: true,
 *   data: {
 *     totalBookings: number,
 *     confirmedBookings: number,
 *     completedBookings: number,
 *     cancelledBookings: number,
 *     averageBookingValue: number,
 *     conversionRate: number,
 *     byServiceType: Record<ServiceType, number>,
 *     byStatus: Record<BookingStatus, number>
 *   }
 * }
 */
router.get('/bookings', getBookingAnalytics);

/**
 * GET /api/analytics/revenue
 * Get revenue statistics and analytics
 *
 * Query params:
 * - startDate: ISO date string (optional) - Filter from this date
 * - endDate: ISO date string (optional) - Filter until this date
 * - serviceType: ServiceType enum (optional) - Filter by service type
 *
 * Response:
 * {
 *   success: true,
 *   data: {
 *     totalRevenue: number,
 *     paidRevenue: number,
 *     pendingRevenue: number,
 *     averageOrderValue: number,
 *     revenueByServiceType: Record<ServiceType, number>,
 *     revenueByMonth: Array<{ month: string, revenue: number }>,
 *     revenueByDay: Array<{ day: string, revenue: number }>
 *   }
 * }
 */
router.get('/revenue', getRevenueAnalytics);

/**
 * GET /api/analytics/users
 * Get user metrics and analytics
 *
 * Query params:
 * - startDate: ISO date string (optional) - Filter from this date
 * - endDate: ISO date string (optional) - Filter until this date
 *
 * Response:
 * {
 *   success: true,
 *   data: {
 *     totalUsers: number,
 *     activeUsers: number,
 *     newUsersThisMonth: number,
 *     usersByRole: Record<UserRole, number>,
 *     retentionRate: number,
 *     churnRate: number
 *   }
 * }
 */
router.get('/users', getUserAnalytics);

/**
 * GET /api/analytics/performance
 * Get complete performance dashboard with all key metrics
 *
 * Query params:
 * - startDate: ISO date string (optional) - Filter from this date
 * - endDate: ISO date string (optional) - Filter until this date
 * - serviceType: ServiceType enum (optional) - Filter by service type
 *
 * Response:
 * {
 *   success: true,
 *   data: {
 *     bookings: BookingStatistics,
 *     revenue: RevenueStatistics,
 *     users: UserMetrics,
 *     topJockeys: Array<JockeyPerformance>,
 *     topWorkshops: Array<WorkshopPerformance>
 *   }
 * }
 */
router.get('/performance', getPerformanceDashboard);

// ============================================================================
// PERFORMANCE ENDPOINTS
// ============================================================================

/**
 * GET /api/analytics/jockeys/top
 * Get top performing jockeys
 *
 * Query params:
 * - limit: number (default: 10, max: 100) - Number of jockeys to return
 *
 * Response:
 * {
 *   success: true,
 *   data: Array<{
 *     jockeyId: string,
 *     name: string,
 *     completedBookings: number,
 *     rating: number
 *   }>
 * }
 */
router.get('/jockeys/top', getTopJockeys);

/**
 * GET /api/analytics/workshops/top
 * Get top performing workshops
 *
 * Query params:
 * - limit: number (default: 10, max: 100) - Number of workshops to return
 *
 * Response:
 * {
 *   success: true,
 *   data: Array<{
 *     workshopId: string,
 *     name: string,
 *     completedServices: number,
 *     utilizationRate: number
 *   }>
 * }
 */
router.get('/workshops/top', getTopWorkshops);

// ============================================================================
// ADVANCED ANALYTICS ENDPOINTS
// ============================================================================

/**
 * GET /api/analytics/customer/:customerId/lifetime-value
 * Get customer lifetime value (CLV)
 *
 * Response:
 * {
 *   success: true,
 *   data: {
 *     customerId: string,
 *     lifetimeValue: number
 *   }
 * }
 */
router.get('/customer/:customerId/lifetime-value', getCustomerLifetimeValue);

/**
 * GET /api/analytics/cohorts
 * Get cohort analysis (user retention by signup month)
 *
 * Query params:
 * - months: number (default: 12, max: 24) - Number of months to analyze
 *
 * Response:
 * {
 *   success: true,
 *   data: Array<{
 *     cohort: string,
 *     userCount: number,
 *     retentionRate: number
 *   }>
 * }
 */
router.get('/cohorts', getCohortAnalysis);

// ============================================================================
// EXPORT ENDPOINTS
// ============================================================================

/**
 * GET /api/analytics/export
 * Export analytics data as JSON
 *
 * Query params:
 * - type: 'bookings' | 'revenue' | 'users' (required) - Type of data to export
 * - startDate: ISO date string (optional) - Filter from this date
 * - endDate: ISO date string (optional) - Filter until this date
 *
 * Response:
 * Downloads JSON file with analytics data
 */
router.get('/export', exportAnalytics);

export default router;
