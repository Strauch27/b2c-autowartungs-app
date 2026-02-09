'use client';

/**
 * Admin Analytics Dashboard
 *
 * Provides comprehensive business intelligence and reporting for admins.
 * Displays key metrics, charts, and performance indicators.
 */

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { apiClient } from '@/lib/api/client';
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Calendar,
  Activity,
  Award,
  Wrench,
  Download,
  RefreshCw
} from 'lucide-react';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface BookingStatistics {
  totalBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  averageBookingValue: number;
  conversionRate: number;
  byServiceType: Record<string, number>;
  byStatus: Record<string, number>;
}

interface RevenueStatistics {
  totalRevenue: number;
  paidRevenue: number;
  pendingRevenue: number;
  averageOrderValue: number;
  revenueByServiceType: Record<string, number>;
  revenueByMonth: Array<{ month: string; revenue: number }>;
  revenueByDay: Array<{ day: string; revenue: number }>;
}

interface UserMetrics {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  usersByRole: Record<string, number>;
  retentionRate: number;
  churnRate: number;
}

interface PerformanceDashboard {
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

type DateRangePreset = '7d' | '30d' | '90d' | '1y' | 'custom';

// ============================================================================
// COMPONENTS
// ============================================================================

function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: any;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}) {
  const trendColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600';
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Activity;

  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <Icon className="w-5 h-5 text-gray-400" />
      </div>
      <div className="space-y-2">
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        {trend && trendValue && (
          <div className={`flex items-center text-sm ${trendColor}`}>
            <TrendIcon className="w-4 h-4 mr-1" />
            <span>{trendValue}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
    </div>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
      <p className="font-medium">Error loading analytics</p>
      <p className="text-sm mt-1">{message}</p>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

function AdminAnalyticsContent() {
  const [dashboard, setDashboard] = useState<PerformanceDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRangePreset>('30d');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Calculate date range based on preset
  const getDateRange = () => {
    const endDate = new Date();
    const startDate = new Date();

    switch (dateRange) {
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
      case 'custom':
        if (customStartDate && customEndDate) {
          return {
            startDate: customStartDate,
            endDate: customEndDate
          };
        }
        return null;
    }

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  };

  // Fetch analytics data
  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);

    try {
      const range = getDateRange();
      const params = new URLSearchParams();

      if (range) {
        params.append('startDate', range.startDate);
        params.append('endDate', range.endDate);
      }

      const data = await apiClient.get<{ success: boolean; data: PerformanceDashboard }>(
        `/api/analytics/performance?${params}`
      );
      setDashboard(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange, customStartDate, customEndDate]);

  // Export analytics data
  const handleExport = async (type: 'bookings' | 'revenue' | 'users') => {
    try {
      const range = getDateRange();
      const params = new URLSearchParams({ type });

      if (range) {
        params.append('startDate', range.startDate);
        params.append('endDate', range.endDate);
      }

      const response = await apiClient.request<Response>(
        `/api/analytics/export?${params}`,
        {
          method: 'GET',
          headers: { Accept: 'application/octet-stream' },
        }
      );

      const blob = new Blob([JSON.stringify(response)]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-analytics-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  // Format percentage
  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Business Intelligence & Performance Metrics
          </p>
        </div>

        {/* Date Range Selector */}
        <div className="bg-white rounded-lg shadow p-4 mb-6 border border-gray-200">
          <div className="flex flex-wrap items-center gap-4">
            <label className="text-sm font-medium text-gray-700">
              Date Range:
            </label>
            <div className="flex gap-2">
              {(['7d', '30d', '90d', '1y'] as DateRangePreset[]).map((preset) => (
                <button
                  key={preset}
                  onClick={() => setDateRange(preset)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    dateRange === preset
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {preset === '7d' && 'Last 7 Days'}
                  {preset === '30d' && 'Last 30 Days'}
                  {preset === '90d' && 'Last 90 Days'}
                  {preset === '1y' && 'Last Year'}
                </button>
              ))}
            </div>

            <button
              onClick={() => fetchAnalytics()}
              className="ml-auto flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && <LoadingSpinner />}

        {/* Error State */}
        {error && <ErrorMessage message={error} />}

        {/* Dashboard Content */}
        {!loading && !error && dashboard && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Total Revenue"
                value={formatCurrency(dashboard.revenue.paidRevenue)}
                subtitle={`${formatCurrency(dashboard.revenue.pendingRevenue)} pending`}
                icon={DollarSign}
                trend="up"
                trendValue={`${dashboard.bookings.totalBookings} bookings`}
              />
              <MetricCard
                title="Total Bookings"
                value={dashboard.bookings.totalBookings}
                subtitle={`${dashboard.bookings.completedBookings} completed`}
                icon={Calendar}
                trend="neutral"
                trendValue={formatPercentage(dashboard.bookings.conversionRate)}
              />
              <MetricCard
                title="Active Users"
                value={dashboard.users.activeUsers}
                subtitle={`${dashboard.users.totalUsers} total users`}
                icon={Users}
                trend="up"
                trendValue={`${dashboard.users.newUsersThisMonth} new this month`}
              />
              <MetricCard
                title="Avg Order Value"
                value={formatCurrency(dashboard.revenue.averageOrderValue)}
                subtitle={`${formatCurrency(dashboard.bookings.averageBookingValue)} booking avg`}
                icon={Activity}
                trend="up"
                trendValue="Growth trend"
              />
            </div>

            {/* Revenue & Bookings Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Breakdown */}
              <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    Revenue by Service Type
                  </h2>
                  <button
                    onClick={() => handleExport('revenue')}
                    className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                </div>
                <div className="space-y-3">
                  {Object.entries(dashboard.revenue.revenueByServiceType).map(
                    ([serviceType, revenue]) => (
                      <div key={serviceType} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">
                          {serviceType.replace(/_/g, ' ')}
                        </span>
                        <span className="text-sm font-bold text-gray-900">
                          {formatCurrency(revenue)}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Bookings Breakdown */}
              <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    Bookings by Status
                  </h2>
                  <button
                    onClick={() => handleExport('bookings')}
                    className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                </div>
                <div className="space-y-3">
                  {Object.entries(dashboard.bookings.byStatus).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        {status.replace(/_/g, ' ')}
                      </span>
                      <span className="text-sm font-bold text-gray-900">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* User Metrics */}
            <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">User Metrics</h2>
                <button
                  onClick={() => handleExport('users')}
                  className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Retention Rate</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatPercentage(dashboard.users.retentionRate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Churn Rate</p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatPercentage(dashboard.users.churnRate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Users by Role</p>
                  <div className="space-y-1 mt-2">
                    {Object.entries(dashboard.users.usersByRole).map(([role, count]) => (
                      <div key={role} className="flex justify-between text-sm">
                        <span className="text-gray-700">{role}:</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Jockeys */}
              <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <Award className="w-5 h-5 text-yellow-500" />
                  <h2 className="text-xl font-bold text-gray-900">Top Jockeys</h2>
                </div>
                <div className="space-y-3">
                  {dashboard.topJockeys.map((jockey, index) => (
                    <div
                      key={jockey.jockeyId}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-gray-400">
                          #{index + 1}
                        </span>
                        <div>
                          <p className="font-medium text-gray-900">{jockey.name}</p>
                          <p className="text-sm text-gray-600">
                            {jockey.completedBookings} bookings
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-yellow-600">
                          {jockey.rating.toFixed(1)} ⭐
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Workshops */}
              <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <Wrench className="w-5 h-5 text-blue-500" />
                  <h2 className="text-xl font-bold text-gray-900">Top Workshops</h2>
                </div>
                <div className="space-y-3">
                  {dashboard.topWorkshops.map((workshop, index) => (
                    <div
                      key={workshop.workshopId}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-gray-400">
                          #{index + 1}
                        </span>
                        <div>
                          <p className="font-medium text-gray-900">{workshop.name}</p>
                          <p className="text-sm text-gray-600">
                            {workshop.completedServices} services
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-blue-600">
                          {formatPercentage(workshop.utilizationRate)} util
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Revenue Trends */}
            <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Monthly Revenue Trend
              </h2>
              <div className="space-y-2">
                {dashboard.revenue.revenueByMonth.slice(-6).map((item) => (
                  <div key={item.month} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      {new Date(item.month).toLocaleDateString('de-DE', {
                        year: 'numeric',
                        month: 'long'
                      })}
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      {formatCurrency(item.revenue)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminAnalyticsContent />
    </ProtectedRoute>
  );
}
