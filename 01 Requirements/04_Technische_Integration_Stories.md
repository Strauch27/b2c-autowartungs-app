# Technische Integration Stories - B2C Autowartungs-App

**Version:** 1.0
**Datum:** 2026-02-01
**Zielgruppe:** Development Team, Tech Lead, PO

---

## Inhaltsverzeichnis

1. [Payment-Integration (Stripe)](#payment-integration-stripe)
2. [Odoo-Integration (Buchhaltung)](#odoo-integration-buchhaltung)
3. [Slot-Management-System](#slot-management-system)
4. [Jockey-Assignment & Driver-App](#jockey-assignment--driver-app)
5. [Werkstatt-System-Integration](#werkstatt-system-integration)
6. [Technische Architektur](#technische-architektur)

---

## Payment-Integration (Stripe)

### TECH-001: Stripe Payment Setup

**Als** System
**möchte ich** Zahlungen über Stripe abwickeln
**damit** Kunden sicher und einfach online bezahlen können

**Akzeptanzkriterien:**

**Given** ein Kunde schließt die Buchung ab
**When** er zur Zahlung kommt
**Then** werden folgende Payment-Methoden angeboten:
- Kreditkarte (Visa, Mastercard, Amex)
- PayPal
- Google Pay
- Apple Pay
- SEPA-Lastschrift (optional, Later)

**Given** der Kunde zahlt mit Kreditkarte
**When** die Zahlung erfolgreich ist
**Then** wird:
- Stripe Payment Intent erstellt
- Zahlung sofort bestätigt
- Rechnung generiert (PDF)
- Odoo benachrichtigt (Webhook)

**Given** die Zahlung fehlschlägt
**When** Karte abgelehnt wird
**Then** erhält der Kunde:
- Fehlermeldung (z.B. "Karte wurde abgelehnt")
- Möglichkeit, andere Zahlungsmethode zu wählen
- Buchung bleibt 30 Min reserviert

**Technische Requirements:**

- **Stripe Account:** Production + Test Environment
- **API Version:** Stripe API v2024 (neueste stable)
- **Compliance:** PCI-DSS Level 1 (Stripe hosted Checkout)
- **3D Secure:** SCA (Strong Customer Authentication) aktiviert
- **Webhook Endpoints:**
  - `payment_intent.succeeded`
  - `payment_intent.payment_failed`
  - `charge.refunded`

**Sicherheit:**

- Keine Kartendaten auf eigenem Server speichern (Stripe Checkout)
- API Keys als Environment Variables (nicht im Code)
- Webhook Signature Verification (verhindert Fake-Webhooks)

**Testing:**

- Stripe Test Mode mit Test Cards
- Error Scenarios (abgelehnte Karten, Network Timeout)
- Refund-Flow testen

**Story Points:** 8

---

### TECH-002: Stripe Subscription für Auftragserweiterung

**Als** System
**möchte ich** zusätzliche Zahlungen bei Auftragserweiterungen abwickeln
**damit** Kunden digital nachzahlen können

**Akzeptanzkriterien:**

**Given** die Werkstatt erstellt ein Angebot
**When** der Kunde dieses freigibt
**Then** wird:
- Stripe Payment Intent für Nachzahlung erstellt
- Karte des Kunden belastet (gespeichert aus erster Zahlung)
- Rechnung generiert
- Odoo aktualisiert

**Given** die Nachzahlung fehlschlägt
**When** Kreditkarte abgelehnt wird
**Then** wird:
- Kunde per E-Mail/Push benachrichtigt
- Werkstatt informiert (Arbeit NICHT durchführen)
- Kunde kann Zahlungsmethode aktualisieren

**Technische Requirements:**

- **Stripe Customer Object:** Kunde anlegen bei erster Zahlung
- **Payment Methods:** Karte speichern für Wiederbuchung (mit Consent)
- **Setup Intents:** Für spätere Zahlungen ohne erneute Eingabe
- **Idempotency Keys:** Verhindert Doppelzahlungen bei Retry

**DSGVO-Compliance:**

- Kunde muss Kartenspeicherung zustimmen
- "Karte für zukünftige Buchungen speichern?" (Checkbox)
- Karte löschen bei Account-Löschung

**Story Points:** 5

---

### TECH-003: Refund-Management

**Als** System
**möchte ich** Stornierungen und Rückerstattungen abwickeln
**damit** Kunden ihr Geld zurückbekommen können

**Akzeptanzkriterien:**

**Given** ein Kunde storniert 24h vor Termin
**When** die Stornierung bestätigt wird
**Then** wird:
- Stripe Refund ausgelöst (100%)
- Kunde erhält Bestätigung per E-Mail
- Slot wird wieder freigegeben
- Odoo wird aktualisiert (Storno-Rechnung)

**Given** ein Kunde storniert < 24h vor Termin
**When** die Stornierung erfolgt
**Then** wird:
- Teilrückerstattung (z.B. 50%) oder keine Rückerstattung
- Kunde erhält Info über Storno-Bedingungen

**Given** die Werkstatt kann Service nicht durchführen (No-Capacity)
**When** wir stornieren müssen
**Then** wird:
- Volle Rückerstattung (100%)
- Kunde erhält Entschuldigung + Gutschein (z.B. 10% auf nächste Buchung)

**Technische Requirements:**

- Stripe Refund API
- Partial Refunds (für Storno-Gebühren)
- Refund Tracking in Odoo
- E-Mail-Benachrichtigung bei Refund

**Story Points:** 5

---

## Odoo-Integration (Buchhaltung)

### TECH-004: Odoo Real-Time Sync für Buchungen

**Als** Finance-Team
**möchte ich** alle Buchungen automatisch in Odoo sehen
**damit** Buchhaltung und Reporting funktionieren

**Akzeptanzkriterien:**

**Given** ein Kunde hat erfolgreich gebucht und bezahlt
**When** die Zahlung bestätigt ist
**Then** wird in Odoo angelegt:
- **Kunde:** Name, E-Mail, Telefon, Adresse
- **Rechnung:** Rechnungsnummer, Betrag, Steuern, Zahlungsstatus
- **Zahlungseingang:** Stripe Payment ID, Betrag, Datum
- **Auftrag:** Service-Typ, Fahrzeugdaten, Termin, Werkstatt

**Given** eine Auftragserweiterung wurde freigegeben
**When** die Nachzahlung erfolgt ist
**Then** wird in Odoo:
- Bestehender Auftrag aktualisiert
- Zusatzrechnung erstellt (oder Ergänzung zur Hauptrechnung)
- Revenue korrekt zugeordnet (Ölservice vs. Bremse vs. sonstige)

**Technische Requirements:**

- **Odoo API:** REST API oder XML-RPC
- **Authentication:** API Key oder OAuth2
- **Endpoints:**
  - `res.partner` (Kundenstammdaten)
  - `account.move` (Rechnungen)
  - `sale.order` (Aufträge)
  - `account.payment` (Zahlungseingänge)
- **Sync-Frequenz:** Real-Time (Event-driven via Webhook)
- **Error Handling:** Retry-Logik bei Odoo-Ausfall (Queue-System)

**Datenmodell:**

```json
{
  "customer": {
    "odoo_id": 12345,
    "name": "Max Mustermann",
    "email": "max@example.com",
    "phone": "+49170123456",
    "address": {
      "street": "Musterstr. 1",
      "zip": "58452",
      "city": "Witten"
    }
  },
  "order": {
    "odoo_id": 67890,
    "service_type": "Inspektion/Wartung",
    "vehicle": {
      "brand": "VW",
      "model": "Golf",
      "year": 2015,
      "mileage": 85000
    },
    "price": 219.00,
    "tax": 41.61,
    "total": 260.61,
    "status": "paid",
    "appointment": "2026-02-15T10:00:00Z",
    "workshop": "Witten"
  },

HINWEIS: Fahrzeugklasse "Kompakt" entfernt. Nur noch Marke/Modell/Baujahr/Kilometerstand.
  "invoice": {
    "odoo_id": 11111,
    "number": "RE-2026-0001",
    "date": "2026-02-01",
    "amount": 236.81,
    "status": "paid"
  },
  "payment": {
    "stripe_id": "pi_abc123",
    "method": "card",
    "amount": 236.81,
    "date": "2026-02-01T14:30:00Z"
  }
}
```

**Story Points:** 13

---

### TECH-005: Odoo Revenue Tracking & Reporting

**Als** Business-Team
**möchte ich** Revenue nach Service-Typ tracken
**damit** ich KPIs und Profitabilität analysieren kann

**Akzeptanzkriterien:**

**Given** Buchungen sind in Odoo
**When** ich ein Report erstelle
**Then** kann ich filtern nach:
- Service-Typ (Ölservice, TÜV, Bremse, etc.)
- Zeitraum (Tag, Woche, Monat)
- Werkstatt (später: Witten, Dortmund, etc.)
- Kunde (Neu vs. Bestandskunde)

**Given** ich will Profitabilität analysieren
**When** ich den Bericht öffne
**Then** sehe ich:
- Umsatz pro Service
- Kosten (Werkstatt-Vergütung, Teile, Jockey)
- Marge (absolut + %)

**Technische Requirements:**

- Odoo Analytics / BI Module
- Kostenstellen-Zuordnung (B2C vs. B2B)
- Dashboard für PO/Management

**Story Points:** 8

---

## Slot-Management-System

### TECH-006: Verfügbarkeit & Kapazitätsplanung Witten

**Als** System
**möchte ich** verfügbare Zeitslots verwalten
**damit** keine Doppelbuchungen entstehen

**Akzeptanzkriterien:**

**Given** ein Admin konfiguriert Witten-Kapazität
**When** er die Einstellungen öffnet
**Then** kann er definieren:
- **Öffnungszeiten:** Mo-Fr 8-18 Uhr, Sa 8-14 Uhr
- **Slots:** 2h-Fenster (8-10, 10-12, 14-16, 16-18)
- **Max. Buchungen pro Slot:** z.B. 4 (basierend auf Werkstatt-Kapazität)
- **Geschlossene Tage:** Feiertage, Urlaub
- **Service-Dauer:** Ölservice = 2h, TÜV = 1h, Bremse = 3h

**Given** ein Kunde wählt einen Termin
**When** er den Kalender öffnet
**Then** sieht er:
- Verfügbare Slots (grün)
- Teilweise verfügbar (gelb, z.B. "Nur noch 1 Platz frei")
- Ausgebucht (grau, nicht klickbar)

**Given** ein Slot ist voll (4/4 Buchungen)
**When** ein Kunde versucht zu buchen
**Then** ist der Button deaktiviert mit Hinweis "Ausgebucht - bitte anderen Termin wählen"

**Technische Requirements:**

- **Datenmodell:**
  ```javascript
  Slot {
    date: Date,
    time: "08:00-10:00",
    max_capacity: 4,
    current_bookings: 2,
    available: true,
    workshop_id: "witten"
  }
  ```
- **Real-Time Updates:** WebSockets oder Polling (alle 30 Sek)
- **Concurrency Handling:** Pessimistic Locking (Slot reservieren bei Checkout)
- **Buffer-Time:** 15 Min zwischen Jockey-Fahrten

**MVP-Simplifikation:**

- Nur 1 Werkstatt (Witten) → kein komplexes Routing
- Manuelle Kapazitätseingabe (später: AI-basierte Optimierung)
- Feste Slot-Zeiten (später: dynamische Slots nach Demand)

**Story Points:** 8

---

### TECH-007: No-Show & Slot-Freigabe

**Als** System
**möchte ich** No-Shows erkennen und Slots wieder freigeben
**damit** Kapazität optimal genutzt wird

**Akzeptanzkriterien:**

**Given** ein Kunde erscheint nicht zur Abholung
**When** Jockey ihn nicht erreicht (3 Anrufversuche)
**Then** wird:
- Buchung als "No-Show" markiert
- Slot nach 30 Min wieder freigegeben
- Kunde erhält E-Mail: "Termin verpasst - bitte neu buchen"
- KEIN Refund (AGB: No-Show = Zahlung verfällt)

**Geschäftsregeln:**

- Vorkasse minimiert No-Show-Risiko
- Reminder 24h + 2h vor Termin (reduziert No-Shows um ~30%)

**Story Points:** 5

---

## Jockey-Assignment & Driver-App

### TECH-008: Jockey-Zuweisung (manuell im MVP)

**Als** Dispatcher (Witten-Team)
**möchte ich** Jockeys manuell zu Buchungen zuweisen
**damit** Abholungen koordiniert werden

**Akzeptanzkriterien:**

**Given** eine Buchung ist bestätigt
**When** ich die Buchungsliste öffne
**Then** sehe ich:
- Kundendaten (Name, Adresse, Telefon)
- Service-Typ
- Abhol-Zeitfenster
- Dropdown: "Jockey zuweisen" (Liste verfügbarer Fahrer)

**Given** ich weise einen Jockey zu
**When** ich auf "Zuweisen" klicke
**Then** wird:
- Jockey per Push in Driver-App benachrichtigt
- Kunde erhält E-Mail: "Ihr Fahrer ist eingeteilt"

**MVP-Simplifikation:**

- Kein automatisches Routing (kommt Sprint 6+)
- Witten-Team kennt Jockeys persönlich → manuelle Zuweisung reicht
- Später: AI-basiertes Assignment nach Verfügbarkeit, Standort, Auslastung

**Story Points:** 3

---

### TECH-009: Driver-App Integration (bestehende App nutzen)

**Als** Jockey
**möchte ich** meine Touren in der Driver-App sehen
**damit** ich Abholungen durchführen kann

**Akzeptanzkriterien:**

**Given** mir wurde eine Buchung zugewiesen
**When** ich die Driver-App öffne
**Then** sehe ich:
- Kundendaten (Name, Telefon, Adresse)
- Service-Typ
- Zeitfenster
- Navigation zur Abholadresse
- Checkliste: Fahrzeugübergabe, Foto-Dokumentation

**Given** ich komme beim Kunden an
**When** ich die Übergabe durchführe
**Then** kann ich:
- Fotos machen (Fahrzeugzustand)
- Unterschrift einholen (digital)
- Zusätzliche Anmerkungen erfassen (z.B. "Kunde wünscht Wischblatt-Check")
- Status auf "Abgeholt" setzen

**Technische Requirements:**

- Bestehende Ronja Driver-App erweitern
- API-Endpoint für B2C-Buchungen
- GPS-Tracking (optional im MVP, später für Live-Tracking)

**Story Points:** 5

---

## Werkstatt-System-Integration

### TECH-010: Werkstatt-Anbindung für Auftragserweiterung

**Als** Werkstatt-Mitarbeiter
**möchte ich** digitale Angebote an Kunden senden
**damit** ich Zusatzarbeiten transparent anbieten kann

**Akzeptanzkriterien:**

**Given** ich habe das Fahrzeug in der Werkstatt
**When** ich zusätzliche Mängel feststelle
**Then** kann ich im Werkstatt-System:
- Mangelbeschreibung eingeben
- Fotos hochladen (direkt vom Smartphone)
- Festpreis kalkulieren (aus Teilekatalog)
- Angebot an Kunde senden

**Given** der Kunde gibt Angebot frei
**When** ich die Benachrichtigung erhalte
**Then** sehe ich:
- "Freigegeben" (grün)
- Zahlung bestätigt
- Kann mit Arbeit beginnen

**Technische Requirements:**

- **Integration:** Ähnlich wie Ronja B2B (bestehendes System)
- **Werkstatt-System Witten:** Welches System nutzen sie aktuell? (GMS, DMS, etc.)
- **API oder Webinterface:** Muss geklärt werden
- **Foto-Upload:** Mobile-optimiert (Werkstatt-Tablet oder Smartphone)

**Offene Fragen:**

- Welches Werkstatt-System nutzt Witten? (GMS, FAS, anderes?)
- Haben sie bereits digitale Prozesse? (Foto-Dokumentation?)
- Brauchen wir eigenes Interface oder Integration in bestehendes System?

**Story Points:** 8

---

### TECH-011: Werkstatt-Portal (vereinfachtes Interface)

**Als** Werkstatt-Mitarbeiter ohne Tech-Affinität
**möchte ich** ein einfaches Interface für B2C-Aufträge
**damit** ich ohne Schulung arbeiten kann

**Akzeptanzkriterien:**

**Given** ich logge mich ins Werkstatt-Portal ein
**When** ich die Auftragsübersicht öffne
**Then** sehe ich:
- Heutige Aufträge (Liste)
- Kundendaten (Name, Fahrzeug, Service)
- Status (Annahme ausstehend, In Arbeit, Fertig)
- Button: "Angebot erstellen"

**Given** ich erstelle ein Angebot
**When** ich auf "Angebot erstellen" klicke
**Then** öffnet sich ein Formular:
- Dropdown: Art der Arbeit (Bremse, Luftfilter, etc.)
- Eingabefeld: Beschreibung
- Foto hochladen (Drag & Drop oder Mobile-Upload)
- Preiskalkulation (automatisch aus Teilekatalog oder manuell)
- Button: "An Kunde senden"

**UX-Anforderungen:**

- Tablet-optimiert (Werkstatt hat Tablets)
- Große Buttons (Touchscreen-freundlich)
- Deutsch (keine Englischen Fachbegriffe)
- Offline-Fähigkeit (optional, Later)

**Story Points:** 8

---

## Technische Architektur

### TECH-012: System-Architektur & Tech-Stack

**DEPLOYMENT-STRATEGIE: ZWEI-PHASEN-ANSATZ**

**Phase 1: MVP - 100% Lokale Version (AKTUELL)**
- Vollständig lokal ausführbar (localhost / lokales Netzwerk)
- Zweck: Ausführliches Testen, Proof of Concept, Demo-Fähigkeit
- KEIN Cloud-Deployment erforderlich
- Alle Services laufen auf lokalem Server/Entwicklungsmaschine
- Datenbank: Lokal (PostgreSQL oder SQLite)
- Ziel: Funktionsfähiger Prototyp für Stakeholder-Demo

**Phase 2: Post-MVP - Azure Cloud Migration**
- Refactoring der lokalen Version für Azure Cloud
- Cloud-native Services nutzen (Azure App Service, Azure SQL, etc.)
- Skalierbarkeit und Multi-Werkstatt-Betrieb
- Production-ready Deployment

**Architektur-Entscheidungen (MVP - Lokal):**

```
┌─────────────────────────────────────────────────────┐
│           LOKALE ENTWICKLUNGSUMGEBUNG               │
│                                                     │
│  ┌─────────────────┐                               │
│  │   Frontend      │  → Next.js (localhost:3000)   │
│  │   Landing Page  │  → Tailwind CSS               │
│  │   + 3 Portale   │  → TypeScript                 │
│  └────────┬────────┘                               │
│           │                                         │
│           ▼                                         │
│  ┌─────────────────┐                               │
│  │   Backend API   │  → Node.js / Express          │
│  │   (REST/GraphQL)│  → Port: localhost:5000       │
│  └────────┬────────┘                               │
│           │                                         │
│           ▼                                         │
│  ┌─────────────────┐                               │
│  │   PostgreSQL    │  → Lokale DB (Port 5432)      │
│  │   oder SQLite   │  → Datei-basiert              │
│  └─────────────────┘                               │
│           │                                         │
│      ┌────┴────┬────────┬────────┬───────┐         │
│      ▼         ▼        ▼        ▼       ▼         │
│  ┌────────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐   │
│  │ Stripe │ │ Odoo │ │ Slot │ │Jockey│ │Werkst│   │
│  │ (Test) │ │(Mock)│ │Mgmt  │ │Portal│ │Portal│   │
│  └────────┘ └──────┘ └──────┘ └──────┘ └──────┘   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Tech-Stack MVP (Lokal):**

- **Frontend:** Next.js 14+ (React), Tailwind CSS, TypeScript
- **Backend:** Node.js + Express ODER Python FastAPI/Django
- **Datenbank:** PostgreSQL (lokal) ODER SQLite (einfacher Setup)
- **Payment:** Stripe Test Mode (Webhooks via Stripe CLI)
- **Odoo:** Mock/Stub-Integration (JSON-Log statt echte API)
- **Hosting:** Localhost (npm run dev / python manage.py runserver)
- **Port-Konfiguration:**
  - Frontend: localhost:3000
  - Backend API: localhost:5000
  - PostgreSQL: localhost:5432
- **CI/CD:** Nicht erforderlich für MVP (manuelles Testing)
- **Monitoring:** Console Logging, JSON-Logs (später: Sentry)

**Tech-Stack Post-MVP (Azure Cloud):**

- **Frontend:** Azure Static Web Apps oder Azure App Service
- **Backend:** Azure App Service (Node.js/Python Container)
- **Datenbank:** Azure Database for PostgreSQL (Flexible Server)
- **Payment:** Stripe Production Mode
- **Odoo:** Echte API-Integration
- **Storage:** Azure Blob Storage (Fotos, Dokumente)
- **CI/CD:** GitHub Actions → Azure DevOps
- **Monitoring:** Azure Application Insights
- **Secrets:** Azure Key Vault

**Alternative (KI-gestützte Entwicklung für MVP):**

"Mit KI-Tools testen, wie weit wir kommen"
- **Cursor / Claude Code:** Für schnelle Prototyping
- **v0.dev:** UI-Komponenten generieren
- **Supabase (optional):** Backend-as-a-Service - kann lokal emuliert werden

**Migrations-Strategie (Lokal → Azure):**

1. **Datenbankschema:** PostgreSQL ist Azure-kompatibel (pg_dump → Azure)
2. **Environment Variables:** Bereits in MVP trennen (.env.local vs. .env.production)
3. **API-Endpoints:** RESTful Design ermöglicht einfaches Re-Hosting
4. **File Storage:** Lokal (./uploads) → Azure Blob Storage
5. **Secrets Management:** .env-Dateien → Azure Key Vault
6. **Containerisierung:** Optional Docker für einfache Azure-Migration

**Betroffene User Stories/Epics:**

- **ALLE technischen Stories** (TECH-001 bis TECH-016) berücksichtigen lokales Setup
- **Epic 6 (Payment & Accounting):** Stripe Test Mode, Odoo-Mock
- **Epic 4 (Slot-Management):** Lokale Datenbank, keine Cloud-Sync
- **TECH-016 (CI/CD):** Nicht im MVP, erst bei Azure-Migration

**Story Points:** N/A (Architektur-Entscheidung, kein Dev-Task)

---

### TECH-013: Datenmodell & Entities

**Kern-Entities:**

```typescript
// Customer
Customer {
  id: UUID
  email: string
  phone: string
  name: string
  address: Address
  vehicles: Vehicle[]
  stripe_customer_id: string
  created_at: DateTime
}

// Vehicle
Vehicle {
  id: UUID
  customer_id: UUID
  brand: string // Pflichtfeld
  model: string // Pflichtfeld
  year: number // Pflichtfeld (Baujahr)
  mileage: number // Pflichtfeld (Kilometerstand bei Ersterfassung)
  license_plate?: string // Optional
  vin?: string // Optional (Post-MVP)
  created_at: DateTime
}

HINWEIS: Fahrzeugklassen (Kleinwagen, Kompakt, etc.) werden NICHT mehr verwendet.
Preiskalkulation erfolgt marke/modell-spezifisch.

// Booking
Booking {
  id: UUID
  customer_id: UUID
  vehicle_id: UUID
  service_type: ServiceType // Inspektion/Wartung (Hauptprodukt), Ölservice, TÜV, etc.
  mileage_at_booking: number // Kilometerstand bei Buchung (Pflichtfeld)
  price: Decimal // Berechnet nach Marke/Modell, nicht Fahrzeugklasse
  status: BookingStatus // pending, confirmed, in_progress, completed, cancelled
  pickup_slot: Slot
  delivery_slot: Slot
  jockey_id?: UUID
  workshop_id: UUID
  stripe_payment_id: string
  odoo_order_id?: number
  created_at: DateTime
}

HINWEIS: Kilometerstand wird bei jeder Buchung erfasst (Pflichtfeld).

// Slot
Slot {
  id: UUID
  date: Date
  time_start: Time
  time_end: Time
  workshop_id: UUID
  max_capacity: number
  current_bookings: number
  available: boolean
}

// AdditionalWork (Auftragserweiterung)
AdditionalWork {
  id: UUID
  booking_id: UUID
  description: string
  photos: string[] // URLs
  price: Decimal
  status: WorkStatus // pending, approved, rejected
  stripe_payment_id?: string
  created_at: DateTime
  approved_at?: DateTime
}

// Workshop
Workshop {
  id: UUID
  name: string // "Witten"
  address: Address
  capacity_settings: JSON
  created_at: DateTime
}

// Jockey
Jockey {
  id: UUID
  name: string
  phone: string
  workshop_id: UUID
  status: JockeyStatus // available, busy, offline
}
```

**Story Points:** N/A (Design-Aufgabe)

---

### TECH-014: Lokales Deployment Setup

**Als** Entwicklungsteam
**möchte ich** die gesamte Anwendung lokal ausführen können
**damit** wir testen, demonstrieren und entwickeln können ohne Cloud-Abhängigkeiten

**Akzeptanzkriterien:**

**Given** ich habe das Repository geklont
**When** ich das lokale Setup ausführe (z.B. npm install && npm run dev)
**Then** startet die Anwendung auf:
- Frontend: localhost:3000
- Backend API: localhost:5000
- Datenbank: localhost:5432 (PostgreSQL) oder SQLite-Datei

**Given** ich öffne localhost:3000
**When** die Anwendung läuft
**Then** sehe ich:
- Landing Page mit drei Login-Bereichen
- Funktionsfähige Kunden-Buchung
- Jockey-Portal (nach Login)
- Werkstatt-Portal (nach Login)

**Given** ich führe eine Test-Buchung durch
**When** ich mit Stripe Test-Karte zahle
**Then** wird die Zahlung lokal verarbeitet (via Stripe CLI Webhooks)

**Technische Requirements:**

**Datenbank:**
- PostgreSQL (lokal via Docker ODER manuell installiert)
- ODER SQLite (einfacher, Datei-basiert, kein Setup nötig)
- Migrations-Scripts für Schema-Setup
- Seed-Data für Testing (Test-Kunden, Test-Jockeys, Test-Werkstatt)

**Stripe Integration (lokal):**
- Stripe Test Mode Keys in .env.local
- Stripe CLI für Webhook-Forwarding: `stripe listen --forward-to localhost:5000/webhooks/stripe`
- Test Cards für Payment-Testing

**Odoo Integration (MVP):**
- Mock/Stub-Implementation (keine echte API-Calls)
- JSON-Logs statt echte Odoo-Requests
- Später: Odoo-API-Integration

**Environment Variables:**
```bash
# .env.local
DATABASE_URL=postgresql://user:password@localhost:5432/b2c_app
# ODER für SQLite
DATABASE_URL=sqlite:./dev.db

STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

ODOO_API_URL=http://localhost:8069 (mock)
ODOO_API_KEY=mock_key

NEXT_PUBLIC_API_URL=http://localhost:5000
```

**Setup-Dokumentation:**
- README.md mit Schritt-für-Schritt-Anleitung
- Docker Compose (optional) für einfaches Setup
- Troubleshooting-Guide

**Story Points:** 8

---

### TECH-015: Multi-Portal Authentication & RBAC

**Als** System
**möchte ich** drei verschiedene User-Rollen verwalten
**damit** Kunde, Jockey und Werkstatt nur ihre relevanten Bereiche sehen

**Akzeptanzkriterien:**

**Given** ich bin auf der Landing Page
**When** ich mich als Kunde anmelde (Magic Link)
**Then** sehe ich nur das Kunden-Portal (Buchungen, Buchungshistorie)

**Given** ich bin ein Jockey
**When** ich mich mit Username/Passwort anmelde
**Then** sehe ich nur das Jockey-Portal (Abholungen, Rückgaben)

**Given** ich bin ein Werkstatt-Mitarbeiter
**When** ich mich mit Username/Passwort anmelde
**Then** sehe ich nur das Werkstatt-Portal (Aufträge, Auftragserweiterungen)

**Technische Requirements:**

**User Roles:**
```typescript
enum UserRole {
  CUSTOMER = 'customer',
  JOCKEY = 'jockey',
  WORKSHOP = 'workshop',
  ADMIN = 'admin' // für System-Admin
}

User {
  id: UUID
  email: string
  role: UserRole
  password_hash?: string // nur für Jockey/Workshop
  created_at: DateTime
}
```

**Authentication Flows:**
- **Customer:** Magic Link (passwordless) via E-Mail
- **Jockey/Workshop:** Username + Passwort
- **Session Management:** JWT oder Session-Cookies
- **Authorization:** Middleware prüft Role bei jedem Request

**API-Endpoints:**
- `POST /auth/customer/magic-link` (sendet E-Mail)
- `GET /auth/customer/verify?token=...` (verifiziert Magic Link)
- `POST /auth/jockey/login` (Username/Passwort)
- `POST /auth/workshop/login` (Username/Passwort)
- `GET /auth/me` (gibt aktuellen User zurück)

**Frontend-Routing:**
- `/` - Landing Page
- `/customer/*` - Kunden-Portal (geschützt, nur Customer-Role)
- `/jockey/*` - Jockey-Portal (geschützt, nur Jockey-Role)
- `/workshop/*` - Werkstatt-Portal (geschützt, nur Workshop-Role)

**Story Points:** 13

---

### TECH-016: Security & DSGVO

**Sicherheitsanforderungen:**

- **HTTPS:** Alle Verbindungen verschlüsselt (auch lokal via mkcert für localhost)
- **Authentication:** JWT oder Session-based
- **Authorization:** Role-based Access Control (Customer, Jockey, Workshop, Admin)
- **Encryption:** Sensible Daten (Zahlungsinformationen) verschlüsselt
- **Rate Limiting:** API-Endpunkte schützen (DoS-Prävention)
- **Password Hashing:** bcrypt oder Argon2 für Jockey/Workshop-Passwörter

**DSGVO-Compliance:**

- **Datensparsamkeit:** Nur nötige Daten erfassen
- **Recht auf Löschung:** Kunde kann Account löschen
- **Datenexport:** Kunde kann Daten als JSON exportieren
- **Consent:** Einwilligung zu Kartenspeicherung, Marketing-E-Mails
- **Datenschutzerklärung:** Klar verständlich
- **AGB:** Storno-Bedingungen, Haftung

**Story Points:** 5 (Security Audit + DSGVO-Check)

---

## Testing-Strategie

### TECH-017: Test-Coverage & QA

**Test-Pyramide:**

```
         ┌──────────┐
         │ E2E Tests│  10% (Playwright / Cypress)
         └──────────┘
      ┌────────────────┐
      │Integration Tests│ 30% (API-Tests)
      └────────────────┘
   ┌────────────────────────┐
   │     Unit Tests         │ 60% (Jest / Vitest)
   └────────────────────────┘
```

**Kritische Test-Szenarien:**

1. **Buchungs-Flow:** End-to-End (Fahrzeug wählen → Zahlen → Bestätigung)
2. **Payment:** Erfolgreiche Zahlung, fehlgeschlagene Zahlung, Refund
3. **Slot-Management:** Concurrent Bookings (Race Conditions)
4. **Auftragserweiterung:** Angebot erstellen → Freigabe → Zahlung
5. **Odoo-Integration:** Daten-Sync, Error-Handling bei Odoo-Ausfall

**Story Points:** 8 (Test-Setup + initiale Tests)

---

## Deployment & DevOps

### TECH-018: CI/CD Pipeline (Post-MVP - Azure Migration)

**Pipeline-Stages:**

```
Code Push → Lint & Format → Unit Tests → Build → Integration Tests → Deploy (Staging) → E2E Tests → Deploy (Production)
```

**Tools:**

- **GitHub Actions:** CI/CD
- **Staging Environment:** Für Testing vor Production
- **Feature Flags:** Schrittweise Rollout neuer Features
- **Rollback-Strategie:** Bei Fehlern in Production

**Story Points:** 5

---

## Offene technische Fragen (für Klärung)

| Frage | Betroffene Story | Priorität | Verantwortlich |
|-------|-----------------|-----------|----------------|
| Welches Werkstatt-System nutzt Witten? | TECH-010 | Hoch | PO/Ops |
| Besteht Odoo-Instanz bereits? API-Zugang? | TECH-004 | Hoch | Tech Lead |
| Kann bestehende Driver-App erweitert werden? | TECH-009 | Mittel | Tech Lead |
| Soll Frontend PWA oder Native App sein? | TECH-012 | Hoch | PO/Tech |
| Hosting-Präferenz? (AWS, Railway, Vercel) | TECH-012 | Mittel | Tech Lead |
| Brauchen wir White-Label für spätere Werkstätten? | TECH-012 | Niedrig | PO |

---

## Technische Risiken & Mitigation

| Risiko | Auswirkung | Wahrscheinlichkeit | Mitigation |
|--------|-----------|-------------------|-----------|
| Odoo-Integration schlägt fehl | Keine Buchhaltung | Mittel | Spike durchführen (1 Sprint), Fallback: Manueller Export |
| Stripe-Zahlung oft fehlgeschlagen | Hohe Abbruchrate | Niedrig | Backup Payment (PayPal), Error-Handling testen |
| Werkstatt-System nicht integrierbar | Manuelle Prozesse | Mittel | Vereinfachtes Werkstatt-Portal bauen (TECH-011) |
| Driver-App nicht erweiterbar | Manuelle Jockey-Koordination | Niedrig | MVP: Telefon/WhatsApp, später: eigene App |
| Concurrency-Probleme bei Slot-Buchung | Doppelbuchungen | Mittel | Pessimistic Locking, Load-Testing |

---

**Nächste Schritte:**

1. **Tech Spike:** Odoo API testen (1 Tag)
2. **Architektur-Review:** Mit Tech Lead finale Entscheidungen treffen
3. **Prototyping:** Payment-Flow mit Stripe Test Mode bauen
4. **Werkstatt-Interview:** Welches System nutzen sie? (PO Aufgabe)

---

**Letzte Überarbeitung:** 2026-02-01
