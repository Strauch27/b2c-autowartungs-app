# E2E Flow Dokumentation - B2C Autowartungs-App

## 1. Gewünschter E2E Flow (Soll-Zustand)

### Customer Booking Flow (authentifiziert)

```
Landing Page (/de)
  → Login (/de/customer/login)
  → Dashboard (/de/customer/dashboard)
  → Fahrzeug wählen (/de/customer/booking)              [Step 1: Marke, Modell, Jahr, KM]
  → Service wählen (/de/customer/booking/service)        [Step 2: Inspektion, Ölwechsel, etc.]
  → Termin & Abholung (/de/customer/booking/appointment) [Step 3: Datum, Uhrzeit, Adresse]
  → Zahlung (/de/customer/booking/payment)               [Step 4: Stripe/Demo]
  → Bestätigung (/de/customer/booking/confirmation)      [Step 5: Buchungs-ID]
```

### Guest Booking Flow (ohne Login)

```
Landing Page (/de)
  → "Jetzt buchen" Button
  → Multi-Step Wizard (/de/booking)
    Step 1: Fahrzeug (VehicleStep)
    Step 2: Service (ServiceStep)
    Step 3: Termin & Abholung (PickupStep)
    Step 4: Registrierung & Zahlung (PaymentStep)
    Step 5: Bestätigung (ConfirmationStep)
```

### Jockey Flow

```
Login (/de/jockey/login)
  → Dashboard (/de/jockey/dashboard)
  → Buchung annehmen → Fahrzeug abholen
  → Handover: Fotos → Checkliste → Signatur → Notizen
  → Zur Werkstatt bringen
  → [Nach Fertigstellung] Fahrzeug zurückbringen
```

### Workshop Flow

```
Login (/de/workshop/login)
  → Dashboard (/de/workshop/dashboard)
  → Eingehende Aufträge → Annehmen → Bearbeiten
  → Optional: Extension erstellen (Zusatzarbeiten)
  → Fertig melden → Rückgabe-Jockey zuweisen
```

### Booking Lifecycle (FSM Statusübergänge)

```
PENDING → CONFIRMED → JOCKEY_ASSIGNED → PICKED_UP → AT_WORKSHOP
  → IN_PROGRESS → [EXTENSION_REQUESTED → EXTENSION_APPROVED]
  → COMPLETED → RETURN_ASSIGNED → RETURNING → DELIVERED → DONE
```

---

## 2. Routing-Probleme (behoben)

### 2.1 Fehlende `/customer/`-Prefix in Routes

| Datei | Fehlerhafter Pfad | Korrekter Pfad |
|-------|--------------------|----------------|
| `customer/booking/service/page.tsx` | `/{locale}/booking/vehicle` | `/{locale}/customer/booking` |
| `customer/booking/service/page.tsx` | `/{locale}/booking/appointment` | `/{locale}/customer/booking/appointment` |

**Ursache**: Die Service-Seite nutzte Pfade aus dem Guest-Flow statt dem Customer-Flow.

### 2.2 Hardcoded Links ohne Locale

| Datei | Fehlerhafter Link | Korrektur |
|-------|-------------------|-----------|
| `customer/booking/page.tsx` | `href="/datenschutz"` | `href={/${locale}/privacy}` |
| `customer/register/page.tsx` | `href="/datenschutz"` | `href={/${locale}/privacy}` |

**Ursache**: Statische deutsche Pfade statt dynamischer locale-basierter Links.

### 2.3 Fehlende Seiten (404)

| Route | Status | Lösung |
|-------|--------|--------|
| `/{locale}/customer/booking/appointment` | Fehlte komplett | Neue Seite erstellt |
| `/{locale}/privacy` | Fehlte | Placeholder erstellt |
| `/{locale}/terms` | Fehlte | Placeholder erstellt |
| `/{locale}/imprint` | Fehlte | Placeholder erstellt |
| `/{locale}/forgot-password` | Fehlte | Formular erstellt |
| `/{locale}/support` | Fehlte | Kontaktseite erstellt |
| `/{locale}/customer/profile` | Fehlte | Placeholder erstellt |
| `/{locale}/customer/vehicles` | Fehlte | Placeholder erstellt |

---

## 3. 404-Problem im Detail

### Symptom
Beim Klick auf "Inspektion auswählen" in `/en/customer/booking/service` → 404 auf `/en/booking/appointment`.

### Root Cause
`customer/booking/service/page.tsx` Zeile 77 navigierte zu:
```typescript
router.push(`/${locale}/booking/appointment?${params.toString()}`);
```
statt:
```typescript
router.push(`/${locale}/customer/booking/appointment?${params.toString()}`);
```

