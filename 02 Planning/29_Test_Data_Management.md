# Test Data Management - B2C Autowartungs-App

**Version:** 1.0
**Datum:** 2026-02-01
**Status:** Ready to Implement
**Autor:** QA & Test Engineer

---

## Inhaltsverzeichnis

1. [Strategie & Prinzipien](#strategie--prinzipien)
2. [Fixtures & Test-Daten](#fixtures--test-daten)
3. [Database Seeding](#database-seeding)
4. [Test Data Builders](#test-data-builders)
5. [Mocks & Stubs](#mocks--stubs)
6. [Data Cleanup Strategien](#data-cleanup-strategien)
7. [Sensitive Data Management](#sensitive-data-management)

---

## Strategie & Prinzipien

### Grundprinzipien

1. **Realistic Data**: Testdaten sollen echten Nutzungsdaten ähneln
2. **Isolation**: Jeder Test nutzt eigene Daten (keine Shared State)
3. **Reproducibility**: Tests müssen deterministisch sein
4. **Performance**: Minimale Daten seeden, schnelles Setup
5. **GDPR-Compliant**: Keine echten Kundendaten in Tests

### Test Data Pyramide

```
        /\
       /  \  Generated (Faker.js)
      /----\  Dynamisch generiert für jeden Test
     /      \
    /--------\  Fixtures (Statisch)
   /----------\  Vordefinierte, wiederverwendbare Daten
  /------------\
 /   Seeded DB  \  Basis-Daten für alle Tests
------------------
```

### Strategie nach Test-Typ

| Test-Typ | Daten-Quelle | Cleanup |
|----------|-------------|---------|
| **Unit Tests** | In-Memory (Mocks) | Nicht nötig |
| **Integration Tests** | DB Fixtures + Seeding | Transaction Rollback |
| **E2E Tests** | DB Seeding + API-Calls | Nach Test löschen |

---

## Fixtures & Test-Daten

### Struktur

```
tests/shared/fixtures/
├── vehicles.ts          # Fahrzeugdaten
├── customers.ts         # Kundendaten
├── services.ts          # Service-Arten
├── workshops.ts         # Werkstattdaten
├── slots.ts             # Zeitslots
├── orders.ts            # Auftragsdaten
└── index.ts             # Exports
```

### Vehicle Fixtures

**`tests/shared/fixtures/vehicles.ts`:**

```typescript
export interface VehicleData {
  brand: string;
  model: string;
  year: number;
  mileage: number;
  expectedPrice: number; // für Inspektion
}

/**
 * Vordefinierte Fahrzeug-Testdaten
 */
export const testVehicles: Record<string, VehicleData> = {
  // Kompaktklasse
  vwGolf: {
    brand: 'VW',
    model: 'Golf 7',
    year: 2015,
    mileage: 85000,
    expectedPrice: 219,
  },

  vwPolo: {
    brand: 'VW',
    model: 'Polo 6',
    year: 2018,
    mileage: 45000,
    expectedPrice: 179,
  },

  // Mittelklasse
  audiA4: {
    brand: 'Audi',
    model: 'A4 B9',
    year: 2017,
    mileage: 60000,
    expectedPrice: 279,
  },

  vwPassat: {
    brand: 'VW',
    model: 'Passat B8',
    year: 2016,
    mileage: 90000,
    expectedPrice: 289,
  },

  bmw3er: {
    brand: 'BMW',
    model: '3er G20',
    year: 2019,
    mileage: 40000,
    expectedPrice: 299,
  },

  // Oberklasse
  mercedesEClass: {
    brand: 'Mercedes',
    model: 'E-Klasse W213',
    year: 2016,
    mileage: 90000,
    expectedPrice: 319,
  },

  bmw5er: {
    brand: 'BMW',
    model: '5er G30',
    year: 2017,
    mileage: 75000,
    expectedPrice: 359,
  },

  audiA6: {
    brand: 'Audi',
    model: 'A6 C8',
    year: 2019,
    mileage: 50000,
    expectedPrice: 339,
  },

  // SUV
  audiQ5: {
    brand: 'Audi',
    model: 'Q5 FY',
    year: 2018,
    mileage: 60000,
    expectedPrice: 279,
  },

  bmwX3: {
    brand: 'BMW',
    model: 'X3 G01',
    year: 2019,
    mileage: 45000,
    expectedPrice: 299,
  },

  // Edge Cases
  highMileage: {
    brand: 'VW',
    model: 'Golf 5',
    year: 2008,
    mileage: 250000,
    expectedPrice: 199, // älteres Fahrzeug
  },

  lowMileage: {
    brand: 'Mercedes',
    model: 'C-Klasse W205',
    year: 2020,
    mileage: 15000,
    expectedPrice: 299,
  },
};
```

### Customer Fixtures

**`tests/shared/fixtures/customers.ts`:**

```typescript
export interface AddressData {
  street: string;
  zip: string;
  city: string;
}

export interface CustomerData {
  email: string;
  phone: string;
  address: AddressData;
}

/**
 * Vordefinierte Kunden-Testdaten
 */
export const testCustomers: Record<string, CustomerData> = {
  regular: {
    email: 'test+customer@ronja.example.com',
    phone: '+49 123 456789',
    address: {
      street: 'Teststraße 1',
      zip: '58452',
      city: 'Witten',
    },
  },

  witten: {
    email: 'test+witten@ronja.example.com',
    phone: '+49 234 567890',
    address: {
      street: 'Hauptstraße 42',
      zip: '58453',
      city: 'Witten',
    },
  },

  dortmund: {
    email: 'test+dortmund@ronja.example.com',
    phone: '+49 231 123456',
    address: {
      street: 'Westenhellweg 10',
      zip: '44137',
      city: 'Dortmund',
    },
  },

  // Edge Cases
  outsideServiceArea: {
    email: 'test+berlin@ronja.example.com',
    phone: '+49 30 123456',
    address: {
      street: 'Unter den Linden 1',
      zip: '10117',
      city: 'Berlin',
    },
  },
};
```

### Service Fixtures

**`tests/shared/fixtures/services.ts`:**

```typescript
export type ServiceType = 'inspection' | 'oil' | 'brake' | 'tuv' | 'climate';

export interface ServiceData {
  id: ServiceType;
  name: string;
  description: string;
  basePrice: number; // Basispreis (wird nach Fahrzeug angepasst)
  duration: number; // Minuten
}

/**
 * Service-Arten
 */
export const testServices: Record<ServiceType, ServiceData> = {
  inspection: {
    id: 'inspection',
    name: 'Inspektion/Wartung',
    description: 'Motoröl ablassen, Ölfilter wechseln, Fahrzeugprüfung',
    basePrice: 200,
    duration: 120,
  },

  oil: {
    id: 'oil',
    name: 'Ölservice',
    description: 'Motoröl und Ölfilter wechseln',
    basePrice: 100,
    duration: 60,
  },

  brake: {
    id: 'brake',
    name: 'Bremsservice',
    description: 'Bremsbeläge und Bremsscheiben prüfen/wechseln',
    basePrice: 200,
    duration: 90,
  },

  tuv: {
    id: 'tuv',
    name: 'TÜV/HU',
    description: 'Hauptuntersuchung',
    basePrice: 120,
    duration: 60,
  },

  climate: {
    id: 'climate',
    name: 'Klimaservice',
    description: 'Klimaanlage desinfizieren und Kältemittel auffüllen',
    basePrice: 150,
    duration: 45,
  },
};
```

### Workshop Fixtures

**`tests/shared/fixtures/workshops.ts`:**

```typescript
export interface WorkshopData {
  id: string;
  name: string;
  address: string;
  city: string;
  zip: string;
  phone: string;
  capacity: number; // Slots pro Tag
}

/**
 * Werkstatt-Testdaten
 */
export const testWorkshops: Record<string, WorkshopData> = {
  witten: {
    id: 'workshop-witten',
    name: 'Werkstatt Witten',
    address: 'Hauptstraße 1',
    city: 'Witten',
    zip: '58452',
    phone: '+49 234 12345',
    capacity: 5,
  },

  dortmund: {
    id: 'workshop-dortmund',
    name: 'Werkstatt Dortmund',
    address: 'Westenhellweg 100',
    city: 'Dortmund',
    zip: '44137',
    phone: '+49 231 54321',
    capacity: 8,
  },
};
```

### Slot Fixtures

**`tests/shared/fixtures/slots.ts`:**

```typescript
export interface SlotData {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  capacity: number;
  available: number;
}

/**
 * Zeitslots für Tests (nächste 14 Tage)
 */
export function generateTestSlots(workshopId: string = 'workshop-witten'): SlotData[] {
  const slots: SlotData[] = [];
  const today = new Date();
  const times = ['08:00', '10:00', '12:00', '14:00', '16:00'];

  for (let day = 0; day < 14; day++) {
    const date = new Date(today);
    date.setDate(date.getDate() + day);
    const dateStr = date.toISOString().split('T')[0];

    for (const time of times) {
      slots.push({
        id: `slot-${workshopId}-${dateStr}-${time.replace(':', '')}`,
        date: dateStr,
        time,
        capacity: 3,
        available: 3,
      });
    }
  }

  return slots;
}

/**
 * Spezielle Slots für Tests
 */
export const specialSlots = {
  fullSlot: {
    id: 'slot-full',
    date: '2026-01-15',
    time: '10:00',
    capacity: 3,
    available: 0, // ausgebucht
  },

  limitedSlot: {
    id: 'slot-limited',
    date: '2026-01-16',
    time: '14:00',
    capacity: 1,
    available: 1, // nur noch 1 Platz
  },
};
```

### Order Extension Fixtures

**`tests/shared/fixtures/order-extensions.ts`:**

```typescript
export interface OrderExtensionData {
  id: string;
  appointmentId: string;
  title: string;
  description: string;
  price: number; // EUR
  photos: string[];
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

/**
 * Auftragserweiterungen für Tests
 */
export const testOrderExtensions: Record<string, OrderExtensionData> = {
  brakePads: {
    id: 'ext-brake-pads',
    appointmentId: 'booking-123',
    title: 'Bremsbeläge vorne verschlissen',
    description: 'Die Bremsbeläge vorne sind unter 2mm und müssen getauscht werden. Sicherheitsrisiko.',
    price: 219,
    photos: ['brake-pad-1.jpg', 'brake-pad-2.jpg'],
    status: 'PENDING',
  },

  windshield: {
    id: 'ext-windshield',
    appointmentId: 'booking-123',
    title: 'Steinschlag in Windschutzscheibe',
    description: 'Steinschlag rechts unten, kann repariert werden.',
    price: 89,
    photos: ['windshield-1.jpg'],
    status: 'PENDING',
  },

  wiperBlades: {
    id: 'ext-wiper-blades',
    appointmentId: 'booking-123',
    title: 'Wischblätter abgenutzt',
    description: 'Wischblätter vorne schlieren stark.',
    price: 39,
    photos: ['wiper-1.jpg'],
    status: 'PENDING',
  },
};
```

---

## Database Seeding

### Global Seeding (vor allen Tests)

**`tests/shared/helpers/db.helpers.ts`:**

```typescript
import { Pool } from 'pg';
import { testWorkshops } from '../fixtures/workshops';
import { generateTestSlots } from '../fixtures/slots';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * Datenbank mit Basis-Daten seeden
 */
export async function seedDatabase() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Tabellen leeren (cascade wegen Foreign Keys)
    await client.query('TRUNCATE TABLE order_extensions CASCADE');
    await client.query('TRUNCATE TABLE appointments CASCADE');
    await client.query('TRUNCATE TABLE slots CASCADE');
    await client.query('TRUNCATE TABLE workshops CASCADE');
    await client.query('TRUNCATE TABLE users CASCADE');

    // 2. Werkstatt Witten anlegen
    const workshop = testWorkshops.witten;
    await client.query(`
      INSERT INTO workshops (id, name, address, city, zip, phone, capacity)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [workshop.id, workshop.name, workshop.address, workshop.city, workshop.zip, workshop.phone, workshop.capacity]);

    // 3. Slots für nächste 14 Tage
    const slots = generateTestSlots(workshop.id);
    for (const slot of slots) {
      await client.query(`
        INSERT INTO slots (id, workshop_id, date, time, capacity, available)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [slot.id, workshop.id, slot.date, slot.time, slot.capacity, slot.available]);
    }

    // 4. Test-User (Jockey, Werkstatt)
    await client.query(`
      INSERT INTO users (id, email, role, password_hash)
      VALUES
        ('user-jockey', 'jockey@witten.ronja', 'JOCKEY', '$2b$10$dummyhash'),
        ('user-workshop', 'werkstatt@witten.ronja', 'WORKSHOP', '$2b$10$dummyhash')
    `);

    await client.query('COMMIT');
    console.log('✅ Database seeded successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Database seed failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Test-Daten aufräumen (nach Tests)
 */
export async function cleanupDatabase() {
  const client = await pool.connect();

  try {
    // Nur Test-Daten löschen (erkennbar an test+...@ronja.example.com)
    await client.query(`
      DELETE FROM appointments WHERE email LIKE 'test+%@ronja.example.com'
    `);

    // Slots auf Initial-State zurücksetzen
    await client.query(`
      UPDATE slots SET available = capacity WHERE workshop_id = 'workshop-witten'
    `);

    console.log('✅ Database cleaned up');
  } catch (error) {
    console.error('❌ Database cleanup failed:', error);
  } finally {
    client.release();
  }
}

/**
 * Spezifische Test-Buchung erstellen (für Preconditions)
 */
export async function createTestAppointment(data: {
  email: string;
  vehicle: { brand: string; model: string; year: number; mileage: number };
  slotId: string;
  status?: string;
}): Promise<string> {
  const client = await pool.connect();

  try {
    const result = await client.query(`
      INSERT INTO appointments (id, email, vehicle_brand, vehicle_model, vehicle_year, mileage, slot_id, status, created_at)
      VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING id
    `, [
      data.email,
      data.vehicle.brand,
      data.vehicle.model,
      data.vehicle.year,
      data.vehicle.mileage,
      data.slotId,
      data.status || 'CONFIRMED',
    ]);

    return result.rows[0].id;
  } finally {
    client.release();
  }
}

/**
 * Auftragserweiterung erstellen (für Preconditions)
 */
export async function createTestOrderExtension(data: {
  appointmentId: string;
  title: string;
  description: string;
  price: number;
  photos: string[];
  status?: string;
}): Promise<string> {
  const client = await pool.connect();

  try {
    const result = await client.query(`
      INSERT INTO order_extensions (id, appointment_id, title, description, price, photos, status, created_at)
      VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, NOW())
      RETURNING id
    `, [
      data.appointmentId,
      data.title,
      data.description,
      data.price * 100, // Cent
      JSON.stringify(data.photos),
      data.status || 'PENDING',
    ]);

    return result.rows[0].id;
  } finally {
    client.release();
  }
}
```

---

## Test Data Builders

### Builder Pattern für komplexe Test-Daten

**`tests/shared/builders/AppointmentBuilder.ts`:**

```typescript
import { testVehicles } from '../fixtures/vehicles';
import { testCustomers } from '../fixtures/customers';
import { createTestAppointment } from '../helpers/db.helpers';

/**
 * Builder für Appointment-Testdaten
 */
export class AppointmentBuilder {
  private data = {
    email: testCustomers.regular.email,
    vehicle: testVehicles.vwGolf,
    slotId: 'slot-default',
    status: 'CONFIRMED',
  };

  withCustomer(customerKey: keyof typeof testCustomers) {
    this.data.email = testCustomers[customerKey].email;
    return this;
  }

  withVehicle(vehicleKey: keyof typeof testVehicles) {
    this.data.vehicle = testVehicles[vehicleKey];
    return this;
  }

  withSlot(slotId: string) {
    this.data.slotId = slotId;
    return this;
  }

  withStatus(status: string) {
    this.data.status = status;
    return this;
  }

  async build(): Promise<string> {
    return await createTestAppointment(this.data);
  }
}

// Usage in Test:
// const appointmentId = await new AppointmentBuilder()
//   .withCustomer('witten')
//   .withVehicle('audiA4')
//   .withStatus('IN_PROGRESS')
//   .build();
```

---

## Mocks & Stubs

### Stripe Payment Mock

**`tests/shared/mocks/stripe.mock.ts`:**

```typescript
/**
 * Stripe Payment Mock für Tests
 */
export const stripeMock = {
  /**
   * Mock Payment Intent erstellen
   */
  createPaymentIntent: async (amount: number) => {
    return {
      id: 'pi_test_' + Date.now(),
      amount: amount * 100, // Cent
      currency: 'eur',
      status: 'succeeded',
      client_secret: 'pi_test_secret',
    };
  },

  /**
   * Mock Payment Intent fehlschlagen lassen
   */
  declinePaymentIntent: async () => {
    throw new Error('Your card was declined.');
  },
};
```

### Email Notification Mock

**`tests/shared/mocks/email.mock.ts`:**

```typescript
/**
 * Email-Mock für Tests (statt echte E-Mails zu senden)
 */
export class EmailMock {
  private sentEmails: Array<{ to: string; subject: string; body: string }> = [];

  async sendEmail(to: string, subject: string, body: string) {
    this.sentEmails.push({ to, subject, body });
    console.log(`📧 Mock Email sent to ${to}: ${subject}`);
  }

  getLastEmail() {
    return this.sentEmails[this.sentEmails.length - 1];
  }

  getEmailsFor(email: string) {
    return this.sentEmails.filter(e => e.to === email);
  }

  clear() {
    this.sentEmails = [];
  }
}

export const emailMock = new EmailMock();
```

---

## Data Cleanup Strategien

### Strategie 1: Transaction Rollback (Integration Tests)

```typescript
import { test } from '@playwright/test';
import { pool } from './db.helpers';

test.beforeEach(async () => {
  // Transaction starten
  await pool.query('BEGIN');
});

test.afterEach(async () => {
  // Rollback nach Test
  await pool.query('ROLLBACK');
});
```

### Strategie 2: Explicit Cleanup (E2E Tests)

```typescript
test.afterEach(async () => {
  // Spezifische Test-Daten löschen
  await cleanupTestAppointments();
  await resetSlotCapacity();
});
```

### Strategie 3: Test-spezifische Namespaces

```typescript
// E-Mails mit Test-Prefix
const testEmail = `test+${Date.now()}@ronja.example.com`;

// Cleanup aller Test-E-Mails
await pool.query(`DELETE FROM appointments WHERE email LIKE 'test+%@ronja.example.com'`);
```

---

## Sensitive Data Management

### GDPR-Compliance

**Regel:** Keine echten Kundendaten in Tests!

**Vorgehen:**
1. Alle Test-E-Mails mit `test+...@ronja.example.com`
2. Fake-Telefonnummern (nicht existent)
3. Fake-Adressen
4. Anonymisierung in Screenshots

### Faker.js für dynamische Daten

**Installation:**
```bash
npm install --save-dev @faker-js/faker
```

**Usage:**
```typescript
import { faker } from '@faker-js/faker';

// Dynamische Test-Daten generieren
const customer = {
  email: `test+${faker.datatype.uuid()}@ronja.example.com`,
  phone: faker.phone.number('+49 ### #######'),
  address: {
    street: faker.address.streetAddress(),
    zip: faker.address.zipCode('#####'),
    city: faker.address.city(),
  },
};
```

---

## Index Export

**`tests/shared/fixtures/index.ts`:**

```typescript
export * from './vehicles';
export * from './customers';
export * from './services';
export * from './workshops';
export * from './slots';
export * from './order-extensions';
```

**Usage in Tests:**
```typescript
import { testVehicles, testCustomers, testServices } from '@tests/shared/fixtures';
```

---

## Nächste Schritte

1. ✅ Test Data Management Strategie definiert
2. 🔲 Fixtures implementieren
3. 🔲 Database Seeding implementieren
4. 🔲 Builders & Mocks erstellen
5. 🔲 Cleanup-Strategien testen

---

**Version History:**
- v1.0 (2026-02-01): Initiale Version - Test Data Management komplett
