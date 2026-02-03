# Playwright Setup Guide - B2C Autowartungs-App

**Version:** 1.0
**Datum:** 2026-02-01
**Status:** Ready to Implement
**Autor:** QA & Test Engineer

---

## Inhaltsverzeichnis

1. [Installation & Projekt-Setup](#installation--projekt-setup)
2. [Playwright Konfiguration](#playwright-konfiguration)
3. [Verzeichnisstruktur erstellen](#verzeichnisstruktur-erstellen)
4. [Test-Utilities & Helpers](#test-utilities--helpers)
5. [Erste Tests schreiben](#erste-tests-schreiben)
6. [Lokales Testing](#lokales-testing)
7. [CI/CD Integration](#cicd-integration)
8. [Best Practices & Troubleshooting](#best-practices--troubleshooting)

---

## Installation & Projekt-Setup

### Voraussetzungen

- Node.js 18.x oder höher
- npm 9.x oder höher
- Git
- Lokale Datenbank (PostgreSQL oder SQLite)

### Schritt 1: Playwright installieren

```bash
# Im Projekt-Root-Verzeichnis
cd /Users/stenrauch/Documents/B2C\ App\ v2

# Playwright installieren
npm init playwright@latest

# Antworten bei Prompts:
# - TypeScript verwenden? Ja
# - Tests-Verzeichnis? tests
# - GitHub Actions Workflow hinzufügen? Ja
# - Playwright Browser installieren? Ja (Chromium)
```

### Schritt 2: Abhängigkeiten installieren

```bash
# Zusätzliche Test-Dependencies
npm install --save-dev \
  @faker-js/faker \
  dotenv \
  cross-env
```

### Schritt 3: TypeScript Konfiguration anpassen

**`tsconfig.json`** (falls nicht vorhanden):
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@tests/*": ["./tests/*"]
    }
  },
  "include": ["src/**/*", "tests/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

## Playwright Konfiguration

### `playwright.config.ts`

Erstelle die Haupt-Konfigurationsdatei im Projekt-Root:

```typescript
import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

// Lade Environment-Variablen aus .env.test
dotenv.config({ path: '.env.test' });

/**
 * Playwright Konfiguration für B2C Autowartungs-App
 *
 * Siehe: https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // Test-Verzeichnis
  testDir: './tests/e2e',

  // Vollständig parallele Testausführung
  fullyParallel: true,

  // Fehlschläge bei .only() in CI
  forbidOnly: !!process.env.CI,

  // Retries
  retries: process.env.CI ? 2 : 0,

  // Worker (parallele Tests)
  workers: process.env.CI ? 1 : undefined, // CI: sequenziell, lokal: parallel

  // Reporter
  reporter: [
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['list'], // Console-Output
  ],

  // Globale Test-Konfiguration
  use: {
    // Base URL
    baseURL: process.env.BASE_URL || 'http://localhost:3000',

    // Trace bei Fehler
    trace: 'on-first-retry',

    // Screenshots bei Fehler
    screenshot: 'only-on-failure',

    // Video bei Fehler
    video: 'retain-on-failure',

    // Timeouts
    actionTimeout: 10000, // 10s für Aktionen (click, fill, etc.)
    navigationTimeout: 30000, // 30s für Navigation

    // Locale & Timezone
    locale: 'de-DE',
    timezone: 'Europe/Berlin',

    // Viewport
    viewport: { width: 1280, height: 720 },

    // Extra HTTP Headers
    extraHTTPHeaders: {
      'Accept-Language': 'de-DE,de;q=0.9',
    },
  },

  // Test-Projekte (verschiedene Browser/Devices)
  projects: [
    // Critical Tests - immer ausführen, keine Retries
    {
      name: 'critical',
      testMatch: /.*\.critical\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
      retries: 0, // keine Retries für kritische Tests
    },

    // Desktop Chromium (Standard)
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // Mobile Chrome (wichtig für mobile-first App)
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },

    // Mobile Safari (iOS)
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 13'] },
    },

    // Optional: Firefox & WebKit (für Cross-Browser-Testing)
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  // Lokaler Dev-Server
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI, // in CI immer neuen Server starten
    timeout: 120000, // 2 Minuten Timeout für Server-Start
    stdout: 'pipe', // Server-Logs pipen
    stderr: 'pipe',
  },

  // Globales Setup/Teardown
  globalSetup: './tests/shared/global-setup.ts',
  globalTeardown: './tests/shared/global-teardown.ts',
});
```

---

## Verzeichnisstruktur erstellen

### Schritt 1: Test-Verzeichnisse anlegen

```bash
# Verzeichnisstruktur erstellen
mkdir -p tests/e2e/customer
mkdir -p tests/e2e/jockey
mkdir -p tests/e2e/workshop
mkdir -p tests/e2e/cross-portal
mkdir -p tests/e2e/edge-cases
mkdir -p tests/shared/fixtures
mkdir -p tests/shared/page-objects/customer
mkdir -p tests/shared/page-objects/jockey
mkdir -p tests/shared/page-objects/workshop
mkdir -p tests/shared/helpers
mkdir -p tests/integration/api
mkdir -p tests/integration/db
mkdir -p test-results
mkdir -p playwright-report
```

### Schritt 2: Environment-Dateien

**`.env.test`** (für Test-Environment):
```env
# Application
NODE_ENV=test
BASE_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://localhost:5432/ronja_test

# Stripe (Test Mode)
STRIPE_TEST_MODE=true
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_test_...

# Email (Mock)
EMAIL_PROVIDER=mock
EMAIL_FROM=test@ronja.example.com

# Auth
JWT_SECRET=test-jwt-secret-change-in-production
MAGIC_LINK_EXPIRY=900000 # 15 Minuten

# Feature Flags
FEATURE_ORDER_EXTENSION=true
FEATURE_JOCKEY_PORTAL=true
FEATURE_WORKSHOP_PORTAL=true
```

**`.gitignore`** (Test-Artefakte ausschließen):
```gitignore
# Playwright
/test-results/
/playwright-report/
/playwright/.cache/

# Environment
.env.test.local
```

---

## Test-Utilities & Helpers

### Global Setup (`tests/shared/global-setup.ts`)

```typescript
import { chromium, FullConfig } from '@playwright/test';
import { seedDatabase } from './helpers/db.helpers';

/**
 * Global Setup - läuft einmal vor allen Tests
 */
async function globalSetup(config: FullConfig) {
  console.log('🚀 Global Setup: Starting...');

  // 1. Datenbank zurücksetzen & seeden
  console.log('📊 Seeding test database...');
  await seedDatabase();

  // 2. Warmup: App-Server anpingen
  const baseURL = config.projects[0].use.baseURL || 'http://localhost:3000';
  console.log(`🌐 Warming up app at ${baseURL}...`);

  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    await page.goto(baseURL, { waitUntil: 'networkidle', timeout: 60000 });
    console.log('✅ App is ready!');
  } catch (error) {
    console.error('❌ App failed to start:', error);
    throw error;
  } finally {
    await browser.close();
  }

  console.log('✅ Global Setup: Complete');
}

export default globalSetup;
```

### Global Teardown (`tests/shared/global-teardown.ts`)

```typescript
import { cleanupDatabase } from './helpers/db.helpers';

/**
 * Global Teardown - läuft nach allen Tests
 */
async function globalTeardown() {
  console.log('🧹 Global Teardown: Starting...');

  // Datenbank aufräumen
  await cleanupDatabase();

  console.log('✅ Global Teardown: Complete');
}

export default globalTeardown;
```

### Database Helpers (`tests/shared/helpers/db.helpers.ts`)

```typescript
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * Datenbank mit Test-Daten seeden
 */
export async function seedDatabase() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Tabellen leeren (in richtiger Reihenfolge wegen Foreign Keys)
    await client.query('TRUNCATE TABLE order_extensions CASCADE');
    await client.query('TRUNCATE TABLE appointments CASCADE');
    await client.query('TRUNCATE TABLE slots CASCADE');
    await client.query('TRUNCATE TABLE workshops CASCADE');
    await client.query('TRUNCATE TABLE users CASCADE');

    // Werkstatt Witten anlegen
    await client.query(`
      INSERT INTO workshops (id, name, address, city, zip, phone)
      VALUES (
        'workshop-witten',
        'Werkstatt Witten',
        'Hauptstraße 1',
        'Witten',
        '58452',
        '+49 234 12345'
      )
    `);

    // Slots für nächste 14 Tage anlegen
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);

      const slots = ['08:00', '10:00', '12:00', '14:00', '16:00'];
      for (const time of slots) {
        const slotId = `slot-${date.toISOString().split('T')[0]}-${time.replace(':', '')}`;
        await client.query(`
          INSERT INTO slots (id, workshop_id, date, time, capacity, available)
          VALUES ($1, 'workshop-witten', $2, $3, 3, 3)
        `, [slotId, date.toISOString().split('T')[0], time]);
      }
    }

    // Test-User anlegen
    await client.query(`
      INSERT INTO users (id, email, role, password_hash)
      VALUES
        ('user-jockey', 'jockey@witten.ronja', 'JOCKEY', '$2b$10$...'),
        ('user-workshop', 'werkstatt@witten.ronja', 'WORKSHOP', '$2b$10$...')
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
 * Datenbank aufräumen
 */
export async function cleanupDatabase() {
  const client = await pool.connect();

  try {
    // Nur Test-Daten löschen (erkennbar an test+...@ronja.example.com)
    await client.query(`
      DELETE FROM appointments WHERE email LIKE 'test+%@ronja.example.com'
    `);

    console.log('✅ Database cleaned up');
  } catch (error) {
    console.error('❌ Database cleanup failed:', error);
  } finally {
    client.release();
  }
}

/**
 * Test-Buchung erstellen (für Preconditions)
 */
export async function createTestAppointment(data: {
  email: string;
  vehicle: { brand: string; model: string; year: number; mileage: number };
  slotId: string;
  status?: string;
}) {
  const client = await pool.connect();

  try {
    const result = await client.query(`
      INSERT INTO appointments (id, email, vehicle_brand, vehicle_model, vehicle_year, mileage, slot_id, status)
      VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7)
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
```

### Auth Helpers (`tests/shared/helpers/auth.helpers.ts`)

```typescript
import { Page } from '@playwright/test';

/**
 * Login als Kunde (Magic Link)
 */
export async function loginAsCustomer(page: Page, email: string) {
  await page.goto('/login');
  await page.fill('input[name="email"]', email);
  await page.click('button:has-text("Login-Code senden")');

  // Mock: Magic Link simulieren (in Test-Umgebung direkt Session setzen)
  const magicToken = await generateMagicToken(email);
  await page.goto(`/auth/verify?token=${magicToken}`);

  // Warten auf Redirect nach Login
  await page.waitForURL(/\/dashboard/);
}

/**
 * Login als Jockey
 */
export async function loginAsJockey(page: Page, username: string, password: string) {
  await page.goto('/jockey/login');
  await page.fill('input[name="username"]', username);
  await page.fill('input[name="password"]', password);
  await page.click('button:has-text("Anmelden")');

  await page.waitForURL(/\/jockey\/dashboard/);
}

/**
 * Login als Werkstatt
 */
export async function loginAsWorkshop(page: Page, username: string, password: string) {
  await page.goto('/workshop/login');
  await page.fill('input[name="username"]', username);
  await page.fill('input[name="password"]', password);
  await page.click('button:has-text("Anmelden")');

  await page.waitForURL(/\/workshop\/dashboard/);
}

/**
 * Magic Token generieren (nur für Tests)
 */
async function generateMagicToken(email: string): Promise<string> {
  // In Test-Umgebung: API-Call oder direktes Token-Generieren
  const response = await fetch('http://localhost:3000/api/auth/test-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  const data = await response.json();
  return data.token;
}
```

### Payment Helpers (`tests/shared/helpers/payment.helpers.ts`)

```typescript
import { Page } from '@playwright/test';

/**
 * Stripe Test-Karten
 */
export const STRIPE_TEST_CARDS = {
  success: '4242424242424242',
  declined: '4000000000000002',
  insufficientFunds: '4000000000009995',
  requiresAuth: '4000002500003155',
};

/**
 * Zahlung mit Stripe Test Card durchführen
 */
export async function payWithStripe(
  page: Page,
  card: keyof typeof STRIPE_TEST_CARDS = 'success'
) {
  // Warten auf Stripe Frame
  const stripeFrame = page.frameLocator('iframe[name^="__privateStripeFrame"]');

  // Card-Daten eingeben
  await stripeFrame.locator('input[name="cardnumber"]').fill(STRIPE_TEST_CARDS[card]);
  await stripeFrame.locator('input[name="exp-date"]').fill('12/28');
  await stripeFrame.locator('input[name="cvc"]').fill('123');
  await stripeFrame.locator('input[name="postal"]').fill('12345');

  // Submit
  await page.click('button:has-text("Jetzt bezahlen")');
}

/**
 * Webhook manuell triggern (für Tests ohne echten Stripe)
 */
export async function triggerStripeWebhook(eventType: string, data: any) {
  await fetch('http://localhost:3000/api/webhooks/stripe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Stripe-Signature': 'test-signature',
    },
    body: JSON.stringify({
      type: eventType,
      data: { object: data },
    }),
  });
}
```

---

## Erste Tests schreiben

### Beispiel: Booking Flow Critical Test

**`tests/e2e/customer/booking-flow.critical.spec.ts`:**

```typescript
import { test, expect } from '@playwright/test';
import { testVehicles, testCustomers } from '@tests/shared/fixtures/test-data';
import { payWithStripe } from '@tests/shared/helpers/payment.helpers';

test.describe('Booking Flow (Critical)', () => {
  test('TC-001: Happy Path - Kunde bucht Inspektion für VW Golf', async ({ page }) => {
    // Step 1: Startseite
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Jetzt buchen');
    await page.click('button:has-text("Jetzt buchen")');

    // Step 2: Fahrzeugauswahl
    await page.selectOption('select[name="brand"]', testVehicles.vwGolf.brand);
    await page.selectOption('select[name="model"]', testVehicles.vwGolf.model);
    await page.selectOption('select[name="year"]', String(testVehicles.vwGolf.year));
    await page.fill('input[name="mileage"]', String(testVehicles.vwGolf.mileage));
    await page.click('button:has-text("Weiter")');

    // Step 3: Service-Auswahl
    await page.click('button[data-service="inspection"]');

    // Festpreis prüfen
    const priceElement = page.locator('[data-testid="fixed-price"]');
    await expect(priceElement).toContainText('219,00 EUR');

    await page.click('button:has-text("Weiter")');

    // Step 4: Termin & Adresse
    await page.click('.slot-button:first-of-type');

    await page.fill('input[name="street"]', testCustomers.regular.address.street);
    await page.fill('input[name="zip"]', testCustomers.regular.address.zip);
    await page.fill('input[name="city"]', testCustomers.regular.address.city);
    await page.fill('input[name="phone"]', testCustomers.regular.phone);

    await page.click('button:has-text("Weiter zur Zahlung")');

    // Step 5: Payment
    await payWithStripe(page, 'success');

    // Step 6: Bestätigung
    await expect(page.locator('h1')).toContainText('Buchung erfolgreich', { timeout: 15000 });
    await expect(page.locator('[data-testid="booking-id"]')).toBeVisible();
  });
});
```

---

## Lokales Testing

### Tests ausführen

```bash
# Alle Tests ausführen
npx playwright test

# Nur kritische Tests
npx playwright test --project=critical

# Nur einen Test-File
npx playwright test tests/e2e/customer/booking-flow.critical.spec.ts

# Tests mit UI (headed mode)
npx playwright test --headed

# Tests mit Debugger
npx playwright test --debug

# Nur Mobile-Tests
npx playwright test --project=mobile-chrome
```

### HTML Report anschauen

```bash
# Report öffnen
npx playwright show-report

# Browser öffnet automatisch: http://localhost:9323
```

### Trace Viewer (bei Fehlern)

```bash
# Trace für fehlgeschlagenen Test anschauen
npx playwright show-trace test-results/[test-name]/trace.zip
```

---

## CI/CD Integration

### GitHub Actions Workflow

**`.github/workflows/e2e-tests.yml`:**

```yaml
name: E2E Tests

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main]
  schedule:
    - cron: '0 2 * * *' # Nightly um 2 Uhr

jobs:
  test:
    name: Playwright Tests
    runs-on: ubuntu-latest
    timeout-minutes: 20

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: ronja_test
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    strategy:
      matrix:
        project: [critical, chromium, mobile-chrome]

    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Install Playwright Browsers
        run: npx playwright install --with-deps chromium

      - name: Setup Database
        run: |
          npm run db:migrate
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/ronja_test

      - name: Start Application
        run: npm run dev &
        env:
          NODE_ENV: test
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/ronja_test
          STRIPE_TEST_MODE: true

      - name: Wait for App
        run: npx wait-on http://localhost:3000 --timeout 60000

      - name: Run Playwright Tests
        run: npx playwright test --project=${{ matrix.project }}
        env:
          BASE_URL: http://localhost:3000

      - name: Upload Report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report-${{ matrix.project }}
          path: playwright-report/
          retention-days: 7

      - name: Upload Screenshots
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: screenshots-${{ matrix.project }}
          path: test-results/
          retention-days: 7
```

---

## Best Practices & Troubleshooting

### Best Practices

1. **Auto-Waiting nutzen**: Playwright wartet automatisch auf Elemente
   ```typescript
   // ✅ Gut
   await page.click('button:has-text("Submit")');

   // ❌ Schlecht (unnötig)
   await page.waitForSelector('button:has-text("Submit")');
   await page.click('button:has-text("Submit")');
   ```

2. **Selektoren priorisieren**:
   - User-facing Attributes: `text=`, `role=`, `label=`
   - Test-IDs: `data-testid=`
   - CSS/XPath: Nur als letzter Ausweg

3. **Explizite Assertions**: Immer prüfen, nicht nur klicken
   ```typescript
   await expect(page.locator('h1')).toContainText('Erfolgreich');
   ```

4. **Isolation**: Jeder Test muss unabhängig laufen
   - Eigene Test-Daten pro Test
   - Cleanup nach Test

5. **Page Object Pattern**: UI-Logik wiederverwenden (siehe nächstes Dokument)

### Troubleshooting

**Problem: "Timeout exceeded" bei Tests**
- Lösung: `timeout` in Config erhöhen oder spezifischen Wait verwenden
  ```typescript
  await page.waitForLoadState('networkidle');
  ```

**Problem: Flaky Tests (mal grün, mal rot)**
- Ursache: Race Conditions, fehlende Waits
- Lösung: Explizite Assertions statt Waits
  ```typescript
  // ❌ Schlecht
  await page.waitForTimeout(2000);

  // ✅ Gut
  await expect(page.locator('.loading')).not.toBeVisible();
  ```

**Problem: Stripe Frame nicht erreichbar**
- Lösung: `frameLocator` verwenden (siehe Payment Helpers)

**Problem: DB-Daten bleiben nach Test**
- Lösung: Cleanup in `afterEach` oder Transaction-Rollback

---

## Nächste Schritte

1. ✅ Playwright Setup-Guide erstellt
2. 🔲 Setup durchführen (`npm init playwright@latest`)
3. 🔲 Helpers & Fixtures implementieren
4. 🔲 Page Objects erstellen (siehe Dokument 27)
5. 🔲 Erste Tests schreiben (TC-001, TC-010, TC-040)

---

**Version History:**
- v1.0 (2026-02-01): Initiale Version - Setup-Anleitung komplett
