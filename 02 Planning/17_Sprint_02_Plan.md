# Sprint 2 Plan: Payment & Concierge Start

**Sprint:** 2 von 6
**Dauer:** 2 Wochen (Woche 3-4)
**Sprint Goal:** "Kunde kann buchen, bezahlen und Termin wählen. Jockey sieht zugewiesene Touren."
**Velocity Ziel:** 31 Story Points

---

## Sprint Objectives

### Primäres Ziel
Kompletten Buchungsprozess mit Payment implementieren. Kunde kann Termin wählen, bezahlen und Buchungsbestätigung erhalten.

### Sekundäres Ziel
Jockey-Portal aufsetzen mit Dashboard für zugewiesene Abholungen.

### Success Criteria
- Kunde kann vollständigen Buchungsprozess durchlaufen (Fahrzeug → Service → Termin → Payment)
- Stripe-Integration funktioniert im Test Mode
- Slot-Management verhindert Doppelbuchungen
- Jockey-Portal zeigt zugewiesene Touren an
- Buchungsbestätigung wird per E-Mail versendet

---

## User Stories in diesem Sprint

| Story ID | Story | Story Points | Priorität | Dependencies |
|----------|-------|--------------|-----------|--------------|
| **US-003** | Hol-/Bringzeitpunkt buchen | 8 | Critical | US-015 |
| **US-011** | Online-Bezahlung (Stripe) | 8 | Critical | TECH-001 |
| **US-015** | Slot-Management Witten | 8 | Critical | - |
| **US-005** | Ersatzfahrzeug-Bereitstellung | 2 | High | - |
| **US-025** | Jockey-Dashboard | 5 | Critical | US-022 |
| **US-026** | Auftrags-Details einsehen | 3 | High | US-025 |
| **US-027** | Navigation zur Abholadresse | 2 | High | US-026 |
| **TECH-001** | Stripe Payment Setup | 8 | Critical | - |

**Total:** 44 SP geplant (realistisch 31-35 SP schaffbar)

**Priorisierung:**
- **Must-Complete:** US-003, US-011, US-015, US-025, TECH-001
- **Should-Complete:** US-026, US-027, US-005
- **Nice-to-Have:** -

---

## Detaillierte Task-Breakdown

### TECH-001: Stripe Payment Setup (8 SP)

**Tasks:**
1. Stripe Test-Account einrichten
2. Stripe SDK installieren (Backend + Frontend)
3. Stripe Payment Intent erstellen (Backend)
4. Checkout-Flow implementieren (Frontend)
5. Webhook-Endpoint für payment_intent.succeeded
6. Stripe CLI für lokale Webhook-Tests
7. Error Handling (abgelehnte Karten)
8. Unit-Tests

**Akzeptanzkriterien:**
- Stripe Test Mode funktioniert
- Kunde kann mit Test-Karte zahlen
- Webhook wird empfangen und verarbeitet
- Bei Fehler: Fehlermeldung und Retry-Option

---

### US-015: Slot-Management Witten (8 SP)

**Tasks:**
1. Slot-Datenmodell erstellen (DB-Tabelle)
2. Admin-Interface: Slots konfigurieren (Öffnungszeiten, Kapazität)
3. API: Verfügbare Slots abfragen
4. Concurrency Handling: Pessimistic Locking bei Buchung
5. Frontend: Kalender-Widget mit verfügbaren Slots
6. Real-Time Updates (Polling alle 30 Sek)
7. Geschlossene Tage markieren (Feiertage)

**Akzeptanzkriterien:**
- Admin kann Slots für Witten konfigurieren
- Kunde sieht nur verfügbare Slots
- Ausgebuchte Slots sind ausgegraut
- Doppelbuchungen werden verhindert

---

### US-003: Hol-/Bringzeitpunkt buchen (8 SP)

