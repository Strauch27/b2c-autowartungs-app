# Sprint Plan Overview - MVP Launch

**Version:** 1.0
**Datum:** 2026-02-01
**Ziel:** Funktionsfähiger MVP nach 6 Sprints (12 Wochen)

---

## Executive Summary

**MVP Timeline:** 6 Sprints à 2 Wochen = 12 Wochen (3 Monate)
**Angenommene Velocity:** 35-40 Story Points pro Sprint
**Team-Annahme:** 2-3 Entwickler (Full-Stack oder Frontend + Backend)
**Must-Have Story Points gesamt:** ~158 SP (inkl. technische Stories)
**Launch-Ziel:** Voll funktionsfähiger Prototyp für Witten PoC

---

## Sprint-Übersicht

| Sprint | Dauer | Fokus | Story Points | Key Deliverables | Risiko |
|--------|-------|-------|--------------|------------------|--------|
| **Sprint 1** | Woche 1-2 | Fundament & Buchung | 36 SP | Landing Page, Login, Fahrzeugauswahl, Preiskalkulation | Mittel |
| **Sprint 2** | Woche 3-4 | Payment & Concierge Start | 31 SP | Stripe-Integration, Slot-Management, Jockey-Dashboard | Mittel |
| **Sprint 3** | Woche 5-6 | Concierge & Werkstatt Start | 29 SP | Übergabeprotokoll, Werkstatt-Dashboard, Fotos | Hoch |
| **Sprint 4** | Woche 7-8 | Auftragserweiterung | 29 SP | Angebot erstellen, Kunde freigibt, Payment-Erweiterung | Mittel |
| **Sprint 5** | Woche 9-10 | Odoo & Testing | 18 SP | Odoo-Integration, Bugfixes, E2E-Tests | Hoch |
| **Sprint 6** | Woche 11-12 | MVP Launch Prep | 15 SP | Finalisierung, Dokumentation, Go-Live Witten | Niedrig |

**Total:** 158 Story Points

---

## Sprint Goals

### Sprint 1: Fundament schaffen
**Sprint Goal:** "Kunde kann Fahrzeug auswählen, Service wählen und Festpreis sehen. Alle drei Login-Bereiche funktionieren."

**Warum wichtig:**
- Basis für alle weiteren Features
- Demo-Fähigkeit der Customer Journey
- Technische Architektur steht

**Definition of Done:**
- Kunde kann auf Landing Page zwischen 3 Bereichen wählen
- Login für Kunde/Jockey/Werkstatt funktioniert
- Fahrzeugauswahl mit Marke/Modell/Baujahr/KM funktioniert
- Festpreis wird korrekt nach Marke/Modell berechnet
- Alle Tests grün

---

### Sprint 2: Payment & Terminbuchung
**Sprint Goal:** "Kunde kann buchen, bezahlen und Termin wählen. Jockey sieht zugewiesene Touren."

**Warum wichtig:**
- Ohne Payment keine echte Buchung
- Slot-Management verhindert Doppelbuchungen
- Jockey-Portal ist Einstieg für Concierge-Service

**Definition of Done:**
- Stripe-Integration funktioniert (Test Mode)
- Kunde kann Termin aus verfügbaren Slots wählen
- Bezahlung erfolgreich abgeschlossen
- Jockey sieht zugewiesene Abholungen im Dashboard
- Buchungsbestätigung per E-Mail

---

### Sprint 3: Concierge-Service live
**Sprint Goal:** "Jockey kann Fahrzeug abholen, dokumentieren und zur Werkstatt bringen. Werkstatt sieht Aufträge."

**Warum wichtig:**
- Concierge ist Kern-Differenzierung
- Rechtliche Absicherung durch Übergabeprotokoll
- Werkstatt-Portal ist Einstieg für Auftragserweiterung

**Definition of Done:**
- Jockey kann Übergabeprotokoll erstellen (Fotos, Unterschrift)
- Fahrzeugzustand dokumentiert
- Werkstatt-Dashboard zeigt eingehende Aufträge
- Status-Updates funktionieren (Kunde wird informiert)

---

### Sprint 4: Digitale Auftragserweiterung
**Sprint Goal:** "Werkstatt kann Angebote erstellen. Kunde kann digital freigeben und zahlt automatisch."

**Warum wichtig:**
- Kern-USP der App ("Keiner in Deutschland hat das")
- Transparenz für Kunde
- Zusatzumsatz für Business

**Definition of Done:**
- Werkstatt kann Angebot mit Fotos erstellen
- Kunde erhält Benachrichtigung
- Kunde kann Angebot freigeben oder ablehnen
- Bei Freigabe: Automatische Zahlung via Stripe
- Werkstatt sieht Status (Freigegeben/Abgelehnt)

