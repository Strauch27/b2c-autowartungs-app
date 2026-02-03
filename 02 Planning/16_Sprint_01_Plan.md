# Sprint 1 Plan: Fundament & Buchung

**Sprint:** 1 von 6
**Dauer:** 2 Wochen (Woche 1-2)
**Sprint Goal:** "Kunde kann Fahrzeug auswählen, Service wählen und Festpreis sehen. Alle drei Login-Bereiche funktionieren."
**Velocity Ziel:** 36 Story Points

---

## Sprint Objectives

### Primäres Ziel
Technisches Fundament schaffen und Basis-Buchungsprozess implementieren. Kunde soll auf Landing Page navigieren, sich anmelden können und ersten Schritt der Buchung (Fahrzeugauswahl + Preiskalkulation) durchführen können.

### Sekundäres Ziel
Multi-Portal-Architektur aufsetzen mit drei separaten Login-Bereichen (Kunde, Jockey, Werkstatt) für Demo-Fähigkeit.

### Success Criteria
- Landing Page ist live und zeigt drei klar getrennte Bereiche
- Kunde kann sich mit Magic Link anmelden
- Jockey und Werkstatt können sich mit Username/Passwort anmelden
- Fahrzeugauswahl funktioniert mit allen Pflichtfeldern
- Festpreis-Kalkulation nach Marke/Modell funktioniert korrekt
- Alle Unit-Tests grün

---

## User Stories in diesem Sprint

| Story ID | Story | Story Points | Priorität | Assignee |
|----------|-------|--------------|-----------|----------|
| **US-020** | Landing Page mit drei Login-Bereichen | 5 | Critical | Frontend |
| **US-021** | Kunden-Login (Magic Link) | 5 | Critical | Full-Stack |
| **US-022** | Jockey-Login (Username/Password) | 3 | Critical | Full-Stack |
| **US-023** | Werkstatt-Login (Username/Password) | 3 | Critical | Full-Stack |
| **US-024** | Session Management & Logout | 2 | Critical | Backend |
| **US-001** | Fahrzeugauswahl mit Pflichtfeldern | 8 | Critical | Full-Stack |
| **US-002** | Service-Auswahl | 5 | High | Frontend |
| **US-004** | Festpreis nach Marke/Modell | 8 | Critical | Backend |
| **US-013** | Inspektion/Wartung als Hauptprodukt | 2 | High | Content |
| **US-019** | Kilometerstand als Pflichtfeld | - | High | (in US-001) |
| **TECH-014** | Lokales Deployment Setup | 8 | Critical | DevOps |
| **TECH-015** | Multi-Portal Authentication & RBAC | 13 | Critical | Backend |

**Total:** 62 SP geplant (überbuch bewusst, realistisch 36-40 SP schaffbar)

**Priorisierung:**
- **Must-Complete:** US-020, US-021, US-022, US-023, US-001, TECH-014, TECH-015
- **Should-Complete:** US-024, US-004, US-002
- **Nice-to-Have:** US-013

---

## Detaillierte Task-Breakdown

### TECH-014: Lokales Deployment Setup (8 SP)

**Ziel:** Entwicklungsumgebung komplett lokal lauffähig

**Tasks:**
1. **Projekt-Setup** (2h)
   - Next.js 14+ initialisieren
   - TypeScript konfigurieren
   - Tailwind CSS einrichten
   - ESLint + Prettier

2. **Backend-Setup** (3h)
   - Node.js + Express (oder Next.js API Routes)
   - PostgreSQL lokal installieren (oder SQLite)
   - Prisma ORM Setup
   - Database Migrations erstellen

3. **Environment Variables** (1h)
   - .env.local Template erstellen
   - Database Connection String
   - JWT Secret
   - Platzhalter für Stripe Keys

4. **Seed Data** (2h)
   - Test-Kunden anlegen
   - Test-Jockeys anlegen
   - Test-Werkstatt anlegen
   - Sample Fahrzeugmodelle in PriceMatrix

