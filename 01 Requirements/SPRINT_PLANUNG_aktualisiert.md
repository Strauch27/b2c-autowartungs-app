# Sprint-Planung: Aktualisierte Roadmap

**Version:** 1.1 (nach Stakeholder-Feedback Integration)
**Datum:** 2026-02-01
**Velocity-Annahme:** 18-20 Story Points pro Sprint (2 Wochen)

---

## Übersicht: MVP Sprints

| Sprint | Focus | Story Points | Wochen | Status |
|--------|-------|--------------|--------|--------|
| Sprint 1 | Core Booking + Landing Page | 20 SP | 1-2 | Geplant |
| Sprint 2 | Payment + Concierge + Jockey-Portal | 18 SP | 3-4 | Geplant |
| Sprint 3 | Auftragserweiterung + Werkstatt-Portal | 20 SP | 5-6 | Geplant |
| Sprint 4 | Weitere Services + Optimierung | 16 SP | 7-8 | Geplant |
| Sprint 5 | Testing + Bugfixing + Demo-Prep | 12 SP | 9-10 | Geplant |
| Sprint 6 | Polishing + Witten Pilot-Vorbereitung | 10 SP | 11-12 | Geplant |

**Gesamt:** ~96 Story Points (6 Sprints = 12 Wochen)

---

## Sprint 1: Core Booking + Landing Page (Wochen 1-2)

**Ziel:** Funktionierende Buchung mit Marke/Modell/Baujahr/Kilometerstand + Multi-Portal-Einstieg

### User Stories

| Story | Beschreibung | SP | Priorität |
|-------|-------------|----|-----------|
| **US-020** | Landing Page mit 3 Login-Bereichen | 8 | Must |
| **US-001** | Fahrzeugauswahl mit Pflichtfeldern (Marke, Modell, Baujahr, KM) | 8 | Must |
| **US-002** | Service-Auswahl (Inspektion als Hauptprodukt) | 5 | Must |

### Technische Stories

| Story | Beschreibung | SP | Priorität |
|-------|-------------|----|-----------|
| **TECH-014** | Lokales Deployment Setup (README, Docker Compose) | 8 | Must |
| **TECH-013** | Datenmodell & Entities (inkl. Marke/Modell-Preistabelle) | - | Must |

**Sprint 1 Total:** 29 SP
**Realistisch machbar:** 20 SP → **US-020, US-001, US-002, TECH-014** (TECH-013 ist Design, kein Dev)

### Deliverables Sprint 1
- ✅ Landing Page mit drei Login-Bereichen (sichtbar auf localhost:3000)
- ✅ Buchungsflow: Fahrzeug auswählen (4 Pflichtfelder) → Service wählen
- ✅ Marke/Modell-Preistabelle (initial 20 Fahrzeuge)
- ✅ Lokales Setup dokumentiert (README.md)
- ✅ Datenbank-Schema (PostgreSQL oder SQLite)

### Definition of Done Sprint 1
- Landing Page deployed (lokal)
- Fahrzeugauswahl funktioniert mit Validierung
- Preis wird korrekt nach Marke/Modell angezeigt
- Jeder Entwickler kann App lokal starten (via README)
- Code Review abgeschlossen

---

## Sprint 2: Payment + Concierge + Jockey-Portal (Wochen 3-4)

**Ziel:** Kompletter Buchungsflow mit Zahlung + Jockey kann Abholungen sehen

### User Stories

| Story | Beschreibung | SP | Priorität |
|-------|-------------|----|-----------|
| **US-003** | Hol-/Bringzeitpunkt buchen | 8 | Must |
| **US-004** | Festpreis-Anzeige nach Marke/Modell | 8 | Must |
| **US-011** | Online-Bezahlung (Stripe Test Mode) | 8 | Must |
| **US-021** | Jockey-Portal Dashboard | 5 | Must |

### Technische Stories

| Story | Beschreibung | SP | Priorität |
|-------|-------------|----|-----------|
| **TECH-001** | Stripe Payment Setup (Test Mode) | 8 | Must |
| **TECH-015** | Multi-Portal Authentication & RBAC | 13 | Must |
| **US-015** | Slot-Management für Witten | 8 | Must |

**Sprint 2 Total:** 58 SP
**Realistisch machbar:** 18 SP → **US-003, US-011, US-021** (TECH-001 und TECH-015 parallel)

### Deliverables Sprint 2
- ✅ Kompletter Buchungsflow: Fahrzeug → Service → Termin → Zahlung
- ✅ Stripe Test-Zahlung funktioniert
- ✅ Jockey-Portal: Login + Liste der Abholungen
- ✅ RBAC: Kunde, Jockey, Werkstatt getrennt
- ✅ Slot-Management (verfügbare Zeitslots)

