# B2C Autowartungs-App - Backend

Complete backend API for the B2C Autowartungs-App (Automotive Maintenance Booking Platform).

## Overview

This backend provides a RESTful API for:
- Customer registration and authentication
- Vehicle management
- Service booking with dynamic pricing
- Payment processing (Stripe)
- Concierge service (pickup/delivery)
- Workshop management
- Additional work requests (Findings)

## Key Features

### Dynamic Pricing System
**NEW:** Prices are calculated from brand/model-specific data, NOT vehicle classes!

**Old System (Removed):**
```typescript
vehicle.class = VehicleClass.SMALL // ❌ No longer used
```

**New System:**
```typescript
// Prices calculated from PriceMatrix table
vehicle.brand = "VW"
vehicle.model = "Golf 7"
vehicle.year = 2016
vehicle.mileage = 75000

// Price lookup based on brand/model/year/mileage
const price = await calculateServicePrice({
  brand: vehicle.brand,
  model: vehicle.model,
  year: vehicle.year,
  mileage: vehicle.mileage,
  serviceType: 'INSPECTION'
});
```

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 16
- npm or yarn

### Installation

1. **Clone and Install:**
```bash
cd "99 Code/backend"
npm install
```

2. **Setup Database:**
```bash
# Copy environment file
cp .env.example .env

# Edit .env and configure DATABASE_URL
# DATABASE_URL="postgresql://postgres:password@localhost:5432/b2c_autowartung?schema=public"

# Generate Prisma Client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed test data
npm run db:seed
```

3. **Start Development Server:**
```bash
npm run dev
```

The API will be available at http://localhost:3000

## Database Schema

### Core Models

#### Customer
User accounts with email authentication (Magic Link).

```typescript
{
  id: string
  email: string (unique)
  name: string
  phone: string
  street: string
  zip: string
  city: string
  stripeCustomerId: string
}
```

#### Vehicle
Customer vehicles - NO vehicle class field!

```typescript
{
  id: string
  customerId: string
  brand: string          // e.g. "VW", "Audi", "BMW"
  model: string          // e.g. "Golf 7", "A4 B9"
  year: number           // REQUIRED (was optional!)
  mileage: number        // REQUIRED (NEW!)
  licensePlate: string
  vin: string
}
```

#### PriceMatrix (NEW!)
Brand/model-specific pricing.

```typescript
{
  id: string
  brand: string          // e.g. "VW"
  model: string          // e.g. "Golf 7"
  yearFrom: number       // e.g. 2012
  yearTo: number         // e.g. 2019
  inspection30k: decimal
  inspection60k: decimal
  inspection90k: decimal
  inspection120k: decimal
  oilService: decimal
  brakeServiceFront: decimal
  brakeServiceRear: decimal
  tuv: decimal
  climateService: decimal
}
```

#### Booking
Service bookings with dynamic pricing.

```typescript
{
  id: string
  bookingNumber: string
  customerId: string
  vehicleId: string
  workshopId: string
  serviceType: ServiceType
  mileageAtBooking: number  // REQUIRED (NEW!)
  price: decimal            // Calculated from PriceMatrix
  status: BookingStatus
  pickupSlotStart: datetime
  pickupSlotEnd: datetime
  deliverySlotStart: datetime
  deliverySlotEnd: datetime
  pickupAddress: json
  deliveryAddress: json
}
```

#### Payment
Stripe payment records.

```typescript
{
  id: string
  bookingId: string
  stripePaymentId: string
  stripeStatus: string
  amount: decimal
  currency: string
  paymentType: PaymentType
}
```

#### Finding
Additional work requests (Auftragserweiterung).

```typescript
{
  id: string
  bookingId: string
  title: string
  description: string
  photos: string[]
  price: decimal
  status: FindingStatus
}
```

### Concierge Models

#### ConciergeBooking
Pickup/delivery service bookings.

```typescript
{
  id: string
  bookingId: string
  pickupJockeyId: string
  pickupStatus: ConciergeStatus
  deliveryJockeyId: string
  deliveryStatus: ConciergeStatus
  replacementCarId: string
  handoverPhotos: string[]
  handoverSignature: string
  handoverNotes: string
}
```

#### Jockey
Drivers for vehicle pickup/delivery.

```typescript
{
  id: string
  username: string
  passwordHash: string
  name: string
  phone: string
  workshopId: string
  status: JockeyStatus
}
```

### Workshop Models

#### Workshop
Workshop locations.

```typescript
{
  id: string
  name: string
  street: string
  zip: string
  city: string
  phone: string
  email: string
  openingHours: json
  maxDailySlots: number
  status: WorkshopStatus
}
```

#### Slot
Available time slots.

```typescript
{
  id: string
  workshopId: string
  date: date
  timeStart: datetime
  timeEnd: datetime
  maxCapacity: number
  currentBookings: number
  available: boolean
}
```

#### ReplacementCar
Replacement vehicles.

```typescript
{
  id: string
  brand: string
  model: string
  licensePlate: string
  status: CarStatus
}
```

## Price Calculation

### How It Works

1. **Vehicle Input:**
   - Brand: "VW"
   - Model: "Golf 7"
   - Year: 2016
   - Mileage: 75,000 km

