/**
 * Analytics API Client
 *
 * Provides type-safe API calls for analytics and reporting endpoints.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface AnalyticsFilters {
  dateRange?: DateRange;
  serviceType?: string;
  status?: string;
  customerId?: string;
  jockeyId?: string;
}

export interface BookingStatistics {
  totalBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  averageBookingValue: number;
  conversionRate: number;
  byServiceType: Record<string, number>;
  byStatus: Record<string, number>;
}

export interface RevenueStatistics {
  totalRevenue: number;
  paidRevenue: number;
  pendingRevenue: number;
  averageOrderValue: number;
  revenueByServiceType: Record<string, number>;
  revenueByMonth: Array<{ month: string; revenue: number }>;
  revenueByDay: Array<{ day: string; revenue: number }>;
}

export interface UserMetrics {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  usersByRole: Record<string, number>;
  retentionRate: number;
  churnRate: number;
}

export interface JockeyPerformance {
  jockeyId: string;
  name: string;
  completedBookings: number;
  rating: number;
}

export interface WorkshopPerformance {
  workshopId: string;
  name: string;
  completedServices: number;
  utilizationRate: number;
}

export interface PerformanceDashboard {
  bookings: BookingStatistics;
  revenue: RevenueStatistics;
  users: UserMetrics;
  topJockeys: JockeyPerformance[];
  topWorkshops: WorkshopPerformance[];
}

export interface CohortAnalysis {
  cohort: string;
  userCount: number;
  retentionRate: number;
}

export interface CustomerLifetimeValue {
  customerId: string;
  lifetimeValue: number;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

interface ApiResponse<T> {
  success: boolean;
  data: T;
  filters?: AnalyticsFilters;
  error?: string;
}

// ============================================================================
// API CLIENT
// ============================================================================

export class AnalyticsApiClient {
  /**
   * Build query string from filters
   */
  private static buildQueryString(filters?: AnalyticsFilters): string {
    if (!filters) return '';

    const params = new URLSearchParams();

    if (filters.dateRange) {
      params.append('startDate', filters.dateRange.startDate);
      params.append('endDate', filters.dateRange.endDate);
    }

    if (filters.serviceType) {
      params.append('serviceType', filters.serviceType);
    }

    if (filters.status) {
      params.append('status', filters.status);
    }

    if (filters.customerId) {
      params.append('customerId', filters.customerId);
    }

    if (filters.jockeyId) {
      params.append('jockeyId', filters.jockeyId);
    }

    const queryString = params.toString();
    return queryString ? `?${queryString}` : '';
  }

  /**
   * Make API request
   */
  private static async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers
      },
      ...options
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: 'An error occurred'
      }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // ==========================================================================
  // BOOKING ANALYTICS
  // ==========================================================================

  /**
   * Get booking statistics
   */
  static async getBookingAnalytics(
    filters?: AnalyticsFilters
  ): Promise<BookingStatistics> {
    const queryString = this.buildQueryString(filters);
    const response = await this.request<BookingStatistics>(
      `/api/analytics/bookings${queryString}`
    );
    return response.data;
  }

  // ==========================================================================
  // REVENUE ANALYTICS
  // ==========================================================================

  /**
   * Get revenue statistics
   */
  static async getRevenueAnalytics(
    filters?: AnalyticsFilters
  ): Promise<RevenueStatistics> {
    const queryString = this.buildQueryString(filters);
    const response = await this.request<RevenueStatistics>(
      `/api/analytics/revenue${queryString}`
    );
    return response.data;
  }

  // ==========================================================================
  // USER ANALYTICS
  // ==========================================================================

  /**
   * Get user metrics
   */
  static async getUserAnalytics(dateRange?: DateRange): Promise<UserMetrics> {
    const filters: AnalyticsFilters = dateRange ? { dateRange } : {};
    const queryString = this.buildQueryString(filters);
    const response = await this.request<UserMetrics>(
      `/api/analytics/users${queryString}`
    );
    return response.data;
  }

  // ==========================================================================
  // PERFORMANCE DASHBOARD
  // ==========================================================================

  /**
   * Get complete performance dashboard
   */
  static async getPerformanceDashboard(
    filters?: AnalyticsFilters
  ): Promise<PerformanceDashboard> {
    const queryString = this.buildQueryString(filters);
    const response = await this.request<PerformanceDashboard>(
      `/api/analytics/performance${queryString}`
    );
    return response.data;
  }

  // ==========================================================================
  // TOP PERFORMERS
  // ==========================================================================

  /**
   * Get top performing jockeys
   */
  static async getTopJockeys(limit = 10): Promise<JockeyPerformance[]> {
    const response = await this.request<JockeyPerformance[]>(
      `/api/analytics/jockeys/top?limit=${limit}`
    );
    return response.data;
  }

  /**
   * Get top performing workshops
   */
  static async getTopWorkshops(limit = 10): Promise<WorkshopPerformance[]> {
    const response = await this.request<WorkshopPerformance[]>(
      `/api/analytics/workshops/top?limit=${limit}`
    );
    return response.data;
  }

  // ==========================================================================
  // ADVANCED ANALYTICS
  // ==========================================================================

  /**
   * Get customer lifetime value
   */
  static async getCustomerLifetimeValue(
    customerId: string
  ): Promise<CustomerLifetimeValue> {
    const response = await this.request<CustomerLifetimeValue>(
      `/api/analytics/customer/${customerId}/lifetime-value`
    );
    return response.data;
  }

  /**
   * Get cohort analysis
   */
  static async getCohortAnalysis(months = 12): Promise<CohortAnalysis[]> {
    const response = await this.request<CohortAnalysis[]>(
      `/api/analytics/cohorts?months=${months}`
    );
    return response.data;
  }

  // ==========================================================================
  // EXPORT
  // ==========================================================================

  /**
   * Export analytics data
   */
  static async exportAnalytics(
    type: 'bookings' | 'revenue' | 'users',
    filters?: AnalyticsFilters
  ): Promise<Blob> {
    const queryString = this.buildQueryString(filters);
    const typeParam = queryString ? `&type=${type}` : `?type=${type}`;

    const response = await fetch(
      `${API_URL}/api/analytics/export${queryString}${typeParam}`,
      {
        credentials: 'include'
      }
    );

    if (!response.ok) {
      throw new Error('Export failed');
    }

    return response.blob();
  }

  /**
   * Download exported analytics
   */
  static async downloadAnalytics(
    type: 'bookings' | 'revenue' | 'users',
    filters?: AnalyticsFilters
  ): Promise<void> {
    const blob = await this.exportAnalytics(type, filters);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}-analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get date range for common presets
 */
