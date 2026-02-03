---
name: database-schema
description: Database schema design and migration guidelines. Reference when designing or modifying database schema.
---

# Database Schema

Database schema design guidelines for the B2C Autowartungs-App.

## Schema Overview

```
users
  ├─ bookings
  │   ├─ extensions
  │   └─ jockey_assignments
  ├─ vehicles
  └─ payment_methods

services
  └─ service_pricing

workshops
  ├─ workshop_capacity
  └─ time_slots

jockeys
  └─ jockey_assignments

ronja_vehicles
  └─ jockey_assignments
```

## Core Tables

### Users

```prisma
model User {
  id                String    @id @default(cuid())
  email             String    @unique
  emailVerified     DateTime?
  name              String?
  phone             String?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  // Odoo integration
  odooCustomerId    Int?      @unique

  // Relations
  bookings          Booking[]
  vehicles          Vehicle[]
  paymentMethods    PaymentMethod[]

  @@index([email])
  @@map("users")
}
```

### Bookings

```prisma
model Booking {
  id                    String        @id @default(cuid())
  userId                String
  user                  User          @relation(fields: [userId], references: [id])

  // Service details
  service               ServiceType
  vehicleClass          VehicleClass
  includeConcierge      Boolean       @default(true)

  // Pricing
  basePrice             Int           // In cents
  conciergePrice        Int           @default(0)
  totalPrice            Int

  // Scheduling
  pickupTime            DateTime
  estimatedReturnTime   DateTime
  actualReturnTime      DateTime?

  // Location
  pickupAddress         String
  pickupPostalCode      String
  pickupCity            String
  pickupLat             Float?
  pickupLng             Float?

  // Status
  status                BookingStatus @default(PENDING)
  paymentStatus         PaymentStatus @default(PENDING)
  paidAt                DateTime?

  // Payment integration
  stripePaymentIntentId String?       @unique
  paymentError          String?

  // Odoo integration
  odooInvoiceId         Int?          @unique

  // Workflow tracking
  workshopCheckinAt     DateTime?
  serviceCompletedAt    DateTime?
  completedAt           DateTime?
  cancelledAt           DateTime?
  cancellationReason    String?

  createdAt             DateTime      @default(now())
  updatedAt             DateTime      @updatedAt

  // Relations
  extensions            Extension[]
  jockeyAssignments     JockeyAssignment[]

  @@index([userId])
  @@index([status])
  @@index([pickupTime])
  @@index([pickupPostalCode])
  @@map("bookings")
}

enum ServiceType {
  OIL_SERVICE
  INSPECTION
  BRAKE_SERVICE
  CLIMATE_SERVICE
}

enum VehicleClass {
  COMPACT
  MIDSIZE
  SUV
  LUXURY
}

enum BookingStatus {
  PENDING
  CONFIRMED
  IN_TRANSIT_TO_WORKSHOP
  IN_WORKSHOP
  READY_FOR_RETURN
  IN_TRANSIT_TO_CUSTOMER
  COMPLETED
  CANCELLED
}

enum PaymentStatus {
  PENDING
  PAID
  FAILED
  REFUNDED
}
```

### Extensions (Auftragserweiterung)

```prisma
model Extension {
  id                    String            @id @default(cuid())
  bookingId             String
  booking               Booking           @relation(fields: [bookingId], references: [id])

  // Extension details
  description           String
  items                 Json              // Array of {name, description, price, quantity}
  totalAmount           Int               // In cents

  // Media
  images                String[]          // URLs to S3
  videos                String[]          // URLs to S3

  // Status
  status                ExtensionStatus   @default(PENDING)
  requestedAt           DateTime          @default(now())
  approvedAt            DateTime?
  declinedAt            DateTime?
  declineReason         String?

  // Payment
  stripePaymentIntentId String?           @unique
  paymentCapturedAt     DateTime?

  // Odoo integration
  odooInvoiceId         Int?              @unique

  createdAt             DateTime          @default(now())
  updatedAt             DateTime          @updatedAt

  @@index([bookingId])
  @@index([status])
  @@map("extensions")
}

enum ExtensionStatus {
  PENDING
  APPROVED
  DECLINED
  CANCELLED
}
```

### Jockey Assignments

```prisma
model JockeyAssignment {
  id                    String                @id @default(cuid())
  bookingId             String
  booking               Booking               @relation(fields: [bookingId], references: [id])
  jockeyId              String
  jockey                Jockey                @relation(fields: [jockeyId], references: [id])
  vehicleId             String
  vehicle               RonjaVehicle          @relation(fields: [vehicleId], references: [id])

  // Type
  type                  AssignmentType        @default(PICKUP)

  // Scheduling
  scheduledTime         DateTime
  arrivedAt             DateTime?
  departedAt            DateTime?

  // Status tracking
  status                AssignmentStatus      @default(ASSIGNED)

  // Handover details
  handover              Json?                 // Photos, signatures, notes, vehicle condition

  createdAt             DateTime              @default(now())
  updatedAt             DateTime              @updatedAt

  @@index([bookingId])
  @@index([jockeyId])
  @@index([vehicleId])
  @@index([scheduledTime])
  @@map("jockey_assignments")
}

enum AssignmentType {
  PICKUP
  RETURN
}

enum AssignmentStatus {
  ASSIGNED
  EN_ROUTE_TO_PICKUP
  AT_PICKUP_LOCATION
  IN_TRANSIT_TO_WORKSHOP
  AT_WORKSHOP
  EN_ROUTE_TO_CUSTOMER
  AT_RETURN_LOCATION
  COMPLETED
  CANCELLED
}
```

