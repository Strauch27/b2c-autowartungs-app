# Prisma Database Schema

This directory contains the Prisma schema and database migration files for the B2C Autowartungs-App.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Database

Copy the example environment file and configure your database:

```bash
cp .env.example .env
# Edit .env and set your DATABASE_URL
```

### 3. Run Migrations

```bash
# Create initial migration and apply to database
npm run db:migrate

# Generate Prisma Client
npm run db:generate
```

### 4. Seed Database

```bash
# Populate database with test data
npm run db:seed
```

## Database Schema Overview

### Core Models

- **Customer**: User accounts with email, address, and Stripe integration
- **Vehicle**: Customer vehicles with brand, model, year, and mileage
- **PriceMatrix**: Brand/model-specific pricing (NEW! - no vehicle classes)
- **Booking**: Service bookings with status tracking
- **Payment**: Stripe payment records
- **Finding**: Additional work requests during service

### Concierge Service

- **ConciergeBooking**: Pickup/delivery service bookings
- **Jockey**: Drivers for vehicle transport
- **ReplacementCar**: Available replacement vehicles

### Workshop Management

- **Workshop**: Workshop locations and capacity
- **Slot**: Available time slots for bookings

## Important Changes from Legacy System

### No Vehicle Classes!
The old system used vehicle class enums (Small, Medium, Large). The new system calculates prices based on specific brand/model combinations from the `PriceMatrix` table.

### Required Fields
- `Vehicle.year`: Now REQUIRED (was optional)
- `Vehicle.mileage`: Now REQUIRED (NEW field)
- `Booking.mileageAtBooking`: Now REQUIRED for accurate pricing

### Price Calculation
Prices are determined by:
1. Vehicle brand + model (e.g., "VW Golf 7")
2. Vehicle year (matched against yearFrom/yearTo in PriceMatrix)
3. Current mileage (determines which inspection tier applies)

## Available Scripts

```bash
# Development
npm run db:migrate         # Create and apply migration
npm run db:generate        # Generate Prisma Client
npm run db:push           # Push schema changes without migration
npm run db:studio         # Open Prisma Studio GUI

# Production
npm run db:migrate:prod   # Apply migrations in production

# Utilities
npm run db:seed          # Seed database with test data
npm run db:reset         # Reset database (WARNING: deletes all data)
```

## Seed Data

The seed script creates:

- **Workshop Witten** (Main workshop location)
- **PriceMatrix** for top 10 vehicle models:
  - VW Golf 7, Golf 8, Polo, Passat B8
  - Audi A3 8V, A4 B9
  - BMW 3er F30, 3er G20
  - Mercedes C-Klasse W205
  - Opel Astra K
- **Test Customer** (kunde@test.de)
- **Test Vehicle** (VW Golf 7, 2016, 75k km)
- **Test Jockey** (username: jockey1, password: password123)
- **3 Replacement Cars**
- **Time Slots** for next 7 days

## Migrations

Migrations are stored in the `prisma/migrations` directory. Each migration has a timestamp and descriptive name.

### Creating a Migration

```bash
npm run db:migrate -- --name "add_new_field"
```

### Applying Migrations

```bash
# Development (creates DB if needed)
npm run db:migrate

# Production (requires existing DB)
npm run db:migrate:prod
```

## Schema Constraints

### Vehicle Constraints
- Year must be between 1994 and 2026
- Mileage must be between 0 and 500,000 km

### Indexes
- Customer email (unique + indexed)
- Vehicle brand/model (composite index for PriceMatrix lookups)
- Booking status, workshop, customer (for common queries)
- PriceMatrix brand/model (for price lookups)

## Database Performance

### N+1 Query Prevention

Always use `include` or `select` to fetch related data:

```typescript
// BAD: N+1 query problem
const bookings = await prisma.booking.findMany();
for (const booking of bookings) {
  const customer = await prisma.customer.findUnique({
    where: { id: booking.customerId }
  });
}

// GOOD: Single query with include
const bookings = await prisma.booking.findMany({
  include: {
    customer: true,
    vehicle: true,
    workshop: true,
  },
});
```

### Pagination

For large result sets, always use pagination:

```typescript
const bookings = await prisma.booking.findMany({
  take: 20,
  skip: 0,
  orderBy: { createdAt: 'desc' },
});
```

## Backup Strategy

### Development
```bash
# Backup
pg_dump b2c_autowartung > backup_$(date +%Y%m%d).sql

# Restore
psql b2c_autowartung < backup_20260201.sql
```

### Production (Azure)
- Automatic backups enabled (7-day retention)
- Point-in-time restore available
- Geo-redundant backups (optional)

## Troubleshooting

### Migration Conflicts

If migrations get out of sync:

```bash
# Reset database (WARNING: deletes all data)
npm run db:reset

# Or manually resolve
npx prisma migrate resolve --rolled-back "migration_name"
```

### Prisma Client Out of Sync

If you see "Prisma Client is out of sync" errors:

```bash
npm run db:generate
```

### Connection Issues

Check your DATABASE_URL in `.env`:
```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
```

## Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Database Schema Document](../../../02%20Planning/04_Database_Schema.md)
