# Product Backlog Summary - B2C Autowartungs-App

**Version:** 1.0
**Datum:** 2026-02-01
**Product Owner:** Sten Rauch
**Projekt:** B2C Autowartungs-App mit Festpreis-USP und Concierge-Service

---

## Executive Summary

Dieses Product Backlog dokumentiert alle Anforderungen für die B2C Autowartungs-App basierend auf dem Meeting vom 23.01.2026. Die App differenziert sich durch:

1. **Festpreis-Garantie:** Kunde zahlt nur, was er bucht - keine Überraschungen
2. **Concierge-Service:** Hol- und Bringservice mit Ronja-Ersatzfahrzeug
3. **Digitale Auftragserweiterung:** Transparente Zusatzangebote mit Foto-Dokumentation

**Strategie:** Start in Witten als Pilotmarkt, später deutschlandweit skalierbar.

---

## Dokumentenstruktur

| Dokument | Beschreibung | Zielgruppe |
|----------|-------------|-----------|
| [00_Product_Vision.md](./00_Product_Vision.md) | Produktvision, Business Case, Zielgruppe | Stakeholder, Management |
| [01_Epics.md](./01_Epics.md) | High-Level Epics und übergeordnete Stories | PO, Team, Stakeholder |
| [02_MVP_User_Stories.md](./02_MVP_User_Stories.md) | Detaillierte MVP User Stories mit Akzeptanzkriterien | Development Team, PO |
| [03_MoSCoW_Priorisierung.md](./03_MoSCoW_Priorisierung.md) | Must/Should/Could/Won't-Have Priorisierung | PO, Stakeholder |
| [04_Technische_Integration_Stories.md](./04_Technische_Integration_Stories.md) | Technische Integration (Payment, Odoo, etc.) | Tech Lead, Dev Team |
| **05_Product_Backlog_Summary.md** | **Dieses Dokument: Übersicht und Roadmap** | **Alle** |

---

## MVP-Scope (Sprint 1-3)

### Must-Have Features

| Epic | User Stories | Story Points | Business Value (1-10) | Risiko |
|------|-------------|--------------|---------------------|--------|
| **Buchungsprozess** | US-001 bis US-004 | 18 SP | 10/10 (Kern-Funktion) | Mittel |
| **Concierge-Service** | US-005 bis US-007 | 7 SP | 9/10 (Haupt-USP) | Niedrig |
| **Digitale Auftragserweiterung** | US-008 bis US-010 | 18 SP | 10/10 (Einzigartig) | Hoch |
| **Payment & Registrierung** | US-011, US-012 | 13 SP | 10/10 (Kritisch) | Mittel |
| **Service-Angebot** | US-013 | 2 SP | 8/10 (Hauptprodukt) | Niedrig |
| **Technische Integration** | TECH-001, TECH-004, TECH-006 | 29 SP | 9/10 (Infrastruktur) | Hoch |

**Gesamt MVP:** ~85 Story Points (ca. 4-5 Sprints à 15-20 SP)

---

## Sprint-Roadmap

### Sprint 1: Buchungs-Flow Foundation (15 SP)

**Ziel:** Kunde kann Service auswählen und Festpreis sehen (ohne Payment)

| Story | Beschreibung | SP | Status |
|-------|-------------|----|----|
| US-001 | 3-Klick Fahrzeugauswahl | 5 | To Do |
| US-002 | Service-Auswahl (Ölservice) | 3 | To Do |
| US-004 | Festpreis-Anzeige nach Fahrzeugklassen | 5 | To Do |
| US-013 | Ölservice-Paket definieren | 2 | To Do |

**Deliverable:** Klickbarer Prototyp (Wireframe + Frontend) ohne Backend

---

### Sprint 2: Payment & Slot-Management (20 SP)

**Ziel:** Kunde kann buchen, bezahlen und Termin wählen

| Story | Beschreibung | SP | Status |
|-------|-------------|----|----|
| US-003 | Hol-/Bring-Buchung | 8 | To Do |
| US-011 | Online-Bezahlung (Stripe) | 8 | To Do |
| TECH-001 | Stripe Payment Setup | 8 | To Do |
| TECH-006 | Slot-Management Witten | 8 | To Do |
| US-005 | Ersatzfahrzeug-Prozess | 2 | To Do |

**Deliverable:** Funktionsfähiger Buchungs-Flow (Ende-zu-Ende ohne Auftragserweiterung)

**Technische Abhängigkeiten:**
- Stripe Test-Account einrichten
- Slot-Datenbank aufsetzen

---

### Sprint 3: Auftragserweiterung & Odoo (25 SP)

**Ziel:** Werkstatt kann digitale Angebote senden, Kunde kann freigeben, Odoo-Integration läuft