5. **README & Dokumentation** (1h)
   - Setup-Anleitung schreiben
   - Troubleshooting-Guide
   - Architecture-Diagramm

**Akzeptanzkriterien:**
- `npm install && npm run dev` startet die App
- Frontend erreichbar unter localhost:3000
- Backend API erreichbar unter localhost:5000 (oder localhost:3000/api)
- Datenbank läuft und Migrations sind durchgelaufen

**Verantwortlich:** Tech Lead + alle Entwickler (gemeinsam)

---

### TECH-015: Multi-Portal Authentication & RBAC (13 SP)

**Ziel:** Drei separate Authentifizierungs-Flows für Kunde/Jockey/Werkstatt

**Tasks:**
1. **User Model & Datenbank** (2h)
   - User-Tabelle mit Role-Enum (CUSTOMER, JOCKEY, WORKSHOP, ADMIN)
   - Session-Tabelle (oder JWT-Token-Verwaltung)
   - Migrations schreiben

2. **JWT oder Session-basierte Auth** (3h)
   - JWT Token-Generierung
   - Token-Validierung Middleware
   - Session-Handling (Cookies)
   - Refresh-Token-Logik (optional, Post-MVP)

3. **Magic Link für Kunden** (4h)
   - E-Mail-Service Setup (lokales SMTP oder SendGrid Test)
   - Token-Generierung für Magic Link
   - E-Mail-Template erstellen
   - Magic Link Verifikation Endpoint

4. **Username/Password für Jockey & Werkstatt** (3h)
   - Passwort-Hashing (bcrypt)
   - Login-Endpoint
   - Passwort-Validierung
   - Rate Limiting (Basic)

5. **RBAC Middleware** (2h)
   - Role-Check Middleware
   - Protected Routes
   - Redirect-Logik bei Unauthorized

6. **Frontend-Integration** (3h)
   - Login-Forms für alle drei Flows
   - Token-Storage (localStorage oder httpOnly Cookie)
   - Auth-Context (React Context)
   - Auto-Redirect bei Session-Expiry

**Akzeptanzkriterien:**
- Kunde kann Magic Link erhalten und sich anmelden
- Jockey/Werkstatt können sich mit Username/Passwort anmelden
- Nach Login sieht jeder User nur sein Portal
- Unauthorized Zugriffe werden abgeblockt
- Session läuft nach definierter Zeit ab

**Verantwortlich:** Backend Developer (primär), Frontend Developer (Integration)

---

### US-020: Landing Page mit drei Login-Bereichen (5 SP)

**Ziel:** Zentrale Einstiegsseite mit drei klar getrennten Bereichen

**Tasks:**
1. **Layout & Design** (2h)
   - Wireframe in Figma (oder direkt Code)
   - Three-Column Layout (Desktop) / Stacked (Mobile)
   - Icons für Kunde/Jockey/Werkstatt
   - Hero-Section mit Produktvision

2. **Komponenten bauen** (3h)
   - Landing Page Komponente
   - Drei Cards/Sections für Bereiche
   - Buttons: "Jetzt buchen", "Fahrer-Login", "Werkstatt-Login"
   - Responsive Design testen

3. **Routing** (1h)
   - / → Landing Page
   - /customer/login → Kunden-Login
   - /jockey/login → Jockey-Login
   - /workshop/login → Werkstatt-Login

**Akzeptanzkriterien:**
- Landing Page lädt unter localhost:3000
- Drei Bereiche sind visuell klar getrennt
- Klick auf "Jetzt buchen" führt zu Fahrzeugauswahl (oder Login, falls nötig)
- Klick auf Login-Buttons führt zu jeweiligen Login-Seiten
- Mobile-responsive

**Verantwortlich:** Frontend Developer

---

### US-021: Kunden-Login (Magic Link) (5 SP)

**Ziel:** Passwordless Login für Kunden