### Definition of Done Sprint 2
- Test-Buchung kann durchgeführt werden
- Stripe Webhook empfangen (via Stripe CLI)
- Jockey sieht zugewiesene Abholungen
- Rollen funktionieren (Kunde sieht nicht Jockey-Portal)
- End-to-End Test: Buchung → Zahlung → Bestätigung

---

## Sprint 3: Auftragserweiterung + Werkstatt-Portal (Wochen 5-6)

**Ziel:** Digitale Auftragserweiterung vollständig implementiert

### User Stories

| Story | Beschreibung | SP | Priorität |
|-------|-------------|----|-----------|
| **US-008** | Werkstatt erstellt digitales Angebot | 8 | Must |
| **US-009** | Kunde gibt Angebot frei | 5 | Must |
| **US-010** | Zahlung bei Auftragserweiterung | 5 | Must |
| **US-022** | Werkstatt-Portal Dashboard | 8 | Must |

### Technische Stories

| Story | Beschreibung | SP | Priorität |
|-------|-------------|----|-----------|
| **TECH-002** | Stripe Subscription für Auftragserweiterung | 5 | Must |
| **TECH-016** | Odoo-Integration (Mock für MVP) | 13 | Must |

**Sprint 3 Total:** 44 SP
**Realistisch machbar:** 20 SP → **US-008, US-009, US-010, US-022**

### Deliverables Sprint 3
- ✅ Werkstatt-Portal: Auftrag sehen, Angebot erstellen
- ✅ Kunde erhält Angebot (E-Mail/Benachrichtigung)
- ✅ Kunde kann Angebot freigeben/ablehnen
- ✅ Nachzahlung funktioniert (Stripe)
- ✅ Odoo-Mock: JSON-Logs für Buchungen

### Definition of Done Sprint 3
- Werkstatt kann Angebot mit Foto erstellen
- Kunde sieht Angebot in Kunden-Portal
- Freigabe löst Zahlung aus
- Odoo-Mock loggt alle Transaktionen
- End-to-End Test: Auftragserweiterung-Flow

---

## Sprint 4: Weitere Services + Optimierung (Wochen 7-8)

**Ziel:** Produktportfolio erweitern, UX verbessern

### User Stories

| Story | Beschreibung | SP | Priorität |
|-------|-------------|----|-----------|
| **US-014** | Weitere Service-Angebote (TÜV, Bremse, Klima) | 3 | Should |
| **US-012** | Light-Registrierung (Magic Link) | 5 | Should |
| **US-005** | Ersatzfahrzeug durch Ronja-Fleet | 2 | Must |
| **US-006** | Fahrzeugübergabe durch Jockey | 3 | Must |
| **US-007** | Fahrzeugrückgabe mit Zusatzservice | 2 | Should |

**Sprint 4 Total:** 15 SP

### Deliverables Sprint 4
- ✅ TÜV, Bremsservice, Klimaservice buchbar
- ✅ Magic Link Login für Kunden
- ✅ Jockey-Prozess: Übergabe-Protokoll, Fotos

### Definition of Done Sprint 4
- Mehrere Services buchbar
- Kunden können sich ohne Passwort einloggen
- Jockey kann Fotos hochladen

---

## Sprint 5: Testing + Bugfixing (Wochen 9-10)

**Ziel:** Stabilität, Fehlerbereinigung, Performance

### Focus Areas
- End-to-End Testing (alle User Journeys)
- Bugfixing aus Sprints 1-4
- Performance-Optimierung (Ladezeiten)
- UX-Verbesserungen basierend auf internem Testing

### Deliverables Sprint 5
- ✅ Alle kritischen Bugs behoben
- ✅ Ladezeiten < 2 Sekunden
- ✅ Mobile Responsiveness getestet
- ✅ Dokumentation aktualisiert

**Sprint 5 Total:** 12 SP (Buffer für Bugfixes)

---

## Sprint 6: Polishing + Demo-Vorbereitung (Wochen 11-12)

**Ziel:** Demo-ready, Stakeholder-Präsentation vorbereiten

### Focus Areas
- Demo-Script erstellen (Customer Journey)
- Seed-Data für realistische Demo
- UI-Polishing (Icons, Farben, Texte)
- Stakeholder-Präsentation vorbereiten

### Deliverables Sprint 6
- ✅ Demo-Script (15 Min Walkthrough)
- ✅ Realistische Test-Daten
- ✅ Video-Walkthrough (optional)
- ✅ Stakeholder-Präsentation (PowerPoint/Keynote)

**Sprint 6 Total:** 10 SP

---