### Fix
1. Route korrigiert: `/${locale}/customer/booking/appointment`
2. Neue Seite `customer/booking/appointment/page.tsx` erstellt mit:
   - URL-Parameter Parsing (brand, model, year, mileage, serviceType)
   - PickupStep-Komponente für Termin-/Adresseingabe
   - Booking-Erstellung via `bookingsApi.create()`
   - Weiterleitung zu Payment nach Erstellung

---

## 4. E2E Test Suite - Übersicht

### Nummerierte Tests (sequenziell aufgebaut)

| # | Datei | Beschreibung |
|---|-------|-------------|
| 00 | `quick-smoke-test` | App lädt, Homepage rendert |
| 00 | `demo-smoke-test` | Kompletter Booking-Flow im Demo-Modus |
| 01 | `landing-page` | DE/EN Content, Sprachwechsel |
| 01 | `complete-booking-journey` | Voller Lifecycle: Registrierung → Booking → Payment → Jockey → Workshop → Return |
| 02 | `booking-flow` | Fahrzeugauswahl → Service → Termin |
| 03 | `customer-portal` | Login, Validierung, Dashboard |
| 04 | `jockey-portal` | Jockey-Login, Dashboard |
| 05 | `workshop-portal` | Workshop-Login, Dashboard |
| 06 | `multi-language` | DE/EN, Sprachpersistenz |
| 07 | `extension-approval-flow` | Notification Center, Extension-Workflow |
| 08 | `extension-integration` | Extension-Erstellung & Workflow |
| 09 | `complete-e2e-journey` | Voller Lifecycle ohne Auth |
| 10 | `complete-e2e-with-auth` | Voller Lifecycle mit Auth-Fixture |
| 11 | `jockey-handover-flow` | Handover: Fotos, Signatur, Checkliste |
| 12 | `extension-flow` | Extension: Erstellen → Notification → Genehmigung → Payment |
| 13 | `return-journey` | Workshop-Fertig → Return-Zuweisung → Lieferung |

### Zusätzliche Tests

| Datei | Beschreibung |
|-------|-------------|
| `master-journey` | Kompletter Lifecycle über alle 3 Portale (API + UI) |
| `auth-flows` | Login/Logout für alle 3 Rollen |
| `portal-smoke-tests` | Dashboard-Laden für alle Portale |
| `en-locale-flow` | Englischer Locale Flow |
| `booking-i18n-tests` | Buchung mit i18n |
| `ui-booking-flow` | UI Booking Flow |
| `customer-journey` | Customer Booking Journey |

### npm Scripts

```bash
# Backend Tests
cd "99 Code/backend"
npm run test:unit      # Unit Tests (FSM, Auth, Validation)
npm run test:api       # API Tests (supertest)
npm run test:all       # Alle Backend Tests

# Frontend E2E Tests
cd "99 Code/frontend"
npm run test:e2e:journey    # Master Journey
npm run test:e2e:smoke      # Portal Smoke Tests
npm run test:e2e:auth       # Auth Flows
npm run test:e2e:portals    # Portal Tests
```

### Test-Credentials

| Rolle | E-Mail | Passwort |
|-------|--------|----------|
| Customer | customer@test.com | Test123! |
| Jockey | jockey@test.com | Test123! |
| Workshop | workshop@test.com | Test123! |

### Manuelle Test-URLs

| Seite | URL |
|-------|-----|
| Landing (DE) | http://localhost:3000/de |
| Landing (EN) | http://localhost:3000/en |
| Customer Login | http://localhost:3000/de/customer/login |
| Customer Dashboard | http://localhost:3000/de/customer/dashboard |
| Buchung starten | http://localhost:3000/de/customer/booking |
| Guest Booking | http://localhost:3000/de/booking |
| Jockey Login | http://localhost:3000/de/jockey/login |
| Workshop Login | http://localhost:3000/de/workshop/login |

---

## 5. Aktuelle Fahrzeugauswahl

Zentrale Datenquelle: `frontend/lib/constants/vehicles.ts`

- **21 Marken** mit echten Modellen für den deutschen Markt
- **Top-8 Marken mit Logos**: Audi, BMW, Ford, Mercedes-Benz, Opel, Porsche, Toyota, VW
- **Genutzt von**: VehicleStep (Guest), VehicleSelectionForm (Customer), API-Fallback
- **Dynamische Modellauswahl**: Modelle filtern nach gewählter Marke