| Story | Beschreibung | SP | Status |
|-------|-------------|----|----|
| US-008 | Werkstatt erstellt digitales Angebot | 8 | To Do |
| US-009 | Kunde gibt Angebot frei | 5 | To Do |
| US-010 | Zahlung Auftragserweiterung | 5 | To Do |
| TECH-004 | Odoo Real-Time Sync | 13 | To Do |
| US-006 | Fahrzeugübergabe durch Jockey | 3 | To Do |
| US-007 | Fahrzeugrückgabe mit Extras | 2 | To Do |

**Deliverable:** MVP-komplett - bereit für internes Testing

**Risiko-Mitigation:**
- Odoo-Integration: 1 Tag Spike vor Sprint 3 (klären: API-Zugang, Testumgebung)
- Werkstatt-System: Witten-Team interviewen (welches System nutzen sie?)

---

### Sprint 4-5: Post-MVP & Witten-Pilot (18 SP)

**Ziel:** Weitere Services, UX-Verbesserungen, Go-Live Vorbereitung

| Story | Beschreibung | SP | Status |
|-------|-------------|----|----|
| US-012 | Light-Registrierung (Magic Link) | 5 | To Do |
| US-014 | Weitere Services (TÜV, Bremse, Klima) | 3 | To Do |
| TECH-017 | Jockey-Assignment | 8 | To Do |
| - | Bugfixing & UX-Optimierung | 10 | To Do |
| - | Marketing-Vorbereitung (Landing Page, Ads) | - | To Do |

**Deliverable:** Beta-Launch in Witten (50 Kunden)

---

## Key Performance Indicators (KPIs)

### Success Metrics für MVP

| Metrik | Ziel | Messweise |
|--------|------|-----------|
| **Conversion Rate** | > 20% (Besucher → Buchung) | Google Analytics |
| **Durchschnittlicher Warenkorb** | 199 EUR | Stripe Dashboard |
| **Auftragserweiterung Acceptance Rate** | > 40% | App-Analytics |
| **Customer Satisfaction (NPS)** | > 50 | Post-Service Survey |
| **No-Show Rate** | < 5% | Booking-Dashboard |
| **Wiederbuchungs-Rate (3 Monate)** | > 15% | CRM |

### Business KPIs (nach 3 Monaten Witten-Pilot)

| Metrik | Ziel | Begründung |
|--------|------|-----------|
| **Buchungen/Monat** | 50-100 | Validierung: Produkt funktioniert |
| **Revenue/Monat** | 10.000-20.000 EUR | Break-Even bei ca. 15.000 EUR |
| **Customer Acquisition Cost (CAC)** | < 50 EUR | Bei organischem Wachstum / Social Media |
| **Avg. Rating (Google)** | > 4.5 Sterne | Trust-Building für Skalierung |

---

## Risiko-Management

### Kritische Risiken (Top 5)

| Risiko | Wahrscheinlichkeit | Impact | Mitigation | Owner |
|--------|-------------------|--------|-----------|-------|
| **Digitale Auftragserweiterung wird nicht genutzt** | Mittel | Hoch | User-Testing vor Launch, Tutorial/Onboarding | PO |
| **Concierge-Kosten zu hoch (Negative Marge)** | Hoch | Hoch | Preiskalkulation mit Witten validieren, ggf. Concierge-Aufpreis ab Sprint 4 | PO/Finance |
| **Odoo-Integration funktioniert nicht** | Mittel | Hoch | Tech Spike vor Sprint 3, Fallback: Manueller CSV-Export | Tech Lead |
| **Werkstatt Witten überlastet** | Mittel | Mittel | Konservative Slot-Limits, Kapazitätsplanung mit Witten | Ops |
| **Payment-Ausfälle (Stripe)** | Niedrig | Hoch | Backup Payment (PayPal), Error-Handling, Monitoring | Tech Lead |

---

## Offene Fragen (Product Backlog Refinement)

### Must-Klären vor Sprint 1

| Frage | Verantwortlich | Deadline |
|-------|---------------|----------|
| Finaler Brand-Name? (Nicht "Ronja B2C") | Marketing/PO | Vor Sprint 1 |
| Welches Werkstatt-System nutzt Witten? (GMS, DMS, anderes?) | PO/Ops | Vor Sprint 3 |
| Odoo-API-Zugang vorhanden? Test-Umgebung? | Tech Lead | Vor Sprint 3 |
| Konkrete Preise für Ölservice nach Fahrzeugklassen? | Finance/Ops | Vor Sprint 1 |

### Should-Klären vor Sprint 2

| Frage | Verantwortlich | Deadline |
|-------|---------------|----------|
| Storno-Bedingungen? (24h kostenlos, danach 50%?) | Legal/PO | Vor Sprint 2 |
| Versicherung für Ersatzfahrzeuge geklärt? | Ops/Legal | Vor Sprint 2 |
| Corporate Partnerships (MHC, Shell) für Trust-Building? | Marketing/PO | Vor Launch |

