# Playwright Quick Start - Zusammenfassung & Roadmap

**Version:** 1.0
**Datum:** 2026-02-01
**Status:** Ready to Implement
**Autor:** QA & Test Engineer

---

## Executive Summary

Diese Dokumentation definiert eine **umfassende Playwright Testautomatisierungs-Strategie** für die B2C Autowartungs-App mit:

- **6 detaillierte Dokumente** (160+ Seiten)
- **60+ definierte Test-Szenarien**
- **Paralleler Test-First-Ansatz** (Tests werden gleichzeitig mit Features entwickelt)
- **Multi-Portal-Testing** (Kunde, Jockey, Werkstatt)
- **CI/CD-Ready** (GitHub Actions Workflows)

---

## Dokumenten-Übersicht

### 📄 Dokument 24: Test-Strategie (24_Test_Strategy_Playwright.md)
**Was:** Übergeordnete Test-Strategie und Architektur
**Inhalt:**
- Testpyramide (10% E2E, 20% Integration, 70% Unit)
- Playwright als Framework-Wahl (Begründung)
- Coverage-Ziele (100% kritische Journeys)
- Release-Gates (Pre-Merge, Pre-Deploy, Post-Deploy)
- Quality Metrics & KPIs

**Key Takeaway:** Playwright ist das richtige Framework für mobile-first, multi-portal E2E-Testing.

---

### 📄 Dokument 25: E2E Test-Szenarien (25_E2E_Test_Scenarios.md)
**Was:** Detaillierte Testfälle für alle User Journeys
**Inhalt:**
- **Kunden-Portal:** 12 Szenarien (Booking Flow, Order Extension, Login)
- **Jockey-Portal:** 5 Szenarien (Pickup, Delivery, Handover)
- **Werkstatt-Portal:** 5 Szenarien (Order Management, Extensions)
- **Cross-Portal:** End-to-End Multi-Stakeholder-Journey
- **Edge Cases:** Concurrent Booking, Payment Failures, Security

**Key Takeaway:** 60+ Test-Szenarien decken alle kritischen User Journeys ab.

---

### 📄 Dokument 26: Playwright Setup (26_Playwright_Setup_Guide.md)
**Was:** Step-by-Step Installation und Konfiguration
**Inhalt:**
- Installation (npm init playwright@latest)
- Playwright Config (playwright.config.ts)
- Verzeichnisstruktur erstellen
- Global Setup/Teardown
- Database Seeding
- Auth Helpers, Payment Helpers

**Key Takeaway:** In 30 Minuten von Zero zu Running Tests.

---

### 📄 Dokument 27: Page Objects (27_Page_Objects_Architecture.md)
**Was:** Wiederverwendbare Page Object Pattern
**Inhalt:**
- Base Page für alle Pages
- Kunden-Portal Page Objects (Booking, Payment, Order Extension)
- Jockey-Portal Page Objects (Dashboard, Pickup, Delivery)
- Werkstatt-Portal Page Objects (Order Management)
- Shared Components (Modal, Header, Footer)

**Key Takeaway:** Page Objects machen Tests wartbar und lesbar.

---

### 📄 Dokument 28: CI/CD Integration (28_CI_CD_Integration.md)
**Was:** GitHub Actions Workflows und Pipeline
**Inhalt:**
- PR Workflow (Lint → Unit → Critical E2E)
- Main Branch Workflow (Full Suite mit Sharding)
- Nightly Tests (Cross-Browser + Visual Regression)
- Smoke Tests (Pre-Deploy)
- Slack-Notifications, HTML-Reports

**Key Takeaway:** CI/CD-Pipeline für automatisierte Quality-Gates.

---

### 📄 Dokument 29: Test Data Management (29_Test_Data_Management.md)
**Was:** Fixtures, Seeding, Mocks
**Inhalt:**
- Fixtures (Vehicles, Customers, Services, Workshops)
- Database Seeding (Basis-Daten vor Tests)
- Test Data Builders (AppointmentBuilder)
- Mocks (Stripe, E-Mail)
- Cleanup-Strategien (Transaction Rollback, Explicit Cleanup)

**Key Takeaway:** Realistische, isolierte, GDPR-konforme Testdaten.

---

## Quick Start Guide (30 Minuten)

### Schritt 1: Playwright installieren (5 Min)

