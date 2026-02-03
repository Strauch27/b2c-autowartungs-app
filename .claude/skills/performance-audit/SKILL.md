---
name: performance-audit
description: Audit and optimize performance for frontend and backend. Use when investigating performance issues.
---

# Performance Audit

Comprehensive performance optimization guide for the B2C app.

## Performance Budgets

### Frontend

**Target Metrics:**
- **FCP** (First Contentful Paint): < 1.8s
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1
- **TTI** (Time to Interactive): < 3.5s

**Bundle Size:**
- Initial JS: < 200KB gzipped
- Initial CSS: < 50KB gzipped
- Total page weight: < 1MB

### Backend API

**Target Metrics:**
- **P50 latency**: < 200ms
- **P95 latency**: < 500ms
- **P99 latency**: < 1000ms
- **Error rate**: < 0.1%
- **Throughput**: > 100 req/s

## Frontend Optimization

### 1. Code Splitting

Split code by route:

```typescript
// app/layout.tsx
const BookingPage = dynamic(() => import('./booking/page'), {
  loading: () => <LoadingSkeleton />
});

// Load heavy libraries on demand
const StripeForm = dynamic(
  () => import('@/components/StripeForm'),
  { ssr: false }
);
```

### 2. Image Optimization

Use Next.js Image component:

```typescript
import Image from 'next/image';

<Image
  src="/hero.jpg"
  alt="Autowartung"
  width={1200}
  height={600}
  priority // For above-fold images
  placeholder="blur"
  blurDataURL="data:image/..."
/>
```

**Best practices:**
- Use WebP format
- Serve responsive images
- Lazy load below-fold images
- Use placeholder while loading
- Optimize image size (< 100KB per image)

### 3. Font Optimization

```typescript
// app/layout.tsx
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // Prevent FOIT
  preload: true
});

export default function RootLayout({ children }) {
  return (
    <html lang="de" className={inter.className}>
      <body>{children}</body>
    </html>
  );
}
```

### 4. Reduce JavaScript

Minimize client-side JavaScript:

```typescript
// Use Server Components by default
export default async function HomePage() {
  const services = await getServices(); // Runs on server

  return (
    <div>
      {services.map(service => (
        <ServiceCard key={service.id} {...service} />
      ))}
    </div>
  );
}

// Only use 'use client' when needed
'use client';
export function InteractiveForm() {
  // Interactive component
}
```

### 5. Caching Strategy

```typescript
// Static page (revalidate every hour)
export const revalidate = 3600;

// Dynamic page with caching
import { unstable_cache } from 'next/cache';

const getServices = unstable_cache(
  async () => {
    return prisma.service.findMany();
  },
  ['services'],
  { revalidate: 3600 }
);
```

### 6. Prefetch Critical Data

```typescript
// Prefetch on hover
<Link
  href="/booking"
  prefetch={true}
  onMouseEnter={() => {
    // Prefetch data
    queryClient.prefetchQuery({
      queryKey: ['services'],
      queryFn: fetchServices
    });
  }}
>
  Jetzt buchen
</Link>
```

### 7. Optimize Third-Party Scripts

```typescript
import Script from 'next/script';

// Load Stripe with proper strategy
<Script
  src="https://js.stripe.com/v3/"
  strategy="lazyOnload" // Load after page interactive
/>

// Analytics
<Script
  src="https://analytics.example.com/script.js"
  strategy="afterInteractive"
/>
```

### 8. Reduce Layout Shift

```typescript
// Reserve space for dynamic content
<div className="min-h-[400px]">
  {loading ? <Skeleton /> : <Content />}
</div>

// Use aspect ratio for images
<div className="aspect-video relative">
  <Image src="..." fill className="object-cover" />
</div>
```

## Backend Optimization

### 1. Database Query Optimization

**Use indexes:**

```sql
-- Index frequently queried fields
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_pickup_time ON bookings(pickup_time);

-- Composite indexes for common queries
CREATE INDEX idx_bookings_user_status
  ON bookings(user_id, status);
```

**Avoid N+1 queries:**

```typescript
// ❌ Bad: N+1 query
const bookings = await prisma.booking.findMany();
for (const booking of bookings) {
  booking.user = await prisma.user.findUnique({
    where: { id: booking.userId }
  });
}

// ✓ Good: Single query with include
const bookings = await prisma.booking.findMany({
  include: { user: true }
});
```

**Use pagination:**

```typescript
const PAGE_SIZE = 20;

const bookings = await prisma.booking.findMany({
  take: PAGE_SIZE,
  skip: (page - 1) * PAGE_SIZE,
  orderBy: { createdAt: 'desc' }
});
```

**Select only needed fields:**

```typescript
// Only fetch required fields
const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    name: true
    // Don't fetch password, etc.
  }
});
```

### 2. Caching

**Redis caching:**

```typescript
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

async function getServices() {
  // Check cache first
  const cached = await redis.get('services');
  if (cached) {
    return JSON.parse(cached);
  }

  // Fetch from database
  const services = await prisma.service.findMany();

  // Cache for 1 hour
  await redis.setex('services', 3600, JSON.stringify(services));

  return services;
}
```

**Memoization:**

