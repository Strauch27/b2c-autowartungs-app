---
name: architecture-review
description: Review and validate architectural decisions for the B2C app. Use when making significant technical decisions.
---

# Architecture Review

Guidelines for reviewing and validating architectural decisions.

## Review Checklist

### 1. Scalability

**Questions to ask:**
- Can this handle 10x current load?
- What are the bottlenecks?
- How does it scale horizontally?
- Database query performance acceptable?
- Caching strategy in place?

**Red flags:**
- N+1 queries
- No pagination
- Synchronous external calls
- No caching layer
- Single point of failure

### 2. Security

**Questions to ask:**
- Are all inputs validated?
- Is authentication required where needed?
- Are authorization checks in place?
- Is sensitive data encrypted?
- Are API keys properly secured?
- GDPR compliant?

**Red flags:**
- Passwords in plain text
- SQL injection vulnerability
- XSS vulnerability
- Missing rate limiting
- No CSRF protection
- Exposed secrets

### 3. Maintainability

**Questions to ask:**
- Is the code self-documenting?
- Are components properly separated?
- Is there test coverage?
- Is error handling consistent?
- Can new developers understand it?

**Red flags:**
- God objects
- Tight coupling
- No tests
- Magic numbers
- Inconsistent patterns

### 4. Performance

**Questions to ask:**
- What's the latency?
- How many database queries?
- Is data cached appropriately?
- Are images optimized?
- Is code split properly?

**Red flags:**
- Multiple round trips
- Large bundle sizes
- Unoptimized images
- No lazy loading
- Inefficient algorithms

### 5. Reliability

**Questions to ask:**
- What happens if external service fails?
- Are operations idempotent?
- Is there proper error handling?
- Are retries implemented?
- Is monitoring in place?

**Red flags:**
- No fallbacks
- No retries
- Silent failures
- No alerting
- Cascading failures

## Architecture Patterns

### Recommended Patterns

#### 1. Layered Architecture

```
Presentation Layer (Next.js)
      ↓
Business Logic Layer (Services)
      ↓
Data Access Layer (Repositories)
      ↓
Database (PostgreSQL)
```

**Benefits:**
- Clear separation of concerns
- Easy to test
- Maintainable

#### 2. Repository Pattern

```typescript
interface BookingRepository {
  findById(id: string): Promise<Booking>;
  findByUserId(userId: string): Promise<Booking[]>;
  create(data: CreateBookingDto): Promise<Booking>;
  update(id: string, data: UpdateBookingDto): Promise<Booking>;
}

class PrismaBookingRepository implements BookingRepository {
  async findById(id: string): Promise<Booking> {
    return prisma.booking.findUnique({ where: { id } });
  }
  // ...
}
```

**Benefits:**
- Abstracts data access
- Easy to mock for tests
- Can swap implementations

#### 3. Service Layer

```typescript
class BookingService {
  constructor(
    private bookingRepo: BookingRepository,
    private paymentService: PaymentService,
    private workshopService: WorkshopService
  ) {}

  async createBooking(data: CreateBookingDto): Promise<Booking> {
    // Validate
    await this.validateBooking(data);

    // Check availability
    const slot = await this.workshopService.checkAvailability(data);

    // Create booking
    const booking = await this.bookingRepo.create(data);

    // Process payment
    await this.paymentService.createPaymentIntent(booking);

    return booking;
  }
}
```

**Benefits:**
- Business logic centralized
- Reusable across controllers
- Easier to test

#### 4. Event-Driven

```typescript
// Emit events for important actions
eventBus.emit('booking.created', { booking });
eventBus.emit('payment.succeeded', { booking, payment });
eventBus.emit('extension.approved', { extension });

// Listeners handle side effects
eventBus.on('booking.created', async ({ booking }) => {
  await emailService.sendConfirmation(booking);
  await queueOdooSync('create-invoice', booking);
});
```

**Benefits:**
- Decoupled components
- Easy to add features
- Better fault tolerance

### Anti-Patterns to Avoid

#### ❌ God Object

```typescript
// Bad: One service does everything
class AppService {
  createBooking() { }
  processPayment() { }
  sendEmail() { }
  syncToOdoo() { }
  scheduleJockey() { }
  // ... 50 more methods
}
```

#### ❌ Tight Coupling

```typescript
// Bad: Direct dependencies
class BookingController {
  async create(req, res) {
    const stripe = new Stripe(process.env.STRIPE_KEY);
    const payment = await stripe.paymentIntents.create(...);
    // ...
  }
}
```

#### ❌ No Error Handling

```typescript
// Bad: Silent failures
async function createBooking(data) {
  const booking = await db.insert(data);
  return booking; // What if insert fails?
}
```

#### ❌ Callback Hell

