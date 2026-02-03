---
name: testing
description: Testing strategy and best practices for the B2C app. Use when writing or reviewing tests.
allowed-tools: Bash(npm *, pnpm *, yarn *)
---

# Testing Strategy

Comprehensive testing approach for the B2C Autowartungs-App.

## Testing Pyramid

```
        E2E Tests (10%)
       ──────────────
      Integration (30%)
     ──────────────────
    Unit Tests (60%)
   ────────────────────
```

## Test Types

### 1. Unit Tests (60% of tests)

Test individual functions and components in isolation.

**Frontend (React/Next.js)**
```typescript
// Component testing with React Testing Library
import { render, screen } from '@testing-library/react';
import { ServiceCard } from './ServiceCard';

describe('ServiceCard', () => {
  it('displays service name and price', () => {
    render(<ServiceCard name="Ölservice" price={22000} />);
    expect(screen.getByText('Ölservice')).toBeInTheDocument();
    expect(screen.getByText('220,00 €')).toBeInTheDocument();
  });
});
```

**Backend (API)**
```typescript
// Pure function testing
import { calculateServicePrice } from './pricing';

describe('calculateServicePrice', () => {
  it('applies correct pricing for compact vehicle', () => {
    const price = calculateServicePrice('oil-service', 'compact');
    expect(price).toBe(22000);
  });

  it('adds concierge fee when requested', () => {
    const price = calculateServicePrice('oil-service', 'compact', true);
    expect(price).toBe(27000);
  });
});
```

### 2. Integration Tests (30% of tests)

Test component interactions and API endpoints.

**API Integration**
```typescript
import request from 'supertest';
import { app } from '../app';

describe('POST /api/bookings', () => {
  it('creates booking with valid data', async () => {
    const response = await request(app)
      .post('/api/bookings')
      .send({
        service: 'oil-service',
        vehicleClass: 'compact',
        pickupTime: '2026-02-05T08:00:00Z',
        postalCode: '58452'
      })
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe('confirmed');
  });

  it('rejects booking with unavailable slot', async () => {
    const response = await request(app)
      .post('/api/bookings')
      .send({
        service: 'oil-service',
        vehicleClass: 'compact',
        pickupTime: '2026-02-05T08:00:00Z', // Already booked
        postalCode: '58452'
      })
      .expect(400);

    expect(response.body.error.code).toBe('SLOT_UNAVAILABLE');
  });
});
```

**Database Integration**
```typescript
import { prisma } from '../lib/prisma';
import { BookingService } from './BookingService';

describe('BookingService', () => {
  beforeEach(async () => {
    await prisma.booking.deleteMany();
  });

  it('persists booking to database', async () => {
    const service = new BookingService(prisma);
    const booking = await service.create({
      service: 'oil-service',
      vehicleClass: 'compact',
      userId: 'user_123'
    });

    const saved = await prisma.booking.findUnique({
      where: { id: booking.id }
    });

    expect(saved).toBeTruthy();
    expect(saved.service).toBe('oil-service');
  });
});
```

### 3. E2E Tests (10% of tests)

Test complete user workflows with Playwright.

**Booking Flow**
```typescript
import { test, expect } from '@playwright/test';

test('complete booking flow', async ({ page }) => {
  // Landing page
  await page.goto('/');
  await expect(page).toHaveTitle(/Autowartung/);

  // Service selection
  await page.click('text=Ölservice');
  await page.selectOption('[name="vehicleClass"]', 'compact');

  // Price display
  await expect(page.locator('.price')).toContainText('220,00 €');

  // Add concierge
  await page.check('[name="includeConcierge"]');
  await expect(page.locator('.price')).toContainText('270,00 €');

  // Location
  await page.fill('[name="postalCode"]', '58452');

  // Time slot selection
  await page.click('[data-slot="2026-02-05T08:00:00Z"]');

  // Payment
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="cardNumber"]', '4242424242424242');
  await page.fill('[name="expiry"]', '12/28');
  await page.fill('[name="cvc"]', '123');

  await page.click('button:has-text("Jetzt buchen")');

  // Confirmation
  await expect(page.locator('.confirmation')).toBeVisible();
  await expect(page.locator('.booking-id')).toBeVisible();
});
```

## Test Organization

