# E2E Test Runner - Anleitung

Automatisches Script zum Starten von Backend, Frontend und Ausführen der E2E-Tests.

## 🚀 Quick Start

```bash
cd "/Users/stenrauch/Documents/B2C App v2/99 Code"

# Standard-Modus (alle Tests, headless)
./run-e2e-tests.sh
```

## 📋 Verfügbare Modi

### 1. Standard-Modus (Headless)
```bash
./run-e2e-tests.sh
```
- Führt alle 168 Tests aus
- Browser im Hintergrund
- Schnellste Ausführung
- Ideal für CI/CD

### 2. UI-Modus (Empfohlen für erste Tests!)
```bash
./run-e2e-tests.sh ui
```
- Öffnet Playwright Test UI
- Interaktive Test-Auswahl
- Live-View der Tests
- Debugging-Tools
- **Perfekt für erste Durchsicht!**

### 3. Headed-Modus (Browser sichtbar)
```bash
./run-e2e-tests.sh headed
```
- Browser ist sichtbar
- Alle Tests werden ausgeführt
- Langsamer, aber gut zum Zuschauen

### 4. Debug-Modus
```bash
./run-e2e-tests.sh debug
```
- Step-by-step Debugging
- Playwright Inspector öffnet sich
- Für einzelne Test-Probleme

### 5. Quick-Modus (Smoke Tests)
```bash
./run-e2e-tests.sh quick
```
- Nur schnelle Smoke Tests
- ~2-3 Minuten
- Prüft ob grundlegende Funktionen laufen

### 6. Demo-Modus (Kompletter E2E Journey)
```bash
./run-e2e-tests.sh demo
```
- Nur der komplette E2E Journey Test
- Browser sichtbar
- Zeigt den gesamten Flow:
  - Customer bucht Service
  - Jockey holt ab
  - Workshop erstellt Extension
  - Customer genehmigt
  - Auto-Capture
  - Jockey liefert zurück
- **Perfekt für Stakeholder-Demos!**

### 7. Auth-Tests
```bash
./run-e2e-tests.sh auth
```
- Nur Authentication Tests
- Alle Login-Flows

## 🎯 Was macht das Script?

### 1. Vorbereitung (10-30 Sek)
```
✓ Prüft ob Backend & Frontend Verzeichnisse existieren
✓ Prüft ob node_modules installiert sind
✓ Installiert Dependencies falls nötig
✓ Prüft .env Dateien
```

### 2. Backend starten (5-10 Sek)
```
✓ Startet Backend auf Port 5001
✓ Wartet auf Health-Check
✓ Verifiziert dass Backend antwortet
```

### 3. Frontend starten (10-20 Sek)
```
✓ Startet Frontend auf Port 3000
✓ Wartet bis Next.js bereit ist
✓ Verifiziert dass Frontend lädt
```

### 4. Tests ausführen (2-20 Min, je nach Modus)
```
✓ Führt Playwright Tests aus
✓ Erstellt Screenshots bei Fehlern
✓ Generiert Test-Report
```

### 5. Cleanup
```
✓ Stoppt Backend automatisch
✓ Stoppt Frontend automatisch
✓ Räumt Ports auf (5001, 3000)
```

## 📊 Test-Übersicht

Nach dem Test-Lauf:

```bash
# Test-Report anzeigen
cd frontend
npm run test:e2e:report
```

Der Report zeigt:
- ✅ Anzahl bestandener Tests
- ❌ Anzahl fehlgeschlagener Tests
- ⏱️ Ausführungszeit
- 📸 Screenshots bei Fehlern
- 🎥 Videos bei Fehlern (wenn aktiviert)

## 🐛 Troubleshooting

### Problem: "Backend failed to start"

**Lösung 1:** .env Datei prüfen
```bash
cd backend
cat .env
# Sollte enthalten:
# DATABASE_URL, STRIPE_SECRET_KEY, etc.
```

**Lösung 2:** Port 5001 belegt
```bash
# Port freigeben
lsof -ti:5001 | xargs kill -9
```

**Lösung 3:** Backend Logs prüfen
```bash
tail -50 /tmp/backend.log
```

### Problem: "Frontend failed to start"

**Lösung 1:** Port 3000 belegt
```bash
# Port freigeben
lsof -ti:3000 | xargs kill -9
```

**Lösung 2:** Frontend Logs prüfen
```bash
tail -50 /tmp/frontend.log
```

**Lösung 3:** Node Modules neu installieren
```bash
cd frontend
rm -rf node_modules
npm install
```