export function getDateRangePreset(
  preset: '7d' | '30d' | '90d' | '1y' | 'ytd' | 'all'
): DateRange | null {
  const endDate = new Date();
  const startDate = new Date();

  switch (preset) {
    case '7d':
      startDate.setDate(startDate.getDate() - 7);
      break;
    case '30d':
      startDate.setDate(startDate.getDate() - 30);
      break;
    case '90d':
      startDate.setDate(startDate.getDate() - 90);
      break;
    case '1y':
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
    case 'ytd':
      startDate.setMonth(0, 1);
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'all':
      return null;
  }

  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  };
}

/**
 * Format currency value
 */
export function formatCurrency(value: number, locale = 'de-DE'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EUR'
  }).format(value);
}

/**
 * Format percentage value
 */
export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format number with locale
 */
export function formatNumber(value: number, locale = 'de-DE'): string {
  return new Intl.NumberFormat(locale).format(value);
}

/**
 * Calculate growth rate
 */
export function calculateGrowthRate(current: number, previous: number): number {
  if (previous === 0) return 100;
  return ((current - previous) / previous) * 100;
}

/**
 * Get trend direction
 */
export function getTrendDirection(
  current: number,
  previous: number
): 'up' | 'down' | 'neutral' {
  if (current > previous) return 'up';
  if (current < previous) return 'down';
  return 'neutral';
}
