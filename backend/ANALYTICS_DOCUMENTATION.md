# Analytics & Reporting Infrastructure

Comprehensive Business Intelligence system for B2C Autowartungs-App.

## Overview

This analytics infrastructure provides real-time business intelligence and reporting capabilities for administrators. It tracks key metrics across bookings, revenue, users, and performance indicators with intelligent caching for optimal performance.

---

## Architecture

### Components

1. **Analytics Service** (`src/services/analytics.service.ts`)
   - Core analytics logic and data aggregation
   - Tracking methods for events and metrics
   - Statistics calculation and reporting

2. **Analytics Cache Service** (`src/services/analytics-cache.service.ts`)
   - In-memory caching for frequently accessed data
   - TTL-based cache invalidation
   - Automatic cleanup and cache management

3. **Analytics Controller** (`src/controllers/analytics.controller.ts`)
   - REST API endpoints for analytics data
   - Request validation and error handling
   - Export functionality

4. **Analytics Routes** (`src/routes/analytics.routes.ts`)
   - Route definitions and authentication
   - Admin-only access control

5. **Database Views** (`prisma/migrations/add_analytics_views/`)
   - Optimized SQL views for common queries
   - Pre-aggregated statistics tables
   - Performance indexes

6. **Frontend Dashboard** (`app/[locale]/admin/analytics/`)
   - React-based admin dashboard
   - Real-time metrics visualization
   - Data export functionality

---

## API Endpoints

All endpoints require authentication and admin role.

### Core Analytics

#### GET `/api/analytics/bookings`
Get booking statistics and analytics.

**Query Parameters:**
- `startDate` (optional): ISO date string (YYYY-MM-DD)
- `endDate` (optional): ISO date string (YYYY-MM-DD)
- `serviceType` (optional): ServiceType enum
- `status` (optional): BookingStatus enum

**Response:**
```json
{
  "success": true,
  "data": {
    "totalBookings": 150,
    "confirmedBookings": 120,
    "completedBookings": 100,
    "cancelledBookings": 10,
    "averageBookingValue": 250.50,
    "conversionRate": 66.67,
    "byServiceType": {
      "INSPECTION": 80,
      "OIL_SERVICE": 40,
      "BRAKE_SERVICE": 30
    },
    "byStatus": {
      "PENDING_PAYMENT": 20,
      "CONFIRMED": 30,
      "COMPLETED": 100
    }
  }
}
```

#### GET `/api/analytics/revenue`
Get revenue statistics and analytics.

**Query Parameters:**
- `startDate` (optional): ISO date string
- `endDate` (optional): ISO date string
- `serviceType` (optional): ServiceType enum

**Response:**
```json
{
  "success": true,
  "data": {
    "totalRevenue": 37500.00,
    "paidRevenue": 35000.00,
    "pendingRevenue": 2500.00,
    "averageOrderValue": 250.00,
    "revenueByServiceType": {
      "INSPECTION": 20000.00,
      "OIL_SERVICE": 10000.00,
      "BRAKE_SERVICE": 7500.00
    },
    "revenueByMonth": [
      { "month": "2026-01", "revenue": 12500.00 },
      { "month": "2026-02", "revenue": 15000.00 }
    ],
    "revenueByDay": [
      { "day": "2026-02-01", "revenue": 1200.00 }
    ]
  }
}
```

#### GET `/api/analytics/users`
Get user metrics and analytics.

**Query Parameters:**
- `startDate` (optional): ISO date string
- `endDate` (optional): ISO date string

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 500,
    "activeUsers": 350,
    "newUsersThisMonth": 50,
    "usersByRole": {
      "CUSTOMER": 450,
      "JOCKEY": 30,
      "WORKSHOP": 15,
      "ADMIN": 5
    },
    "retentionRate": 70.0,
    "churnRate": 30.0
  }
}
```

#### GET `/api/analytics/performance`
Get complete performance dashboard with all key metrics.

**Query Parameters:**
- `startDate` (optional): ISO date string
- `endDate` (optional): ISO date string
- `serviceType` (optional): ServiceType enum

**Response:**
```json
{
  "success": true,
  "data": {
    "bookings": { /* BookingStatistics */ },
    "revenue": { /* RevenueStatistics */ },
    "users": { /* UserMetrics */ },
    "topJockeys": [
      {
        "jockeyId": "jockey123",
        "name": "Max Mustermann",
        "completedBookings": 45,
        "rating": 4.8
      }
    ],
    "topWorkshops": [
      {
        "workshopId": "workshop456",
        "name": "Auto Service Berlin",
        "completedServices": 120,
        "utilizationRate": 85.5
      }
    ]
  }
}
```

### Performance Analytics

#### GET `/api/analytics/jockeys/top`
Get top performing jockeys.

**Query Parameters:**
- `limit` (optional): Number (default: 10, max: 100)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "jockeyId": "jockey123",
      "name": "Max Mustermann",
      "completedBookings": 45,
      "rating": 4.8
    }
  ]
}
```

