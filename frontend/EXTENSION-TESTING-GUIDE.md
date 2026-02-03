# Extension Approval Flow - Testing Guide

Komplette Anleitung zum Testen des Extension (Auftragserweiterung) Workflows.

## Übersicht

Der Extension Workflow testet die vollständige Journey von der Erstellung einer Auftragserweiterung durch die Werkstatt bis zur Genehmigung/Ablehnung durch den Kunden.

## Test-Suites

### 1. Extension Approval Flow Tests (`07-extension-approval-flow.spec.ts`)

**Typ**: UI Component Tests
**Backend erforderlich**: Nein (mocked)
**Anzahl Tests**: 15
**Laufzeit**: ~2-3 Minuten

**Was wird getestet:**
- ✅ Notification Center UI
- ✅ Extension List Component
- ✅ Extension Approval Modal
- ✅ Status Badges (Pending, Approved, Declined)
- ✅ Navigation Flow
- ✅ Multi-Language Support

**Ausführen:**
```bash
npx playwright test e2e/07-extension-approval-flow.spec.ts
```

### 2. Extension Integration Tests (`08-extension-integration.spec.ts`)

**Typ**: Full Integration Tests
**Backend erforderlich**: JA (Port 3001)
**Anzahl Tests**: 9
**Laufzeit**: ~3-5 Minuten

**Was wird getestet:**
- ✅ Workshop erstellt Extension
- ✅ Backend speichert Extension
- ✅ Customer erhält Notification
- ✅ Customer genehmigt Extension
- ✅ Payment Intent wird erstellt
- ✅ Status Updates in Datenbank
- ✅ UI reflektiert Backend-Änderungen

**Ausführen:**
```bash
npx playwright test e2e/08-extension-integration.spec.ts
```

**⚠️ Wichtig:**
- Backend muss laufen auf Port 3001
- Test-Datenbank mit Seed-Daten erforderlich
- Tests laufen serial (nicht parallel)
- Echte Extensions werden erstellt

## Voraussetzungen

### 1. Frontend Dev Server

```bash
cd frontend
npm run dev
# Läuft auf http://localhost:3000
```

### 2. Backend Dev Server (für Integration Tests)

```bash
cd backend
npm run dev
# Läuft auf http://localhost:3001
```

### 3. Test-Datenbank Setup

```bash
cd backend
npx prisma db push
npm run seed:minimal
```

**Test-Credentials:**
- **Customer**: kunde@kunde.de / kunde
- **Workshop**: werkstatt (username) / werkstatt

## Quick Start

### Alle Extension Tests ausführen

```bash
cd frontend
./RUN-EXTENSION-TESTS.sh
```

Oder direkt:

```bash
# Nur UI Tests (kein Backend erforderlich)
npx playwright test e2e/07-extension-approval-flow.spec.ts

# Nur Integration Tests (Backend erforderlich)
npx playwright test e2e/08-extension-integration.spec.ts

# Alle Extension Tests
npx playwright test e2e/07-extension-approval-flow.spec.ts e2e/08-extension-integration.spec.ts

# Mit Playwright UI (interaktiv)
npx playwright test e2e/07-extension-approval-flow.spec.ts --ui

# Im Browser sichtbar (headed mode)
npx playwright test e2e/08-extension-integration.spec.ts --headed

# Nur einen spezifischen Test
npx playwright test e2e/08-extension-integration.spec.ts -g "workshop creates extension"
```

## Test-Workflow im Detail

### Workshop Flow

1. **Login als Werkstatt**
   - Navigate zu `/de/workshop/login`
   - Username: `werkstatt`
   - Password: `werkstatt`

2. **Extension Modal öffnen**
   - Find booking in dashboard
   - Click "Erweiterung erstellen"
   - Modal erscheint

3. **Extension Details eingeben**
   - Beschreibung: z.B. "Bremsbeläge müssen erneuert werden"
   - Item 1: "Bremsbeläge vorne" - 189.99€
   - Item 2 hinzufügen: "Bremsbeläge hinten" - 169.99€
   - Optional: Fotos hochladen

4. **Extension senden**
   - Click "An Kunden senden"
   - Success toast erscheint
   - Modal schließt
   - Backend erstellt Extension mit Status "PENDING"

### Customer Notification Flow

5. **Customer erhält Notification**
   - Push Notification wird gesendet (Backend)
   - Bell Icon zeigt Badge mit Anzahl ungelesener Notifications
   - Notification erscheint in Notification Center

6. **Customer öffnet Notification**
   - Click auf Bell Icon
   - Notification Popover erscheint
   - Extension Notification sichtbar (orange Icon)
   - Click auf Notification

7. **Navigation zur Booking Detail**
   - Automatische Navigation zu `/de/customer/bookings/{id}?tab=extensions`
   - Extensions Tab ist aktiv
   - Extension List wird geladen

### Customer Approval Flow

