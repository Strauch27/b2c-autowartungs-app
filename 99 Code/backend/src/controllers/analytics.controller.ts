/**
 * Analytics Controller
 *
 * Handles all analytics and reporting endpoints for admin users.
 */

import { Request, Response, NextFunction } from 'express';
import { AnalyticsService, AnalyticsFilters } from '../services/analytics.service';
import { DatabaseService } from '../services/database.service.instance';
import { ApiError } from '../middleware/errorHandler';
import { ServiceType, BookingStatus } from '@prisma/client';

// Initialize services
const databaseService = DatabaseService.getInstance();
const analyticsService = new AnalyticsService(databaseService);

/**
 * Parse date range from query parameters
 */
function parseDateRange(startDate?: string, endDate?: string) {
  if (!startDate || !endDate) {
    return undefined;
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new ApiError(400, 'Invalid date format. Use ISO 8601 format (YYYY-MM-DD)');
  }

  return { startDate: start, endDate: end };
}

/**
 * Parse analytics filters from query parameters
 */
function parseFilters(query: any): AnalyticsFilters {
  const filters: AnalyticsFilters = {};

  // Date range
  if (query.startDate && query.endDate) {
    filters.dateRange = parseDateRange(query.startDate, query.endDate);
  }

  // Service type
  if (query.serviceType && Object.values(ServiceType).includes(query.serviceType)) {
    filters.serviceType = query.serviceType as ServiceType;
  }

  // Status
  if (query.status && Object.values(BookingStatus).includes(query.status)) {
    filters.status = query.status as BookingStatus;
  }

  // Customer ID
  if (query.customerId) {
    filters.customerId = query.customerId;
  }

  // Jockey ID
  if (query.jockeyId) {
    filters.jockeyId = query.jockeyId;
  }

  return filters;
}

/**
 * GET /api/analytics/bookings
 * Get booking statistics and analytics
 *
 * Query params:
 * - startDate: ISO date string (optional)
 * - endDate: ISO date string (optional)
 * - serviceType: ServiceType enum (optional)
 * - status: BookingStatus enum (optional)
 */
export async function getBookingAnalytics(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const filters = parseFilters(req.query);
    const statistics = await analyticsService.getBookingStatistics(filters);

    res.json({
      success: true,
      data: statistics,
      filters
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/analytics/revenue
 * Get revenue statistics and analytics
 *
 * Query params:
 * - startDate: ISO date string (optional)
 * - endDate: ISO date string (optional)
 * - serviceType: ServiceType enum (optional)
 */
export async function getRevenueAnalytics(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const filters = parseFilters(req.query);
    const statistics = await analyticsService.getRevenueStatistics(filters);

    res.json({
      success: true,
      data: statistics,
      filters
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/analytics/users
 * Get user metrics and analytics
 *
 * Query params:
 * - startDate: ISO date string (optional)
 * - endDate: ISO date string (optional)
 */
export async function getUserAnalytics(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const dateRange = parseDateRange(req.query.startDate as string, req.query.endDate as string);
    const metrics = await analyticsService.getUserMetrics(dateRange);

    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/analytics/performance
 * Get complete performance dashboard
 *
 * Query params:
 * - startDate: ISO date string (optional)
 * - endDate: ISO date string (optional)
 * - serviceType: ServiceType enum (optional)
 */
export async function getPerformanceDashboard(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const filters = parseFilters(req.query);
    const dashboard = await analyticsService.getPerformanceDashboard(filters);

    res.json({
      success: true,
      data: dashboard,
      filters
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/analytics/jockeys/top
 * Get top performing jockeys
 *
 * Query params:
 * - limit: number (default: 10)
 */
export async function getTopJockeys(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const limitQuery = Array.isArray(req.query.limit) ? req.query.limit[0] : req.query.limit;
    const limit = limitQuery ? parseInt(limitQuery as string, 10) : 10;

    if (isNaN(limit) || limit < 1 || limit > 100) {
      throw new ApiError(400, 'Limit must be between 1 and 100');
    }

    const jockeys = await analyticsService.getTopJockeys(limit);

    res.json({
      success: true,
      data: jockeys
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/analytics/workshops/top
 * Get top performing workshops
 *
 * Query params:
 * - limit: number (default: 10)
 */
export async function getTopWorkshops(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const limitQuery = Array.isArray(req.query.limit) ? req.query.limit[0] : req.query.limit;
    const limit = limitQuery ? parseInt(limitQuery as string, 10) : 10;

    if (isNaN(limit) || limit < 1 || limit > 100) {
      throw new ApiError(400, 'Limit must be between 1 and 100');
    }

    const workshops = await analyticsService.getTopWorkshops(limit);

    res.json({
      success: true,
      data: workshops
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/analytics/customer/:customerId/lifetime-value
 * Get customer lifetime value
 */
export async function getCustomerLifetimeValue(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { customerId } = req.params;

    if (!customerId) {
      throw new ApiError(400, 'Customer ID is required');
    }

    const clv = await analyticsService.getCustomerLifetimeValue(customerId);

    res.json({
      success: true,
      data: {
        customerId,
        lifetimeValue: clv
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/analytics/cohorts
 * Get cohort analysis
 *
 * Query params:
 * - months: number (default: 12)
 */
export async function getCohortAnalysis(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const monthsQuery = Array.isArray(req.query.months) ? req.query.months[0] : req.query.months;
    const months = monthsQuery ? parseInt(monthsQuery as string, 10) : 12;

    if (isNaN(months) || months < 1 || months > 24) {
      throw new ApiError(400, 'Months must be between 1 and 24');
    }

    const cohorts = await analyticsService.getCohortAnalysis(months);

    res.json({
      success: true,
      data: cohorts
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/analytics/export
 * Export analytics data as CSV
 *
 * Query params:
 * - type: 'bookings' | 'revenue' | 'users' (required)
 * - startDate: ISO date string (optional)
 * - endDate: ISO date string (optional)
 */
export async function exportAnalytics(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { type } = req.query;

    if (!type || !['bookings', 'revenue', 'users'].includes(type as string)) {
      throw new ApiError(400, 'Invalid export type. Must be: bookings, revenue, or users');
    }

    const filters = parseFilters(req.query);

    let data: any;
    let filename: string;

    switch (type) {
      case 'bookings':
        data = await analyticsService.getBookingStatistics(filters);
        filename = 'bookings-analytics.json';
        break;
      case 'revenue':
        data = await analyticsService.getRevenueStatistics(filters);
        filename = 'revenue-analytics.json';
        break;
      case 'users':
        data = await analyticsService.getUserMetrics(filters.dateRange);
        filename = 'user-analytics.json';
        break;
      default:
        throw new ApiError(400, 'Invalid export type');
    }

    // Set headers for file download
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    res.json({
      success: true,
      data,
      exportedAt: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
}