2. **Price Lookup:**
```typescript
const priceEntry = await prisma.priceMatrix.findFirst({
  where: {
    brand: "VW",
    model: "Golf 7",
    yearFrom: { lte: 2016 },
    yearTo: { gte: 2016 }
  }
});
```

3. **Mileage Tier Determination:**
   - 0-45k km → 30k inspection
   - 45k-75k km → 60k inspection
   - 75k-105k km → 90k inspection
   - 105k+ km → 120k inspection

4. **Price Result:**
```typescript
// 75,000 km falls into 60k tier
price = priceEntry.inspection60k // e.g. 219 EUR
```

### Usage Example

```typescript
import { calculateServicePrice } from './utils/priceCalculator';

const result = await calculateServicePrice({
  brand: 'VW',
  model: 'Golf 7',
  year: 2016,
  mileage: 75000,
  serviceType: 'INSPECTION'
});

if (result.price) {
  console.log(`Price: ${result.price} EUR`);
} else {
  console.error(result.error);
}
```

## API Scripts

```bash
# Development
npm run dev              # Start dev server with hot reload
npm run build            # Build for production
npm run start            # Start production server

# Database
npm run db:generate      # Generate Prisma Client
npm run db:migrate       # Create and apply migration
npm run db:migrate:prod  # Apply migrations (production)
npm run db:seed          # Seed database with test data
npm run db:reset         # Reset database (WARNING: deletes data)
npm run db:studio        # Open Prisma Studio GUI
npm run db:push          # Push schema without migration

# Testing
npm run test             # Run tests
npm run test:watch       # Run tests in watch mode

# Code Quality
npm run lint             # Lint code
```

## Environment Variables

See `.env.example` for all configuration options.

**Required:**
- `DATABASE_URL` - PostgreSQL connection string
- `STRIPE_SECRET_KEY` - Stripe API key
- `JWT_SECRET` - JWT signing secret

**Optional:**
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `FRONTEND_URL` - Frontend URL for CORS and Magic Links
- `SENDGRID_API_KEY` - Email service API key
- `AZURE_STORAGE_CONNECTION_STRING` - Azure Blob Storage

## Test Data

After running `npm run db:seed`, you'll have:

### Workshop
- **Werkstatt Witten**
  - Address: Hauptstraße 1, 58452 Witten
  - Email: info@werkstatt-witten.de

### PriceMatrix
Top 10 German vehicle models with pricing:
- VW Golf 7, Golf 8, Polo, Passat B8
- Audi A3 8V, A4 B9
- BMW 3er F30, 3er G20
- Mercedes C-Klasse W205
- Opel Astra K

### Test Accounts
- **Customer:** kunde@test.de
- **Jockey:** jockey1 / password123

### Test Vehicle
- VW Golf 7 (2016, 75,000 km, EN-MW-1234)

### Replacement Cars
- VW Polo (EN-MW-9001)
- VW Golf (EN-MW-9002)
- Opel Corsa (EN-MW-9003)

### Time Slots
- Next 7 days (excluding Sundays)
- 4 slots per day: 8-10, 10-12, 13-15, 15-17

## Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma           # Database schema
│   ├── seed.ts                 # Seed script
│   ├── migrations/             # Migration files
│   └── README.md               # Prisma documentation
├── src/
│   ├── server.ts               # Express server setup
│   ├── routes/                 # API routes
│   ├── controllers/            # Business logic
│   ├── middleware/             # Auth, validation, etc.
│   ├── services/               # External services (Stripe, etc.)
│   └── utils/                  # Helper functions
│       └── priceCalculator.ts  # Price calculation logic
├── .env.example                # Environment template
├── package.json                # Dependencies and scripts
├── tsconfig.json               # TypeScript config
├── DATABASE_SETUP.md           # Database setup guide
└── README.md                   # This file
```

## Key Differences from Legacy System

### 1. No Vehicle Classes
**Before:**
```typescript
enum VehicleClass { SMALL, MEDIUM, LARGE }
vehicle.class = VehicleClass.SMALL
```

**After:**
```typescript
// No class field - use brand/model instead
vehicle.brand = "VW"
vehicle.model = "Golf 7"
```

### 2. Required Fields
- `Vehicle.year` - Now REQUIRED
- `Vehicle.mileage` - Now REQUIRED (NEW!)
- `Booking.mileageAtBooking` - Now REQUIRED

### 3. Price Calculation
- **Before:** Fixed prices per vehicle class
- **After:** Dynamic prices from PriceMatrix based on brand/model/year/mileage

### 4. Mileage Tracking
- Mileage now tracked at booking time
- Used to determine inspection tier
- Affects price calculation

## Documentation

- [Database Setup Guide](./DATABASE_SETUP.md)
- [Prisma Documentation](./prisma/README.md)
- [Database Schema Design](../../02%20Planning/04_Database_Schema.md)
- [Technical Impact Analysis](../../02%20Planning/TECHNICAL_IMPACT_ANALYSIS.md)

## Support

For issues or questions:
1. Check documentation in `02 Planning/`
2. Review Prisma logs: `DEBUG=* npm run db:migrate`
3. Consult database setup guide

## License

MIT
