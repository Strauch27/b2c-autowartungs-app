# Quick Start Guide

Get the database up and running in 5 minutes.

## Prerequisites

- Node.js 18+
- PostgreSQL 16

## 1. Setup PostgreSQL

```bash
# macOS
brew install postgresql@16
brew services start postgresql@16

# Ubuntu
sudo apt install postgresql-16
sudo systemctl start postgresql

# Create database
psql postgres
CREATE DATABASE b2c_autowartung;
\q
```

## 2. Configure Environment

```bash
# Copy environment file
cp .env.example .env

# Edit .env and set:
# DATABASE_URL="postgresql://postgres:password@localhost:5432/b2c_autowartung?schema=public"
```

## 3. Install & Migrate

```bash
# Install dependencies
npm install

# Generate Prisma Client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed test data
npm run db:seed
```

## 4. Verify Setup

```bash
# Open Prisma Studio
npm run db:studio
```

Visit http://localhost:5555 to browse your database.

## What You Get

After seeding, you'll have:

### Test Accounts
- **Customer:** kunde@test.de
- **Jockey:** jockey1 / password123

### Test Vehicle
- VW Golf 7 (2016, 75,000 km, EN-MW-1234)

### Workshop
- Werkstatt Witten (Hauptstraße 1, 58452 Witten)

### PriceMatrix
- 10 popular German vehicle models with pricing

### Time Slots
- Next 7 days, 4 slots per day

## Common Commands

```bash
npm run dev              # Start dev server
npm run db:studio        # Open database GUI
npm run db:seed          # Re-seed data
npm run db:reset         # Reset database (WARNING: deletes all data!)
```

## Price Calculation Example

```typescript
import { calculateServicePrice } from './src/utils/priceCalculator';

const result = await calculateServicePrice({
  brand: 'VW',
  model: 'Golf 7',
  year: 2016,
  mileage: 75000,
  serviceType: 'INSPECTION'
});

console.log(`Price: ${result.price} EUR`); // Price: 219 EUR
```

## Key Differences from Old System

### NO Vehicle Classes!
```typescript
// ❌ OLD - Don't do this!
vehicle.class = VehicleClass.SMALL

// ✅ NEW - Do this!
vehicle.brand = "VW"
vehicle.model = "Golf 7"
vehicle.year = 2016
vehicle.mileage = 75000
```

### Required Fields
- `Vehicle.year` - Now REQUIRED
- `Vehicle.mileage` - Now REQUIRED (NEW!)
- `Booking.mileageAtBooking` - Now REQUIRED

## Need Help?

- Full setup guide: `DATABASE_SETUP.md`
- Schema details: `prisma/README.md`
- Backend docs: `README.md`
- Implementation summary: `PRISMA_IMPLEMENTATION_SUMMARY.md`

## Troubleshooting

**Connection refused?**
```bash
# Check PostgreSQL is running
pg_isready

# Check DATABASE_URL in .env
```

**Migration failed?**
```bash
# Reset and try again (dev only!)
npm run db:reset
```

**Prisma Client out of sync?**
```bash
npm run db:generate
```

## Ready to Code!

Your database is ready. Start building:

1. Implement booking endpoints
2. Add Stripe payment integration
3. Create vehicle management API
4. Build customer authentication

Happy coding! 🚀