### Problem: "Tests fail with timeout"

**Ursache:** Services nicht bereit

**Lösung:**
```bash
# Backend Health Check
curl http://localhost:5001/health

# Frontend Check
curl http://localhost:3000

# Wenn nicht erreichbar: Logs prüfen
```

### Problem: "Database connection error"

**Lösung:**
```bash
# PostgreSQL starten
brew services start postgresql@14

# Oder Docker
docker-compose up -d postgres

# Datenbank prüfen
cd backend
npx prisma db push
```

## 🎬 Empfohlener Workflow

### Erste Durchsicht (UI-Modus)
```bash
./run-e2e-tests.sh ui
```
- Sieh dir alle Tests an
- Wähle interessante Tests aus
- Debugging bei Problemen
- **Zeit:** ~30 Min interaktiv

### Quick Check (Smoke Tests)
```bash
./run-e2e-tests.sh quick
```
- Schneller Check ob alles läuft
- **Zeit:** ~2-3 Min

### Vollständiger Test-Lauf
```bash
./run-e2e-tests.sh
```
- Alle 168 Tests
- Headless (schnell)
- **Zeit:** ~15-20 Min

### Demo für Stakeholder
```bash
./run-e2e-tests.sh demo
```
- Zeigt kompletten E2E Flow
- Browser sichtbar
- **Zeit:** ~5 Min

## 📁 Output-Dateien

Nach dem Test-Lauf findest du:

```
frontend/
├── playwright-report/           ← HTML Test Report
│   └── index.html              (npm run test:e2e:report)
├── test-results/               ← Screenshots & Videos
│   ├── screenshots/
│   └── videos/
└── /tmp/
    ├── backend.log             ← Backend Logs
    └── frontend.log            ← Frontend Logs
```

## 🔧 Erweiterte Optionen

### Nur bestimmte Test-Datei
```bash
cd frontend
npx playwright test e2e/auth.spec.ts
```

### Mit Video-Recording
```bash
cd frontend
npx playwright test --video=on
```

### Nur Chrome (kein Firefox/Safari)
```bash
cd frontend
npx playwright test --project=chromium-desktop
```

### Parallele Ausführung (schneller)
```bash
cd frontend
npx playwright test --workers=4
```

### Einzelnen Test ausführen
```bash
cd frontend
npx playwright test -g "should login as customer"
```

## 📊 Test-Statistiken

**Gesamt: 168 Tests**

| Suite | Tests | Durchschnitt |
|-------|-------|--------------|
| Authentication | 25 | ~30 Sek |
| Booking Flow | 31 | ~2 Min |
| Workshop Dashboard | 26 | ~1 Min |
| i18n | 36 | ~45 Sek |
| Components | 29 | ~1 Min |
| Visual Regression | 21 | ~3 Min |

**Gesamtdauer (headless):** ~15-20 Minuten
**Gesamtdauer (headed):** ~25-30 Minuten

## 🎯 Best Practices

1. **Vor jedem Commit:** Quick Tests
   ```bash
   ./run-e2e-tests.sh quick
   ```

2. **Vor jedem PR:** Vollständiger Test
   ```bash
   ./run-e2e-tests.sh
   ```

3. **Nach größeren Changes:** UI-Modus
   ```bash
   ./run-e2e-tests.sh ui
   ```

4. **Für Demos:** Demo-Modus
   ```bash
   ./run-e2e-tests.sh demo
   ```

## 🚨 Wichtige Hinweise

### Test-Daten
- Tests verwenden Test-Accounts (siehe DEMO_ANLEITUNG.md)
- Tests sollten idempotent sein (mehrfach ausführbar)
- Datenbank wird nicht automatisch zurückgesetzt

### Cleanup
- Script räumt automatisch auf
- Bei Abbruch (Ctrl+C): Cleanup läuft trotzdem
- Ports werden freigegeben

### Performance
- Erste Ausführung: ~25 Min (inkl. Downloads)
- Folge-Ausführungen: ~15 Min
- Quick Mode: ~2-3 Min

## 📞 Support

Bei Problemen:

1. Logs prüfen:
   ```bash
   tail -50 /tmp/backend.log
   tail -50 /tmp/frontend.log
   ```

2. Test-Report anschauen:
   ```bash
   cd frontend
   npm run test:e2e:report
   ```

3. Tests einzeln debuggen:
   ```bash
   ./run-e2e-tests.sh debug
   ```

---

**Viel Erfolg beim Testen! 🚀**