**Tasks:**
1. **E-Mail-Eingabe-Seite** (1h)
   - Form mit E-Mail-Input
   - Validierung (E-Mail-Format)
   - Submit Button

2. **Backend: Magic Link senden** (2h)
   - Endpoint: POST /auth/customer/magic-link
   - Token generieren (JWT mit 15 Min Expiry)
   - E-Mail senden mit Link
   - Rate Limiting (max. 5 Requests/Stunde)

3. **Backend: Magic Link verifizieren** (2h)
   - Endpoint: GET /auth/customer/verify?token=...
   - Token validieren
   - Session erstellen
   - Redirect zu /customer/dashboard

4. **Frontend: Success & Error Handling** (1h)
   - Success: "Link gesendet an max@example.com"
   - Error: "Link abgelaufen" mit Retry-Button

**Akzeptanzkriterien:**
- Kunde gibt E-Mail ein → erhält E-Mail mit Link
- Klick auf Link → automatisch eingeloggt
- Abgelaufener Link → Fehlermeldung
- Session gültig für 7 Tage

**Verantwortlich:** Full-Stack Developer

---

### US-022 & US-023: Jockey/Werkstatt-Login (3 SP each = 6 SP)

**Ziel:** Standard Login mit Username/Passwort

**Tasks (pro Role):**
1. **Login-Form** (1h)
   - Username + Passwort Inputs
   - Submit Button
   - "Passwort vergessen?" Link (Post-MVP)

2. **Backend: Login-Endpoint** (2h)
   - POST /auth/jockey/login (oder /auth/workshop/login)
   - Username/Passwort validieren
   - Passwort-Hash vergleichen (bcrypt)
   - JWT Token generieren
   - Rate Limiting (max. 5 Fehlversuche)

3. **Frontend: Error Handling** (1h)
   - Fehlermeldung: "Falsche Zugangsdaten"
   - Nach 5 Fehlversuchen: "Account gesperrt"

**Akzeptanzkriterien:**
- Jockey/Werkstatt kann sich mit Test-Credentials anmelden
- Bei falschen Daten: Fehlermeldung
- Nach erfolgreicher Anmeldung: Redirect zu Dashboard (Placeholder im Sprint 2)

**Verantwortlich:** Full-Stack Developer

---

### US-024: Session Management & Logout (2 SP)

**Ziel:** Sichere Session-Verwaltung

**Tasks:**
1. **Logout-Endpoint** (1h)
   - POST /auth/logout
   - Session invalidieren (Token aus Blacklist oder Cookie löschen)

2. **Frontend: Logout-Button** (1h)
   - Button in Navigation/Header
   - Redirect zur Landing Page nach Logout
   - Auth-State aktualisieren

3. **Auto-Logout bei Expiry** (1h)
   - Middleware prüft Token-Expiry
   - Bei Expired: Redirect zu Login
   - Hinweis: "Sitzung abgelaufen"

**Akzeptanzkriterien:**
- Logout-Button funktioniert
- Nach Logout: Redirect zur Landing Page
- Abgelaufene Session: Auto-Redirect zu Login

**Verantwortlich:** Full-Stack Developer

---

### US-001: Fahrzeugauswahl mit Pflichtfeldern (8 SP)

**Ziel:** Kunde wählt Fahrzeug mit Marke, Modell, Baujahr, Kilometerstand

**Tasks:**
1. **Frontend: Fahrzeugauswahl-Form** (3h)
   - Dropdown: Marke (Autocomplete)
   - Dropdown: Modell (abhängig von Marke)
   - Dropdown: Baujahr (1994 - aktuelles Jahr)
   - Input: Kilometerstand (Pflicht, numerisch)
   - Validierung: Alle Felder erforderlich

2. **Backend: Fahrzeugdaten-API** (2h)
   - Endpoint: GET /api/vehicles/brands
   - Endpoint: GET /api/vehicles/models?brand=VW
   - JSON mit Marken/Modellen

