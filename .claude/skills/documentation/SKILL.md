---
name: documentation
description: Generate and maintain documentation for APIs, components, and features. Use when creating new features or APIs.
---

# Documentation Standards

Guidelines for documenting code, APIs, and features in the B2C app.

## API Documentation

Use OpenAPI 3.0 for API documentation.

### Endpoint Documentation

```typescript
/**
 * @openapi
 * /api/bookings:
 *   post:
 *     summary: Create a new booking
 *     description: Creates a new service booking with optional concierge service
 *     tags:
 *       - Bookings
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - service
 *               - vehicleClass
 *               - pickupTime
 *               - postalCode
 *             properties:
 *               service:
 *                 type: string
 *                 enum: [oil-service, inspection, brake-service]
 *                 description: Type of service requested
 *               vehicleClass:
 *                 type: string
 *                 enum: [compact, midsize, suv, luxury]
 *                 description: Vehicle classification
 *               pickupTime:
 *                 type: string
 *                 format: date-time
 *                 description: Requested pickup time (ISO 8601)
 *               postalCode:
 *                 type: string
 *                 pattern: ^\d{5}$
 *                 description: Five-digit German postal code
 *               includeConcierge:
 *                 type: boolean
 *                 default: true
 *                 description: Include concierge service
 *     responses:
 *       201:
 *         description: Booking created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 */
export async function POST(request: Request) {
  // Implementation
}
```

### Schema Definitions

```typescript
/**
 * @openapi
 * components:
 *   schemas:
 *     Booking:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique booking identifier
 *           example: booking_abc123
 *         service:
 *           type: string
 *           enum: [oil-service, inspection, brake-service]
 *         status:
 *           type: string
 *           enum: [pending, confirmed, in-progress, completed, cancelled]
 *         totalPrice:
 *           type: integer
 *           description: Total price in cents
 *           example: 27000
 *         pickupTime:
 *           type: string
 *           format: date-time
 *         returnTime:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 */
```

### Generate Docs

```typescript
// lib/swagger.ts
import { createSwaggerSpec } from 'next-swagger-doc';

export const getApiDocs = async () => {
  const spec = createSwaggerSpec({
    apiFolder: 'app/api',
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'B2C Autowartungs-App API',
        version: '1.0.0',
        description: 'API documentation for the B2C car service booking platform'
      },
      servers: [
        {
          url: 'https://app.example.com',
          description: 'Production'
        },
        {
          url: 'http://localhost:3000',
          description: 'Development'
        }
      ],
      components: {
        securitySchemes: {
          BearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        }
      },
      security: [{ BearerAuth: [] }]
    }
  });
  return spec;
};
```

## Component Documentation

### React Component

```typescript
/**
 * ServiceCard displays a service offering with pricing and details.
 *
 * @component
 * @example
 * ```tsx
 * <ServiceCard
 *   name="Ölservice"
 *   description="Ölwechsel mit Filter"
 *   price={22000}
 *   vehicleClass="compact"
 *   onSelect={() => handleSelect('oil-service')}
 * />
 * ```
 */
interface ServiceCardProps {
  /** Display name of the service */
  name: string;

  /** Brief description of what's included */
  description: string;

  /** Price in cents (e.g., 22000 = 220.00 EUR) */
  price: number;

  /** Vehicle classification this price applies to */
  vehicleClass: 'compact' | 'midsize' | 'suv' | 'luxury';

  /** Callback when service is selected */
  onSelect: () => void;

  /** Optional icon to display */
  icon?: React.ReactNode;

  /** Whether this is the recommended option */
  recommended?: boolean;
}

export function ServiceCard({
  name,
  description,
  price,
  vehicleClass,
  onSelect,
  icon,
  recommended = false
}: ServiceCardProps) {
  // Implementation
}
```

### Hook Documentation

```typescript
/**
 * Custom hook for managing booking state and operations.
 *
 * Handles booking creation, updates, and real-time status tracking.
 *
 * @param bookingId - Optional booking ID for existing bookings
 * @returns Booking data, loading state, and operations
 *
 * @example
 * ```tsx
 * function BookingPage() {
 *   const { booking, isLoading, createBooking, updateBooking } = useBooking();
 *
 *   const handleSubmit = async (data) => {
 *     await createBooking(data);
 *   };
 *
 *   if (isLoading) return <Loading />;
 *
 *   return <BookingForm onSubmit={handleSubmit} />;
 * }
 * ```
 */
export function useBooking(bookingId?: string) {
  // Implementation
}
```

## Feature Documentation

### Feature Overview