**Tasks:**
1. Frontend: Termin-Auswahl-Screen
2. Backend: Slot-Reservation Logic
3. Adress-Eingabe (Abholung + Rückgabe)
4. PLZ-Radius-Check (Servicegebiet Witten)
5. Telefonnummer-Eingabe (für Jockey-Kontakt)
6. Zusammenfassung vor Payment
7. Integration mit US-015 (Slot-Management)

**Akzeptanzkriterien:**
- Kunde kann Zeitslot wählen
- Abholadresse und Rückgabeadresse eingeben
- PLZ außerhalb Servicegebiet → Fehlermeldung
- Slot wird für 10 Min reserviert (während Checkout)

---

### US-011: Online-Bezahlung (Stripe) (8 SP)

**Tasks:**
1. Frontend: Checkout-Seite mit Stripe Elements
2. Backend: Payment Intent erstellen
3. Payment-Flow: Redirect zu Stripe Checkout (oder Embedded)
4. Erfolgreiche Zahlung: Buchung bestätigen
5. Fehlgeschlagene Zahlung: Retry-Logic
6. Rechnung generieren (PDF) - Basic
7. E-Mail: Buchungsbestätigung mit Rechnung
8. Odoo-Mock-Integration (JSON-Log statt echte API)

**Akzeptanzkriterien:**
- Kunde kann mit Kreditkarte (Test Mode) zahlen
- Bei Erfolg: Buchungsbestätigung per E-Mail
- Bei Fehler: Fehlermeldung und andere Zahlungsmethode wählen
- Buchung wird in DB gespeichert

---

### US-025: Jockey-Dashboard (5 SP)

**Tasks:**
1. Frontend: Jockey-Dashboard Layout
2. Backend: API für zugewiesene Touren
3. Liste: Heutige Abholungen (sortiert nach Zeit)
4. Liste: Heutige Rückgaben
5. Status-Anzeige (Offen, Unterwegs, Abgeschlossen)
6. Auto-Refresh (alle 5 Min oder WebSocket)
7. Mobile-Responsive (Jockey nutzt Smartphone)

**Akzeptanzkriterien:**
- Jockey sieht alle heutigen Touren
- Jeder Tour hat Status-Badge
- "Details anzeigen" und "Navigation starten" Buttons vorhanden
- Dashboard aktualisiert sich automatisch

---

### US-026: Auftrags-Details einsehen (3 SP)

**Tasks:**
1. Frontend: Detail-Seite für Tour
2. Kundendaten anzeigen (Name, Telefon, Adresse)
3. Fahrzeugdaten anzeigen
4. Service-Art anzeigen
5. Click-to-Call: Telefonnummer klickbar
6. "Navigation starten" Button

**Akzeptanzkriterien:**
- Jockey kann alle relevanten Infos sehen
- Telefonnummer ist klickbar (öffnet Phone-App)
- Zurück-Button zum Dashboard

---

### US-027: Navigation zur Abholadresse (2 SP)

**Tasks:**
1. Deep-Link zu Google Maps (Android) / Apple Maps (iOS)
2. Adresse in URL einbetten
3. Fallback: Webbasierte Google Maps

**Akzeptanzkriterien:**
- Klick auf "Navigation starten" öffnet Maps-App
- Zieladresse ist vorausgefüllt

---

### US-005: Ersatzfahrzeug-Bereitstellung (2 SP)

**Tasks:**
1. Konzept dokumentieren (wie wird Ersatzfahrzeug zugewiesen?)
2. Backend: Ersatzfahrzeug-Tabelle (Vehicle-Pool)
3. Jockey bekommt Info: "Ersatzfahrzeug: [Kennzeichen]"
4. Hinweis im Jockey-Dashboard

**Akzeptanzkriterien:**
- Jockey sieht, welches Ersatzfahrzeug er mitbringen soll
- (Physischer Prozess, kein Software-Feature im MVP)

---

## Sprint Backlog Timeline