```typescript
import { cache } from 'react';

// Dedupe requests during SSR
const getUser = cache(async (id: string) => {
  return prisma.user.findUnique({ where: { id } });
});
```

### 3. Connection Pooling

```typescript
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  // Connection pool settings
  // ?connection_limit=10&pool_timeout=20
}

// Monitor pool
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// Use pool metrics
prisma.$on('query', (e) => {
  console.log('Query duration:', e.duration, 'ms');
});
```

### 4. Async/Parallel Processing

```typescript
// ❌ Bad: Sequential
const user = await getUser(id);
const bookings = await getBookings(userId);
const vehicles = await getVehicles(userId);

// ✓ Good: Parallel
const [user, bookings, vehicles] = await Promise.all([
  getUser(id),
  getBookings(userId),
  getVehicles(userId)
]);
```

### 5. Background Jobs

Move slow operations to queue:

```typescript
// Don't wait for email
await queue.add('send-email', {
  to: user.email,
  template: 'booking-confirmation',
  data: { booking }
});

// Don't wait for Odoo sync
await queue.add('sync-to-odoo', {
  type: 'create-invoice',
  bookingId: booking.id
});

// Return immediately
return res.json({ success: true });
```

### 6. Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Zu viele Anfragen. Bitte später erneut versuchen.'
      }
    });
  }
});

app.use('/api/', limiter);
```

### 7. Compression

```typescript
import compression from 'compression';

app.use(compression({
  level: 6, // Balance between speed and compression
  threshold: 1024, // Only compress responses > 1KB
  filter: (req, res) => {
    // Don't compress images, videos
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));
```

## Monitoring

### Frontend Monitoring

**Web Vitals:**

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

**Custom tracking:**

```typescript
import { sendToAnalytics } from '@/lib/analytics';

export function reportWebVitals(metric) {
  sendToAnalytics({
    name: metric.name,
    value: metric.value,
    label: metric.label,
    id: metric.id
  });

  // Alert on poor performance
  if (metric.name === 'LCP' && metric.value > 2500) {
    console.warn('Poor LCP:', metric.value);
  }
}
```

### Backend Monitoring

**Response time tracking:**

```typescript
app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;

    // Log slow requests
    if (duration > 1000) {
      console.warn('Slow request:', {
        method: req.method,
        path: req.path,
        duration,
        user: req.user?.id
      });
    }

    // Send to monitoring
    metrics.timing('http.request.duration', duration, {
      method: req.method,
      path: req.path,
      status: res.statusCode
    });
  });

  next();
});
```

**Database query monitoring:**

```typescript
prisma.$use(async (params, next) => {
  const start = Date.now();
  const result = await next(params);
  const duration = Date.now() - start;

  // Log slow queries
  if (duration > 100) {
    console.warn('Slow query:', {
      model: params.model,
      action: params.action,
      duration
    });
  }

  return result;
});
```

## Performance Testing

### Load Testing

```typescript
// k6 script
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up
    { duration: '5m', target: 100 }, // Stay at 100
    { duration: '2m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% under 500ms
    http_req_failed: ['rate<0.01'],   // <1% errors
  },
};

export default function () {
  const res = http.get('https://app.example.com/api/services');

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);
}
```

### Lighthouse CI

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI
on: [push]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Lighthouse
        uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            https://app.example.com
            https://app.example.com/booking
          uploadArtifacts: true
```

## Common Issues & Solutions

### Issue: Slow API responses

**Diagnosis:**
```typescript
// Add timing to identify bottleneck
console.time('database');
const data = await prisma.booking.findMany();
console.timeEnd('database');

console.time('processing');
const processed = processData(data);
console.timeEnd('processing');
```

**Solutions:**
- Add database indexes
- Implement caching
- Reduce data fetched
- Use pagination
- Move to background job

### Issue: Large bundle size

**Diagnosis:**
```bash
npm run build
# Check .next/analyze output

# Or use bundle analyzer
npm install -D @next/bundle-analyzer
```

**Solutions:**
- Dynamic imports
- Remove unused dependencies
- Tree-shake libraries
- Use smaller alternatives

### Issue: Memory leaks

**Diagnosis:**
```typescript
// Monitor memory usage
setInterval(() => {
  const usage = process.memoryUsage();
  console.log('Memory usage:', {
    rss: `${Math.round(usage.rss / 1024 / 1024)}MB`,
    heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)}MB`
  });
}, 60000);
```

**Solutions:**
- Close database connections
- Clear intervals/timeouts
- Remove event listeners
- Weak references for caches

## Optimization Checklist

### Frontend
- [ ] Images optimized and lazy loaded
- [ ] Code split by route
- [ ] Fonts optimized
- [ ] Third-party scripts deferred
- [ ] CSS critical path optimized
- [ ] JavaScript minimized
- [ ] Service worker for caching
- [ ] CDN for static assets

### Backend
- [ ] Database queries optimized
- [ ] Indexes on frequently queried fields
- [ ] Connection pooling configured
- [ ] Caching implemented
- [ ] Background jobs for slow tasks
- [ ] Compression enabled
- [ ] Rate limiting in place
- [ ] Monitoring set up

### Both
- [ ] Performance budgets defined
- [ ] Load testing completed
- [ ] Monitoring dashboards created
- [ ] Alerts configured
- [ ] Documentation updated