### Could-Klären vor Sprint 4+

| Frage | Verantwortlich | Deadline |
|-------|---------------|----------|
| Finanzierung/Ratenzahlung anbieten? (Klarna, PayPal Pay Later) | Finance/PO | Q2 2026 |
| Multi-Fahrzeug-Haushalt: Datenmodell? | Tech Lead | Sprint 6 |
| White-Label für andere Werkstätten? (B2B2C-Pivot?) | PO/Management | Q3 2026 |

---

## Abhängigkeiten & Blocker

### Technische Abhängigkeiten

```
Sprint 1 (Frontend)
    ↓
Sprint 2 (Payment + Slot-Management) ← Stripe Account nötig
    ↓
Sprint 3 (Auftragserweiterung + Odoo) ← Odoo-Zugang nötig, Werkstatt-System-Klärung
    ↓
Sprint 4 (Jockey-Assignment) ← Driver-App-Erweiterung
```

### Externe Abhängigkeiten

- **Stripe:** Account beantragen (dauert 1-2 Wochen mit KYC)
- **Odoo:** Zugang zur Produktiv-Instanz (IT-Team einbinden)
- **Werkstatt Witten:** Kapazitätszusage, System-Zugang klären
- **Ronja-Flotte:** 7-8 Ersatzfahrzeuge in Witten verfügbar?
- **Legal:** AGB, Datenschutz, Impressum (vor Launch)

---

## Stakeholder-Kommunikation

### Wöchentliche Updates (während Sprint)

**An:** Amjad (Management), Andreas (Tech Lead), Hüseyin (Ops), Thomas (Strategie)

**Inhalt:**
- Sprint-Fortschritt (Burndown)
- Completed Stories
- Blocker / Risiken
- Nächste Schritte

**Format:** E-Mail + kurzes Stand-Up (15 Min)

---

### Sprint Review (alle 2 Wochen)

**An:** Alle Stakeholder + Werkstatt Witten (ab Sprint 2)

**Inhalt:**
- Demo der neuen Features
- Feedback einholen
- Backlog-Anpassungen besprechen

**Format:** 1h Meeting (remote oder vor Ort)

---

### Monatliches Status-Update

**An:** Management (Amjad)

**Inhalt:**
- Delivered Value (welche Features sind live?)
- Current Sprint Focus
- Next Priorities (nächste 2 Sprints)
- Risks & Escalations
- Budget-Status (wenn relevant)

**Format:** Executive Summary (1 Seite) + 30 Min Meeting

---

## Definition of Ready (DoR)

Eine Story ist "Ready" für Sprint Planning, wenn:

- [ ] User Story im Format: "Als [Rolle] möchte ich [Funktion], damit [Nutzen]"
- [ ] Akzeptanzkriterien definiert (Given-When-Then)
- [ ] Story Points geschätzt (Planning Poker)
- [ ] Abhängigkeiten identifiziert
- [ ] UX/Design-Mockups vorhanden (falls UI-lastig)
- [ ] Technische Risiken besprochen (Tech Lead Input)
- [ ] PO hat Story priorisiert (Must/Should/Could)

---

## Definition of Done (DoD)

Eine Story ist "Done", wenn:

- [ ] Code implementiert und in Feature-Branch gepusht
- [ ] Unit Tests geschrieben (min. 80% Coverage für kritische Logik)
- [ ] Code Review durchgeführt (min. 1 Reviewer Approval)
- [ ] Akzeptanzkriterien erfüllt (alle Given-When-Then getestet)
- [ ] Integration Tests erfolgreich (falls applicable)
- [ ] Deployed auf Staging-Environment
- [ ] PO hat Story abgenommen (Acceptance Test)
- [ ] Dokumentation aktualisiert (falls API/System-Änderung)
- [ ] Keine kritischen Bugs offen

---

## Nächste Schritte (Action Items)

### Sofort (diese Woche)

- [ ] **PO:** Finalisierten Brand-Name entscheiden (statt "Ronja B2C")
- [ ] **Tech Lead:** Stripe Test-Account einrichten
- [ ] **PO:** Witten-Team interviewen (Werkstatt-System klären)
- [ ] **Finance:** Preiskalkulation für Ölservice nach Fahrzeugklassen (Kleinwagen bis SUV)
- [ ] **Marketing:** Corporate Partnership MHC kontaktieren (Trust-Siegel)

### Nächste Woche

- [ ] **Team:** Sprint Planning für Sprint 1 (Stories aufteilen, Tasks definieren)
- [ ] **Designer:** Wireframes für US-001 bis US-004 erstellen
- [ ] **Tech Lead:** Tech Spike: Odoo API testen (1 Tag)
- [ ] **Legal:** AGB-Entwurf (Storno-Bedingungen, Haftung)