### Day 1-2: Stripe Setup & Slot-Management Start
- [ ] TECH-001: Stripe-Account + SDK-Setup
- [ ] US-015: Slot-Datenmodell
- [ ] US-015: Admin-Interface (Basic)

### Day 3-4: Slot-Management & Terminbuchung
- [ ] US-015: API für verfügbare Slots
- [ ] US-003: Termin-Auswahl-Frontend
- [ ] US-003: Adress-Eingabe
- [ ] US-003: PLZ-Check

### Day 5-6: Payment-Integration
- [ ] TECH-001: Payment Intent + Checkout
- [ ] US-011: Frontend Checkout-Seite
- [ ] TECH-001: Webhook-Endpoint
- [ ] US-011: E-Mail Buchungsbestätigung

### Day 7-8: Jockey-Portal
- [ ] US-025: Jockey-Dashboard bauen
- [ ] US-026: Detail-Seite
- [ ] US-027: Navigation-Integration
- [ ] US-005: Ersatzfahrzeug-Konzept

### Day 9-10: Testing & Finalisierung
- [ ] End-to-End Test: Kompletter Buchungsprozess
- [ ] Stripe Test-Szenarien (Erfolg, Fehler, Retry)
- [ ] Bugfixes
- [ ] Sprint Review vorbereiten

---

## Definition of Done

Siehe Sprint 1 DoD + zusätzlich:
- [ ] Payment-Flow mit Stripe Test Mode funktioniert
- [ ] Keine Race Conditions bei Slot-Buchung (Load-Test)
- [ ] E-Mail-Versand funktioniert (lokal oder Test-Service)
- [ ] Jockey-Portal mobile-responsive

---

## Risks & Mitigation

| Risiko | Wahrscheinlichkeit | Impact | Mitigation |
|--------|-------------------|--------|-----------|
| Stripe-Integration verzögert | Niedrig | Hoch | Früher Start, Stripe-Dokumentation gründlich lesen |
| Slot-Management Race Conditions | Mittel | Hoch | Pessimistic Locking, Load-Test |
| E-Mail-Service lokal funktioniert nicht | Mittel | Mittel | Fallback: Console-Log, später echten Service |
| Velocity zu hoch geschätzt | Mittel | Mittel | US-005, US-027 optional |

---

## Deliverables

**Funktional:**
- Kompletter Buchungsprozess (Fahrzeug → Termin → Payment)
- Stripe-Payment funktioniert (Test Mode)
- Jockey-Dashboard mit heutigen Touren
- Buchungsbestätigung per E-Mail

**Technisch:**
- Stripe SDK integriert
- Slot-Management-System live
- E-Mail-Service konfiguriert
- Jockey-Portal responsive

---

## Sprint Ceremonies

- **Sprint Planning:** Tag 1, 9:00 Uhr (2h)
- **Daily Stand-up:** Jeden Tag, 9:00 Uhr (15 Min)
- **Backlog Refinement:** Tag 5, 14:00 Uhr (1h) - Sprint 3 vorbereiten
- **Sprint Review:** Tag 10, 15:00 Uhr (1h)
- **Sprint Retrospective:** Tag 10, 16:00 Uhr (1h)

---

## Action Items für Product Owner

**Vor Sprint:**
- [ ] Stripe Test-Account mit Team teilen
- [ ] Slot-Konfiguration für Witten festlegen (Öffnungszeiten, Kapazität)
- [ ] E-Mail-Templates für Buchungsbestätigung schreiben

**Während Sprint:**
- [ ] Payment-Flow testen (mit Test-Karten)
- [ ] Feedback zu Jockey-Dashboard UX geben

**Ende Sprint:**
- [ ] Demo: Komplette Buchung durchführen (Live)

---

**Nächster Sprint:** Sprint 3 - Concierge & Werkstatt Start
**Key Focus:** Übergabeprotokoll, Werkstatt-Dashboard, Fotos
