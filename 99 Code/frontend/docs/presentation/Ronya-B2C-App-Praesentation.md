# Ronya B2C App - Presentation Input
## AI-Driven Full-Stack Automotive Service Platform

---

# Vorgeschlagene Folienstruktur

1. **Titelfolie** - Ronya B2C App
2. **Executive Summary** - Was ist die App?
3. **Das Problem** - Warum diese App?
4. **Die Lösung** - Feature-Übersicht (High-Level)
5. **Multi-Portal Architektur** - 4 Portale, 1 Plattform
6. **Customer Portal** - Deep Dive
7. **Jockey/Driver Portal** - Deep Dive
8. **Workshop Portal** - Deep Dive
9. **Booking Lifecycle (FSM)** - Statusmaschine visualisiert
10. **Technologie-Stack** - Übersicht
11. **Code-Statistiken** - Zahlen & Fakten
12. **Entwicklung mit Claude Code** - KI-gestützte Entwicklung
13. **Vergleich: KI vs. Klassisches Team** - Sprint-Kalkulation
14. **Live-Demo / Screenshots** - Walkthrough
15. **Fazit & Ausblick**

---

# Folie 1: Titelfolie

**Ronya B2C App**
*Premium Fahrzeugwartung mit Festpreis-Garantie und Concierge-Service*

- Full-Stack Web-Applikation
- Entwickelt in 5 Tagen mit Claude Code (AI)
- ~98.000 Zeilen Code

---

# Folie 2: Executive Summary

## Was ist die Ronya B2C App?

Eine **vollumfängliche Automotive-Service-Plattform** mit 4 Portalen:

| Portal | Zielgruppe | Kernfunktion |
|--------|-----------|--------------|
| **Kunden-Portal** | Endkunden | Online-Buchung, Tracking, Erweiterungen genehmigen |
| **Fahrer-Portal** | Jockey-Fahrer | Aufträge verwalten, GPS-Tracking, Übergabe dokumentieren |
| **Werkstatt-Portal** | Werkstattbetreiber | Kanban-Board, Status-Management, Erweiterungen erstellen |
| **Admin** | Plattform-Betreiber | Benutzerverwaltung, Monitoring |

**Unique Selling Points:**
- Garantierte Festpreise basierend auf Fahrzeugdaten
- Concierge Hol- & Bringservice inklusive
- Digitale Genehmigung von Zusatzarbeiten
- Echtzeit-Tracking des Fahrzeugs
- Vollständig zweisprachig (DE/EN)

---

# Folie 3: Das Problem

## Herausforderungen im Automotive Aftermarket

- **Intransparente Preise** - Kunden wissen nicht, was der Service kosten wird
- **Zeitaufwand** - Fahrzeug selbst zur Werkstatt bringen
- **Keine Digitalisierung** - Telefonische Terminvereinbarung, Papierprozesse
- **Fehlende Transparenz** - Kein Echtzeit-Status des Fahrzeugs
- **Zusatzkosten-Überraschungen** - Ungeplante Reparaturen ohne vorherige Genehmigung

---

# Folie 4: Die Lösung

## Ronya: End-to-End Digitalisierung

```
Kunde bucht online  -->  Fahrer holt ab  -->  Werkstatt bearbeitet  -->  Fahrer bringt zurück
     |                        |                       |                        |
  Festpreis               GPS-Tracking          Digitale Erweiterung     Echtzeit-Status
  berechnet              Übergabe-Doku          Foto-Dokumentation      für alle sichtbar
```

**Alles in einer Plattform - für alle Beteiligten.**

---

# Folie 5: Multi-Portal Architektur

## 4 Portale, 1 Backend, 1 Datenbank

```
                    ┌──────────────────────┐
                    │   Landing Page (de/en)│
                    └──────────┬───────────┘
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                     │
  ┌───────▼──────┐   ┌────────▼─────────┐  ┌───────▼──────┐
  │   Customer   │   │   Jockey/Driver  │  │   Workshop   │
  │   Portal     │   │   Portal         │  │   Portal     │
  └───────┬──────┘   └────────┬─────────┘  └───────┬──────┘
          │                    │                     │
          └────────────────────┼────────────────────┘
                               │
                    ┌──────────▼───────────┐
                    │  Express.js REST API │
                    │  + JWT Auth + RBAC   │
                    └──────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
                    │  PostgreSQL + Prisma │
                    └──────────────────────┘
```