8. **Extension Details anzeigen**
   - Extension Card zeigt:
     - Status Badge: "Ausstehend" (gelber Hintergrund)
     - Beschreibung
     - Items-Liste mit Einzelpreisen
     - Fotos (Grid 2x2)
     - Gesamtpreis: 359.98€
   - "Details anzeigen" Button ist sichtbar

9. **Approval Modal öffnen**
   - Click "Details anzeigen"
   - Extension Approval Modal erscheint
   - Zeigt vollständige Details:
     - Beschreibung
     - Alle Items mit Quantity und Preis
     - Foto-Galerie (Click to enlarge)
     - Gesamtpreis prominent
     - Warnung über Payment-Verarbeitung

10. **Extension genehmigen**
    - Click "Genehmigen & Bezahlen"
    - API Call: `POST /api/bookings/{id}/extensions/{extensionId}/approve`
    - Backend:
      - Erstellt Payment Intent (Stripe)
      - Updated Extension Status → "APPROVED"
      - Speichert approvedAt timestamp
    - Frontend:
      - Success Toast: "Erweiterung genehmigt! Zahlung wird verarbeitet..."
      - Modal schließt
      - Extension List refresht

11. **UI Updates nach Approval**
    - Status Badge: "Ausstehend" → "Genehmigt" (grüner Hintergrund)
    - "Details anzeigen" Button verschwindet
    - "Genehmigt am: DD.MM.YYYY HH:MM" wird angezeigt
    - Pending Badge auf Extensions Tab verschwindet

### Alternative: Customer Decline Flow

10. **Extension ablehnen**
    - Click "Ablehnen"
    - Decline Reason Input erscheint (rot highlightet)
    - Optional: Grund eingeben (z.B. "Bitte erst Kostenvoranschlag")
    - Click "Ablehnung bestätigen"
    - API Call: `POST /api/bookings/{id}/extensions/{extensionId}/decline`
    - Backend:
      - Updated Extension Status → "DECLINED"
      - Speichert declinedAt timestamp
      - Speichert decline reason
    - Frontend:
      - Success Toast: "Erweiterung abgelehnt."
      - Modal schließt
      - Extension List refresht

11. **UI Updates nach Decline**
    - Status Badge: "Ausstehend" → "Abgelehnt" (roter Hintergrund)
    - "Details anzeigen" Button verschwindet
    - "Abgelehnt am: DD.MM.YYYY HH:MM" wird angezeigt

## API Endpoints getestet

### Workshop Endpoints
- `POST /api/workshops/orders/{bookingId}/extensions`
  - Body: `{ description, items[], images[], videos[] }`
  - Creates extension with status PENDING

### Customer Endpoints
- `GET /api/bookings/{bookingId}/extensions`
  - Returns all extensions for booking

- `POST /api/bookings/{bookingId}/extensions/{extensionId}/approve`
  - Creates Payment Intent
  - Updates status to APPROVED
  - Returns: `{ extension, paymentIntent }`

- `POST /api/bookings/{bookingId}/extensions/{extensionId}/decline`
  - Body: `{ reason?: string }`
  - Updates status to DECLINED

### Notification Endpoints
- `GET /api/notifications/history?page=1&limit=10`
  - Returns notification list

- `GET /api/notifications/unread-count`
  - Returns unread count for badge

- `PATCH /api/notifications/{id}/read`
  - Marks notification as read

- `PATCH /api/notifications/read-all`
  - Marks all as read

## Erwartete Test-Ergebnisse

### UI Tests (07-extension-approval-flow.spec.ts)

```
✓ should display notification center with bell icon
✓ should show extension in notification center when created
✓ should navigate to full notifications page
✓ workshop can create extension via modal
✓ should show extension list on booking detail page
✓ should display extension approval modal when clicking on pending extension
✓ extension approval modal should show all required information
✓ should show decline reason input when decline button clicked
✓ should navigate to booking detail when clicking extension notification
✓ should update extension status badge after approval
✓ notifications page should show extension notifications with correct icons
✓ should show pending extension count badge on extensions tab
✓ extension list should show correct status badges
✓ should display extension photos in grid layout
✓ should calculate and display correct total price for extension

15 passed (1.5m)
```

### Integration Tests (08-extension-integration.spec.ts)

```
✓ SETUP: create booking for extension tests
✓ workshop creates extension for booking
✓ customer sees extension notification
✓ customer views extension details
✓ customer opens extension approval modal
✓ customer approves extension
⊘ ALTERNATIVE: customer declines extension (skipped)
✓ extension list shows correct information after approval

8 passed, 1 skipped (3.2m)
```

## Debugging

### Test fehlschlägt: "Booking not found"

**Problem**: Keine Test-Bookings in Datenbank

**Lösung**:
```bash
cd backend
npm run seed:minimal
```

### Test fehlschlägt: "Backend not reachable"

**Problem**: Backend läuft nicht auf Port 3001

**Lösung**:
```bash
cd backend
npm run dev
```