#### GET `/api/analytics/workshops/top`
Get top performing workshops.

**Query Parameters:**
- `limit` (optional): Number (default: 10, max: 100)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "workshopId": "workshop456",
      "name": "Auto Service Berlin",
      "completedServices": 120,
      "utilizationRate": 85.5
    }
  ]
}
```

### Advanced Analytics

#### GET `/api/analytics/customer/:customerId/lifetime-value`
Get customer lifetime value (CLV).

**Response:**
```json
{
  "success": true,
  "data": {
    "customerId": "customer789",
    "lifetimeValue": 1250.00
  }
}
```

#### GET `/api/analytics/cohorts`
Get cohort analysis (user retention by signup month).

**Query Parameters:**
- `months` (optional): Number (default: 12, max: 24)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "cohort": "2026-01",
      "userCount": 50,
      "retentionRate": 75.0
    }
  ]
}
```

### Export

#### GET `/api/analytics/export`
Export analytics data as JSON.

**Query Parameters:**
- `type` (required): 'bookings' | 'revenue' | 'users'
- `startDate` (optional): ISO date string
- `endDate` (optional): ISO date string

**Response:**
Downloads JSON file with analytics data.

---

## Tracking Methods

### Track Booking
```typescript
await analyticsService.trackBooking(booking);
```

Logs booking creation and updates for analytics.

### Track Payment
```typescript
await analyticsService.trackPayment({
  bookingId: 'booking123',
  customerId: 'customer456',
  amount: 250.00,
  paymentIntentId: 'pi_123',
  paidAt: new Date()
});
```

Logs successful payments for revenue analytics.

### Track User Activity
```typescript
await analyticsService.trackUserActivity(
  'user123',
  'booking_created',
  { bookingId: 'booking456' }
);
```

Logs user actions for behavior analysis.

### Track Jockey Performance
```typescript
await analyticsService.trackJockeyPerformance('jockey123', {
  completedBookings: 10,
  averageRating: 4.8,
  totalRevenue: 2500.00,
  onTimeDeliveryRate: 95.0
});
```

### Track Workshop Performance
```typescript
await analyticsService.trackWorkshopPerformance('workshop456', {
  completedServices: 25,
  averageServiceTime: 2.5,
  capacity: 5,
  utilizationRate: 85.0
});
```

---

## Caching Strategy

### Cache Layers

1. **In-Memory Cache** (Current Implementation)
   - Fast access for frequently queried data
   - TTL-based expiration
   - Automatic cleanup

2. **Redis Cache** (Production Recommendation)
   - Distributed caching across multiple servers
   - Persistent cache storage
   - Better scalability

### Cache TTL

- **Dashboard Data**: 5 minutes
- **Statistics**: 10 minutes
- **Performance Metrics**: 15 minutes
- **Cohort Analysis**: 1 hour
- **Lifetime Value**: 30 minutes

### Cache Invalidation

Caches are automatically invalidated when:
- New booking is created
- Booking status is updated
- Payment is completed
- User registers

**Manual Invalidation:**
```typescript
import { analyticsCacheService } from './services/analytics-cache.service';

// Invalidate specific caches
analyticsCacheService.invalidateBookings();
analyticsCacheService.invalidateRevenue();
analyticsCacheService.invalidateUsers();
analyticsCacheService.invalidatePerformance();

// Invalidate all caches
analyticsCacheService.invalidateAll();
```

---

## Database Views

### Available Views

1. **DailyBookingStats** - Daily booking aggregations
2. **MonthlyRevenue** - Monthly revenue aggregations
3. **CustomerLifetimeValue** - Customer value metrics
4. **JockeyPerformance** - Jockey performance metrics
5. **WorkshopPerformance** - Workshop utilization metrics
6. **ServiceTypePerformance** - Service type analytics
7. **UserRetentionMetrics** - User retention tracking
8. **BookingFunnel** - Conversion funnel analysis

### Usage Example

```sql
-- Query daily booking statistics
SELECT * FROM "DailyBookingStats"
WHERE booking_date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY booking_date DESC;

-- Query monthly revenue
SELECT * FROM "MonthlyRevenue"
WHERE revenue_month >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '12 months')
ORDER BY revenue_month DESC;

-- Query customer lifetime value
SELECT * FROM "CustomerLifetimeValue"
ORDER BY lifetime_value DESC
LIMIT 100;
```

---

## Frontend Integration