```bash
cd /Users/stenrauch/Documents/B2C\ App\ v2

# Playwright installieren
npm init playwright@latest
# Antworten: TypeScript=Ja, Verzeichnis=tests, GitHub Actions=Ja

# Zusätzliche Dependencies
npm install --save-dev @faker-js/faker dotenv cross-env
```

### Schritt 2: Konfiguration (5 Min)

**`playwright.config.ts` erstellen:**
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'critical', testMatch: /.*\.critical\.spec\.ts/ },
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['iPhone 13'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
  },
});
```

**`.env.test` erstellen:**
```env
NODE_ENV=test
BASE_URL=http://localhost:3000
DATABASE_URL=postgresql://localhost:5432/ronja_test
STRIPE_TEST_MODE=true
```

### Schritt 3: Verzeichnisstruktur (5 Min)

```bash
mkdir -p tests/e2e/customer
mkdir -p tests/e2e/jockey
mkdir -p tests/e2e/workshop
mkdir -p tests/shared/fixtures
mkdir -p tests/shared/page-objects/customer
mkdir -p tests/shared/helpers
```

### Schritt 4: Fixtures erstellen (5 Min)

**`tests/shared/fixtures/test-data.ts`:**
```typescript
export const testVehicles = {
  vwGolf: {
    brand: 'VW',
    model: 'Golf 7',
    year: 2015,
    mileage: 85000,
  },
};

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
};
```

### Schritt 5: Ersten Test schreiben (10 Min)

**`tests/e2e/customer/booking-flow.critical.spec.ts`:**
```typescript
import { test, expect } from '@playwright/test';
import { testVehicles, testCustomers } from '@tests/shared/fixtures/test-data';

test('TC-001: Booking Flow Happy Path', async ({ page }) => {
  // Startseite
  await page.goto('/');
  await page.click('text=Jetzt buchen');

  // Fahrzeug auswählen
  await page.selectOption('select[name="brand"]', testVehicles.vwGolf.brand);
  await page.selectOption('select[name="model"]', testVehicles.vwGolf.model);
  await page.selectOption('select[name="year"]', String(testVehicles.vwGolf.year));
  await page.fill('input[name="mileage"]', String(testVehicles.vwGolf.mileage));
  await page.click('button:has-text("Weiter")');

  // Service auswählen
  await page.click('button[data-service="inspection"]');
  await expect(page.locator('[data-testid="fixed-price"]')).toContainText('219,00 EUR');
  await page.click('button:has-text("Weiter")');

  // Termin & Adresse
  await page.click('.slot-button:first-of-type');
  await page.fill('input[name="street"]', testCustomers.regular.address.street);
  await page.fill('input[name="zip"]', testCustomers.regular.address.zip);
  await page.fill('input[name="city"]', testCustomers.regular.address.city);
  await page.fill('input[name="phone"]', testCustomers.regular.phone);
  await page.click('button:has-text("Weiter zur Zahlung")');

  // Payment (Stripe Test Card)
  const stripeFrame = page.frameLocator('iframe[name^="__privateStripeFrame"]');
  await stripeFrame.locator('input[name="cardnumber"]').fill('4242424242424242');
  await stripeFrame.locator('input[name="exp-date"]').fill('12/28');
  await stripeFrame.locator('input[name="cvc"]').fill('123');
  await page.click('button:has-text("Jetzt bezahlen")');

  // Bestätigung
  await expect(page.locator('h1')).toContainText('Buchung erfolgreich', { timeout: 15000 });
});
```

### Schritt 6: Test ausführen

```bash
# Test ausführen
npx playwright test

# Mit UI
npx playwright test --headed

# Mit Debugger
npx playwright test --debug