**Rollenbasierte Zugriffskontrolle (RBAC):**
- 4 Rollen: CUSTOMER, JOCKEY, WORKSHOP, ADMIN
- JWT-basierte Authentifizierung
- Separate Login-Seiten pro Portal

---

# Folie 6: Customer Portal - Features

## Buchungsfluss (4-Step-Wizard)

1. **Fahrzeug eingeben** - Marke, Modell, Baujahr, Kilometerstand mit dynamischer Preisberechnung
2. **Service wählen** - Inspektion, Ölwechsel, Bremsen, TÜV, Klima (+ Multi-Service)
3. **Termin & Adresse** - Abhol-/Rückgabedatum, Zeitfenster, Adresse
4. **Bestätigung & Zahlung** - Zusammenfassung, Kontaktdaten, Stripe-Zahlung

## Dashboard & Tracking

- **Aktive Buchungen** mit Fortschritts-Timeline (5 Schritte)
- **Echtzeit Jockey-Tracking** - Geplant → Unterwegs → Angekommen → Übergeben
- **Buchungshistorie** mit Filterung
- **Fahrzeugverwaltung** - Gespeicherte Fahrzeuge für schnelle Wiederbuchung

## Auftragserweiterungen

- Push-Benachrichtigung bei neuen Erweiterungsvorschlägen
- Detail-Ansicht mit Fotos und Einzelpositionen
- **Genehmigen & Bezahlen** oder **Ablehnen** mit Begründung
- Stripe-Autorisierung (Charge erst nach Ausführung)

## Sonstiges

- Zweisprachig (DE/EN) mit Sprachumschaltung
- Responsive Design (Desktop + Mobile)
- Fahrzeugmarken-Logos

---

# Folie 7: Jockey/Driver Portal - Features

## Auftragsmanagement

- **Tagesansicht** mit Datum-Navigation (Vor-/Zurück)
- **Filter** nach Typ (Abholung/Rückgabe) und Status
- **Auftrags-Karten** mit Kundeninfo, Fahrzeug, Adresse, Zeitfenster

## Status-Workflow

```
ZUGEWIESEN  →  ROUTE STARTEN  →  ANGEKOMMEN  →  ÜBERGABE ABSCHLIEßEN
                     │                  │                    │
              departedAt         arrivedAt           completedAt
              (Zeitstempel)      (Zeitstempel)       (Zeitstempel)
```

## Übergabe-Dokumentation

- **Foto-Dokumentation** des Fahrzeugzustands
- **Kundenunterschrift** (Digital-Signatur)
- **Checkliste**: Schlüssel erhalten, Zustand dokumentiert, Fahrzeugschein fotografiert
- **Kilometerstand** erfassen
- **Anmerkungen** für besondere Hinweise

## Zusätzliche Features

- **Navigation starten** (Deep-Link zu Maps)
- **Kunden anrufen** (Click-to-Call)
- **Statistiken** (Fahrten pro Woche/Monat, Bewertung)
- **Verfügbarkeits-Management** (Wöchentliche Verfügbarkeit)

---

# Folie 8: Workshop Portal - Features

## Kanban-Board

- **3 Spalten**: Neu | In Bearbeitung | Abgeschlossen
- Drag & Drop zum Status-Wechsel
- Datumsfilter und Suchfunktion
- Auftrags-Karten mit Service, Fahrzeug, Deadline

## Auftragsdetail

- Vollständige Fahrzeug- und Kundeninformationen
- Service-Details mit Preisen
- **Status-Timeline** mit FSM-validierten Übergängen
- **Jockey-Timeline** mit Echtzeit-Timestamps (NEU)
- Notizen & Kommunikation

## Auftragserweiterungen erstellen

- Einzelpositionen mit Beschreibung, Menge, Einzelpreis
- Foto-Upload als Nachweis
- Automatische Benachrichtigung an Kunden
- **Auto-Capture** der Zahlung bei Service-Abschluss