---

### Sprint 5: Integration & Testing
**Sprint Goal:** "Odoo-Integration funktioniert. Alle kritischen User Journeys sind getestet und bugfrei."

**Warum wichtig:**
- Odoo ist kritisch für Buchhaltung
- Testing verhindert Bugs im Launch
- Performance-Optimierung

**Definition of Done:**
- Odoo-Integration für Buchungen und Rechnungen funktioniert
- E2E-Tests für Haupt-User-Journeys grün
- Performance: Ladezeiten < 2 Sekunden
- Alle kritischen Bugs gefixt
- Code Review abgeschlossen

---

### Sprint 6: MVP Launch Vorbereitung
**Sprint Goal:** "Produkt ist produktionsreif für Witten-Pilot. Dokumentation vollständig. Team ist launch-ready."

**Warum wichtig:**
- Letzter Schliff vor Go-Live
- Stakeholder-Training
- Launch-Kommunikation

**Definition of Done:**
- Alle Must-Have Features vollständig
- User-Dokumentation vorhanden
- Werkstatt-Team in Witten geschult
- Launch-Plan steht (Marketing, Support)
- Monitoring & Error-Tracking aktiv

---

## Velocity & Kapazitätsplanung

### Annahmen

**Team-Größe:**
- 1 Full-Stack Developer (oder 1 Frontend + 1 Backend)
- 1 Product Owner (Teilzeit, 50%)
- Optional: 1 Designer (Teilzeit für Wireframes)

**Velocity:**
- Sprint 1-2: 35-40 SP (Ramp-up Phase)
- Sprint 3-5: 30-35 SP (stabile Velocity)
- Sprint 6: 15-20 SP (Finalisierung, weniger neue Features)

**Verfügbarkeit:**
- 10 Arbeitstage pro Sprint (2 Wochen)
- Abzüglich Meetings: ~8 produktive Tage
- Entwickler-Kapazität: 64 Stunden pro Sprint

**Story Point Kalkulation:**
- 1 SP ≈ 1-2 Stunden
- 3 SP ≈ 3-5 Stunden
- 5 SP ≈ 5-8 Stunden
- 8 SP ≈ 8-13 Stunden
- 13 SP ≈ 13-21 Stunden

---

## Kritische Pfade & Dependencies

### Must-Complete für nächsten Sprint

```
Sprint 1 → Sprint 2:
- US-020 (Landing Page) muss fertig sein → sonst keine Logins
- US-001 (Fahrzeugauswahl) muss fertig sein → sonst kein Buchungsprozess
- TECH-015 (Authentication) muss fertig sein → sonst keine Portale

Sprint 2 → Sprint 3:
- US-011 (Payment) muss fertig sein → sonst keine echten Buchungen
- US-015 (Slot-Management) muss fertig sein → sonst Doppelbuchungen
- US-022 (Jockey-Login) muss fertig sein → sonst kein Jockey-Portal

Sprint 3 → Sprint 4:
- US-028 (Übergabeprotokoll) muss fertig sein → sonst keine Abholungen
- US-033 (Werkstatt-Dashboard) muss fertig sein → sonst keine Auftragserweiterung

Sprint 4 → Sprint 5:
- US-008/US-035 (Auftragserweiterung) muss fertig sein → sonst fehlt USP
- TECH-001 (Stripe) muss vollständig sein → sonst keine Zahlungen

Sprint 5 → Sprint 6:
- US-016/TECH-004 (Odoo) muss fertig sein → sonst keine Buchhaltung
```

---

## Risiko-Management pro Sprint

### Sprint 1 Risiken

| Risiko | Wahrscheinlichkeit | Impact | Mitigation |
|--------|-------------------|--------|-----------|
| Multi-Portal Authentication zu komplex | Mittel | Hoch | Vereinfachte Auth im MVP, Tech Spike vorher |
| Preiskalkulation-Logik fehlerhaft | Mittel | Hoch | Frühe Tests, Pricing-Workshop mit Business |
| Team braucht Einarbeitungszeit | Hoch | Mittel | Onboarding-Session, Pair Programming |

### Sprint 2 Risiken

| Risiko | Wahrscheinlichkeit | Impact | Mitigation |
|--------|-------------------|--------|-----------|
| Stripe-Integration verzögert | Niedrig | Hoch | Früher Start, Stripe Test Mode nutzen |
| Slot-Management Race Conditions | Mittel | Hoch | Pessimistic Locking, Load Testing |
| Velocity überschätzt | Mittel | Mittel | Buffer einplanen, 31 SP statt 40 |

