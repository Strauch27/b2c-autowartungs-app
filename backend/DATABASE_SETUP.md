# Database Setup Guide

Complete guide for setting up the PostgreSQL database with Prisma for the B2C Autowartungs-App.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL 16 installed and running
- npm or yarn package manager

## Quick Setup (Development)

### 1. Install PostgreSQL

**macOS (Homebrew):**
```bash
brew install postgresql@16
brew services start postgresql@16
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql-16
sudo systemctl start postgresql
```

**Windows:**
Download and install from [postgresql.org](https://www.postgresql.org/download/windows/)

### 2. Create Database

```bash
# Connect to PostgreSQL
psql postgres

# Create database
CREATE DATABASE b2c_autowartung;

# Create user (optional)
CREATE USER autowartung_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE b2c_autowartung TO autowartung_user;

# Exit psql
\q
```

### 3. Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit .env and update DATABASE_URL
# Example:
# DATABASE_URL="postgresql://postgres:password@localhost:5432/b2c_autowartung?schema=public"
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Run Migrations

```bash
# Generate Prisma Client
npm run db:generate

# Apply migrations to database
npm run db:migrate

# Seed database with test data
npm run db:seed
```

### 6. Verify Setup

```bash
# Open Prisma Studio to browse data
npm run db:studio
```

Visit http://localhost:5555 to view your database in Prisma Studio.

## Database Schema Overview

### Key Changes from Legacy System

#### No Vehicle Classes!
The old system used vehicle class enums (Small, Medium, Large). The new system uses the `PriceMatrix` table to store brand/model-specific pricing.

**Old System:**
```typescript
enum VehicleClass { SMALL, MEDIUM, LARGE }
vehicle.class = VehicleClass.SMALL
```

**New System:**
```typescript
// No class field!
vehicle.brand = "VW"
vehicle.model = "Golf 7"
vehicle.year = 2016
vehicle.mileage = 75000

// Price lookup from PriceMatrix
const priceEntry = await prisma.priceMatrix.findFirst({
  where: {
    brand: vehicle.brand,
    model: vehicle.model,
    yearFrom: { lte: vehicle.year },
    yearTo: { gte: vehicle.year }
  }
});
```

#### Required Fields
- `Vehicle.year` - Now REQUIRED (was optional)
- `Vehicle.mileage` - Now REQUIRED (NEW field)
- `Booking.mileageAtBooking` - Now REQUIRED for accurate pricing

### Core Tables

1. **Customer** - User accounts
2. **Vehicle** - Customer vehicles (NO vehicle class!)
3. **PriceMatrix** - Brand/model-specific pricing (NEW!)
4. **Booking** - Service bookings
5. **Payment** - Stripe payments
6. **Finding** - Additional work requests
7. **ConciergeBooking** - Pickup/delivery service
8. **Workshop** - Workshop locations
9. **Jockey** - Drivers
10. **Slot** - Time slots
11. **ReplacementCar** - Replacement vehicles

## Test Data

The seed script creates:

### Workshop
- **Name:** Werkstatt Witten
- **Address:** Hauptstraße 1, 58452 Witten
- **Email:** info@werkstatt-witten.de

### PriceMatrix (Top 10 Models)
- VW Golf 7 (2012-2019)
- VW Golf 8 (2019-2026)
- VW Passat B8 (2014-2023)
- VW Polo (2017-2026)
- Audi A4 B9 (2015-2023)
- Audi A3 8V (2012-2020)
- BMW 3er G20 (2019-2026)
- BMW 3er F30 (2012-2019)
- Mercedes C-Klasse W205 (2014-2021)
- Opel Astra K (2015-2026)

### Test Customer
- **Email:** kunde@test.de
- **Name:** Max Mustermann
- **Address:** Musterstraße 42, 58452 Witten

### Test Vehicle
- **Brand:** VW
- **Model:** Golf 7
- **Year:** 2016
- **Mileage:** 75,000 km
- **License Plate:** EN-MW-1234

### Test Jockey
- **Username:** jockey1
- **Password:** password123
- **Name:** Hans Fahrer

### Replacement Cars
- VW Polo (EN-MW-9001)
- VW Golf (EN-MW-9002)
- Opel Corsa (EN-MW-9003)

### Time Slots
- Next 7 days (excluding Sundays)
- 4 slots per day: 8-10, 10-12, 13-15, 15-17
- Capacity: 4 bookings per slot

## Common Tasks

### Reset Database

```bash
# WARNING: This deletes ALL data!
npm run db:reset
```

### Create New Migration

```bash
# After editing schema.prisma
npm run db:migrate -- --name "add_new_field"
```

### Push Schema Without Migration

```bash
# For rapid prototyping (dev only!)
npm run db:push
```

### View Database

```bash
# Open Prisma Studio GUI
npm run db:studio
```

## Production Deployment

### Azure PostgreSQL

1. **Create Azure Database:**
```bash
az postgres flexible-server create \
  --name b2c-autowartung-db \
  --resource-group b2c-autowartung-rg \
  --location westeurope \
  --admin-user dbadmin \
  --admin-password <strong-password> \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --version 16
```

2. **Configure Firewall:**
```bash
az postgres flexible-server firewall-rule create \
  --name b2c-autowartung-db \
  --resource-group b2c-autowartung-rg \
  --rule-name AllowAllAzureIPs \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0
```

3. **Update Environment:**
```bash
# Set DATABASE_URL in production environment
DATABASE_URL="postgresql://dbadmin:<password>@b2c-autowartung-db.postgres.database.azure.com:5432/b2c_autowartung?sslmode=require"
```

4. **Run Migrations:**
```bash
npm run db:migrate:prod
```

### Backup Strategy

**Development:**
```bash
# Backup
pg_dump b2c_autowartung > backup_$(date +%Y%m%d).sql

# Restore
psql b2c_autowartung < backup_20260201.sql
```

**Production (Azure):**
- Automatic backups (7-day retention)
- Point-in-time restore
- Geo-redundant backups (optional)

## Troubleshooting

### Connection Refused

**Issue:** `Error: connect ECONNREFUSED`

**Solution:**
1. Verify PostgreSQL is running: `pg_isready`
2. Check DATABASE_URL in `.env`
3. Ensure PostgreSQL is listening on correct port (default: 5432)

### Migration Conflicts

**Issue:** `Migration failed to apply cleanly`

**Solution:**
```bash
# Option 1: Reset database (dev only!)
npm run db:reset

# Option 2: Mark migration as applied
npx prisma migrate resolve --applied "migration_name"

# Option 3: Mark migration as rolled back
npx prisma migrate resolve --rolled-back "migration_name"
```

### Prisma Client Out of Sync

**Issue:** `Prisma Client is out of sync with schema`

**Solution:**
```bash
npm run db:generate
```

### Seed Fails with bcrypt Error

**Issue:** `Error: Cannot find module 'bcrypt'`

**Solution:**
```bash
# Reinstall bcrypt
npm uninstall bcrypt
npm install bcrypt
```

### Database Constraints Violated

**Issue:** Vehicle year/mileage validation fails

**Solution:**
Check data meets constraints:
- Year: 1994-2026
- Mileage: 0-500,000 km

## Performance Optimization

### Indexes

All critical indexes are created automatically via migration:
- Customer email (unique + indexed)
- Vehicle brand/model (composite)
- Booking status, customer, workshop
- PriceMatrix brand/model lookup

### Query Optimization

**Avoid N+1 queries:**
```typescript
// Bad
const bookings = await prisma.booking.findMany();
for (const booking of bookings) {
  const customer = await prisma.customer.findUnique({
    where: { id: booking.customerId }
  });
}

// Good
const bookings = await prisma.booking.findMany({
  include: {
    customer: true,
    vehicle: true,
    workshop: true,
  },
});
```

**Use pagination:**
```typescript
const bookings = await prisma.booking.findMany({
  take: 20,
  skip: 0,
  orderBy: { createdAt: 'desc' },
});
```

### Connection Pooling

Production configuration in `schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  // Connection pool settings
  // connection_limit = 10
  // pool_timeout = 20
}
```

## Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/16/)
- [Database Schema Design](../../02%20Planning/04_Database_Schema.md)
- [Technical Impact Analysis](../../02%20Planning/TECHNICAL_IMPACT_ANALYSIS.md)

## Support

For issues or questions:
1. Check troubleshooting section above
2. Review Prisma logs: `DEBUG=* npm run db:migrate`
3. Consult database schema documentation