```
tests/
├── unit/
│   ├── components/
│   ├── utils/
│   └── services/
├── integration/
│   ├── api/
│   ├── database/
│   └── external/
└── e2e/
    ├── booking-flow.spec.ts
    ├── payment-flow.spec.ts
    └── concierge-flow.spec.ts
```

## Coverage Requirements

Minimum coverage thresholds:

```json
{
  "coverageThreshold": {
    "global": {
      "branches": 80,
      "functions": 80,
      "lines": 85,
      "statements": 85
    }
  }
}
```

Critical paths require 100% coverage:
- Payment processing
- Booking creation
- Auftragserweiterung approval
- User authentication

## Test Data

Use factories for consistent test data:

```typescript
// factories/booking.factory.ts
export const createBooking = (overrides = {}) => ({
  id: 'booking_' + Math.random().toString(36).substr(2, 9),
  service: 'oil-service',
  vehicleClass: 'compact',
  status: 'confirmed',
  pickupTime: '2026-02-05T08:00:00Z',
  returnTime: '2026-02-05T18:00:00Z',
  price: 22000,
  ...overrides
});
```

## Mocking

### External Services

Mock external integrations:

```typescript
// Stripe mock
jest.mock('@stripe/stripe-js', () => ({
  loadStripe: jest.fn(() => ({
    confirmPayment: jest.fn(() => ({ paymentIntent: { status: 'succeeded' } }))
  }))
}));

// Odoo mock
jest.mock('../lib/odoo', () => ({
  createInvoice: jest.fn(() => ({ id: 'invoice_123' }))
}));
```

### Date/Time

Use consistent timestamps:

```typescript
beforeAll(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2026-02-01T10:00:00Z'));
});

afterAll(() => {
  jest.useRealTimers();
});
```

## Continuous Integration

Run tests on every commit:

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install dependencies
        run: npm ci
      - name: Run unit tests
        run: npm test
      - name: Run integration tests
        run: npm run test:integration
      - name: Run E2E tests
        run: npm run test:e2e
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## Performance Testing

Test critical endpoints for performance:

```typescript
import { performance } from 'perf_hooks';

test('booking creation completes in under 500ms', async () => {
  const start = performance.now();

  await request(app)
    .post('/api/bookings')
    .send(validBookingData);

  const duration = performance.now() - start;
  expect(duration).toBeLessThan(500);
});
```

## Security Testing

Test authentication and authorization:

```typescript
describe('Authentication', () => {
  it('rejects unauthenticated requests', async () => {
    await request(app)
      .get('/api/bookings/me')
      .expect(401);
  });

  it('rejects requests with invalid token', async () => {
    await request(app)
      .get('/api/bookings/me')
      .set('Authorization', 'Bearer invalid_token')
      .expect(401);
  });

  it('prevents access to other users bookings', async () => {
    const token = generateToken('user_123');

    await request(app)
      .get('/api/bookings/booking_456') // Belongs to user_789
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
  });
});
```

## Running Tests

```bash
# All tests
npm test

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage

# Specific test file
npm test -- booking.test.ts

# Integration tests only
npm run test:integration

# E2E tests
npm run test:e2e

# E2E with UI
npm run test:e2e:ui
```

## Test Naming Convention

Use descriptive test names:

```typescript
// ✓ Good
it('creates booking when all required fields are provided')
it('rejects booking when postal code is outside service area')
it('sends confirmation email after successful payment')

// ✗ Bad
it('works')
it('test booking')
it('should create')
```

## Debugging Tests

```typescript
// Add debug output
console.log('Booking data:', JSON.stringify(booking, null, 2));

// Pause execution
await page.pause(); // Playwright

// Screenshot on failure
afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) {
    await page.screenshot({
      path: `screenshots/${testInfo.title}.png`
    });
  }
});
```

## Best Practices

1. **Arrange-Act-Assert**: Structure tests clearly
2. **Independent tests**: Each test should be runnable in isolation
3. **Clear assertions**: One logical assertion per test
4. **Fast tests**: Unit tests < 100ms, integration < 1s
5. **Descriptive names**: Test name explains what is tested
6. **Setup/teardown**: Clean state before/after tests
7. **Mock external**: Don't rely on external services
8. **Test edge cases**: Not just happy paths
9. **Async handling**: Properly handle promises and async code
10. **DRY helpers**: Extract common test setup to helpers