### React Hook Example

```typescript
import { AnalyticsApiClient, getDateRangePreset } from '@/lib/api/analytics';

function AnalyticsDashboard() {
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const dateRange = getDateRangePreset('30d');
      const data = await AnalyticsApiClient.getPerformanceDashboard({
        dateRange
      });
      setDashboard(data);
    }
    fetchData();
  }, []);

  return (
    // Dashboard UI
  );
}
```

### Export Data

```typescript
import { AnalyticsApiClient } from '@/lib/api/analytics';

async function exportRevenue() {
  await AnalyticsApiClient.downloadAnalytics('revenue', {
    dateRange: {
      startDate: '2026-01-01',
      endDate: '2026-01-31'
    }
  });
}
```

---

## Performance Optimization

### Best Practices

1. **Use Date Ranges**: Always filter by date range for large datasets
2. **Leverage Caching**: Utilize cached data for dashboards
3. **Batch Queries**: Use performance dashboard endpoint for multiple metrics
4. **Database Indexes**: Ensure proper indexes on date and status fields
5. **Aggregate Views**: Query pre-aggregated views for common reports

### Query Performance Tips

```typescript
// GOOD: Use date range filters
const stats = await analyticsService.getBookingStatistics({
  dateRange: {
    startDate: '2026-01-01',
    endDate: '2026-01-31'
  }
});

// BETTER: Use cached dashboard endpoint
const dashboard = await analyticsService.getPerformanceDashboard({
  dateRange: {
    startDate: '2026-01-01',
    endDate: '2026-01-31'
  }
});

// BEST: Use database views for complex queries
const result = await prisma.$queryRaw`
  SELECT * FROM "DailyBookingStats"
  WHERE booking_date >= ${startDate}
  ORDER BY booking_date DESC
`;
```

---

## Monitoring & Observability

### Cache Statistics

```typescript
import { analyticsCacheService } from './services/analytics-cache.service';

// Get cache stats
const stats = analyticsCacheService.getStats();
console.log('Cache size:', stats.size);
console.log('Cache entries:', stats.entries);
```

### Logging

All analytics operations are logged with structured logging:

```typescript
// Example log output
{
  event: 'booking_tracked',
  bookingId: 'booking123',
  customerId: 'customer456',
  serviceType: 'INSPECTION',
  totalPrice: '250.00',
  timestamp: '2026-02-01T10:30:00Z'
}
```

---

## Migration Guide

### Database Migration

```bash
# Run migration to create analytics views
cd backend
npm run db:migrate

# Or manually apply migration
psql -d your_database -f prisma/migrations/add_analytics_views/migration.sql
```

### Frontend Setup

1. Install dependencies (if using charts):
```bash
cd frontend
npm install recharts
# or
npm install chart.js react-chartjs-2
```

2. Access admin dashboard:
```
http://localhost:3000/en/admin/analytics
```

---

## Security Considerations

1. **Admin-Only Access**: All analytics endpoints require admin role
2. **Data Privacy**: Customer PII is not exposed in aggregated reports
3. **Rate Limiting**: Consider implementing rate limits for export endpoints
4. **Audit Logging**: Track who accesses analytics data

---

## Future Enhancements

### Recommended Improvements

1. **Redis Integration**
   - Replace in-memory cache with Redis
   - Enable distributed caching
   - Persist cache across restarts

2. **Real-Time Analytics**
   - WebSocket integration for live updates
   - Server-sent events for dashboard
   - Real-time KPI monitoring

3. **Advanced Visualizations**
   - Chart.js or Recharts integration
   - Interactive charts and graphs
   - Custom report builder

4. **Scheduled Reports**
   - Daily/weekly email reports
   - Automated PDF generation
   - Slack/Teams integration

5. **Predictive Analytics**
   - Revenue forecasting
   - Demand prediction
   - Churn prediction models

6. **Data Warehouse**
   - Dedicated analytics database
   - ETL pipelines for historical data
   - BigQuery or Snowflake integration

---

## Troubleshooting

### Common Issues

**Issue**: Slow query performance
- **Solution**: Add date range filters, use cached endpoints

**Issue**: Cache not invalidating
- **Solution**: Manually invalidate caches or restart service

**Issue**: Missing data in reports
- **Solution**: Check database views, verify tracking methods are called

**Issue**: Export fails
- **Solution**: Check admin permissions, verify date range format

---

## Support

For questions or issues, contact the development team or refer to:
- API Documentation: `/src/API_DOCUMENTATION.md`
- Backend README: `/src/README.md`
- Database Schema: `/prisma/schema.prisma`

---

**Last Updated**: February 2026
**Version**: 1.0.0
**Maintainer**: Data Analytics Team
