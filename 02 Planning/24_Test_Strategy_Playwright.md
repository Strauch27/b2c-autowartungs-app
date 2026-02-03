# Test-Strategie: Playwright Testautomatisierung - B2C Autowartungs-App

**Version:** 1.0
**Datum:** 2026-02-01
**Status:** Draft
**Autor:** QA & Test Engineer

---

## Inhaltsverzeichnis

1. [Executive Summary](#executive-summary)
2. [Testpyramide & Coverage-Ziele](#testpyramide--coverage-ziele)
3. [E2E-Test-Strategie mit Playwright](#e2e-test-strategie-mit-playwright)
4. [Test-Struktur & Organisation](#test-struktur--organisation)
5. [Kritische Test-Szenarien](#kritische-test-szenarien)
6. [Test Data Management](#test-data-management)
7. [CI/CD Integration](#cicd-integration)
8. [Quality Metrics & KPIs](#quality-metrics--kpis)
9. [Tools & Technologie-Stack](#tools--technologie-stack)
10. [Release-Gates](#release-gates)

---

## Executive Summary

### Vision
Diese Test-Strategie definiert einen **parallelen Test-First-Ansatz**, bei dem Testcases **gleichzeitig mit der Entwicklung** geschrieben werden. Für jede User Story existieren entsprechende E2E-Tests, die als lebende Dokumentation und Qualitäts-Gates dienen.

### Hauptziele
1. **100% Coverage kritischer User Journeys** (Booking Flow, Payment, Order Extension)
2. **Parallele Entwicklung**: Tests werden während Sprint Planning definiert und parallel zu Features entwickelt
3. **Zero Flakiness**: Tests müssen deterministisch und zuverlässig sein
4. **Multi-Portal-Testing**: Alle drei Portale (Kunde, Jockey, Werkstatt) werden getestet
5. **Fast Feedback**: E2E-Suite läuft in < 10 Minuten

### Testframework-Wahl: Playwright

**Warum Playwright?**
- Native Multi-Browser-Support (Chromium, Firefox, WebKit)
- Hervorragende Auto-Waiting-Mechanismen (reduziert Flakiness)
- Mobile-Testing mit Device-Emulation (kritisch für mobile-first App)
- Parallele Testausführung out-of-the-box
- Screenshot & Video Recording bei Failures
- Trace Viewer für detailliertes Debugging
- TypeScript-First Ansatz
- Aktive Community & Microsoft-Support

---

## Testpyramide & Coverage-Ziele

### Testverteilung nach QA-Guidelines

```
        /\
       /  \  E2E Tests (10%)
      /----\  Playwright: Kritische User Journeys
     /      \  Fokus: Revenue & Trust Flows
    /--------\
   /  Integration Tests (20%)
  /--------------\  API + DB + External Services
 /                \
/    Unit Tests    \  (70%)
--------------------  Jest/Vitest: Domain Logic
```

### Coverage-Ziele

| Test-Typ | Anteil | Coverage-Ziel | Tools |
|----------|--------|---------------|-------|
| **Unit Tests** | 70% | 80%+ für Domain Logic | Jest, Vitest |
| **Integration Tests** | 20% | 100% für kritische APIs | Supertest, Testcontainers |
| **E2E Tests** | 10% | 100% für kritische Journeys | Playwright |

### Was wird E2E getestet?

**Revenue-kritische Flows (Must-Have):**
- Booking Flow: Fahrzeugauswahl → Service → Termin → Payment → Bestätigung
- Payment Flow: Stripe Integration, Fehlerbehandlung
- Order Extension Flow: Angebot → Freigabe/Ablehnung → Payment

**Trust-kritische Flows (Must-Have):**
- Login/Auth: Magic Link für Kunden
- Jockey Pickup/Delivery: Übergabeprotokoll, Foto-Upload
- Werkstatt Order Management: Auftragserweiterung erstellen

**Edge Cases (Must-Have):**
- Validierungsfehler (fehlende Pflichtfelder)
- Ausgebuchte Slots
- Payment Failures
- Session Timeout

---

## E2E-Test-Strategie mit Playwright

### Grundprinzipien

1. **Test-First Approach**: Tests werden während Sprint Planning definiert
2. **Given-When-Then Format**: Alle Tests folgen BDD-Stil
3. **Page Object Pattern**: Wiederverwendbare Page Objects für alle UI-Komponenten
4. **Data-Driven Tests**: Fixtures für realistische Testdaten
5. **Isolation**: Jeder Test ist unabhängig und kann parallel laufen
6. **Fast Feedback**: Priorisierung nach Kritikalität (Critical > High > Medium)

### Test-Kategorien nach Kritikalität

**P0 (Critical) - Blocker, müssen immer grün sein:**
- Booking Flow Happy Path
- Payment Flow
- Order Extension Freigabe
- Login/Auth

**P1 (High) - Kern-Features:**
- Booking Flow Edge Cases
- Jockey Pickup/Delivery
- Werkstatt Order Creation
- Error Handling

**P2 (Medium) - Nice-to-Have:**
- UI/UX Details
- Visual Regression
- Performance-Tests

### Test-Execution-Strategie

```typescript
// playwright.config.ts - Test Suites nach Kritikalität
export default defineConfig({
  projects: [
    {
      name: 'critical', // P0 - immer ausführen
      testMatch: /.*\.critical\.spec\.ts/,
      retries: 0, // keine Retries für kritische Tests
    },
    {
      name: 'regression', // P1 - bei PRs
      testMatch: /.*\.spec\.ts/,
      retries: 2,
    },
    {
      name: 'mobile', // Mobile-Testing
      use: { ...devices['iPhone 13'] },
    },
  ],
});
```

---

## Test-Struktur & Organisation

### Verzeichnisstruktur

```
/tests/
├── e2e/                              # Playwright E2E Tests
│   ├── customer/                     # Kunden-Portal Tests
│   │   ├── booking-flow.critical.spec.ts      # P0: Booking Happy Path
│   │   ├── booking-validation.spec.ts         # P1: Validierungen
│   │   ├── order-extension-approval.spec.ts   # P0: Freigabe
│   │   ├── order-extension-rejection.spec.ts  # P1: Ablehnung
│   │   ├── payment.critical.spec.ts           # P0: Payment
│   │   ├── payment-failure.spec.ts            # P1: Payment Errors
│   │   └── login.spec.ts                      # P1: Auth
│   │
│   ├── jockey/                       # Jockey-Portal Tests
│   │   ├── dashboard.spec.ts                  # P1: Dashboard
│   │   ├── pickup-flow.spec.ts                # P1: Abholung
│   │   ├── delivery-flow.spec.ts              # P1: Rückgabe
│   │   ├── handover-protocol.spec.ts          # P1: Übergabeprotokoll
│   │   └── photo-upload.spec.ts               # P1: Fotodokumentation
│   │
│   ├── workshop/                     # Werkstatt-Portal Tests
│   │   ├── dashboard.spec.ts                  # P1: Dashboard
│   │   ├── order-list.spec.ts                 # P1: Auftragsübersicht
│   │   ├── order-extension-create.critical.spec.ts  # P0: Angebot erstellen
│   │   ├── order-extension-workflow.spec.ts   # P1: Workflow
│   │   └── photo-upload.spec.ts               # P1: Foto-Upload
│   │
│   └── shared/                       # Shared Utilities
│       ├── fixtures/                 # Test Data
│       │   ├── vehicles.ts           # Fahrzeugdaten
│       │   ├── customers.ts          # Kundendaten
│       │   ├── services.ts           # Service-Arten
│       │   └── workshops.ts          # Werkstattdaten
│       │
│       ├── page-objects/             # Page Object Pattern
│       │   ├── customer/
│       │   │   ├── BookingPage.ts
│       │   │   ├── VehicleSelectionPage.ts
│       │   │   ├── ServiceSelectionPage.ts
│       │   │   ├── SlotSelectionPage.ts
│       │   │   ├── PaymentPage.ts
│       │   │   └── OrderExtensionPage.ts
│       │   │
│       │   ├── jockey/
│       │   │   ├── DashboardPage.ts
│       │   │   ├── PickupPage.ts
│       │   │   └── HandoverProtocolPage.ts
│       │   │
│       │   └── workshop/
│       │       ├── DashboardPage.ts
│       │       ├── OrderListPage.ts
│       │       └── OrderExtensionPage.ts
│       │
│       ├── helpers/                  # Helper Functions
│       │   ├── auth.helpers.ts       # Login/Auth Helpers
│       │   ├── payment.helpers.ts    # Stripe Test Helpers
│       │   ├── db.helpers.ts         # DB Seed/Cleanup
│       │   └── api.helpers.ts        # API-Interaktionen
│       │
│       └── test-setup.ts             # Global Setup/Teardown
│
├── integration/                      # API Integration Tests (20%)
│   ├── api/
│   │   ├── booking.api.spec.ts
│   │   ├── slots.api.spec.ts
│   │   └── payment.api.spec.ts
│   └── db/
│       └── slot-locking.spec.ts      # Race Conditions
│
└── unit/                             # Unit Tests (70%)
    └── (wird von Entwicklern geschrieben)
```

### Namenskonventionen

- **Critical Tests**: `*.critical.spec.ts` (P0 - immer grün)
- **Standard Tests**: `*.spec.ts` (P1/P2 - bei PRs)
- **Page Objects**: PascalCase mit `Page` Suffix (z.B. `BookingPage.ts`)
- **Helpers**: camelCase mit `.helpers.ts` Suffix
- **Fixtures**: camelCase (z.B. `testVehicles.ts`)

---

## Kritische Test-Szenarien

### 1. Kunden-Portal: Booking Flow (P0 - Critical)

**Datei:** `e2e/customer/booking-flow.critical.spec.ts`

**Scope:**
- Vollständiger Happy Path: Fahrzeug → Service → Termin → Payment → Bestätigung
- Alle Pflichtfelder: Marke, Modell, Baujahr, Kilometerstand
- Festpreis-Anzeige nach Marke/Modell
- Slot-Auswahl & Adresseingabe
- Stripe Payment
- Buchungsbestätigung

**User Stories:** US-001, US-002, US-003, US-004, US-011

### 2. Kunden-Portal: Order Extension Approval (P0 - Critical)

**Datei:** `e2e/customer/order-extension-approval.spec.ts`

**Scope:**
- Push-Benachrichtigung empfangen (Mock)
- Auftragserweiterung öffnen
- Fotos/Videos ansehen
- Festpreis angezeigt
- Freigabe → Payment
- Werkstatt erhält Freigabe-Benachrichtigung

**User Stories:** US-009, US-010

### 3. Werkstatt-Portal: Order Extension Create (P0 - Critical)

**Datei:** `e2e/workshop/order-extension-create.critical.spec.ts`

**Scope:**
- Auftrag öffnen
- Auftragserweiterung erstellen
- Mangelbeschreibung eingeben
- Fotos hochladen (Drag & Drop)
- Festpreis eingeben
- An Kunde senden
- Kunde erhält Benachrichtigung

**User Stories:** US-008

### 4. Jockey-Portal: Pickup Flow (P1 - High)

**Datei:** `e2e/jockey/pickup-flow.spec.ts`

**Scope:**
- Login
- Dashboard mit heutigen Aufträgen
- Auftrags-Details öffnen
- Navigation zur Abholadresse (Mock)
- Übergabeprotokoll ausfüllen
- Fahrzeugschein fotografieren
- Status-Update: "Auto abgeholt"

**User Stories:** US-006, US-021

### 5. Payment Flow mit Error Handling (P1 - High)

**Datei:** `e2e/customer/payment-failure.spec.ts`

**Scope:**
- Stripe Test Card mit Decline
- Error Message anzeigen
- Retry-Möglichkeit
- Alternative Zahlungsmethode

**User Stories:** US-011

---

## Test Data Management

### Fixtures-Strategie

**Prinzipien:**
1. **Realistische Daten**: Fixtures basieren auf echten Nutzungsszenarien
2. **Wiederverwendbarkeit**: Zentrale Fixtures für alle Tests
3. **Isolation**: Jeder Test nutzt eigene Daten (keine Shared State)
4. **Seed & Cleanup**: Automatisches Setup/Teardown

### Beispiel-Fixtures

**vehicles.fixtures.ts:**
```typescript
export const testVehicles = {
  vwGolf: {
    brand: 'VW',
    model: 'Golf 7',
    year: 2015,
    mileage: 85000,
    expectedPrice: 219, // EUR für Inspektion
  },
  audiA4: {
    brand: 'Audi',
    model: 'A4 B9',
    year: 2018,
    mileage: 45000,
    expectedPrice: 279,
  },
  mercedesEClass: {
    brand: 'Mercedes',
    model: 'E-Klasse W213',
    year: 2016,
    mileage: 90000,
    expectedPrice: 319,
  },
};
```

**customers.fixtures.ts:**
```typescript
export const testCustomers = {
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
};
```

### Datenbank-Seeding

**Strategie:**
- Vor jedem Test: Fresh Database State
- Seed minimale Daten für Test
- Nach Test: Cleanup (oder Rollback)

**Implementierung:**
```typescript
// shared/helpers/db.helpers.ts
export async function seedTestData(scenario: 'booking' | 'orderExtension') {
  if (scenario === 'booking') {
    await db.workshops.create(testWorkshops.witten);
    await db.slots.createMany(testSlots.january2026);
  }
  // ...
}

export async function cleanupTestData() {
  await db.appointments.deleteMany({ email: /test\+.*@ronja.example.com/ });
  // ...
}
```

---

## CI/CD Integration

### GitHub Actions Workflow

**Strategie:**
- **PR**: Kritische Tests (P0) + Regression (P1)
- **Main Branch**: Full Suite (P0 + P1 + P2)
- **Nightly**: Full Suite + Visual Regression + Performance

**Workflow-Datei:** `.github/workflows/e2e-tests.yml`

```yaml
name: E2E Tests (Playwright)

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main]
  schedule:
    - cron: '0 2 * * *' # Nightly um 2 Uhr

jobs:
  test:
    name: E2E Tests
    runs-on: ubuntu-latest
    timeout-minutes: 15

    strategy:
      matrix:
        project: [critical, regression, mobile]

    steps:
      - name: Checkout Code
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
          npm run db:setup
          npm run db:seed:test

      - name: Start Application
        run: npm run dev &
        env:
          NODE_ENV: test
          DATABASE_URL: postgresql://localhost:5432/ronja_test

      - name: Wait for Application
        run: npx wait-on http://localhost:3000 --timeout 60000

      - name: Run Playwright Tests
        run: npx playwright test --project=${{ matrix.project }}
        env:
          STRIPE_TEST_MODE: true
          BASE_URL: http://localhost:3000

      - name: Upload Test Report
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

      - name: Comment PR with Results
        if: github.event_name == 'pull_request'
        uses: daun/playwright-report-comment@v3
        with:
          report-path: playwright-report/
```

### Pre-Commit Hooks (Optional)

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run test:unit",
      "pre-push": "npm run test:critical"
    }
  }
}
```

---

## Quality Metrics & KPIs

### Test Coverage Metrics

| Metrik | Ziel | Aktuell | Status |
|--------|------|---------|--------|
| **E2E Coverage** | 100% kritische Journeys | TBD | 🔴 |
| **Flakiness Rate** | < 5% | TBD | 🔴 |
| **Test Execution Time** | < 10 Min (Full Suite) | TBD | 🔴 |
| **Bug Escape Rate** | < 2% (Bugs in Production) | TBD | 🔴 |
| **Test Reliability** | > 95% (Pass Rate) | TBD | 🔴 |

### Tracking & Reporting

**Wöchentliches Dashboard:**
- Anzahl Tests: Gesamt, Kritisch, Regression
- Pass Rate: % grüne Tests
- Flaky Tests: Liste instabiler Tests
- Execution Time: Durchschnittliche Laufzeit
- Coverage: Abgedeckte User Stories

**Tools:**
- Playwright HTML Reporter (lokal)
- GitHub Actions Dashboard (CI)
- Optional: Allure Report für erweiterte Metriken

---

## Tools & Technologie-Stack

### Test-Stack

| Tool | Zweck | Version |
|------|-------|---------|
| **Playwright** | E2E Testing | 1.40+ |
| **TypeScript** | Test-Code | 5.x |
| **Jest** | Unit Tests | 29.x |
| **Supertest** | API Integration Tests | 6.x |
| **Testcontainers** | DB Testing (Docker) | 10.x |
| **Stripe CLI** | Payment Testing (Webhooks) | Latest |
| **Faker.js** | Test Data Generation | 8.x |

### Playwright Configuration

**Datei:** `playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: [
    ['html', { open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],

  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

  projects: [
    // Critical Tests - immer ausführen
    {
      name: 'critical',
      testMatch: /.*\.critical\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
      retries: 0, // keine Retries für kritische Tests
    },

    // Regression Suite
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // Mobile Testing (kritisch für mobile-first App)
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 13'] },
    },

    // Optional: Firefox & WebKit
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
```

---

## Release-Gates

### Definition of Done für Tests

**Pre-Merge Gates (vor PR-Merge):**
- ✅ Alle Unit Tests grün (100%)
- ✅ Kritische E2E Tests grün (P0 - 100%)
- ✅ Regression Tests grün (P1 - > 95%)
- ✅ Lint + TypeCheck ohne Fehler
- ✅ Code Coverage > 80% für neue Dateien

**Pre-Deploy Gates (Staging):**
- ✅ Full E2E Suite grün (P0 + P1 + P2)
- ✅ Smoke Tests grün (API health, DB connection)
- ✅ Performance Tests (Ladezeit < 2s)
- ✅ No Flaky Tests (100% deterministic)

**Post-Deploy (Production):**
- ✅ Smoke Tests auf Prod (API health, Login, Search)
- ✅ Monitoring Alerts aktiv (Sentry, CloudWatch)
- ✅ Rollback-Plan dokumentiert

### Bug-Triage-Prozess

**Severity Levels:**
- **P0 (Blocker)**: App nicht nutzbar → Hotfix sofort
- **P1 (Critical)**: Kernfunktion broken → Fix in 24h
- **P2 (Major)**: Feature broken, Workaround → Fix in Sprint
- **P3 (Minor)**: Kosmetisch, UX-Issue → Backlog

**Regel:** Jeder Bug > P1 erhält einen Regression-Test (verhindert Wiederkehr).

---

## Nächste Schritte

### Sprint 1 (Aktuell)
1. ✅ Test-Strategie definieren (dieses Dokument)
2. 🔲 Playwright Setup & Konfiguration (`playwright.config.ts`)
3. 🔲 Erste kritische Tests implementieren:
   - `booking-flow.critical.spec.ts`
   - `payment.critical.spec.ts`
4. 🔲 Page Object Pattern etablieren (BookingPage, PaymentPage)
5. 🔲 CI/CD Pipeline aufsetzen (GitHub Actions)

### Sprint 2
6. 🔲 Order Extension Tests (Kunde + Werkstatt)
7. 🔲 Jockey-Portal Tests
8. 🔲 Integration Tests (API + DB)
9. 🔲 Fixtures & Test Data Management finalisieren

### Sprint 3+
10. 🔲 Visual Regression Testing (Optional)
11. 🔲 Performance Testing (Lighthouse CI)
12. 🔲 Accessibility Testing (Axe Core)
13. 🔲 Security Testing (OWASP ZAP)

---

## Anhang

### Referenzen
- QA-Guidelines: `.claude/agents/qa-test-engineer.md`
- User Stories: `01 Requirements/02_MVP_User_Stories.md`
- Epics: `01 Requirements/01_Epics.md`
- Playwright Docs: https://playwright.dev

### Glossar
- **P0-P3**: Prioritäten (0 = Critical, 3 = Minor)
- **Flakiness**: Instabile Tests (mal grün, mal rot)
- **Page Object**: Design Pattern für wiederverwendbare UI-Komponenten
- **Fixture**: Testdaten (Fahrzeuge, Kunden, etc.)
- **Smoke Test**: Minimaler Test nach Deployment (App startet?)

---

**Version History:**
- v1.0 (2026-02-01): Initiale Version - Strategie definiert