3. **Backend: Validierung** (2h)
   - Baujahr: 1994 - aktuelles Jahr
   - Kilometerstand: 0 - 500.000 km
   - Plausibilitäts-Check (z.B. 2023 Auto mit 200.000 km → Warnung)

4. **Frontend: Plausibilitäts-Warnung** (1h)
   - Hinweis anzeigen bei unrealistischen Werten
   - Nicht blockierend, nur Warnung

**Akzeptanzkriterien:**
- Kunde kann Marke/Modell wählen
- Baujahr und Kilometerstand sind Pflichtfelder
- Validierung funktioniert
- Plausibilitäts-Warnung wird angezeigt

**Verantwortlich:** Full-Stack Developer

---

### US-004: Festpreis nach Marke/Modell (8 SP)

**Ziel:** Preiskalkulation basierend auf Marke, Modell, Kilometerstand

**Tasks:**
1. **PriceMatrix-Datenbank** (2h)
   - Tabelle erstellen (siehe Technical Impact Analysis)
   - Seed-Data: Top 10 Fahrzeugmodelle (VW Golf, Passat, Audi A4, BMW 3er, etc.)
   - Preise manuell eintragen

2. **Backend: Preis-Kalkulation-Logik** (4h)
   - Funktion: calculatePrice(brand, model, year, mileage, service)
   - Lookup in PriceMatrix
   - Kilometerstand-Multiplikator anwenden
   - Alters-Multiplikator anwenden
   - Fallback-Logik bei fehlendem Modell

3. **API-Endpoint** (1h)
   - GET /api/prices?brand=VW&model=Golf&year=2015&mileage=85000&service=inspection
   - Response: { price: 289, currency: "EUR", breakdown: {...} }

4. **Frontend: Preis anzeigen** (2h)
   - Preis-Card nach Fahrzeugauswahl
   - "Garantierter Festpreis: 289 EUR"
   - Hinweis: "Inkl. Hol- und Bringservice"

5. **Unit-Tests** (2h)
   - Tests für Preiskalkulation
   - Edge Cases: Sehr alte Autos, sehr hohe km

**Akzeptanzkriterien:**
- Preiskalkulation funktioniert für Top 10 Modelle
- Kilometerstand beeinflusst Preis korrekt
- Fallback-Logik funktioniert bei fehlendem Modell
- Unit-Tests grün

**Verantwortlich:** Backend Developer (primär), Frontend Developer (Integration)

---

### US-002: Service-Auswahl (5 SP)

**Ziel:** Kunde wählt Service aus (Inspektion, Ölservice, etc.)

**Tasks:**
1. **Frontend: Service-Auswahl-Screen** (2h)
   - Cards für Services: Inspektion/Wartung, Ölservice, TÜV, Bremse, Klima
   - Icons für Services
   - Kurze Beschreibung je Service
   - Radio-Buttons oder Cards mit Selection

2. **Backend: Service-Typen** (1h)
   - Enum: ServiceType (INSPECTION, OIL_SERVICE, BRAKE, TUV, CLIMATE)
   - Datenbank-Migration

3. **Preis pro Service** (2h)
   - Preiskalkulation für verschiedene Services
   - Anzeige: "Inspektion 60k: 289 EUR" vs. "Ölservice: 159 EUR"

**Akzeptanzkriterien:**
- Kunde kann Service wählen
- Preis wird pro Service angezeigt
- Inspektion/Wartung ist prominent als Hauptprodukt dargestellt

**Verantwortlich:** Frontend Developer (primär), Backend Developer (Preise)

---

### US-013: Inspektion/Wartung als Hauptprodukt (2 SP)

**Ziel:** Produkt-Content und Leistungsbeschreibung

**Tasks:**
1. **Content schreiben** (1h)
   - Leistungsbeschreibung Inspektion/Wartung
   - Was ist enthalten?
   - Was ist NICHT enthalten?