### Sprint 3 Risiken

| Risiko | Wahrscheinlichkeit | Impact | Mitigation |
|--------|-------------------|--------|-----------|
| Foto-Upload Performance | Mittel | Mittel | Bild-Komprimierung, max. 5 MB |
| Übergabeprotokoll UX zu komplex | Mittel | Hoch | User Testing mit Jockey, Wireframes |
| Unterschrift-Feature buggy | Niedrig | Mittel | Canvas API testen, Fallback: Checkbox |

### Sprint 4 Risiken

| Risiko | Wahrscheinlichkeit | Impact | Mitigation |
|--------|-------------------|--------|-----------|
| Auftragserweiterung UX unklar | Mittel | Hoch | Wireframes, Feedback von Werkstatt Witten |
| Payment-Erweiterung Stripe fehlschlägt | Niedrig | Hoch | Payment Intent Strategy, Error Handling |

### Sprint 5 Risiken

| Risiko | Wahrscheinlichkeit | Impact | Mitigation |
|--------|-------------------|--------|-----------|
| Odoo-Integration scheitert | Hoch | Kritisch | Tech Spike in Sprint 1, Fallback: Mock |
| Testing deckt kritische Bugs auf | Mittel | Hoch | Frühe E2E-Tests, Buffer für Bugfixes |

### Sprint 6 Risiken

| Risiko | Wahrscheinlichkeit | Impact | Mitigation |
|--------|-------------------|--------|-----------|
| Letzte Bugs verzögern Launch | Mittel | Hoch | Priorisierung: Blocker zuerst |
| Stakeholder-Training dauert länger | Niedrig | Mittel | Frühzeitige Schulung ab Sprint 5 |

---

## Milestones & Demo-Termine

### Sprint Review Demos

| Sprint | Demo-Termin | Demo-Inhalt | Teilnehmer |
|--------|-------------|-------------|-----------|
| **Sprint 1** | Ende Woche 2 | Landing Page, Login-Flows, Fahrzeugauswahl, Preiskalkulation | PO, Tech Lead, Stakeholder |
| **Sprint 2** | Ende Woche 4 | Kompletter Buchungsprozess inkl. Payment (Test Mode) | PO, Tech Lead, Business, Stakeholder |
| **Sprint 3** | Ende Woche 6 | Concierge-Service: Abholung, Übergabe, Werkstatt-Portal | PO, Werkstatt Witten, Jockey |
| **Sprint 4** | Ende Woche 8 | Digitale Auftragserweiterung End-to-End | PO, Werkstatt Witten, Stakeholder |
| **Sprint 5** | Ende Woche 10 | Odoo-Integration, vollständige User Journey | PO, CFO, Tech Lead |
| **Sprint 6** | Ende Woche 12 | **MVP Launch Review** - Produkt produktionsreif | Alle Stakeholder, Management |

### Wichtige Entscheidungspunkte

**Nach Sprint 2:**
- Go/No-Go: Ist Payment stabil genug für echte Transaktionen?
- Entscheidung: Azure-Migration nach MVP oder später?

**Nach Sprint 4:**
- Go/No-Go: Ist Auftragserweiterung UX gut genug?
- Entscheidung: Brauchen wir Sprint 7 für Should-Haves vor Launch?

**Nach Sprint 6:**
- Go/No-Go: MVP Launch in Witten
- Entscheidung: Welche Should-Haves in Sprint 7-8?

---

## Release Plan

### MVP Release (Ende Sprint 6)

**Datum:** Ende Woche 12
**Umfang:** Alle Must-Have Features (US-001 bis US-040 teilweise)
**Zielgruppe:** Witten PoC (ca. 50-100 Kunden in ersten 4 Wochen)

**Release-Kriterien:**
- Alle Must-Have Stories "Done"
- Keine Critical/Blocker Bugs
- Performance: Ladezeiten < 2 Sekunden
- E2E-Tests grün
- Stakeholder-Training abgeschlossen
- Support-Prozess definiert

**Launch-Strategie:**
- Soft Launch: Erste 2 Wochen nur limitierte Buchungen (5 pro Tag)
- Beta-Tester: 10 ausgewählte Kunden für Feedback
- Full Launch: Nach 2 Wochen Beta (wenn alles stabil)

---

### Post-MVP (Sprint 7-8)

**Fokus:** Should-Have Features
**Dauer:** 4 Wochen (2 Sprints)
**Story Points:** ~70 SP

**Hauptfeatures:**
- US-012: Light-Registrierung (Wiederbuchung)
- US-014: Weitere Services (TÜV, Bremse, Klima)
- US-017: Automatisches Jockey-Assignment
- US-029: Fahrzeugschein-Foto
- Optimierungen: Performance, UX-Improvements