### Vehicles (Customer Vehicles)

```prisma
model Vehicle {
  id                    String      @id @default(cuid())
  userId                String
  user                  User        @relation(fields: [userId], references: [id])

  // Registration details
  licensePlate          String
  vin                   String?     @unique
  make                  String
  model                 String
  year                  Int
  firstRegistration     DateTime?

  // Classification
  vehicleClass          VehicleClass

  // Documents (S3 URLs)
  registrationDocument  String?

  // Status
  isPrimary             Boolean     @default(false)
  isActive              Boolean     @default(true)

  createdAt             DateTime    @default(now())
  updatedAt             DateTime    @updatedAt

  @@index([userId])
  @@index([licensePlate])
  @@map("vehicles")
}
```

### Ronja Vehicles (Fleet)

```prisma
model RonjaVehicle {
  id                    String              @id @default(cuid())

  // Vehicle details
  licensePlate          String              @unique
  make                  String
  model                 String
  year                  Int
  color                 String
  fuelType              FuelType

  // Status
  status                VehicleStatus       @default(AVAILABLE)
  currentLocation       String?             // Address or coordinates
  mileage               Int                 @default(0)

  // Maintenance
  lastServiceDate       DateTime?
  nextServiceDue        DateTime?
  nextServiceMileage    Int?

  createdAt             DateTime            @default(now())
  updatedAt             DateTime            @updatedAt

  // Relations
  assignments           JockeyAssignment[]

  @@index([status])
  @@index([nextServiceDue])
  @@map("ronja_vehicles")
}

enum FuelType {
  GASOLINE
  DIESEL
  ELECTRIC
  HYBRID
}

enum VehicleStatus {
  AVAILABLE
  IN_USE
  MAINTENANCE
  OUT_OF_SERVICE
}
```

### Jockeys

```prisma
model Jockey {
  id                    String              @id @default(cuid())

  // Personal details
  name                  String
  email                 String              @unique
  phone                 String

  // Employment
  employeeId            String?             @unique
  status                JockeyStatus        @default(ACTIVE)

  // Location (for assignment optimization)
  currentLat            Float?
  currentLng            Float?
  lastLocationUpdate    DateTime?

  createdAt             DateTime            @default(now())
  updatedAt             DateTime            @updatedAt

  // Relations
  assignments           JockeyAssignment[]

  @@index([status])
  @@map("jockeys")
}

enum JockeyStatus {
  ACTIVE
  BUSY
  OFF_DUTY
  INACTIVE
}
```

### Payment Methods

```prisma
model PaymentMethod {
  id                    String      @id @default(cuid())
  userId                String
  user                  User        @relation(fields: [userId], references: [id])

  // Stripe details
  stripePaymentMethodId String      @unique
  type                  String      // card, sepa_debit, etc.

  // Card details (for display)
  cardBrand             String?     // visa, mastercard, etc.
  cardLast4             String?
  cardExpMonth          Int?
  cardExpYear           Int?

  // Status
  isDefault             Boolean     @default(false)
  isActive              Boolean     @default(true)

  createdAt             DateTime    @default(now())
  updatedAt             DateTime    @updatedAt

  @@index([userId])
  @@map("payment_methods")
}
```

## Service Configuration

### Services

```prisma
model Service {
  id                    String            @id @default(cuid())

  // Service details
  type                  ServiceType       @unique
  name                  String
  description           String

  // Duration (in minutes)
  estimatedDuration     Int

  // Availability
  isActive              Boolean           @default(true)

  createdAt             DateTime          @default(now())
  updatedAt             DateTime          @updatedAt

  // Relations
  pricing               ServicePricing[]

  @@map("services")
}
```

### Service Pricing

```prisma
model ServicePricing {
  id                    String        @id @default(cuid())
  serviceId             String
  service               Service       @relation(fields: [serviceId], references: [id])

  // Pricing by vehicle class
  vehicleClass          VehicleClass
  basePrice             Int           // In cents
  conciergePrice        Int           // Additional cost for concierge

  // Effective dates
  validFrom             DateTime      @default(now())
  validUntil            DateTime?

  createdAt             DateTime      @default(now())
  updatedAt             DateTime      @updatedAt

  @@unique([serviceId, vehicleClass, validFrom])
  @@index([serviceId])
  @@map("service_pricing")
}
```

## Workshop Management

### Workshops

```prisma
model Workshop {
  id                    String              @id @default(cuid())

  // Workshop details
  name                  String
  address               String
  postalCode            String
  city                  String
  lat                   Float
  lng                   Float

  // Contact
  phone                 String
  email                 String

  // Service radius (in km)
  serviceRadius         Int                 @default(60)

  // Status
  isActive              Boolean             @default(true)

  createdAt             DateTime            @default(now())
  updatedAt             DateTime            @updatedAt

  // Relations
  capacity              WorkshopCapacity[]
  timeSlots             TimeSlot[]

  @@index([postalCode])
  @@map("workshops")
}
```