2. **Frontend: Info-Modal** (1h)
   - "Was ist enthalten?" Button
   - Modal mit Details

**Akzeptanzkriterien:**
- Kunde kann Details zur Inspektion lesen
- Content ist klar und verständlich

**Verantwortlich:** Product Owner (Content), Frontend Developer (UI)

---

## Sprint Backlog

### Day 1-2: Setup & Fundament

- [ ] TECH-014: Projekt-Setup (alle gemeinsam)
- [ ] TECH-014: Backend-Setup
- [ ] TECH-014: Database-Setup
- [ ] TECH-015: User Model & Database

### Day 3-4: Authentication

- [ ] TECH-015: JWT/Session-Setup
- [ ] TECH-015: Magic Link für Kunden
- [ ] TECH-015: Username/Password für Jockey/Werkstatt
- [ ] US-021: Kunden-Login implementieren
- [ ] US-022: Jockey-Login implementieren
- [ ] US-023: Werkstatt-Login implementieren

### Day 5-6: Landing Page & Routing

- [ ] US-020: Landing Page Design & Implementierung
- [ ] US-024: Session Management & Logout
- [ ] TECH-015: RBAC Middleware
- [ ] TECH-015: Frontend Auth-Integration

### Day 7-8: Fahrzeugauswahl

- [ ] US-001: Fahrzeugauswahl-Form bauen
- [ ] US-001: Backend Fahrzeugdaten-API
- [ ] US-001: Validierung
- [ ] US-004: PriceMatrix-Datenbank aufsetzen

### Day 9-10: Preiskalkulation & Service-Auswahl

- [ ] US-004: Preis-Kalkulation-Logik
- [ ] US-004: API-Endpoint für Preise
- [ ] US-004: Frontend Preis-Anzeige
- [ ] US-002: Service-Auswahl implementieren
- [ ] US-013: Content für Inspektion
- [ ] Unit-Tests schreiben
- [ ] Sprint Review vorbereiten

---

## Definition of Done (DoD)

Eine User Story gilt als "Done", wenn:

**Code:**
- [ ] Code ist geschrieben und reviewed (Code Review durch min. 1 Person)
- [ ] Keine TODOs oder Hardcoded Values
- [ ] Error Handling implementiert
- [ ] Logging an kritischen Stellen

**Testing:**
- [ ] Unit-Tests geschrieben und grün
- [ ] Manuelle Tests durchgeführt
- [ ] Edge Cases getestet
- [ ] Mobile-Responsive (Frontend)

**Dokumentation:**
- [ ] Code-Kommentare wo nötig
- [ ] API-Endpoints dokumentiert (z.B. Swagger)
- [ ] README aktualisiert (wenn nötig)

**Deployment:**
- [ ] Läuft lokal ohne Fehler
- [ ] Environment Variables dokumentiert
- [ ] Database Migrations durchgeführt

**Akzeptanz:**
- [ ] Alle Akzeptanzkriterien erfüllt
- [ ] Product Owner hat abgenommen

---

## Risks & Mitigation

| Risiko | Wahrscheinlichkeit | Impact | Mitigation |
|--------|-------------------|--------|-----------|
| Multi-Portal Auth zu komplex | Mittel | Hoch | Tech Spike vorab, Pair Programming |
| Team braucht Einarbeitungszeit | Hoch | Mittel | Onboarding-Session, gemeinsames Setup |
| Preiskalkulation-Logik fehlerhaft | Mittel | Hoch | Frühe Tests, Pricing-Workshop |
| Velocity überschätzt (36 SP zu viel) | Mittel | Mittel | Priorisierung: US-002, US-013 optional |
| E-Mail-Service lokal funktioniert nicht | Mittel | Mittel | Fallback: Console-Log statt echte E-Mail |

---

## Sprint Ceremonies