---

### Expansion (ab Sprint 9)

**Ziel:** Skalierung auf weitere Städte
**Timeline:** Q2/Q3 2026

**Could-Have Features:**
- Multi-Werkstatt-Routing
- Weitere Standorte (Dortmund, Essen)
- Native Mobile App
- QR-Code Schnellbuchung
- Azure Cloud Migration

---

## Success Metrics (KPIs)

### Sprint-Level KPIs

| Metric | Ziel | Messung |
|--------|------|---------|
| Velocity | 35-40 SP/Sprint | Jira Burndown Chart |
| Sprint Goal Erreicht | 100% | Sprint Review |
| Code Coverage | > 70% | Unit Tests |
| Bugs gefunden | < 5 Critical/Sprint | Bug Tracking |
| Team Happiness | > 7/10 | Retro Survey |

### MVP Launch KPIs (nach Sprint 6)

| Metric | Ziel | Messung |
|--------|------|---------|
| Buchungsrate | 5-10 Buchungen/Woche | Analytics |
| Conversion Rate | > 20% | Funnel-Analyse |
| Payment Success Rate | > 95% | Stripe Dashboard |
| Kundenzufriedenheit | > 4.5/5 | Post-Service Survey |
| Auftragserweiterung Acceptance | > 30% | System-Tracking |
| Technical Uptime | > 99% | Monitoring |

### Business KPIs (nach 3 Monaten)

| Metric | Ziel | Messung |
|--------|------|---------|
| Total Bookings | 100+ | Odoo |
| Wiederbuchungsrate | > 25% | CRM |
| Durchschnittlicher Umsatz/Buchung | 250 EUR | Odoo |
| Customer Acquisition Cost | < 50 EUR | Marketing-Budget / Kunden |
| Net Promoter Score | > 50 | Survey |

---

## Team Ceremonies

### Daily Stand-up
- **Wann:** Jeden Tag, 9:00 Uhr
- **Dauer:** 15 Minuten
- **Format:** Was gemacht? Was heute? Blocker?

### Sprint Planning
- **Wann:** Erster Tag des Sprints
- **Dauer:** 2 Stunden
- **Output:** Sprint Backlog, Sprint Goal definiert

### Sprint Review / Demo
- **Wann:** Letzter Tag des Sprints
- **Dauer:** 1 Stunde
- **Teilnehmer:** Team + Stakeholder
- **Output:** Feedback, akzeptierte Stories

### Sprint Retrospective
- **Wann:** Letzter Tag des Sprints (nach Review)
- **Dauer:** 1 Stunde
- **Format:** Start/Stop/Continue
- **Output:** Action Items für nächsten Sprint

### Backlog Refinement
- **Wann:** Mitte des Sprints
- **Dauer:** 1 Stunde
- **Output:** Stories für nächsten Sprint geschätzt und "Ready"

---

## Kommunikationsplan

### Stakeholder-Updates

| Stakeholder | Frequenz | Format | Inhalt |
|-------------|----------|--------|--------|
| Management | Monatlich | Presentation | Status, Risks, Budget |
| Werkstatt Witten | Wöchentlich | Call | Features, Training, Feedback |
| Investor | Nach Sprint 3, 6 | Demo | Fortschritt, MVP-Readiness |
| Tech Team | Daily | Stand-up | Blocker, Progress |

### Eskalationsprozess

**Level 1: Blocker im Team**
- Ansprechpartner: Tech Lead
- Reaktionszeit: Sofort

**Level 2: Scope-Änderung nötig**
- Ansprechpartner: Product Owner
- Reaktionszeit: Innerhalb 24h

**Level 3: Budget/Timeline gefährdet**
- Ansprechpartner: Management
- Reaktionszeit: Innerhalb 48h

---

## Nächste Schritte

1. **Vor Sprint 1 Start:**
   - Team-Onboarding durchführen
   - Development-Environment aufsetzen
   - Sprint 1 Planning vorbereiten
   - Wireframes für US-020, US-001 erstellen

2. **Sprint 1 Kick-off:**
   - Sprint Planning (2h)
   - Tasks aufteilen
   - Tech Spike: Odoo API testen

3. **Während Sprint 1:**
   - Daily Stand-ups
   - Pair Programming für Authentication
   - Code Reviews
   - Sprint 2 vorbereiten (Backlog Refinement)

---

**Version Control:**
- Letzte Aktualisierung: 2026-02-01
- Nächstes Review: Nach Sprint 1
- Owner: Product Owner (Sten Rauch)