# HTML Report anschauen
npx playwright show-report
```

---

## Roadmap: Implementierungs-Plan

### Sprint 1 (Woche 1-2) - Foundation

**Ziele:**
- Playwright Setup abgeschlossen
- Erste kritische Tests laufen
- CI/CD Pipeline aktiv

**Tasks:**
1. ✅ Dokumentation erstellen (dieses Dokument)
2. 🔲 Playwright installieren & konfigurieren
3. 🔲 Fixtures & Helpers implementieren
4. 🔲 Erste kritische Tests schreiben:
   - TC-001: Booking Flow Happy Path
   - TC-010: Order Extension Approval
5. 🔲 GitHub Actions Workflow (PR Tests)
6. 🔲 Database Seeding Setup

**Deliverables:**
- ✅ `playwright.config.ts`
- ✅ 2-3 kritische Tests (P0)
- ✅ CI/CD Pipeline für PRs

---

### Sprint 2 (Woche 3-4) - Core Test Suite

**Ziele:**
- Alle kritischen Journeys getestet (P0)
- Page Object Pattern etabliert
- Database Seeding automatisiert

**Tasks:**
1. 🔲 Page Objects implementieren:
   - BookingPage, PaymentPage
   - OrderExtensionPage
   - JockeyDashboardPage, WorkshopDashboardPage
2. 🔲 Kritische Tests (P0):
   - TC-001: Booking Flow
   - TC-010: Order Extension Approval
   - TC-040: Order Extension Create
   - TC-050: Multi-Portal Journey
3. 🔲 Database Helpers & Cleanup
4. 🔲 Auth Helpers (Login für alle Portale)

**Deliverables:**
- ✅ 10+ kritische Tests (P0)
- ✅ Page Object Pattern in allen Portalen
- ✅ Global Setup/Teardown funktioniert

---

### Sprint 3 (Woche 5-6) - Regression Suite

**Ziele:**
- Alle High-Priority-Tests (P1)
- Edge Cases abgedeckt
- Full CI/CD-Pipeline

**Tasks:**
1. 🔲 Regression Tests (P1):
   - Validierungsfehler (TC-002)
   - Slot ausgebucht (TC-003)
   - Payment Failures (TC-004)
   - Jockey Pickup/Delivery
2. 🔲 Edge Cases:
   - Concurrent Booking (TC-060)
   - Payment Webhook Failure (TC-061)
   - Session Hijacking (TC-062)
3. 🔲 CI/CD: Main Branch Workflow (Full Suite)
4. 🔲 Nightly Tests Setup

**Deliverables:**
- ✅ 30+ Tests (P0 + P1)
- ✅ Edge Cases abgedeckt
- ✅ CI/CD Full Suite läuft

---

### Sprint 4 (Woche 7-8) - Optimization & Reporting

**Ziele:**
- Test-Performance optimieren
- Reporting & Monitoring
- Visual Regression (Optional)

**Tasks:**
1. 🔲 Test-Performance:
   - Sharding für parallele Ausführung
   - Database Snapshots
   - Caching optimieren
2. 🔲 Reporting:
   - HTML Report Customization
   - PR-Kommentare mit Results
   - Slack-Benachrichtigungen
3. 🔲 Visual Regression (Optional):
   - Screenshot-Vergleiche für UI
4. 🔲 Documentation & Onboarding

**Deliverables:**
- ✅ E2E Suite läuft in < 10 Min
- ✅ Automatische Reports & Notifications
- ✅ Team-Onboarding abgeschlossen

---

## Test Coverage Übersicht

### Nach Sprint 1 (Foundation)
- **E2E Tests:** 3 Tests (P0)
- **Coverage:** Booking Flow, Order Extension
- **Geschätzte Laufzeit:** 5 Min

### Nach Sprint 2 (Core)
- **E2E Tests:** 12 Tests (P0)
- **Coverage:** Alle kritischen Journeys
- **Geschätzte Laufzeit:** 8 Min

### Nach Sprint 3 (Regression)
- **E2E Tests:** 35 Tests (P0 + P1)
- **Coverage:** Alle User Journeys + Edge Cases
- **Geschätzte Laufzeit:** 12 Min

### Nach Sprint 4 (Optimization)
- **E2E Tests:** 40+ Tests (P0 + P1 + P2)
- **Coverage:** 100% kritische Journeys
- **Geschätzte Laufzeit:** < 10 Min (durch Sharding)

---

## Erfolgs-Kriterien

### Sprint 1
- ✅ Playwright läuft lokal
- ✅ 2-3 kritische Tests grün
- ✅ CI/CD Pipeline für PRs aktiv

### Sprint 2
- ✅ Alle P0-Tests grün
- ✅ Page Objects in allen Portalen
- ✅ Database Seeding automatisiert

### Sprint 3
- ✅ 30+ Tests (P0 + P1) grün
- ✅ Full CI/CD-Pipeline (Main Branch + Nightly)
- ✅ < 5% Flakiness Rate

### Sprint 4
- ✅ E2E Suite < 10 Min
- ✅ Automatische Reports & Notifications
- ✅ Team kann eigenständig Tests schreiben

---

## Wichtige Links & Ressourcen

### Dokumentation
- [Playwright Docs](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [GitHub Actions Docs](https://docs.github.com/en/actions)

### Interne Dokumente
- `24_Test_Strategy_Playwright.md` - Gesamtstrategie
- `25_E2E_Test_Scenarios.md` - Alle Testfälle
- `26_Playwright_Setup_Guide.md` - Installation
- `27_Page_Objects_Architecture.md` - Page Object Pattern
- `28_CI_CD_Integration.md` - GitHub Actions
- `29_Test_Data_Management.md` - Fixtures & Mocks

### Guidelines
- `.claude/agents/qa-test-engineer.md` - QA-Guidelines
- `01 Requirements/02_MVP_User_Stories.md` - User Stories
- `01 Requirements/01_Epics.md` - Epics

---

## Team-Rollen & Verantwortlichkeiten

### QA Engineer (Lead)
- Test-Strategie definieren ✅
- Playwright Setup ✅
- Kritische Tests schreiben
- CI/CD Pipeline aufsetzen
- Code Reviews für Tests

### Fullstack Engineers
- Features entwickeln
- Tests für eigene Features schreiben (parallel)
- Page Objects erweitern
- Bugs fixen

### Tech Lead / Architect
- Architektur-Reviews
- Test-Infrastruktur-Decisions
- Performance-Optimierung

---

## FAQ

**Q: Wann schreiben wir Tests?**
A: Parallel zur Feature-Entwicklung. Für jede User Story gibt es entsprechende E2E-Tests.

**Q: Müssen alle Tests vor Merge grün sein?**
A: Ja, alle P0-Tests (Critical) müssen grün sein. P1/P2 dürfen < 5% flaky sein.

**Q: Wie lange dauert die E2E-Suite?**
A: Ziel: < 10 Min für Full Suite (durch Sharding & Parallelisierung)

**Q: Was passiert bei flaky Tests?**
A: Regel: Kein Merge bei flaky Tests. Entweder fixen, quarantänen oder löschen.

**Q: Brauchen wir alle Browser?**
A: MVP: Chromium + Mobile (iPhone/Android). Optional: Firefox/WebKit später.

**Q: Wie testen wir Stripe?**
A: Stripe Test Mode mit Test Cards (4242424242424242). Webhooks via Stripe CLI.

---

## Nächste Schritte (Priorisiert)

### Diese Woche
1. ✅ Dokumentation erstellt (dieses Dokument)
2. 🔲 Playwright installieren (`npm init playwright@latest`)
3. 🔲 `playwright.config.ts` erstellen
4. 🔲 Erste Test-Fixtures erstellen

### Nächste Woche
5. 🔲 Ersten Test schreiben (TC-001: Booking Flow)
6. 🔲 Database Seeding Setup
7. 🔲 GitHub Actions Workflow (PR Tests)
8. 🔲 Page Objects für Booking Flow

### Sprint 2 Start
9. 🔲 Alle kritischen Tests (P0) implementieren
10. 🔲 Auth Helpers für alle Portale
11. 🔲 Full CI/CD-Pipeline

---

## Kontakt & Support

**Bei Fragen zu:**
- **Playwright Setup:** Siehe Dokument 26
- **Test-Szenarien:** Siehe Dokument 25
- **CI/CD:** Siehe Dokument 28
- **Page Objects:** Siehe Dokument 27

**Eskalation:**
- Flaky Tests → QA Lead
- CI/CD-Probleme → DevOps / Tech Lead
- Test-Strategie → QA Lead + Product Manager

---

## Zusammenfassung

Diese Playwright Testautomatisierungs-Strategie bietet:

✅ **Umfassende Dokumentation** (6 Dokumente, 160+ Seiten)
✅ **60+ definierte Test-Szenarien** für alle User Journeys
✅ **Quick Start Guide** (30 Min von Zero zu Running Tests)
✅ **CI/CD-Ready** (GitHub Actions Workflows vordefiniert)
✅ **Page Object Pattern** für wartbare Tests
✅ **Realistische Test-Daten** (Fixtures, Builders, Mocks)
✅ **Paralleler Test-First-Ansatz** (Tests = lebende Dokumentation)

**Nächster Schritt:** Playwright installieren und ersten Test schreiben! 🚀

---

**Version History:**
- v1.0 (2026-02-01): Initiale Version - Quick Start Guide & Roadmap