## Post-MVP: Sprint 7+ (Azure Cloud Migration)

**Nicht im initialen Scope, aber geplant:**

### Sprint 7-8: Azure Migration
- Refactoring für Azure App Service
- Azure SQL Database Setup
- CI/CD Pipeline (GitHub Actions)
- Production Deployment

### Sprint 9+: Skalierung
- Multi-Werkstatt-Routing
- Weitere Standorte (Dortmund, Essen)
- Native Mobile App (iOS/Android)
- Advanced Analytics

---

## Ressourcen-Planung

### Team-Setup
- **1x Frontend Developer** (React/Next.js)
- **1x Backend Developer** (Node.js/Python)
- **1x Product Owner** (Requirements, Prioritization)
- **Optional: 1x Designer** (UX/UI für Portale)

### Velocity-Tracking

| Sprint | Geplant | Tatsächlich | Velocity |
|--------|---------|-------------|----------|
| Sprint 1 | 20 SP | - | - |
| Sprint 2 | 18 SP | - | - |
| Sprint 3 | 20 SP | - | - |
| Sprint 4 | 15 SP | - | - |
| Sprint 5 | 12 SP | - | - |
| Sprint 6 | 10 SP | - | - |

**Ziel:** Durchschnittliche Velocity von 18 SP/Sprint erreichen

---

## Risiken & Abhängigkeiten

### Kritische Abhängigkeiten

| Abhängigkeit | Betroffene Sprints | Owner | Status |
|--------------|-------------------|-------|--------|
| Marke/Modell-Preistabelle | Sprint 1 | PO | ⏳ In Arbeit |
| Stripe Test-Account | Sprint 2 | Tech Lead | ⏳ Angefordert |
| Odoo-Zugang (später) | Sprint 3 | Finance | ❌ Noch nicht |
| Werkstatt Witten Feedback | Sprint 6 | Operations | ❌ Noch nicht |

### Risiko-Mitigation

| Risiko | Wahrscheinlichkeit | Impact | Mitigation | Verantwortlich |
|--------|-------------------|--------|-----------|----------------|
| Velocity niedriger als geplant | Mittel | Hoch | Buffer in Sprint 5-6, Scope-Reduktion möglich | PO |
| Marke/Modell-Preise zu komplex | Mittel | Mittel | Top 20 Fahrzeuge initial, Fallback "auf Anfrage" | PO |
| Stripe-Integration schwieriger | Niedrig | Hoch | Frühes Spike (Sprint 1), Stripe-Doku lesen | Tech Lead |
| Odoo-Mock nicht ausreichend | Niedrig | Mittel | JSON-Logging reicht für MVP | Tech Lead |

---

## Sprint Ceremonies

### Sprint Planning (Tag 1 jedes Sprints)
- **Dauer:** 2 Stunden
- **Teilnehmer:** PO, Entwickler, Tech Lead
- **Output:** Sprint Backlog finalisiert, Tasking durchgeführt

### Daily Standup (täglich)
- **Dauer:** 15 Min
- **Format:** Was gestern? Was heute? Blocker?

### Sprint Review (letzter Tag)
- **Dauer:** 1 Stunde
- **Teilnehmer:** Team + Stakeholder
- **Output:** Demo der fertigen Stories

### Sprint Retrospective (letzter Tag)
- **Dauer:** 1 Stunde
- **Teilnehmer:** Nur Team
- **Output:** Action Items für nächsten Sprint

---

## Erfolgs-Metriken

### Sprint-Level
- ✅ Alle Must-Have Stories abgeschlossen
- ✅ Definition of Done erfüllt
- ✅ Velocity stabil (±10% vom Plan)
- ✅ Keine kritischen Bugs

### MVP-Level
- ✅ Alle drei Portale funktionsfähig
- ✅ End-to-End Buchung funktioniert
- ✅ Stakeholder-Demo erfolgreich
- ✅ Technische Schulden < 20% der Codebase

---

## Nächste Schritte

### Diese Woche
1. ✅ Anforderungen finalisiert
2. ⏳ Marke/Modell-Preistabelle erstellen (PO)
3. ⏳ Sprint 1 Planning (Team)
4. ⏳ Entwicklungsumgebung setup (Tech Lead)

### Sprint 1 Woche 1
- US-020: Landing Page Design + Implementation
- US-001: Fahrzeugauswahl mit Validierung
- TECH-014: README.md schreiben, Docker Compose setup

### Sprint 1 Woche 2
- US-002: Service-Auswahl implementieren
- Testing + Bugfixing
- Sprint 1 Review + Retrospective

---

**Approved by:**
- Product Owner: ________________
- Tech Lead: ________________
- Date: 2026-02-01
