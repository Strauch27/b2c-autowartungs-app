# CI/CD Integration - Playwright E2E Tests

**Version:** 1.0
**Datum:** 2026-02-01
**Status:** Ready to Implement
**Autor:** QA & Test Engineer

---

## Inhaltsverzeichnis

1. [CI/CD Strategie](#cicd-strategie)
2. [GitHub Actions Workflows](#github-actions-workflows)
3. [Test-Execution-Pipeline](#test-execution-pipeline)
4. [Environment Management](#environment-management)
5. [Reporting & Notifications](#reporting--notifications)
6. [Performance-Optimierung](#performance-optimierung)
7. [Troubleshooting](#troubleshooting)

---

## CI/CD Strategie

### Pipeline-Übersicht

```
┌─────────────────┐
│  Code Push/PR   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Lint & Build  │ (5-10 Min)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Unit Tests    │ (2-3 Min)
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│  Integration Tests (API/DB) │ (5 Min)
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Critical E2E Tests (P0)    │ (5 Min) - Parallel
└────────┬────────────────────┘
         │
         ├─────────────┬────────────┐
         ▼             ▼            ▼
    ┌────────┐   ┌────────┐   ┌──────────┐
    │Chromium│   │ Mobile │   │ Firefox  │
    └───┬────┘   └───┬────┘   └────┬─────┘
         │            │             │
         └────────────┴─────────────┘
                      │
                      ▼
         ┌────────────────────────┐
         │   Regression (P1/P2)   │ (nur bei Push zu main)
         └────────────────────────┘
                      │
                      ▼
         ┌────────────────────────┐
         │    Deploy Staging      │
         └────────────────────────┘
```

### Test-Execution-Strategie

| Trigger | Tests | Dauer | Ziel |
|---------|-------|-------|------|
| **PR erstellt** | Lint, Unit, Critical E2E | ~10 Min | Schnelles Feedback |
| **Push zu main** | Full Suite (P0-P2) | ~20 Min | Vollständige Validierung |
| **Nightly (2 Uhr)** | Full Suite + Visual Regression | ~30 Min | Umfassende Qualitätssicherung |
| **Pre-Deploy** | Smoke Tests | ~3 Min | Produktionsreife prüfen |

---

## GitHub Actions Workflows

### 1. Pull Request Workflow

**`.github/workflows/pr-tests.yml`:**

```yaml
name: PR Tests

on:
  pull_request:
    branches: [main, develop]
    types: [opened, synchronize, reopened]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true # Alte Runs canceln bei neuem Push

jobs:
  # Job 1: Lint & TypeCheck
  lint:
    name: Lint & TypeCheck
    runs-on: ubuntu-latest
    timeout-minutes: 5

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

      - name: Run Lint
        run: npm run lint

      - name: Run TypeCheck
        run: npm run typecheck

  # Job 2: Unit Tests
  unit-tests:
    name: Unit Tests
    runs-on: ubuntu-latest
    timeout-minutes: 10
    needs: lint

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

      - name: Run Unit Tests
        run: npm run test:unit -- --coverage

      - name: Upload Coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
          flags: unit

  # Job 3: Critical E2E Tests (Parallel)
  e2e-critical:
    name: Critical E2E Tests (${{ matrix.project }})
    runs-on: ubuntu-latest
    timeout-minutes: 15
    needs: unit-tests

    strategy:
      fail-fast: false
      matrix:
        project: [critical-chromium, critical-mobile]

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
        run: npm run db:migrate
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/ronja_test

      - name: Start Application
        run: npm run dev &
        env:
          NODE_ENV: test
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/ronja_test
          STRIPE_TEST_MODE: true
          PORT: 3000

      - name: Wait for Application
        run: npx wait-on http://localhost:3000 --timeout 60000

      - name: Run Critical E2E Tests
        run: npx playwright test --project=${{ matrix.project }}
        env:
          BASE_URL: http://localhost:3000
          CI: true

      - name: Upload Test Results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-results-${{ matrix.project }}
          path: |
            playwright-report/
            test-results/
          retention-days: 7

  # Job 4: Comment PR with Results
  comment-pr:
    name: Comment PR with Results
    runs-on: ubuntu-latest
    needs: e2e-critical
    if: always()

    steps:
      - name: Download Test Results
        uses: actions/download-artifact@v3
        with:
          name: playwright-results-critical-chromium
          path: playwright-report/

      - name: Comment PR
        uses: daun/playwright-report-comment@v3
        with:
          report-path: playwright-report/
          comment-title: 'E2E Test Results (Critical)'
```

---

### 2. Main Branch Workflow (Full Suite)

**`.github/workflows/main-tests.yml`:**

```yaml
name: Main Branch Tests

on:
  push:
    branches: [main]

jobs:
  full-e2e-suite:
    name: Full E2E Suite (${{ matrix.project }})
    runs-on: ubuntu-latest
    timeout-minutes: 30

    strategy:
      fail-fast: false
      matrix:
        project: [chromium, mobile-chrome, mobile-safari]
        shard: [1/3, 2/3, 3/3] # Sharding für Parallelisierung

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
        run: npx playwright install --with-deps

      - name: Setup Database
        run: npm run db:migrate
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/ronja_test

      - name: Start Application
        run: npm run dev &
        env:
          NODE_ENV: test
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/ronja_test

      - name: Wait for Application
        run: npx wait-on http://localhost:3000 --timeout 60000

      - name: Run Full E2E Suite
        run: npx playwright test --project=${{ matrix.project }} --shard=${{ matrix.shard }}
        env:
          BASE_URL: http://localhost:3000
          CI: true

      - name: Upload Report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report-${{ matrix.project }}-${{ matrix.shard }}
          path: playwright-report/
          retention-days: 30

      - name: Upload Videos & Screenshots
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: failure-artifacts-${{ matrix.project }}-${{ matrix.shard }}
          path: test-results/
          retention-days: 7

  # Merge Shard Results
  merge-reports:
    name: Merge Test Reports
    runs-on: ubuntu-latest
    needs: full-e2e-suite
    if: always()

    steps:
      - name: Download All Reports
        uses: actions/download-artifact@v3
        with:
          path: all-reports/

      - name: Merge Reports
        run: npx playwright merge-reports all-reports/

      - name: Upload Merged Report
        uses: actions/upload-artifact@v3
        with:
          name: merged-playwright-report
          path: playwright-report/
          retention-days: 30
```

---

### 3. Nightly Workflow (Extended)

**`.github/workflows/nightly-tests.yml`:**

```yaml
name: Nightly Tests

on:
  schedule:
    - cron: '0 2 * * *' # Jeden Tag um 2 Uhr UTC
  workflow_dispatch: # Manuelles Triggern

jobs:
  nightly-full-suite:
    name: Nightly Full Suite
    runs-on: ubuntu-latest
    timeout-minutes: 60

    strategy:
      matrix:
        browser: [chromium, firefox, webkit]

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: ronja_test
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
        ports:
          - 5432:5432

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

      - name: Install All Browsers
        run: npx playwright install --with-deps

      - name: Setup Database
        run: npm run db:migrate
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/ronja_test

      - name: Start Application
        run: npm run dev &
        env:
          NODE_ENV: test
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/ronja_test

      - name: Wait for Application
        run: npx wait-on http://localhost:3000 --timeout 60000

      - name: Run Full Test Suite
        run: npx playwright test --project=${{ matrix.browser }}
        env:
          BASE_URL: http://localhost:3000

      - name: Run Visual Regression Tests
        run: npx playwright test --project=visual-regression
        continue-on-error: true

      - name: Upload Report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: nightly-report-${{ matrix.browser }}
          path: playwright-report/
          retention-days: 30

  # Notify Slack on Failure
  notify-failure:
    name: Notify on Failure
    runs-on: ubuntu-latest
    needs: nightly-full-suite
    if: failure()

    steps:
      - name: Send Slack Notification
        uses: slackapi/slack-github-action@v1
        with:
          webhook-url: ${{ secrets.SLACK_WEBHOOK_URL }}
          payload: |
            {
              "text": "🚨 Nightly E2E Tests Failed",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*Nightly E2E Tests Failed*\n<${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}|View Run>"
                  }
                }
              ]
            }
```

---

### 4. Pre-Deploy Smoke Tests

**`.github/workflows/smoke-tests.yml`:**

```yaml
name: Smoke Tests

on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to test'
        required: true
        default: 'staging'
        type: choice
        options:
          - staging
          - production

jobs:
  smoke-tests:
    name: Smoke Tests (${{ github.event.inputs.environment }})
    runs-on: ubuntu-latest
    timeout-minutes: 10

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

      - name: Install Playwright
        run: npx playwright install --with-deps chromium

      - name: Run Smoke Tests
        run: npx playwright test --grep @smoke
        env:
          BASE_URL: ${{ github.event.inputs.environment == 'production' && 'https://ronja.com' || 'https://staging.ronja.com' }}

      - name: Upload Report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: smoke-test-report
          path: playwright-report/
```

---

## Test-Execution-Pipeline

### Parallelisierung mit Sharding

**Test-Sharding für schnellere Ausführung:**

```typescript
// playwright.config.ts
export default defineConfig({
  // ...
  workers: process.env.CI ? 1 : undefined,

  // Sharding aktivieren (via CLI)
  // npx playwright test --shard=1/3
});
```

**In GitHub Actions:**
```yaml
strategy:
  matrix:
    shard: [1/4, 2/4, 3/4, 4/4]

steps:
  - run: npx playwright test --shard=${{ matrix.shard }}
```

**Vorteile:**
- 4 Shards → 4x schneller (theoretisch)
- Praktisch: 20 Min → 6-8 Min

---

## Environment Management

### Environment Variables

**`.github/workflows` Environment Secrets:**

```yaml
env:
  # Application
  NODE_ENV: test
  BASE_URL: http://localhost:3000

  # Database
  DATABASE_URL: postgresql://postgres:postgres@localhost:5432/ronja_test

  # Stripe (Test Mode)
  STRIPE_TEST_MODE: true
  STRIPE_PUBLIC_KEY: ${{ secrets.STRIPE_TEST_PUBLIC_KEY }}
  STRIPE_SECRET_KEY: ${{ secrets.STRIPE_TEST_SECRET_KEY }}

  # Auth
  JWT_SECRET: ${{ secrets.TEST_JWT_SECRET }}

  # Feature Flags
  FEATURE_ORDER_EXTENSION: true
  FEATURE_JOCKEY_PORTAL: true
```

### GitHub Secrets einrichten

```bash
# Via GitHub UI:
Settings → Secrets and variables → Actions → New repository secret

# Oder via CLI:
gh secret set STRIPE_TEST_SECRET_KEY < stripe_key.txt
gh secret set TEST_JWT_SECRET < jwt_secret.txt
gh secret set SLACK_WEBHOOK_URL < slack_webhook.txt
```

---

## Reporting & Notifications

### 1. HTML Report als Artifact

```yaml
- name: Upload HTML Report
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
    retention-days: 30
```

**Report anschauen:**
```bash
# Download Artifact aus GitHub UI
# Oder via CLI:
gh run download <run-id> -n playwright-report

# Lokal öffnen:
npx playwright show-report playwright-report/
```

### 2. PR-Kommentare mit Testergebnissen

```yaml
- name: Comment PR with Results
  uses: daun/playwright-report-comment@v3
  with:
    report-path: playwright-report/
    comment-title: 'E2E Test Results'
```

**Beispiel-PR-Kommentar:**
```
✅ E2E Test Results

Tests: 45 passed, 2 failed, 47 total
Duration: 5m 23s

Failed Tests:
- TC-010: Order Extension Approval (Critical)
- TC-042: Photo Upload (Medium)

[View Full Report](https://github.com/.../actions/runs/123)
```

### 3. Slack-Benachrichtigungen

```yaml
- name: Notify Slack on Failure
  if: failure()
  uses: slackapi/slack-github-action@v1
  with:
    webhook-url: ${{ secrets.SLACK_WEBHOOK_URL }}
    payload: |
      {
        "text": "🚨 E2E Tests Failed in PR #${{ github.event.pull_request.number }}",
        "blocks": [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "*PR:* <${{ github.event.pull_request.html_url }}|${{ github.event.pull_request.title }}>\n*Author:* ${{ github.actor }}"
            }
          }
        ]
      }
```

### 4. Test-Metriken Dashboard

**Option 1: GitHub Pages (statisches Dashboard)**
```yaml
- name: Deploy Report to GitHub Pages
  uses: peaceiris/actions-gh-pages@v3
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    publish_dir: ./playwright-report
```

**Option 2: Integration mit Allure Report**
```yaml
- name: Generate Allure Report
  run: npx allure generate --clean

- name: Deploy Allure Report
  uses: peaceiris/actions-gh-pages@v3
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    publish_dir: ./allure-report
```

---

## Performance-Optimierung

### 1. Caching

```yaml
- name: Cache Dependencies
  uses: actions/cache@v3
  with:
    path: |
      ~/.npm
      ~/.cache/ms-playwright
    key: ${{ runner.os }}-playwright-${{ hashFiles('**/package-lock.json') }}

- name: Cache Playwright Browsers
  uses: actions/cache@v3
  with:
    path: ~/.cache/ms-playwright
    key: ${{ runner.os }}-playwright-browsers-${{ hashFiles('**/package-lock.json') }}
```

### 2. Database Seeding optimieren

```yaml
- name: Seed Database (Optimized)
  run: |
    # Nur minimale Daten seeden
    npm run db:seed:minimal
```

### 3. Test-Isolation mit Snapshots

```yaml
- name: Create DB Snapshot
  run: pg_dump ronja_test > db_snapshot.sql

- name: Restore DB Snapshot (before each shard)
  run: psql ronja_test < db_snapshot.sql
```

---

## Troubleshooting

### Problem: Tests timeout in CI

**Ursache:** Server startet zu langsam

**Lösung:**
```yaml
- name: Wait for Application (Extended Timeout)
  run: npx wait-on http://localhost:3000 --timeout 120000 # 2 Min
```

### Problem: Flaky Tests in CI

**Ursache:** Race Conditions, instabile Netzwerk-Bedingungen

**Lösung:**
```typescript
// playwright.config.ts
export default defineConfig({
  retries: process.env.CI ? 2 : 0, // 2 Retries in CI
  use: {
    actionTimeout: 15000, // Längere Timeouts in CI
  },
});
```

### Problem: DB-Verbindung schlägt fehl

**Ursache:** PostgreSQL-Service nicht bereit

**Lösung:**
```yaml
services:
  postgres:
    options: >-
      --health-cmd pg_isready
      --health-interval 10s
      --health-timeout 5s
      --health-retries 5
```

### Problem: Zu hohe Costs (GitHub Actions Minutes)

**Lösung:**
- Nur kritische Tests bei jedem PR
- Full Suite nur bei Push zu main
- Nightly nur 1x pro Tag
- Sharding nutzen für schnellere Ausführung

---

## Cost-Estimation (GitHub Actions)

| Workflow | Trigger | Dauer | Runs/Monat | Minutes/Monat |
|----------|---------|-------|------------|---------------|
| PR Tests | Pull Request | 10 Min | 100 PRs | 1.000 Min |
| Main Tests | Push to main | 20 Min | 50 Pushes | 1.000 Min |
| Nightly | Daily | 30 Min | 30 Days | 900 Min |
| **Total** | | | | **2.900 Min** |

**GitHub Free Tier:** 2.000 Min/Monat (danach $0.008/Min)
**Kosten:** ~$7/Monat bei 2.900 Minuten

---

## Nächste Schritte

1. ✅ CI/CD Strategie definiert
2. 🔲 GitHub Actions Workflows erstellen
3. 🔲 Secrets konfigurieren
4. 🔲 Slack-Webhook einrichten
5. 🔲 Erste Pipeline ausführen

---

**Version History:**
- v1.0 (2026-02-01): Initiale Version - CI/CD Integration komplett
