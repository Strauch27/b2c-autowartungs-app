/**
 * Analytics Integration Examples
 *
 * Demonstrates how to integrate analytics tracking into your application.
 */

import { AnalyticsService } from '../services/analytics.service';
import { DatabaseService } from '../services/database.service.instance';
import { invalidateCacheOnBookingUpdate } from '../services/analytics-cache.service';
import { Booking, BookingStatus } from '@prisma/client';

// Initialize services
const databaseService = DatabaseService.getInstance();
const analyticsService = new AnalyticsService(databaseService);
const cacheInvalidator = invalidateCacheOnBookingUpdate();

// ============================================================================
// EXAMPLE 1: Track Booking Creation
// ============================================================================

async function onBookingCreated(booking: Booking) {
  // Track the booking for analytics
  await analyticsService.trackBooking(booking);

  // Invalidate relevant caches
  cacheInvalidator.onBookingCreated();

  console.log('Booking tracked and caches invalidated');
}

// ============================================================================
// EXAMPLE 2: Track Booking Status Update
// ============================================================================

async function onBookingStatusUpdated(booking: Booking) {
  // Track the booking update
  await analyticsService.trackBooking(booking);

  // Track user activity
  await analyticsService.trackUserActivity(
    booking.customerId,
    'booking_status_updated',
    {
      bookingId: booking.id,
      oldStatus: booking.status,
      newStatus: booking.status
    }
  );

  // Invalidate caches
  cacheInvalidator.onBookingUpdated();
}

// ============================================================================
// EXAMPLE 3: Track Payment Completion
// ============================================================================

async function onPaymentCompleted(
  bookingId: string,
  customerId: string,
  amount: number,
  paymentIntentId: string
) {
  // Track payment
  await analyticsService.trackPayment({
    bookingId,
    customerId,
    amount,
    paymentIntentId,
    paidAt: new Date()
  });

  // Track user activity
  await analyticsService.trackUserActivity(
    customerId,
    'payment_completed',
    {
      bookingId,
      amount,
      paymentIntentId
    }
  );

  // Invalidate caches
  cacheInvalidator.onPaymentCompleted();
}

// ============================================================================
// EXAMPLE 4: Track Jockey Assignment
// ============================================================================

async function onJockeyAssigned(bookingId: string, jockeyId: string) {
  // Track user activity
  await analyticsService.trackUserActivity(
    jockeyId,
    'jockey_assigned',
    { bookingId }
  );

  // Invalidate caches
  cacheInvalidator.onBookingUpdated();
}

// ============================================================================
// EXAMPLE 5: Track Service Completion
// ============================================================================

async function onServiceCompleted(booking: Booking) {
  // Track booking completion
  await analyticsService.trackBooking(booking);

  // Track jockey performance
  if (booking.jockeyId) {
    await analyticsService.trackJockeyPerformance(booking.jockeyId, {
      completedBookings: 1,
      averageRating: 5.0,
      totalRevenue: Number(booking.totalPrice),
      onTimeDeliveryRate: 100.0
    });
  }

  // Track user activity
  await analyticsService.trackUserActivity(
    booking.customerId,
    'service_completed',
    {
      bookingId: booking.id,
      serviceType: booking.serviceType,
      totalPrice: Number(booking.totalPrice)
    }
  );

  // Invalidate caches
  cacheInvalidator.onBookingUpdated();
}

// ============================================================================
// EXAMPLE 6: Fetch Analytics for Dashboard
// ============================================================================

async function fetchDashboardData(startDate?: Date, endDate?: Date) {
  // Get performance dashboard with date range
  const dashboard = await analyticsService.getPerformanceDashboard({
    dateRange: startDate && endDate
      ? {
          startDate,
          endDate
        }
      : undefined
  });

  console.log('Dashboard Data:', {
    totalBookings: dashboard.bookings.totalBookings,
    totalRevenue: dashboard.revenue.totalRevenue,
    activeUsers: dashboard.users.activeUsers,
    topJockeys: dashboard.topJockeys.length,
    topWorkshops: dashboard.topWorkshops.length
  });

  return dashboard;
}

// ============================================================================
// EXAMPLE 7: Generate Monthly Report
// ============================================================================

async function generateMonthlyReport(year: number, month: number) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  // Get all analytics for the month
  const [bookings, revenue, users] = await Promise.all([
    analyticsService.getBookingStatistics({
      dateRange: { startDate, endDate }
    }),
    analyticsService.getRevenueStatistics({
      dateRange: { startDate, endDate }
    }),
    analyticsService.getUserMetrics({ startDate, endDate })
  ]);

  const report = {
    period: `${year}-${month.toString().padStart(2, '0')}`,
    summary: {
      totalBookings: bookings.totalBookings,
      completedBookings: bookings.completedBookings,
      conversionRate: bookings.conversionRate,
      totalRevenue: revenue.totalRevenue,
      paidRevenue: revenue.paidRevenue,
      averageOrderValue: revenue.averageOrderValue,
      activeUsers: users.activeUsers,
      newUsers: users.newUsersThisMonth,
      retentionRate: users.retentionRate
    },
    bookingsByServiceType: bookings.byServiceType,
    revenueByServiceType: revenue.revenueByServiceType
  };

  console.log('Monthly Report:', report);
  return report;
}