### Vor Sprint 3

- [ ] **Tech Lead:** Odoo-Integration vorbereiten (Test-Umgebung, API-Keys)
- [ ] **PO:** Werkstatt-Portal Requirements mit Witten abstimmen
- [ ] **Ops:** Jockey-Verfügbarkeit für Pilotphase sichern (7-8 Fahrer)

---

## Backlog Grooming Cadence

**Alle 2 Wochen (1h Session):**

- Neue Stories erstellen (aus Feedback, Ideen)
- Veraltete Stories löschen/archivieren
- Stories verfeinern (Acceptance Criteria präzisieren)
- Abhängigkeiten aktualisieren
- Priorisierung reviewen (MoSCoW anpassen)

**Teilnehmer:** PO, Tech Lead, 1-2 Dev-Team-Mitglieder

---

## Langfristige Roadmap (Post-MVP)

### Q2 2026: Witten-Pilot & Optimierung

- Beta-Launch mit 50-100 Kunden
- UX-Optimierungen basierend auf Feedback
- Weitere Services (TÜV, Bremse, Klima)
- Google-Bewertungen sammeln (Ziel: 4.5+ Sterne)

### Q3 2026: Skalierung auf weitere Städte

- Dortmund, Essen (Ruhrgebiet)
- Multi-Werkstatt-Routing
- Native Mobile App (iOS/Android)
- Referral-Programm ("Freunde werben")

### Q4 2026: Deutschlandweite Expansion

- Top 10 Städte (Berlin, Hamburg, München, Köln, etc.)
- Corporate Partnerships (MHC, Shell, etc.)
- Abo-Modell / Subscription testen
- KI-basierte Preis-Optimierung

### 2027: Premium-Features & New Business Models

- E-Auto-Services (Hochvolt-Checks)
- White-Label für Werkstätten (B2B2C)
- Loyalty-Programm
- Internationale Expansion (Österreich, Schweiz)

---

## Lessons Learned (aus Meeting-Transcript)

### Was funktioniert schon (Learnings aus Ronja B2B):

- Concierge-Service wird gut angenommen (Driver-App funktioniert)
- Festpreis-Modell im B2B erfolgreich
- Odoo-Integration technisch machbar (bereits im Einsatz)

### Was vermeiden (Learnings aus Werkstatt-Portal):

- Zu komplexe Inspektion-Varianten (Nutzer sind überfordert)
- Fahrzeugauswahl zu kompliziert (Conversion-Killer)
- Fehlende Transparenz bei Auftragserweiterungen (führt zu schlechten Reviews)

### Was testen (neue Hypothesen):

- B2C-Nutzer akzeptieren digitale Auftragserweiterung? (bisher nur B2B)
- Concierge-Service rechtfertigt Premium-Preis? (oder zu teuer?)
- Festpreis nach Fahrzeugklassen funktioniert ohne Verluste? (Mischkalkulation)

---

## Anhang: Meeting-Insights

**Wichtigste Zitate aus dem Transcript:**

> "Der USP ist nicht Concierge, sondern Festpreis-Garantie. Du bezahlst nur, was du buchst. Das hat keiner in Deutschland." - Thomas (Speaker 3)

> "Digitale Auftragserweiterung ist der größte Hebel. Kein OEM, kein Aftermarket hat das." - Thomas

> "Mit Ronja-Ersatzfahrzeugen fahren Kunden Werbung für uns, ohne es zu wissen." - Thomas (viraler Marketing-Effekt)

> "3 Klicks: Marke, Modell, Baujahr. Das weiß jeder Kunde. Keine VIN, keine Schlüsselnummer." - Hüseyin (Speaker 4)

> "Wir müssen den Kunden führen. Sobald er in die Werkstatt fährt (ohne Concierge), verlieren wir die Kontrolle." - Thomas

**Business-Entscheidungen:**

- Start nur in Witten (Pilotmarkt)
- Fokus auf Ölservice (NICHT komplexe Inspektion)
- Concierge ist Must-Have (nicht optional)
- Festpreis nach Fahrzeugklassen (wie ATU-Modell)
- Vorkasse (kein Zahlen bei Abholung)

---

**Product Owner:** Sten Rauch
**Letzte Aktualisierung:** 2026-02-01
**Nächstes Review:** Nach Sprint 1 (ca. 2 Wochen)

---

## Kontakt & Fragen

Für Rückfragen zum Product Backlog:
- **Product Owner:** Sten Rauch
- **Tech Lead:** Andreas
- **Operations:** Hüseyin
- **Strategie:** Thomas

**Backlog-Tool:** (noch zu klären - Jira, Linear, Notion?)
**Dokumentation:** GitHub `/01 Requirements/`