Check: `lsof -Pi :3001 -sTCP:LISTEN -t`

### Test fehlschlägt: "Extension already processed"

**Problem**: Test-Daten wurden bereits verwendet

**Lösung**:
```bash
cd backend
npx prisma db push --force-reset
npm run seed:minimal
```

### Screenshots bei Fehlschlag

Playwright erstellt automatisch Screenshots:
```
test-results/
  07-extension-approval-flow-spec/
    customer-approves-extension/
      test-failed-1.png
```

### Playwright UI für Debugging

```bash
npx playwright test e2e/08-extension-integration.spec.ts --ui
```

Features:
- Step-by-step execution
- DOM snapshots
- Network requests
- Console logs
- Pick locators

## Best Practices

### 1. Backend-Status prüfen

Vor Integration Tests:
```bash
curl http://localhost:3001/health
```

### 2. Test-Daten zurücksetzen

Nach jedem Test-Run:
```bash
cd backend
npm run seed:minimal
```

### 3. Selektiv Tests ausführen

Nur fehlgeschlagene Tests:
```bash
npx playwright test --last-failed
```

Nur einen Test:
```bash
npx playwright test -g "customer approves extension"
```

### 4. Headed Mode für Entwicklung

Sehe was passiert:
```bash
npx playwright test e2e/08-extension-integration.spec.ts --headed --workers=1
```

### 5. Debug Mode

Pausiert an Breakpoints:
```bash
npx playwright test e2e/08-extension-integration.spec.ts --debug
```

## CI/CD Integration

### GitHub Actions Workflow

```yaml
name: Extension E2E Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    paths:
      - 'frontend/components/customer/**'
      - 'frontend/e2e/07-extension-*'
      - 'frontend/e2e/08-extension-*'
      - 'backend/src/services/bookings.service.ts'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: |
          cd frontend && npm ci
          cd ../backend && npm ci

      - name: Setup Database
        run: |
          cd backend
          npx prisma db push
          npm run seed:minimal

      - name: Start Backend
        run: cd backend && npm run dev &

      - name: Start Frontend
        run: cd frontend && npm run dev &

      - name: Wait for servers
        run: |
          npx wait-on http://localhost:3000
          npx wait-on http://localhost:3001

      - name: Install Playwright
        run: cd frontend && npx playwright install --with-deps

      - name: Run Extension Tests
        run: |
          cd frontend
          npx playwright test e2e/07-extension-approval-flow.spec.ts e2e/08-extension-integration.spec.ts

      - name: Upload Test Results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: frontend/playwright-report/
```

## Troubleshooting

### Common Issues

| Problem | Ursache | Lösung |
|---------|---------|--------|
| `ECONNREFUSED` | Backend läuft nicht | `cd backend && npm run dev` |
| `Timeout waiting for element` | Selektoren veraltet | Update selectors in test |
| `Extension already approved` | Test-Daten wiederverwendet | `npm run seed:minimal` |
| `Payment Intent failed` | Stripe nicht konfiguriert | Check `.env` für Stripe keys |
| `Notification not found` | Push Service offline | Check backend logs |

## Performance

### Test-Optimierung

**Parallel vs Serial:**
- UI Tests: Parallel OK
- Integration Tests: Serial (vermeidet Data Races)

```typescript
// In test file
test.describe.configure({ mode: 'serial' });
```

**Timeouts erhöhen:**
```typescript
test.setTimeout(60000); // 60 seconds
```

**Selective Test Execution:**
```bash
# Nur smoke tests
npx playwright test e2e/00-quick-smoke-test.spec.ts

# Dann extension tests
npx playwright test e2e/07-extension-approval-flow.spec.ts
```

## Reporting

### HTML Report

```bash
npx playwright show-report
```

Öffnet: `http://localhost:9323`

### CI/CD Reports

Playwright Reporter Optionen:
- HTML Reporter (default)
- JUnit Reporter (für CI)
- JSON Reporter (für custom processing)

```typescript
// playwright.config.ts
reporter: [
  ['html'],
  ['junit', { outputFile: 'results.xml' }],
  ['json', { outputFile: 'results.json' }]
]
```

## Nächste Schritte

- [ ] Payment Flow vollständig integrieren (Stripe Test Mode)
- [ ] Extension PDF-Upload testen
- [ ] Extension Video-Upload testen
- [ ] Mobile Extension Flow testen (Responsive)
- [ ] Performance Tests für Extension List (100+ Extensions)
- [ ] Accessibility Tests (a11y) für Extension Components
- [ ] Visual Regression Tests für Extension UI

## Support

Bei Fragen oder Problemen:
1. Check Playwright Logs: `npx playwright show-trace`
2. Check Backend Logs: `cd backend && npm run dev`
3. Check GitHub Issues für bekannte Probleme
4. Create neue Issue mit:
   - Test-Name
   - Error-Message
   - Screenshot
   - Browser/Version