```markdown
# Concierge Service

## Overview
The concierge service allows customers to have their vehicle picked up and returned, with a Ronja replacement vehicle provided during the service.

## User Story
As a customer, I want my car picked up and returned so that I don't have to visit the workshop.

## Business Value
- Increased customer satisfaction
- Differentiation from competitors
- Brand visibility (Ronja vehicles as "rolling advertisements")
- Higher conversion rates

## Technical Implementation

### Components
- `ConciergeBooking` - Booking form with time slot selection
- `JockeyAssignment` - Admin interface for assigning drivers
- `VehicleTracking` - Real-time vehicle location tracking

### API Endpoints
- `POST /api/bookings` - Create booking with concierge
- `GET /api/slots` - Get available time slots
- `POST /api/assignments` - Assign jockey to booking

### Database Schema
- `jockey_assignments` - Links bookings to jockeys and vehicles
- `vehicles` - Ronja vehicle fleet management
- `time_slots` - Available pickup/return slots

## Configuration
```env
CONCIERGE_ENABLED=true
CONCIERGE_SERVICE_RADIUS=60
CONCIERGE_MAX_DAILY_CAPACITY=20
```

## Testing
- Unit tests: `tests/unit/concierge/`
- Integration tests: `tests/integration/concierge/`
- E2E tests: `tests/e2e/concierge-flow.spec.ts`

## Monitoring
- Track: pickup/return on-time rate
- Alert: if on-time rate < 95%
- Dashboard: Grafana "Concierge Operations"
```

## README Templates

### Project README

```markdown
# B2C Autowartungs-App

Digital platform for booking car service with concierge service.

## Features

- 🔧 Service booking (Ölservice, Inspektion, Bremsen)
- 🚗 Concierge service (pickup & return)
- 💳 Online payment (Stripe)
- 📱 Digital extension approvals
- 🧾 Odoo integration for accounting

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma, PostgreSQL
- **Queue**: BullMQ + Redis
- **Payments**: Stripe
- **Hosting**: Vercel

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis 7+

### Installation

```bash
# Clone repository
git clone <repo-url>
cd b2c-app-v2

# Install dependencies
npm install

# Setup database
npx prisma migrate dev

# Start development server
npm run dev
```

### Environment Variables

```env
DATABASE_URL="postgresql://..."
REDIS_URL="redis://..."
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_KEY="pk_test_..."
```

## Development

```bash
# Run tests
npm test

# Run E2E tests
npm run test:e2e

# Type check
npm run type-check

# Lint
npm run lint

# Format
npm run format
```

## Deployment

```bash
# Build
npm run build

# Deploy to Vercel
vercel deploy --prod
```

## Documentation

- [API Documentation](./docs/api.md)
- [Architecture](./docs/architecture.md)
- [Deployment Guide](./docs/deployment.md)
```

## Code Comments

### When to Comment

**DO comment:**
- Why code exists (business logic)
- Complex algorithms
- Workarounds
- TODOs with context
- Public APIs

```typescript
// We use manual payment capture for extensions to allow
// customers to review additional work before charging.
// If declined, the authorization is automatically released after 7 days.
const paymentIntent = await stripe.paymentIntents.create({
  amount: extension.totalAmount,
  capture_method: 'manual' // Don't capture immediately
});
```

**DON'T comment:**
- What code does (should be self-explanatory)
- Obvious things
- Commented out code (delete it)

```typescript
// ❌ Bad: Explains what, not why
// Loop through bookings
for (const booking of bookings) {
  // Send email
  await sendEmail(booking);
}

// ✓ Good: Explains why
// Send emails in sequence to avoid rate limiting
for (const booking of bookings) {
  await sendEmail(booking);
}
```

### TODO Comments

Include ticket number and context:

```typescript
// TODO(TICKET-123): Replace with proper error boundary
// Currently catching all errors, but should distinguish between
// recoverable and non-recoverable errors.
try {
  await processBooking();
} catch (error) {
  console.error(error);
}
```

## Changelog

Maintain CHANGELOG.md following [Keep a Changelog](https://keepachangelog.com/):

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Digital extension approval workflow
- Push notifications for booking updates

### Changed
- Improved slot availability algorithm
- Updated pricing for luxury vehicles

### Fixed
- Payment webhook timeout handling
- Jockey assignment edge case

## [1.0.0] - 2026-02-01

### Added
- Initial release
- Service booking flow
- Concierge service
- Payment integration (Stripe)
- Odoo integration
```

## Documentation Maintenance

### Review Cycle

- Review API docs with each release
- Update READMEs when features change
- Keep examples up to date
- Remove obsolete documentation

### Documentation Checklist

When adding a feature:

- [ ] API endpoints documented (OpenAPI)
- [ ] Components documented (JSDoc)
- [ ] Feature overview added
- [ ] README updated
- [ ] Examples provided
- [ ] Tests documented
- [ ] Environment variables listed
- [ ] Deployment notes added

### Auto-Generated Docs

```typescript
// Generate TypeScript types from Prisma
npx prisma generate

// Generate API docs
npm run generate-docs

// Generate component library docs (Storybook)
npm run storybook
```

## External Documentation

### For Users

- User guide (how to book)
- FAQ
- Pricing information
- Service area coverage
- Contact information

### For Developers

- API reference
- Architecture diagrams
- Setup instructions
- Contribution guidelines
- Code standards

### For Operations

- Runbooks for common issues
- Deployment procedures
- Monitoring dashboards
- Incident response
- Backup/restore procedures