## Sonstiges

- Anstehende Aufträge (7-Tage-Vorschau)
- Kalender-Ansicht
- Statistiken (Aufträge, Umsatz, Durchlaufzeit, Auslastung)
- Automatische Jockey-Zuweisung für Rückfahrt

---

# Folie 9: Booking Lifecycle (FSM)

## 11 Booking-Status mit Finite State Machine

```
PENDING_PAYMENT
      │ (Zahlung)
      ▼
  CONFIRMED
      │ (Jockey zugewiesen)
      ▼
PICKUP_ASSIGNED ─────────────────────────┐
      │ (Jockey schließt Übergabe ab)    │
      ▼                                  │ (Storno)
  PICKED_UP                              │
      │ (Werkstatt: Angekommen)          ▼
      ▼                             CANCELLED
  AT_WORKSHOP
      │ (Werkstatt: Arbeit starten)
      ▼
  IN_SERVICE
      │ (Werkstatt: Abgeschlossen)
      ▼
READY_FOR_RETURN
      │ (System: Auto-Zuweisung Rückfahrt)
      ▼
RETURN_ASSIGNED
      │ (Jockey schließt Übergabe ab)
      ▼
  RETURNED ✓
```

**Jeder Übergang ist FSM-validiert** - ungültige Statuswechsel werden serverseitig abgelehnt.
Jeder Aktor (CUSTOMER, JOCKEY, WORKSHOP, SYSTEM) hat definierte erlaubte Übergänge.

---

# Folie 10: Technologie-Stack

## Backend

| Technologie | Version | Zweck |
|------------|---------|-------|
| **Node.js** | 22.x | Runtime |
| **TypeScript** | 5.7 | Typsicherheit |
| **Express.js** | 4.21 | REST API Framework |
| **Prisma** | 6.2 | ORM & Datenbank-Migrationen |
| **PostgreSQL** | 16.x | Relationale Datenbank |
| **Stripe** | 20.3 | Zahlungsabwicklung |
| **Zod** | 3.24 | Request-Validierung |
| **JWT** | 9.0 | Authentifizierung |
| **Firebase Admin** | 13.6 | Push-Notifications |
| **Winston** | 3.17 | Logging |
| **Resend** | 6.9 | E-Mail-Versand |
| **Handlebars** | 4.7 | E-Mail-Templates |
| **AWS S3** | 3.x | Datei-Upload (Fotos) |
| **Sharp** | 0.34 | Bildverarbeitung |

## Frontend

| Technologie | Version | Zweck |
|------------|---------|-------|
| **Next.js** | 16.1 | React Full-Stack Framework |
| **React** | 19.2 | UI-Bibliothek |
| **TypeScript** | 5.x | Typsicherheit |
| **Tailwind CSS** | 4.x | Utility-First CSS |
| **Radix UI** | diverse | Zugängliche UI-Primitives (Dialog, Select, Tabs, etc.) |
| **next-intl** | 4.8 | Internationalisierung (DE/EN) |
| **Stripe React** | 5.6 | Zahlungsformulare |
| **Lucide React** | 0.469 | Icon-Bibliothek |
| **React Hook Form** | 7.71 | Formular-Management |
| **Sonner** | 2.0 | Toast-Benachrichtigungen |
| **date-fns** | 4.1 | Datums-Operationen |
| **Playwright** | 1.58 | End-to-End Tests |
| **Jest** | 29.7 | Unit & API Tests |

---

# Folie 11: Code-Statistiken

## ~98.000 Zeilen Code

| Bereich | Dateien | Zeilen Code |
|---------|---------|-------------|
| **Backend Source** (TypeScript) | 88 | 21.804 |
| **Backend Tests** (Unit + API) | 158 | 32.009 |
| **Frontend** (TSX/TS) | 209 | 26.954 |
| **E2E Tests** (Playwright) | 38 | 12.347 |
| **i18n** (DE + EN JSON) | 2 | 3.592 |
| **CSS / Tailwind** | - | 936 |
| **Prisma Schema** | 1 | 463 |
| **Gesamt** | **~496** | **~98.105** |