// ============================================================================
// EXAMPLE 8: Track User Registration
// ============================================================================

async function onUserRegistered(userId: string, role: string) {
  // Track user activity
  await analyticsService.trackUserActivity(
    userId,
    'user_registered',
    { role }
  );

  // Invalidate user caches
  cacheInvalidator.onUserRegistered();
}

// ============================================================================
// EXAMPLE 9: Calculate Customer Value
// ============================================================================

async function calculateCustomerValue(customerId: string) {
  // Get customer lifetime value
  const clv = await analyticsService.getCustomerLifetimeValue(customerId);

  console.log(`Customer ${customerId} Lifetime Value: €${clv.toFixed(2)}`);
  return clv;
}

// ============================================================================
// EXAMPLE 10: Analyze Top Performers
// ============================================================================

async function analyzeTopPerformers() {
  const [topJockeys, topWorkshops] = await Promise.all([
    analyticsService.getTopJockeys(10),
    analyticsService.getTopWorkshops(10)
  ]);

  console.log('Top Jockeys:', topJockeys);
  console.log('Top Workshops:', topWorkshops);

  return { topJockeys, topWorkshops };
}

// ============================================================================
// EXAMPLE 11: Real-time KPI Monitoring
// ============================================================================

async function monitorKPIs() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const dashboard = await analyticsService.getPerformanceDashboard({
    dateRange: {
      startDate: thirtyDaysAgo,
      endDate: new Date()
    }
  });

  // Define KPI thresholds
  const kpis = {
    conversionRate: {
      value: dashboard.bookings.conversionRate,
      threshold: 60,
      status: dashboard.bookings.conversionRate >= 60 ? 'GOOD' : 'WARNING'
    },
    retentionRate: {
      value: dashboard.users.retentionRate,
      threshold: 70,
      status: dashboard.users.retentionRate >= 70 ? 'GOOD' : 'WARNING'
    },
    averageOrderValue: {
      value: dashboard.revenue.averageOrderValue,
      threshold: 200,
      status: dashboard.revenue.averageOrderValue >= 200 ? 'GOOD' : 'WARNING'
    }
  };

  console.log('KPI Monitoring:', kpis);

  // Alert if any KPI is below threshold
  Object.entries(kpis).forEach(([name, kpi]) => {
    if (kpi.status === 'WARNING') {
      console.warn(`⚠️  ${name} is below threshold: ${kpi.value} < ${kpi.threshold}`);
    }
  });

  return kpis;
}

// ============================================================================
// EXAMPLE 12: Cohort Analysis
// ============================================================================

async function analyzeCohorts() {
  // Get cohort analysis for last 12 months
  const cohorts = await analyticsService.getCohortAnalysis(12);

  console.log('Cohort Analysis:');
  cohorts.forEach(cohort => {
    console.log(
      `${cohort.cohort}: ${cohort.userCount} users, ${cohort.retentionRate.toFixed(1)}% retention`
    );
  });

  return cohorts;
}

// ============================================================================
// EXAMPLE 13: Export Analytics Data
// ============================================================================

async function exportAnalyticsData(
  type: 'bookings' | 'revenue' | 'users',
  startDate: Date,
  endDate: Date
) {
  let data: any;

  switch (type) {
    case 'bookings':
      data = await analyticsService.getBookingStatistics({
        dateRange: { startDate, endDate }
      });
      break;
    case 'revenue':
      data = await analyticsService.getRevenueStatistics({
        dateRange: { startDate, endDate }
      });
      break;
    case 'users':
      data = await analyticsService.getUserMetrics({
        startDate,
        endDate
      });
      break;
  }

  // Convert to CSV or JSON for export
  const exportData = {
    type,
    dateRange: { startDate, endDate },
    data,
    exportedAt: new Date().toISOString()
  };

  console.log('Export Data:', exportData);
  return exportData;
}

// ============================================================================
// EXPORT EXAMPLES
// ============================================================================

export {
  onBookingCreated,
  onBookingStatusUpdated,
  onPaymentCompleted,
  onJockeyAssigned,
  onServiceCompleted,
  fetchDashboardData,
  generateMonthlyReport,
  onUserRegistered,
  calculateCustomerValue,
  analyzeTopPerformers,
  monitorKPIs,
  analyzeCohorts,
  exportAnalyticsData
};
