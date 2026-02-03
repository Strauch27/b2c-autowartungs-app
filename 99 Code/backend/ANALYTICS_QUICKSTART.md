# Analytics & BI Quickstart Guide

Get started with the Analytics and Business Intelligence infrastructure in 5 minutes.

---

## 1. Setup

### Database Migration

Run the analytics views migration:

```bash
cd backend
npm run db:migrate
```

This creates optimized database views for analytics queries.

---

## 2. Backend Integration

### Track Events in Your Code

Add analytics tracking to your booking service:

```typescript
import { AnalyticsService } from './services/analytics.service';
import { DatabaseService } from './services/database.service';
import { invalidateCacheOnBookingUpdate } from './services/analytics-cache.service';

// Initialize
const databaseService = DatabaseService.getInstance();
const analyticsService = new AnalyticsService(databaseService);
const cacheInvalidator = invalidateCacheOnBookingUpdate();

// Track booking creation
async function createBooking(bookingData) {
  const booking = await bookingsRepository.create(bookingData);

  // Track analytics
  await analyticsService.trackBooking(booking);
  cacheInvalidator.onBookingCreated();

  return booking;
}

// Track payment
async function processPayment(bookingId, customerId, amount, paymentIntentId) {
  await analyticsService.trackPayment({
    bookingId,
    customerId,
    amount,
    paymentIntentId,
    paidAt: new Date()
  });
  cacheInvalidator.onPaymentCompleted();
}
```

---

## 3. API Endpoints

All endpoints are available at `/api/analytics/*` and require admin authentication.

### Get Performance Dashboard

```bash
curl -X GET "http://localhost:5000/api/analytics/performance" \
  -H "Cookie: auth_token=your_token" \
  --cookie-jar cookies.txt
```

### Get Booking Statistics

```bash
curl -X GET "http://localhost:5000/api/analytics/bookings?startDate=2026-01-01&endDate=2026-01-31" \
  -H "Cookie: auth_token=your_token"
```

### Get Revenue Analytics

```bash
curl -X GET "http://localhost:5000/api/analytics/revenue?startDate=2026-01-01&endDate=2026-01-31" \
  -H "Cookie: auth_token=your_token"
```

---

## 4. Frontend Dashboard

### Access Admin Dashboard

Navigate to:
```
http://localhost:3000/en/admin/analytics
```

### Use Analytics API Client

```typescript
import { AnalyticsApiClient, getDateRangePreset } from '@/lib/api/analytics';

// Get dashboard data
const dateRange = getDateRangePreset('30d');
const dashboard = await AnalyticsApiClient.getPerformanceDashboard({
  dateRange
});

// Get top performers
const topJockeys = await AnalyticsApiClient.getTopJockeys(10);
const topWorkshops = await AnalyticsApiClient.getTopWorkshops(10);

// Export data
await AnalyticsApiClient.downloadAnalytics('revenue', {
  dateRange: {
    startDate: '2026-01-01',
    endDate: '2026-01-31'
  }
});
```

---

## 5. Common Use Cases

### Generate Monthly Report

```typescript
import { AnalyticsService } from './services/analytics.service';

const startDate = new Date(2026, 0, 1); // January 1, 2026
const endDate = new Date(2026, 0, 31); // January 31, 2026

const [bookings, revenue, users] = await Promise.all([
  analyticsService.getBookingStatistics({ dateRange: { startDate, endDate } }),
  analyticsService.getRevenueStatistics({ dateRange: { startDate, endDate } }),
  analyticsService.getUserMetrics({ startDate, endDate })
]);

console.log('Monthly Report:', {
  bookings: bookings.totalBookings,
  revenue: revenue.totalRevenue,
  users: users.activeUsers
});
```

### Monitor KPIs

```typescript
const dashboard = await analyticsService.getPerformanceDashboard();

const kpis = {
  conversionRate: dashboard.bookings.conversionRate,
  retentionRate: dashboard.users.retentionRate,
  averageOrderValue: dashboard.revenue.averageOrderValue
};

if (kpis.conversionRate < 60) {
  console.warn('⚠️  Conversion rate below target!');
}
```

### Analyze Customer Value

```typescript
const clv = await analyticsService.getCustomerLifetimeValue('customer123');
console.log(`Customer Lifetime Value: €${clv.toFixed(2)}`);
```

---

## 6. Testing

### Test Analytics Endpoints

```bash
# Install dependencies
npm install

# Run tests (when available)
npm test

# Manual testing
npm run dev
```

### Sample Test Request

```typescript
// Test GET /api/analytics/performance
const response = await fetch('http://localhost:5000/api/analytics/performance', {
  credentials: 'include',
  headers: {
    'Cookie': 'auth_token=your_admin_token'
  }
});

const data = await response.json();
console.log('Performance Dashboard:', data);
```

---

## 7. Cache Management

### Check Cache Status

```typescript
import { analyticsCacheService } from './services/analytics-cache.service';

const stats = analyticsCacheService.getStats();
console.log('Cache entries:', stats.size);
console.log('Cache details:', stats.entries);
```

### Invalidate Caches

```typescript
// Invalidate specific cache
analyticsCacheService.invalidateBookings();
analyticsCacheService.invalidateRevenue();

// Invalidate all caches
analyticsCacheService.invalidateAll();
```

---

## 8. Database Views

### Query Analytics Views

```sql
-- Daily booking statistics
SELECT * FROM "DailyBookingStats"
WHERE booking_date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY booking_date DESC;

-- Monthly revenue
SELECT * FROM "MonthlyRevenue"
WHERE revenue_month >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '12 months')
ORDER BY revenue_month DESC;

-- Top customers by lifetime value
SELECT * FROM "CustomerLifetimeValue"
ORDER BY lifetime_value DESC
LIMIT 100;

-- Jockey performance
SELECT * FROM "JockeyPerformance"
ORDER BY completed_assignments DESC
LIMIT 20;
```

---

## 9. Troubleshooting

### Issue: Endpoints return 403 Forbidden

**Solution**: Ensure you're authenticated as an admin user.

```typescript
// Login as admin first
const response = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@example.com',
    password: 'your_password'
  })
});
```

### Issue: Slow query performance

**Solution**: Add date range filters to all queries.

```typescript
// GOOD: Use date filters
const stats = await analyticsService.getBookingStatistics({
  dateRange: {
    startDate: new Date('2026-01-01'),
    endDate: new Date('2026-01-31')
  }
});
```

### Issue: Stale data in dashboard

**Solution**: Invalidate cache or wait for TTL expiration.

```typescript
import { analyticsCacheService } from './services/analytics-cache.service';

analyticsCacheService.invalidateAll();
```

---

## 10. Next Steps

1. **Integrate Tracking**: Add analytics tracking to all booking flows
2. **Customize Dashboard**: Modify frontend dashboard for your needs
3. **Set Up Alerts**: Configure KPI monitoring and alerts
4. **Schedule Reports**: Implement automated report generation
5. **Add Charts**: Install recharts or chart.js for visualizations

### Install Chart Libraries (Optional)

```bash
cd frontend
npm install recharts
# or
npm install chart.js react-chartjs-2
```

---

## Resources

- **Full Documentation**: `/backend/ANALYTICS_DOCUMENTATION.md`
- **API Reference**: `/backend/src/API_DOCUMENTATION.md`
- **Integration Examples**: `/backend/src/examples/analytics-integration.example.ts`
- **Database Schema**: `/backend/prisma/schema.prisma`

---

**Questions?** Check the documentation or contact the development team.
