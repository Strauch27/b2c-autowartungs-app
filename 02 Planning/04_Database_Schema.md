# Database Schema - B2C Autowartungs-App

**Version:** 1.0  
**Datum:** 2026-02-01  
**ORM:** Prisma 5.22+  
**Database:** PostgreSQL 16

---

## Executive Summary

Dieses Dokument beschreibt das vollständige Datenmodell der B2C Autowartungs-App basierend auf den Anforderungen aus `TECHNICAL_IMPACT_ANALYSIS.md`.

**Wichtige Änderungen:**
- **Fahrzeugklassen entfernt:** Preiskalkulation basiert auf Marke/Modell, NICHT auf pauschalen Fahrzeugklassen
- **Pflichtfelder erweitert:** Baujahr + Kilometerstand sind jetzt PFLICHT
- **Neue Tabelle:** `PriceMatrix` für marke/modell-spezifische Preise

---

## 1. Entity Relationship Diagram

\`\`\`
┌──────────────┐         ┌──────────────┐
│   Customer   │───────< │   Vehicle    │
└──────────────┘         └──────────────┘
       │                        │
       │                        │
       └────────┬───────────────┘
                │
                ▼
         ┌──────────────┐
         │   Booking    │
         └──────────────┘
                │
       ┌────────┴────────┬──────────────┐
       │                 │              │
       ▼                 ▼              ▼
┌─────────────┐   ┌──────────────┐  ┌─────────────┐
│  Payment    │   │   Finding    │  │ Concierge   │
│             │   │ (Auftrags-   │  │   Booking   │
│             │   │  erweiterung)│  │             │
└─────────────┘   └──────────────┘  └─────────────┘

┌──────────────┐         ┌──────────────┐
│   Workshop   │         │    Jockey    │
└──────────────┘         └──────────────┘
       │                        │
       └────────┬───────────────┘
                │
                ▼
         ┌──────────────┐
         │     Slot     │
         └──────────────┘
         
┌──────────────────────┐
│    PriceMatrix       │  NEU!
│ (Marke/Modell-Preise)│
└──────────────────────┘
\`\`\`

---

## 2. Prisma Schema

### 2.1 Customer (Kunde)

\`\`\`prisma
model Customer {
  id        String   @id @default(cuid())
  email     String   @unique
  phone     String?
  name      String?
  
  // Adresse
  street    String?
  zip       String?
  city      String?
  
  // Stripe
  stripeCustomerId String? @unique
  
  // Relationen
  vehicles  Vehicle[]
  bookings  Booking[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  deletedAt DateTime? // Soft-Delete für DSGVO
  
  @@index([email])
}
\`\`\`

**Wichtig:**
- E-Mail ist Pflicht (für Magic Link)
- Name + Adresse werden bei erster Buchung erfasst
- Stripe Customer ID für wiederholte Zahlungen
- Soft-Delete für DSGVO-Compliance

---

### 2.2 Vehicle (Fahrzeug)

\`\`\`prisma
model Vehicle {
  id             String   @id @default(cuid())
  customerId     String
  customer       Customer @relation(fields: [customerId], references: [id])
  
  // PFLICHTFELDER (gemäß TECHNICAL_IMPACT_ANALYSIS)
  brand          String   // z.B. "VW", "Audi", "BMW"
  model          String   // z.B. "Golf 7", "A4 B9", "3er G20"
  year           Int      // Baujahr (PFLICHT, war vorher optional!)
  mileage        Int      // Kilometerstand (NEU: PFLICHT!)
  
  // ENTFERNT: class VehicleClass → Keine Fahrzeugklassen mehr!
  
  // Optional
  licensePlate   String?
  vin            String?  // Fahrzeug-Identnummer (Post-MVP)
  
  // Relationen
  bookings       Booking[]
  
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  @@index([customerId])
  @@index([brand, model]) // Für PriceMatrix-Lookup
  
  // Constraints
  @@check(year >= 1994 && year <= 2026)
  @@check(mileage >= 0 && mileage <= 500000)
}
\`\`\`

**Änderungen:**
- `year` von Optional zu PFLICHT
- `mileage` NEU hinzugefügt (PFLICHT)
- `class` (VehicleClass) ENTFERNT
- Constraints für Plausibilitätsprüfung

---

### 2.3 PriceMatrix (NEU!)

\`\`\`prisma
model PriceMatrix {
  id        String   @id @default(cuid())
  
  // Fahrzeug-Definition
  brand     String   // z.B. "VW"
  model     String   // z.B. "Golf 7"
  yearFrom  Int      // Gültig ab Baujahr (z.B. 2012)
  yearTo    Int      // Gültig bis Baujahr (z.B. 2019)
  
  // Service-Preise nach Kilometerstand
  inspection30k  Decimal? @db.Decimal(10, 2) // Inspektion bei 30.000 km
  inspection60k  Decimal? @db.Decimal(10, 2) // Inspektion bei 60.000 km
  inspection90k  Decimal? @db.Decimal(10, 2) // Inspektion bei 90.000 km
  inspection120k Decimal? @db.Decimal(10, 2) // Inspektion bei 120.000+ km
  
  // Weitere Services
  oilService          Decimal? @db.Decimal(10, 2)
  brakeServiceFront   Decimal? @db.Decimal(10, 2)
  brakeServiceRear    Decimal? @db.Decimal(10, 2)
  tuv                 Decimal? @db.Decimal(10, 2)
  climateService      Decimal? @db.Decimal(10, 2)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@unique([brand, model, yearFrom, yearTo])
  @@index([brand, model])
}
\`\`\`

**Beispiel-Daten:**
\`\`\`sql
INSERT INTO "PriceMatrix" (brand, model, yearFrom, yearTo, inspection30k, inspection60k, inspection90k, oilService, brakeServiceFront)
VALUES
  ('VW', 'Golf 7', 2012, 2019, 189, 219, 289, 159, 349),
  ('VW', 'Golf 8', 2019, 2026, 199, 229, 299, 169, 359),
  ('Audi', 'A4 B9', 2015, 2023, 249, 289, 359, 199, 449),
  ('BMW', '3er G20', 2019, 2026, 269, 309, 379, 219, 479);
\`\`\`

---

### 2.4 Booking (Buchung)

\`\`\`prisma
model Booking {
  id                  String   @id @default(cuid())
  bookingNumber       String   @unique @default(cuid())
  
  // Relationen
  customerId          String
  customer            Customer @relation(fields: [customerId], references: [id])
  
  vehicleId           String
  vehicle             Vehicle  @relation(fields: [vehicleId], references: [id])
  
  workshopId          String
  workshop            Workshop @relation(fields: [workshopId], references: [id])
  
  // Service
  serviceType         ServiceType
  mileageAtBooking    Int      // NEU: Kilometerstand bei Buchung (PFLICHT)
  
  // Preis
  price               Decimal  @db.Decimal(10, 2) // Berechnet aus PriceMatrix!
  
  // Status
  status              BookingStatus @default(PENDING)
  
  // Slots
  pickupSlotStart     DateTime
  pickupSlotEnd       DateTime
  deliverySlotStart   DateTime?
  deliverySlotEnd     DateTime?
  
  // Adressen
  pickupAddress       Json     // { street, zip, city }
  deliveryAddress     Json?
  
  // Integrationen
  stripePaymentId     String?
  odooOrderId         Int?
  
  // Concierge
  jockeyId            String?
  jockey              Jockey?  @relation(fields: [jockeyId], references: [id])
  concierge           ConciergeBooking?
  
  // Relationen
  payments            Payment[]
  findings            Finding[]
  
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
  
  @@index([customerId])
  @@index([workshopId])
  @@index([status])
  @@index([pickupSlotStart])
}

enum BookingStatus {
  PENDING           // Erstellt, Zahlung ausstehend
  CONFIRMED         // Zahlung erfolgt
  PICKUP_SCHEDULED  // Abholung geplant
  IN_WORKSHOP       // In Werkstatt
  READY             // Fertig, Rückgabe ausstehend
  COMPLETED         // Abgeschlossen
  CANCELLED         // Storniert
}

enum ServiceType {
  INSPECTION        // Inspektion/Wartung (Hauptprodukt)
  OIL_SERVICE       // Ölservice
  BRAKE_SERVICE     // Bremsservice
  TUV               // TÜV/HU
  CLIMATE_SERVICE   // Klimaservice
}
\`\`\`

**Änderungen:**
- `mileageAtBooking` NEU (Pflicht)
- `price` wird aus PriceMatrix berechnet, NICHT aus Fahrzeugklasse

---

### 2.5 Payment (Zahlung)

\`\`\`prisma
model Payment {
  id                String   @id @default(cuid())
  
  bookingId         String
  booking           Booking  @relation(fields: [bookingId], references: [id])
  
  // Stripe
  stripePaymentId   String   @unique
  stripeStatus      String   // succeeded, failed, pending
  
  amount            Decimal  @db.Decimal(10, 2)
  currency          String   @default("eur")
  
  // Typ
  paymentType       PaymentType @default(BOOKING)
  
  // Relationen
  findingId         String?  // Falls Auftragserweiterung
  finding           Finding? @relation(fields: [findingId], references: [id])
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  @@index([bookingId])
  @@index([stripePaymentId])
}

enum PaymentType {
  BOOKING           // Initiale Buchung
  FINDING           // Auftragserweiterung
  REFUND            // Rückerstattung
}
\`\`\`

---

### 2.6 Finding (Auftragserweiterung)

\`\`\`prisma
model Finding {
  id          String   @id @default(cuid())
  
  bookingId   String
  booking     Booking  @relation(fields: [bookingId], references: [id])
  
  // Beschreibung
  title       String
  description String   @db.Text
  photos      String[] // Array von URLs (Azure Blob Storage)
  
  // Preis
  price       Decimal  @db.Decimal(10, 2)
  
  // Status
  status      FindingStatus @default(PENDING)
  
  // Zeitstempel
  createdAt   DateTime @default(now())
  approvedAt  DateTime?
  rejectedAt  DateTime?
  
  // Relationen
  payments    Payment[]
  
  @@index([bookingId])
  @@index([status])
}

enum FindingStatus {
  PENDING     // Warte auf Kundenentscheidung
  APPROVED    // Kunde hat freigegeben
  REJECTED    // Kunde hat abgelehnt
  COMPLETED   // Arbeit durchgeführt
}
\`\`\`

---

### 2.7 ConciergeBooking (Hol-/Bringservice)

\`\`\`prisma
model ConciergeBooking {
  id                    String   @id @default(cuid())
  
  bookingId             String   @unique
  booking               Booking  @relation(fields: [bookingId], references: [id])
  
  // Abholung
  pickupJockeyId        String?
  pickupJockey          Jockey?  @relation(name: "PickupJockey", fields: [pickupJockeyId], references: [id])
  pickupStatus          ConciergeStatus @default(SCHEDULED)
  pickupCompletedAt     DateTime?
  
  // Rückgabe
  deliveryJockeyId      String?
  deliveryJockey        Jockey?  @relation(name: "DeliveryJockey", fields: [deliveryJockeyId], references: [id])
  deliveryStatus        ConciergeStatus @default(SCHEDULED)
  deliveryCompletedAt   DateTime?
  
  // Ersatzfahrzeug
  replacementCarId      String?
  replacementCar        ReplacementCar? @relation(fields: [replacementCarId], references: [id])
  
  // Fahrzeugübergabe
  handoverPhotos        String[] // Fotos bei Übergabe
  handoverSignature     String?  // Base64 Unterschrift
  handoverNotes         String?  @db.Text
  
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  
  @@index([bookingId])
  @@index([pickupJockeyId])
  @@index([deliveryJockeyId])
}

enum ConciergeStatus {
  SCHEDULED    // Geplant
  IN_PROGRESS  // Unterwegs
  COMPLETED    // Abgeschlossen
  FAILED       // Fehlgeschlagen (z.B. No-Show)
}
\`\`\`

---

### 2.8 Workshop (Werkstatt)

\`\`\`prisma
model Workshop {
  id          String   @id @default(cuid())
  name        String
  
  // Adresse
  street      String
  zip         String
  city        String
  
  // Kontakt
  phone       String
  email       String
  
  // Öffnungszeiten
  openingHours Json   // { "monday": "8-18", "tuesday": "8-18", ... }
  
  // Kapazität
  maxDailySlots Int   @default(16) // 4 Slots à 2h, 4 pro Slot
  
  // Status
  status      WorkshopStatus @default(ACTIVE)
  
  // Relationen
  bookings    Booking[]
  jockeys     Jockey[]
  slots       Slot[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([status])
}

enum WorkshopStatus {
  ACTIVE      // Aktiv
  INACTIVE    // Inaktiv (z.B. Urlaub)
  MAINTENANCE // Wartung
}
\`\`\`

---

### 2.9 Jockey (Fahrer)

\`\`\`prisma
model Jockey {
  id          String   @id @default(cuid())
  username    String   @unique
  passwordHash String
  
  name        String
  phone       String
  
  workshopId  String
  workshop    Workshop @relation(fields: [workshopId], references: [id])
  
  status      JockeyStatus @default(AVAILABLE)
  
  // Relationen
  bookings           Booking[]
  pickups            ConciergeBooking[] @relation("PickupJockey")
  deliveries         ConciergeBooking[] @relation("DeliveryJockey")
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([workshopId])
  @@index([status])
}

enum JockeyStatus {
  AVAILABLE   // Verfügbar
  BUSY        // Beschäftigt
  OFFLINE     // Offline
}
\`\`\`

---

### 2.10 Slot (Zeitslot)

\`\`\`prisma
model Slot {
  id              String   @id @default(cuid())
  
  workshopId      String
  workshop        Workshop @relation(fields: [workshopId], references: [id])
  
  date            DateTime @db.Date
  timeStart       DateTime
  timeEnd         DateTime
  
  maxCapacity     Int      @default(4)
  currentBookings Int      @default(0)
  
  available       Boolean  @default(true)
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@unique([workshopId, date, timeStart])
  @@index([workshopId, date])
  @@index([available])
}
\`\`\`

---

### 2.11 ReplacementCar (Ersatzfahrzeug)

\`\`\`prisma
model ReplacementCar {
  id              String   @id @default(cuid())
  
  brand           String
  model           String
  licensePlate    String   @unique
  
  status          CarStatus @default(AVAILABLE)
  
  // Relationen
  conciergeBookings ConciergeBooking[]
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@index([status])
}

enum CarStatus {
  AVAILABLE   // Verfügbar
  IN_USE      // Im Einsatz
  MAINTENANCE // Wartung
}
\`\`\`

---

## 3. Migrations-Strategie

### 3.1 Initial Migration

\`\`\`bash
# Schema erstellen
npx prisma migrate dev --name init

# Seed-Daten einfügen
npm run db:seed
\`\`\`

### 3.2 Migrations-Plan

**Sprint 1:**
- Core Models (Customer, Vehicle, Booking)
- PriceMatrix-Tabelle
- Payment-Model

**Sprint 2:**
- ConciergeBooking, Jockey
- Slot-Management
- ReplacementCar

**Sprint 3:**
- Finding (Auftragserweiterung)
- Workshop-Model erweitern
- Performance-Optimierungen

---

## 4. Performance-Optimierungen

### 4.1 Indexe

\`\`\`sql
-- Häufige Queries optimieren
CREATE INDEX idx_booking_customer ON "Booking"("customerId");
CREATE INDEX idx_booking_workshop ON "Booking"("workshopId");
CREATE INDEX idx_booking_status ON "Booking"("status");
CREATE INDEX idx_vehicle_brand_model ON "Vehicle"("brand", "model");
CREATE INDEX idx_pricematrix_lookup ON "PriceMatrix"("brand", "model");
\`\`\`

### 4.2 N+1-Query-Vermeidung

\`\`\`typescript
// BAD: N+1 Query
const bookings = await prisma.booking.findMany();
for (const booking of bookings) {
  const customer = await prisma.customer.findUnique({ where: { id: booking.customerId } });
}

// GOOD: Single Query mit Include
const bookings = await prisma.booking.findMany({
  include: {
    customer: true,
    vehicle: true,
    workshop: true,
  },
});
\`\`\`

---

## 5. Data-Seeding (Test-Daten)

### prisma/seed.ts

\`\`\`typescript
async function main() {
  // Werkstatt Witten
  const workshop = await prisma.workshop.create({
    data: {
      name: 'Werkstatt Witten',
      street: 'Hauptstraße 1',
      zip: '58452',
      city: 'Witten',
      phone: '+49 2302 123456',
      email: 'info@werkstatt-witten.de',
      openingHours: {
        monday: '8-18',
        tuesday: '8-18',
        wednesday: '8-18',
        thursday: '8-18',
        friday: '8-18',
        saturday: '8-14',
        sunday: 'closed',
      },
    },
  });

  // PriceMatrix einfügen (Top 10 Modelle)
  await prisma.priceMatrix.createMany({
    data: [
      { brand: 'VW', model: 'Golf 7', yearFrom: 2012, yearTo: 2019, inspection30k: 189, inspection60k: 219, inspection90k: 289, oilService: 159, brakeServiceFront: 349 },
      { brand: 'VW', model: 'Golf 8', yearFrom: 2019, yearTo: 2026, inspection30k: 199, inspection60k: 229, inspection90k: 299, oilService: 169, brakeServiceFront: 359 },
      { brand: 'VW', model: 'Passat B8', yearFrom: 2014, yearTo: 2023, inspection30k: 219, inspection60k: 259, inspection90k: 329, oilService: 179, brakeServiceFront: 399 },
      { brand: 'Audi', model: 'A4 B9', yearFrom: 2015, yearTo: 2023, inspection30k: 249, inspection60k: 289, inspection90k: 359, oilService: 199, brakeServiceFront: 449 },
      { brand: 'BMW', model: '3er G20', yearFrom: 2019, yearTo: 2026, inspection30k: 269, inspection60k: 309, inspection90k: 379, oilService: 219, brakeServiceFront: 479 },
      // ... weitere 5 Modelle
    ],
  });

  // Test-Kunde
  await prisma.customer.create({
    data: {
      email: 'kunde@test.de',
      name: 'Max Mustermann',
      street: 'Musterstraße 1',
      zip: '58452',
      city: 'Witten',
      phone: '+49170123456',
    },
  });

  // Test-Jockey
  await prisma.jockey.create({
    data: {
      username: 'jockey1',
      passwordHash: await bcrypt.hash('password', 10),
      name: 'Hans Fahrer',
      phone: '+49170234567',
      workshopId: workshop.id,
    },
  });

  console.log('Seeding completed!');
}
\`\`\`

---

## 6. Backup-Strategie

### 6.1 Lokal (Development)

\`\`\`bash
# Tägliches Backup
pg_dump b2c_autowartung > backup_$(date +%Y%m%d).sql

# Restore
psql b2c_autowartung < backup_20260201.sql
\`\`\`

### 6.2 Azure (Production)

- Automatische Backups (7 Tage Retention)
- Point-in-Time-Restore
- Geo-Redundanz (optional)

---

**Status:** READY FOR IMPLEMENTATION

**Letzte Aktualisierung:** 2026-02-01
