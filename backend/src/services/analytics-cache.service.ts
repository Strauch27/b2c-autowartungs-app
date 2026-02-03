/**
 * Analytics Cache Service
 *
 * Implements caching strategy for frequently accessed analytics data.
 * Reduces database load and improves response times for dashboard queries.
 */

import { logger } from '../config/logger';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  key?: string; // Custom cache key
}

// ============================================================================
// IN-MEMORY CACHE
// ============================================================================

/**
 * In-memory cache for analytics data
 * In production, use Redis or similar distributed cache
 */
class InMemoryCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  /**
   * Set cache entry
   */
  set<T>(key: string, data: T, ttl: number): void {
    const now = Date.now();
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + ttl
    });

    logger.debug('Cache set', { key, ttl });
  }

  /**
   * Get cache entry
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      logger.debug('Cache miss', { key });
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      logger.debug('Cache expired', { key });
      return null;
    }

    logger.debug('Cache hit', { key });
    return entry.data as T;
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);

    if (!entry) {
      return false;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Delete cache entry
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      logger.debug('Cache deleted', { key });
    }
    return deleted;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    logger.info('Cache cleared');
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    const entries = Array.from(this.cache.entries());
    for (const [key, entry] of entries) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.debug('Cache cleanup completed', { cleaned, remaining: this.cache.size });
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
        key,
        age: Date.now() - entry.timestamp,
        ttl: entry.expiresAt - Date.now()
      }))
    };
  }

  /**
   * Destroy cache and cleanup
   */
  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.clear();
  }
}

// ============================================================================
// ANALYTICS CACHE SERVICE
// ============================================================================

export class AnalyticsCacheService {
  private static instance: AnalyticsCacheService;
  private cache: InMemoryCache;

  // Default TTL for different cache types (in milliseconds)
  private readonly DEFAULT_TTL = {
    dashboard: 5 * 60 * 1000, // 5 minutes for dashboard data
    statistics: 10 * 60 * 1000, // 10 minutes for statistics
    performance: 15 * 60 * 1000, // 15 minutes for performance metrics
    cohorts: 60 * 60 * 1000, // 1 hour for cohort analysis
    lifetime: 30 * 60 * 1000 // 30 minutes for lifetime value
  };

  private constructor() {
    this.cache = new InMemoryCache();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): AnalyticsCacheService {
    if (!AnalyticsCacheService.instance) {
      AnalyticsCacheService.instance = new AnalyticsCacheService();
    }
    return AnalyticsCacheService.instance;
  }

  /**
   * Generate cache key from filters
   */
  private generateKey(prefix: string, filters?: Record<string, any>): string {
    if (!filters || Object.keys(filters).length === 0) {
      return prefix;
    }

    const sortedFilters = Object.keys(filters)
      .sort()
      .map((key) => `${key}:${JSON.stringify(filters[key])}`)
      .join('|');

    return `${prefix}:${sortedFilters}`;
  }

  /**
   * Wrapper for caching async functions
   */
  async withCache<T>(
    cacheKey: string,
    fetchFn: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const key = options.key || cacheKey;
    const ttl = options.ttl || this.DEFAULT_TTL.statistics;

    // Check cache first
    const cached = this.cache.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Fetch fresh data
    try {
      const data = await fetchFn();
      this.cache.set(key, data, ttl);
      return data;
    } catch (error) {
      logger.error('Cache fetch failed', { key, error });
      throw error;
    }
  }

  // ==========================================================================
  // CACHE METHODS FOR SPECIFIC ANALYTICS
  // ==========================================================================

  /**
   * Cache booking statistics
   */
  async getBookingStatistics<T>(
    filters: Record<string, any>,
    fetchFn: () => Promise<T>
  ): Promise<T> {
    const key = this.generateKey('bookings:stats', filters);
    return this.withCache(key, fetchFn, {
      ttl: this.DEFAULT_TTL.statistics
    });
  }

  /**
   * Cache revenue statistics
   */
  async getRevenueStatistics<T>(
    filters: Record<string, any>,
    fetchFn: () => Promise<T>
  ): Promise<T> {
    const key = this.generateKey('revenue:stats', filters);
    return this.withCache(key, fetchFn, {
      ttl: this.DEFAULT_TTL.statistics
    });
  }