## Datenmodell

- **12 Prisma-Models**: User, CustomerProfile, JockeyProfile, WorkshopProfile, Session, Vehicle, PriceMatrix, Booking, Extension, TimeSlot, NotificationLog, JockeyAssignment
- **7 Enums**: UserRole, ServiceType, BookingStatus (11 Status), ExtensionStatus, AssignmentType, AssignmentStatus, NotificationType
- **Optimierte Indizes** auf allen relevanten Feldern

## API-Endpunkte

- **Auth**: Login, Register, Token-Refresh, Logout
- **Bookings**: CRUD, Status-Updates, Erweiterungen
- **Workshops**: Aufträge, Status, Erweiterungen erstellen
- **Jockeys**: Aufträge, Status-Updates, Handover
- **Payments**: Stripe Integration, Demo-Mode
- **Vehicles**: CRUD, Marken-/Modell-Datenbank
- **Notifications**: Firebase Push

## Test-Abdeckung

- **158 Backend-Testdateien** (Unit + API Tests mit Jest/Supertest)
- **38 E2E-Testspezifikationen** (Playwright, Multi-Browser, Multi-Viewport)
- **FSM-Tests**: Alle Booking-Status-Übergänge validiert
- **RBAC-Tests**: Rollenbasierte Zugriffskontrollen getestet
- **Walkthrough-Tests**: Vollständige User Journeys in DE und EN

---

# Folie 12: Entwicklung mit Claude Code

## Kennzahlen

| Metrik | Wert |
|--------|------|
| **Entwicklungszeitraum** | 3. Februar 2026 - 9. Februar 2026 |
| **Aktive Entwicklungstage** | 5 Tage |
| **Git Commits** | 15 |
| **Alle Commits KI-co-authored** | 15/15 (100%) |
| **Primärer Entwickler** | 1 Person (Sten Rauch) |
| **KI-Agents** | Claude Code (Opus) als Haupt-Agent + parallele Sub-Agents |
| **Gesamter Code** | ~98.000 Zeilen |
| **Geschwindigkeit** | ~19.600 Zeilen/Tag |

## Wie wurde mit Claude Code gearbeitet?

1. **Anforderungen beschreiben** - natürlichsprachliche Prompts
2. **Claude Code generiert** - Backend + Frontend + Tests + i18n gleichzeitig
3. **Review & Iteration** - Sofortiges Feedback, Anpassungen in Sekunden
4. **Agent-Teams** - Parallele Sub-Agents für Research, Code-Stats, Testing
5. **Automatische Qualitätssicherung** - TypeScript-Compiler, ESLint, Tests nach jedem Schritt

## Was hat Claude Code gemacht?

- Vollständiges Prisma-Schema mit 12 Models designed
- REST API mit Express + Zod-Validierung implementiert
- FSM (Finite State Machine) für Booking-Lifecycle entworfen
- Next.js Frontend mit 4 Portalen gebaut
- Stripe + Demo-Payment Integration
- Vollständige i18n (1.800 Zeilen pro Sprache)
- 196 Testdateien geschrieben
- E2E Walkthrough-Tests mit Screenshots
- Alle Commit-Messages formuliert

---

# Folie 13: Vergleich - KI vs. Klassisches Entwicklerteam

## Annahmen für klassisches Team (ohne KI)

- **Team**: 1 Backend-Dev, 1 Frontend-Dev, 1 Fullstack/QA, 1 UX/Design
- **Sprint-Länge**: 2 Wochen
- **Velocity**: ~40 Story Points pro Sprint (Team)
- **Erfahrung**: Senior-Entwickler mit Erfahrung in den eingesetzten Technologien

## Aufwandsschätzung nach Modulen