### Workshop Capacity

```prisma
model WorkshopCapacity {
  id                    String      @id @default(cuid())
  workshopId            String
  workshop              Workshop    @relation(fields: [workshopId], references: [id])

  // Capacity
  date                  DateTime    @db.Date
  maxBookings           Int         @default(20)
  currentBookings       Int         @default(0)

  // Special dates
  isHoliday             Boolean     @default(false)
  note                  String?

  createdAt             DateTime    @default(now())
  updatedAt             DateTime    @updatedAt

  @@unique([workshopId, date])
  @@index([workshopId])
  @@index([date])
  @@map("workshop_capacity")
}
```

### Time Slots

```prisma
model TimeSlot {
  id                    String      @id @default(cuid())
  workshopId            String
  workshop              Workshop    @relation(fields: [workshopId], references: [id])

  // Slot details
  startTime             DateTime
  endTime               DateTime

  // Capacity
  maxBookings           Int         @default(1)
  currentBookings       Int         @default(0)

  // Status
  isAvailable           Boolean     @default(true)

  createdAt             DateTime    @default(now())
  updatedAt             DateTime    @updatedAt

  @@unique([workshopId, startTime])
  @@index([workshopId])
  @@index([startTime])
  @@map("time_slots")
}
```

## Sync & Queue Tracking

### Odoo Sync Status

```prisma
model OdooSyncStatus {
  id                    String        @id @default(cuid())

  // Entity tracking
  entityType            String        // user, booking, invoice, etc.
  entityId              String

  // Odoo reference
  odooId                Int?

  // Status
  status                SyncStatus    @default(PENDING)
  lastSyncAttempt       DateTime?
  syncError             String?
  attempts              Int           @default(0)

  createdAt             DateTime      @default(now())
  updatedAt             DateTime      @updatedAt

  @@unique([entityType, entityId])
  @@index([status])
  @@map("odoo_sync_status")
}

enum SyncStatus {
  PENDING
  SYNCED
  FAILED
}
```

### Failed Operations

```prisma
model FailedOperation {
  id                    String      @id @default(cuid())

  // Operation details
  operation             String      // Type of operation
  payload               Json        // Original data
  error                 String      // Error message
  stackTrace            String?     // Full stack trace

  // Resolution
  resolvedAt            DateTime?
  resolvedBy            String?     // User ID who resolved it
  resolution            String?     // How it was resolved

  createdAt             DateTime    @default(now())
  updatedAt             DateTime    @updatedAt

  @@index([operation])
  @@index([createdAt])
  @@map("failed_operations")
}
```

## Migration Best Practices

### Writing Migrations

```prisma
// 1. Generate migration
npx prisma migrate dev --name add_extensions_table

// 2. Review generated SQL
// migrations/20260201120000_add_extensions_table/migration.sql

// 3. Add data migration if needed
// migrations/20260201120000_add_extensions_table/data.sql
```

### Data Migrations

```sql
-- Example: Backfill missing data
UPDATE bookings
SET estimated_return_time = pickup_time + INTERVAL '8 hours'
WHERE estimated_return_time IS NULL;
```

### Rollback Plan

Always include down migration:

```sql
-- down.sql
DROP TABLE IF EXISTS extensions;
ALTER TABLE bookings DROP COLUMN IF EXISTS extension_approved;
```

## Indexing Strategy

### Query Patterns

Common queries to optimize:

```sql
-- User's bookings
SELECT * FROM bookings WHERE user_id = ? ORDER BY created_at DESC;
-- Index: (user_id, created_at)

-- Available slots
SELECT * FROM time_slots
WHERE workshop_id = ?
  AND start_time > ?
  AND is_available = true;
-- Index: (workshop_id, start_time, is_available)

-- Pending sync
SELECT * FROM odoo_sync_status
WHERE status = 'PENDING'
ORDER BY created_at ASC;
-- Index: (status, created_at)
```

### Index Guidelines

- Index foreign keys
- Index fields used in WHERE clauses
- Index fields used for sorting
- Consider composite indexes for common query patterns
- Monitor slow queries and add indexes as needed

## Schema Validation

```typescript
// Validate schema matches Prisma types
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function validateSchema() {
  // Check constraints
  const user = await prisma.user.findFirst();
  if (user && !user.email) {
    throw new Error('Email should be required');
  }

  // Check indexes exist
  const indexes = await prisma.$queryRaw`
    SELECT indexname FROM pg_indexes
    WHERE tablename = 'bookings';
  `;
  console.log('Bookings indexes:', indexes);
}
```

## Backup Strategy

```bash
# Daily backups
pg_dump -h localhost -U postgres b2c_app > backup_$(date +%Y%m%d).sql

# Point-in-time recovery
# Enable WAL archiving in postgresql.conf

# Test restore regularly
psql -U postgres b2c_app_test < backup_20260201.sql
```