```typescript
// Bad: Nested callbacks
function createBooking(data, callback) {
  db.insert(data, (err, booking) => {
    if (err) return callback(err);
    stripe.charge(booking, (err, charge) => {
      if (err) return callback(err);
      email.send(booking, (err) => {
        if (err) return callback(err);
        callback(null, booking);
      });
    });
  });
}
```

## Technology Decisions

### Frontend Stack

**Recommended:**
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: React Query + Context API
- **Forms**: React Hook Form + Zod
- **Testing**: Vitest + React Testing Library + Playwright

**Why:**
- Next.js: SSR, API routes, excellent DX
- TypeScript: Type safety, better refactoring
- Tailwind: Fast styling, consistent design
- shadcn/ui: High-quality, customizable components
- React Query: Server state management
- Zod: Runtime validation

### Backend Stack

**Recommended:**
- **Runtime**: Node.js (Next.js API routes)
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Queue**: BullMQ + Redis
- **Cache**: Redis
- **Testing**: Jest + Supertest

**Why:**
- Node.js: JavaScript everywhere, good ecosystem
- PostgreSQL: Reliable, ACID compliant
- Prisma: Type-safe ORM, great migrations
- BullMQ: Robust queue system
- Redis: Fast caching and queue backend

### Infrastructure

**Recommended:**
- **Hosting**: Vercel (frontend + API) or AWS
- **Database**: Supabase or AWS RDS
- **Redis**: Upstash or AWS ElastiCache
- **Storage**: AWS S3
- **CDN**: Cloudflare
- **Monitoring**: Sentry + Datadog

## Decision Records

Document major decisions:

```markdown
# ADR 001: Use Stripe for Payments

## Status
Accepted

## Context
Need payment provider with good German market support.

## Decision
Use Stripe for payment processing.

## Consequences
+ Excellent documentation
+ Strong fraud detection
+ PCI-DSS compliant
+ Good webhook system
- Slightly higher fees than alternatives
- Requires HTTPS for all payment pages

## Alternatives Considered
- PayPal: Limited API flexibility
- Adyen: More complex integration
- Mollie: Less established
```

## Code Review Focus Areas

### API Endpoints

```typescript
// Check for:
✓ Input validation
✓ Authentication
✓ Authorization
✓ Error handling
✓ Rate limiting
✓ Response format consistency
✓ Documentation (OpenAPI)
```

### Database Queries

```typescript
// Check for:
✓ No N+1 queries
✓ Proper indexes
✓ Pagination
✓ Connection pooling
✓ Transaction handling
✓ Proper error handling
```

### Security

```typescript
// Check for:
✓ SQL injection prevention
✓ XSS prevention
✓ CSRF protection
✓ Rate limiting
✓ Input sanitization
✓ Secrets management
✓ HTTPS everywhere
```

### Performance

```typescript
// Check for:
✓ Caching strategy
✓ Database query optimization
✓ Image optimization
✓ Code splitting
✓ Lazy loading
✓ CDN usage
```

## Migration Strategy

When refactoring architecture:

### 1. Strangler Fig Pattern

Gradually replace old system:

```
Old System ←→ Proxy ←→ New System
                 ↓
           Route by feature
```

### 2. Feature Flags

Deploy gradually:

```typescript
if (featureFlags.newBookingFlow) {
  return newBookingService.create(data);
} else {
  return oldBookingService.create(data);
}
```

### 3. Parallel Run

Run both systems, compare results:

```typescript
const [oldResult, newResult] = await Promise.all([
  oldSystem.process(data),
  newSystem.process(data)
]);

// Compare results
compareResults(oldResult, newResult);

// Return old result (safe)
return oldResult;
```

## Questions to Ask

Before committing to an architecture:

1. **Does it solve the actual problem?**
2. **Is it the simplest solution?**
3. **Can it scale?**
4. **Is it maintainable?**
5. **Is it testable?**
6. **What are the trade-offs?**
7. **What could go wrong?**
8. **How do we recover from failures?**
9. **What's the total cost of ownership?**
10. **Can the team support it?**

## Red Flags in PRs

Watch for:

- ⚠️ Large PRs (>500 lines)
- ⚠️ No tests added
- ⚠️ Commented out code
- ⚠️ Console.logs left in
- ⚠️ Hardcoded values
- ⚠️ No error handling
- ⚠️ Breaking changes without migration
- ⚠️ Inconsistent with existing patterns
- ⚠️ No documentation for complex logic
- ⚠️ Security vulnerabilities

## Success Criteria

Architecture is good when:

- ✓ New features are easy to add
- ✓ Bugs are easy to find and fix
- ✓ Code is self-documenting
- ✓ Tests are easy to write
- ✓ Performance is acceptable
- ✓ Security is built-in
- ✓ Team can work independently
- ✓ System is observable
- ✓ Recovery is straightforward
- ✓ Cost is predictable