| Modul | Story Points | Sprints |
|-------|-------------|---------|
| **Projekt-Setup** (DB, Auth, CI/CD) | 20 | 0,5 |
| **Datenmodell & Prisma** (12 Models, Migrationen) | 15 | 0,4 |
| **Auth-System** (JWT, RBAC, 4 Rollen) | 20 | 0,5 |
| **Booking-API** (CRUD, FSM, Validierung) | 35 | 0,9 |
| **Payment-Integration** (Stripe + Demo) | 25 | 0,6 |
| **Landing Page + Booking Wizard** | 30 | 0,8 |
| **Customer Portal** (Dashboard, Details, Extensions) | 35 | 0,9 |
| **Jockey Portal** (Aufträge, Tracking, Handover) | 30 | 0,8 |
| **Workshop Portal** (Kanban, Details, Extensions) | 35 | 0,9 |
| **i18n** (2 Sprachen, 1.800 Zeilen/Sprache) | 15 | 0,4 |
| **E2E Tests** (38 Specs, Multi-Browser) | 25 | 0,6 |
| **Unit/API Tests** (158 Dateien) | 20 | 0,5 |
| **UX/UI Polish** (Responsive, Logos, Animations) | 20 | 0,5 |
| **Notifications** (Firebase, E-Mail) | 15 | 0,4 |
| **Integration & Bugfixing** | 20 | 0,5 |
| **Gesamt** | **~380 SP** | **~8,7 Sprints** |

## Ergebnis

| | KI-gestützt (Claude Code) | Klassisches 4er-Team |
|---|---|---|
| **Dauer** | **5 Arbeitstage** | **~9 Sprints = ~18 Wochen** |
| **Personen** | 1 + KI | 4 Entwickler |
| **Personentage** | ~5 | ~360 (4 Pers. x 90 Tage) |
| **Faktor** | **1x** | **~72x langsamer** |
| **Kosten (geschätzt)** | ~500 EUR (API-Kosten) | ~180.000 EUR (4 x 45k/halbjahr anteilig) |

> **Fazit: Was ein 4-köpfiges Entwicklerteam ~4,5 Monate beschäftigt hätte, wurde mit Claude Code in 5 Tagen realisiert.**

---

# Folie 14: Live Demo / Screenshots

*Hier Screenshot-Walkthrough einfügen aus:*
- `frontend/e2e/walkthrough-screenshots/de-unified/` (47 Screenshots)
- `frontend/e2e/walkthrough-screenshots/en-unified/` (41 Screenshots)

**Empfohlener Walkthrough:**

1. Landing Page mit Festpreis-Berechnung
2. Fahrzeug-Auswahl (Marke, Modell, Baujahr)
3. Service-Auswahl mit dynamischer Preisanzeige
4. Terminwahl & Adresseingabe
5. Buchungsbestätigung & Zahlung
6. Kunden-Dashboard nach Buchung
7. Jockey-Login & Auftragsansicht
8. Jockey: Route starten → Angekommen → Übergabe
9. Werkstatt-Login & Kanban-Board
10. Werkstatt: Auftrag bearbeiten → Erweiterung erstellen
11. Kunde: Erweiterung prüfen & genehmigen
12. Werkstatt: Service abschließen
13. Jockey: Rückgabe-Auftrag → Fahrzeug zurück

---

# Folie 15: Fazit & Ausblick

## Was wurde erreicht

- **Vollständige B2C-Plattform** mit 4 Portalen in 5 Tagen
- **~98.000 Zeilen** produktionsreifer Code (TypeScript/React/Express)
- **196 Testdateien** für Qualitätssicherung
- **11-stufige Booking State Machine** für lückenlosen Prozess
- **Stripe-Integration** (Real + Demo-Mode)
- **Zweisprachig** (DE/EN) mit 3.600 Übersetzungsschlüsseln
- **E2E-getestet** mit automatisierten Walkthrough-Screenshots

## Nächste Schritte

- Echtzeit-GPS-Tracking mit WebSockets
- Mobile App (React Native)
- Werkstatt-Bewertungssystem
- Odoo ERP-Integration (Buchhaltung)
- Admin-Dashboard mit Analytics
- Erweitertes Benachrichtigungssystem
- Performance-Optimierung & Caching

## Takeaway

> **Claude Code transformiert die Softwareentwicklung fundamental: Ein einzelner Entwickler kann mit KI-Unterstützung in wenigen Tagen ein Produkt erstellen, das traditionell ein Team von 4+ Entwicklern über Monate hinweg beschäftigt hätte - bei vergleichbarer Codequalität und Testabdeckung.**