### Sprint Planning (2h)
**Wann:** Tag 1, 9:00 Uhr
**Agenda:**
- Sprint Goal finalisieren
- User Stories durchgehen und Fragen klären
- Tasks aufteilen (wer macht was?)
- Schätzungen bestätigen
- Sprint Backlog committen

### Daily Stand-up (15 Min)
**Wann:** Jeden Tag, 9:00 Uhr
**Format:**
- Was habe ich gestern gemacht?
- Was mache ich heute?
- Gibt es Blocker?

### Backlog Refinement (1h)
**Wann:** Mitte Sprint (Tag 5)
**Agenda:**
- Sprint 2 User Stories durchgehen
- Schätzungen für Sprint 2
- Offene Fragen klären

### Sprint Review (1h)
**Wann:** Tag 10, 15:00 Uhr
**Agenda:**
- Demo: Landing Page, Login-Flows, Fahrzeugauswahl, Preiskalkulation
- Feedback von Stakeholdern einholen
- Done/Not Done Stories

### Sprint Retrospective (1h)
**Wann:** Tag 10, 16:00 Uhr (nach Review)
**Agenda:**
- Was lief gut?
- Was lief nicht gut?
- Was wollen wir im nächsten Sprint anders machen?
- Action Items definieren

---

## Deliverables am Ende des Sprints

**Funktional:**
- Landing Page mit drei Login-Bereichen live
- Kunden-Login funktioniert (Magic Link)
- Jockey/Werkstatt-Login funktioniert (Username/Password)
- Kunde kann Fahrzeug auswählen (Marke, Modell, Baujahr, KM)
- Festpreis wird korrekt nach Marke/Modell berechnet
- Service-Auswahl funktioniert

**Technisch:**
- Lokale Entwicklungsumgebung komplett lauffähig
- Datenbank-Schema steht (User, Vehicle, PriceMatrix)
- Authentication-System funktioniert (JWT/Session)
- Unit-Tests für Preiskalkulation

**Dokumentation:**
- README mit Setup-Anleitung
- API-Dokumentation für Endpoints
- Architektur-Diagramm

---

## Success Metrics

**Sprint Goal Erfüllung:**
- [ ] Landing Page mit 3 Bereichen live
- [ ] Alle Login-Flows funktionieren
- [ ] Fahrzeugauswahl mit Preiskalkulation funktioniert

**Velocity:**
- Ziel: 36 SP
- Buffer: 32-40 SP akzeptabel

**Team Happiness:**
- Retro-Survey: Ziel > 7/10

**Code Quality:**
- Code Coverage: > 50% (früher Sprint, Coverage wird steigen)
- Keine Critical Bugs

---

## Action Items für Product Owner

**Vor Sprint Start:**
- [ ] Pricing-Workshop mit Business durchführen
- [ ] Top 10 Fahrzeugmodelle und Preise festlegen
- [ ] Wireframes für Landing Page reviewen
- [ ] Stakeholder für Sprint Review einladen

**Während Sprint:**
- [ ] Daily Stand-ups teilnehmen (optional, aber empfohlen)
- [ ] Für Fragen verfügbar sein (< 2h Reaktionszeit)
- [ ] Content für US-013 schreiben

**Ende Sprint:**
- [ ] Sprint Review moderieren
- [ ] User Stories abnehmen (DoD prüfen)
- [ ] Sprint 2 Planning vorbereiten

---

## Nächster Sprint (Vorschau)

**Sprint 2 Fokus:** Payment & Terminbuchung
**Key Stories:**
- US-003: Hol-/Bringzeitpunkt buchen
- US-011: Online-Bezahlung (Stripe)
- US-015: Slot-Management
- US-025: Jockey-Dashboard
- TECH-001: Stripe Payment Setup

**Vorbereitung:**
- Stripe Test-Account anlegen
- Slot-Management-Konzept finalisieren

---

**Sprint Owner:** Product Owner (Sten Rauch)
**Tech Lead:** [Name]
**Team:** [Namen]

**Let's ship this!**