  /**
   * Cache user metrics
   */
  async getUserMetrics<T>(
    filters: Record<string, any>,
    fetchFn: () => Promise<T>
  ): Promise<T> {
    const key = this.generateKey('users:metrics', filters);
    return this.withCache(key, fetchFn, {
      ttl: this.DEFAULT_TTL.statistics
    });
  }

  /**
   * Cache performance dashboard
   */
  async getPerformanceDashboard<T>(
    filters: Record<string, any>,
    fetchFn: () => Promise<T>
  ): Promise<T> {
    const key = this.generateKey('performance:dashboard', filters);
    return this.withCache(key, fetchFn, {
      ttl: this.DEFAULT_TTL.dashboard
    });
  }

  /**
   * Cache top performers
   */
  async getTopPerformers<T>(
    type: 'jockeys' | 'workshops',
    limit: number,
    fetchFn: () => Promise<T>
  ): Promise<T> {
    const key = `top:${type}:${limit}`;
    return this.withCache(key, fetchFn, {
      ttl: this.DEFAULT_TTL.performance
    });
  }

  /**
   * Cache customer lifetime value
   */
  async getCustomerLifetimeValue<T>(
    customerId: string,
    fetchFn: () => Promise<T>
  ): Promise<T> {
    const key = `clv:${customerId}`;
    return this.withCache(key, fetchFn, {
      ttl: this.DEFAULT_TTL.lifetime
    });
  }

  /**
   * Cache cohort analysis
   */
  async getCohortAnalysis<T>(
    months: number,
    fetchFn: () => Promise<T>
  ): Promise<T> {
    const key = `cohorts:${months}`;
    return this.withCache(key, fetchFn, {
      ttl: this.DEFAULT_TTL.cohorts
    });
  }

  // ==========================================================================
  // CACHE MANAGEMENT
  // ==========================================================================

  /**
   * Invalidate specific cache entry
   */
  invalidate(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Invalidate all booking-related caches
   */
  invalidateBookings(): void {
    const stats = this.cache.getStats();
    stats.entries
      .filter((entry) => entry.key.startsWith('bookings:'))
      .forEach((entry) => this.cache.delete(entry.key));
    logger.info('Booking caches invalidated');
  }

  /**
   * Invalidate all revenue-related caches
   */
  invalidateRevenue(): void {
    const stats = this.cache.getStats();
    stats.entries
      .filter((entry) => entry.key.startsWith('revenue:'))
      .forEach((entry) => this.cache.delete(entry.key));
    logger.info('Revenue caches invalidated');
  }

  /**
   * Invalidate all user-related caches
   */
  invalidateUsers(): void {
    const stats = this.cache.getStats();
    stats.entries
      .filter((entry) => entry.key.startsWith('users:'))
      .forEach((entry) => this.cache.delete(entry.key));
    logger.info('User caches invalidated');
  }

  /**
   * Invalidate all performance-related caches
   */
  invalidatePerformance(): void {
    const stats = this.cache.getStats();
    stats.entries
      .filter(
        (entry) =>
          entry.key.startsWith('performance:') ||
          entry.key.startsWith('top:')
      )
      .forEach((entry) => this.cache.delete(entry.key));
    logger.info('Performance caches invalidated');
  }

  /**
   * Invalidate all caches
   */
  invalidateAll(): void {
    this.cache.clear();
    logger.info('All caches invalidated');
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return this.cache.getStats();
  }

  /**
   * Destroy cache service
   */
  destroy(): void {
    this.cache.destroy();
  }
}

// ============================================================================
// CACHE MIDDLEWARE
// ============================================================================

/**
 * Middleware to automatically invalidate caches on booking updates
 */
export function invalidateCacheOnBookingUpdate() {
  const cacheService = AnalyticsCacheService.getInstance();

  return {
    /**
     * Call after booking creation
     */
    onBookingCreated: () => {
      cacheService.invalidateBookings();
      cacheService.invalidateRevenue();
      cacheService.invalidatePerformance();
    },

    /**
     * Call after booking update
     */
    onBookingUpdated: () => {
      cacheService.invalidateBookings();
      cacheService.invalidateRevenue();
      cacheService.invalidatePerformance();
    },

    /**
     * Call after payment
     */
    onPaymentCompleted: () => {
      cacheService.invalidateRevenue();
      cacheService.invalidatePerformance();
    },

    /**
     * Call after user registration
     */
    onUserRegistered: () => {
      cacheService.invalidateUsers();
    }
  };
}

// Export singleton instance
export const analyticsCacheService = AnalyticsCacheService.getInstance();