---

# Appendix: Datenmodell (Entity Relationship)

```
User (4 Rollen)
 ├── CustomerProfile (Stripe-ID, Adresse)
 ├── JockeyProfile (Lizenz, Verfügbarkeit, Rating)
 ├── WorkshopProfile (Name, Kapazität, Slots)
 ├── Session (JWT Token Management)
 ├── Vehicle (Marke, Modell, Baujahr, KM)
 ├── Booking
 │    ├── Extension (Zusatzarbeiten, Fotos, Zahlung)
 │    └── JockeyAssignment (PICKUP/RETURN, Timestamps, Handover)
 ├── PriceMatrix (Fahrzeug → Preis pro Service)
 ├── TimeSlot (Werkstatt-Verfügbarkeit)
 └── NotificationLog (Push, E-Mail, Status)
```

---

# Appendix: Vollständige Feature-Liste

## Kundenportal
- [x] Online-Buchung mit 4-Schritt-Wizard
- [x] Dynamische Preisberechnung nach Fahrzeug
- [x] Fahrzeugmarken- & Modell-Datenbank mit Logos
- [x] Service-Auswahl (7 Services)
- [x] Termin- & Zeitfenster-Auswahl mit Kalender
- [x] Adresseingabe für Abholung/Rückgabe
- [x] Stripe-Zahlung (Real + Demo)
- [x] Buchungsbestätigungs-Seite
- [x] Kunden-Dashboard mit Statistiken
- [x] Buchungsdetails mit Fortschritts-Timeline
- [x] Jockey-Status-Timeline mit Echtzeit-Timestamps
- [x] Auftragserweiterungen prüfen & genehmigen/ablehnen
- [x] Aktivitäts-Timeline pro Buchung
- [x] Fahrzeugverwaltung (CRUD)
- [x] Login/Register mit JWT
- [x] Responsive Mobile-First Design

## Jockey/Fahrer-Portal
- [x] Tagesansicht mit Auftrags-Karten
- [x] Datum-Navigation (vor/zurück/heute)
- [x] Filter nach Typ und Status
- [x] Status-Workflow: Zugewiesen → Unterwegs → Angekommen → Übergabe
- [x] Zeitstempel bei jedem Statuswechsel (departedAt, arrivedAt, completedAt)
- [x] Übergabe-Modal mit Foto, Unterschrift, Checkliste, KM-Stand
- [x] Navigation starten (Maps Deep-Link)
- [x] Kunden anrufen (Click-to-Call)
- [x] Verdienst-Statistiken
- [x] Verfügbarkeits-Management

## Werkstatt-Portal
- [x] Kanban-Board (3 Spalten, Drag & Drop)
- [x] Auftrags-Detailseite mit allen Infos
- [x] Status-Management mit FSM-Validierung
- [x] Auftragserweiterung erstellen (Positionen, Fotos)
- [x] Automatische Kundenbenachrichtigung bei Erweiterung
- [x] Jockey-Timeline mit Timestamps pro Auftrag
- [x] Auto-Capture genehmigter Erweiterungszahlungen
- [x] Automatische Rückfahrt-Zuweisung
- [x] Kalender-Ansicht
- [x] Statistiken (Umsatz, Aufträge, Auslastung)
- [x] Suchfunktion

## Cross-Cutting
- [x] JWT-Authentifizierung mit Refresh-Tokens
- [x] RBAC (4 Rollen)
- [x] i18n Deutsch/Englisch (3.600 Schlüssel)
- [x] FSM (Finite State Machine) für Booking-Status
- [x] Stripe + DemoPaymentService
- [x] Firebase Push-Notifications
- [x] E-Mail-Benachrichtigungen (Resend + Handlebars)
- [x] Rate Limiting
- [x] Zod Request-Validierung
- [x] Winston Logging
- [x] AWS S3 File-Upload
- [x] Image Processing (Sharp)

---

*Erstellt am 10. Februar 2026 | Generiert mit Claude Code*
