# Product Backlog - Complete

**Version:** 1.0
**Datum:** 2026-02-01
**Status:** Ready for Sprint Planning
**Total Story Points:** ~250 SP (MVP + Post-MVP)

---

## Backlog-Übersicht

| Kategorie | Anzahl Stories | Story Points | Status |
|-----------|---------------|--------------|--------|
| Must-Have (MVP) | 35 | 158 SP | Sprint 1-6 |
| Should-Have (Post-MVP) | 10 | 70 SP | Sprint 7-8 |
| Could-Have (Later) | 10+ | 80+ SP | Q2/Q3 2026 |
| **Total** | **55+** | **308+ SP** | - |

---

## Product Backlog (Priorisiert)

### MUST-HAVE - Sprint 1-6 (MVP)

#### Sprint 1: Fundament & Buchung (36 SP)

| ID | Story | SP | Dependencies | Status |
|----|-------|----|--------------| -------|
| US-020 | Landing Page mit drei Login-Bereichen | 5 | - | Not Started |
| US-021 | Kunden-Login (Magic Link) | 5 | US-020 | Not Started |
| US-022 | Jockey-Login (Username/Password) | 3 | US-020 | Not Started |
| US-023 | Werkstatt-Login (Username/Password) | 3 | US-020 | Not Started |
| US-024 | Session Management & Logout | 2 | US-021/22/23 | Not Started |
| US-001 | Fahrzeugauswahl mit Pflichtfeldern | 8 | US-020 | Not Started |
| US-002 | Service-Auswahl | 5 | US-001 | Not Started |
| US-004 | Festpreis nach Marke/Modell | 8 | US-001 | Not Started |
| US-013 | Inspektion/Wartung als Hauptprodukt | 2 | US-002 | Not Started |
| US-019 | Kilometerstand als Pflichtfeld | - | US-001 | Not Started |
| TECH-014 | Lokales Deployment Setup | 8 | - | Not Started |
| TECH-015 | Multi-Portal Authentication & RBAC | 13 | TECH-014 | Not Started |

**Sprint 1 Total:** 62 SP geplant → 36-40 SP realistisch

---

#### Sprint 2: Payment & Concierge Start (31 SP)

| ID | Story | SP | Dependencies | Status |
|----|-------|----|--------------| -------|
| US-003 | Hol-/Bringzeitpunkt buchen | 8 | US-015 | Not Started |
| US-011 | Online-Bezahlung (Stripe) | 8 | TECH-001 | Not Started |
| US-015 | Slot-Management Witten | 8 | - | Not Started |
| US-005 | Ersatzfahrzeug-Bereitstellung | 2 | - | Not Started |
| US-025 | Jockey-Dashboard | 5 | US-022 | Not Started |
| US-026 | Auftrags-Details einsehen | 3 | US-025 | Not Started |
| US-027 | Navigation zur Abholadresse | 2 | US-026 | Not Started |
| TECH-001 | Stripe Payment Setup | 8 | - | Not Started |

**Sprint 2 Total:** 44 SP geplant → 31-35 SP realistisch

---

#### Sprint 3: Concierge & Werkstatt Start (29 SP)

| ID | Story | SP | Dependencies | Status |
|----|-------|----|--------------| -------|
| US-006 | Fahrzeugübergabe mit Protokoll | 3 | US-025 | Not Started |
| US-028 | Übergabeprotokoll erstellen (digital) | 8 | US-025 | Not Started |
| US-030 | Fahrzeugzustand dokumentieren (Fotos) | 5 | US-028 | Not Started |
| US-031 | Status-Updates senden | 5 | US-028 | Not Started |
| US-033 | Werkstatt-Dashboard | 5 | US-023 | Not Started |
| US-034 | Auftrags-Details | 3 | US-033 | Not Started |

**Sprint 3 Total:** 29 SP

---

#### Sprint 4: Auftragserweiterung (29 SP)

| ID | Story | SP | Dependencies | Status |
|----|-------|----|--------------| -------|
| US-008 | Werkstatt erstellt digitales Angebot | 8 | US-033 | Not Started |
| US-035 | Auftragserweiterung erstellen (Tech) | 8 | US-033 | Not Started |
| US-036 | Fotos hochladen (Drag & Drop) | 5 | US-035 | Not Started |
| US-037 | Kunde benachrichtigen | 3 | US-035 | Not Started |
| US-009 | Kunde gibt Angebot frei | 5 | US-035 | Not Started |
| US-038 | Status tracken | 3 | US-035 | Not Started |
| US-010 | Zahlung Auftragserweiterung | 5 | US-009 | Not Started |
| US-007 | Fahrzeugrückgabe | 2 | US-031 | Not Started |
| US-032 | Rückgabe-Prozess | 5 | US-007 | Not Started |

**Sprint 4 Total:** 44 SP geplant → 29-33 SP realistisch

---

#### Sprint 5: Odoo & Testing (18 SP)

| ID | Story | SP | Dependencies | Status |
|----|-------|----|--------------| -------|
| US-016 | Odoo-Integration (Buchhaltung) | 13 | US-011 | Not Started |
| US-039 | Auftrag abschließen | 5 | US-033 | Not Started |
| US-014 | Weitere Services (TÜV, Bremse, Klima) | 3 | US-002 | Not Started |
| TECH-004 | Odoo Real-Time Sync | - | US-016 | Not Started |
| TECH-017 | Test-Coverage & QA | 8 | All | Not Started |
| Bugfixes | Kritische Bugs Sprint 1-4 | 10 | - | Not Started |

**Sprint 5 Total:** 39 SP geplant → 18-23 SP realistisch (Fokus Qualität)

---

#### Sprint 6: MVP Launch Prep (15 SP)

| Task | Beschreibung | SP | Status |
|------|-------------|----| -------|
| Dokumentation | User-/Jockey-/Werkstatt-Handbuch | 3 | Not Started |
| Training | Stakeholder schulen | 3 | Not Started |
| Bugfixes | Final Bugfixes | 5 | Not Started |
| Monitoring | Sentry, Logging | 3 | Not Started |
| Launch-Plan | Marketing, Go-Live | 2 | Not Started |
| Performance | Optimierungen | 2 | Not Started |
| Security | DSGVO, Security-Audit | 2 | Not Started |

**Sprint 6 Total:** 20 SP geplant → 15-18 SP realistisch

**MVP Total (Sprint 1-6):** ~158 SP Must-Have Features

---

### SHOULD-HAVE - Sprint 7-8 (Post-MVP)

| ID | Story | SP | Priorität | Sprint |
|----|-------|----|-----------|--------|
| US-012 | Light-Registrierung (Magic Link Wiederkehr) | 5 | Hoch | 7 |
| US-014 | Weitere Services (falls nicht in Sprint 5) | 3 | Hoch | 7 |
| US-017 | Jockey-Assignment (automatisch) | 8 | Mittel | 7 |
| US-029 | Fahrzeugschein fotografieren | 3 | Mittel | 7 |
| US-040 | Kommunikation mit Jockey | 5 | Mittel | 7 |
| TECH-009 | Driver-App Integration | 5 | Mittel | 7 |
| Auto-Wäsche | Fahrzeug waschen bei Rückgabe | 2 | Mittel | 8 |
| Push-Notifications | Real-time Updates | 5 | Mittel | 8 |
| Bewertungssystem | Kunde bewertet Service | 8 | Mittel | 8 |
| Performance-Opt | Weitere Optimierungen | 5 | Niedrig | 8 |

**Should-Have Total:** ~49 SP

---

### COULD-HAVE - Sprint 9+ (Later)

| ID | Feature | SP | Timeframe | Priorität |
|----|---------|----|-----------| ----------|
| US-018 | QR-Code Schnellbuchung | 3 | Sprint 9 | Mittel |
| Multi-Fahrzeug Management | Kunde verwaltet mehrere Autos | 8 | Sprint 10 | Mittel |
| Jockey Live-Tracking | GPS-Tracking "Uber-like" | 13 | Sprint 10 | Niedrig |
| Service-Erinnerungen | Auto-Reminder | 5 | Sprint 11 | Mittel |
| Reifenwechsel | Saisonaler Service | 13 | Q3 2026 | Niedrig |
| Glasreparatur | Steinschlag (Kooperation) | 8 | Q4 2026 | Niedrig |
| Wischblätter-Tausch | Low-Price Add-On | 2 | Sprint 9 | Niedrig |
| E-Auto-Services | Hochvolt-Checks | 21 | 2027 | Niedrig |
| Abo-Modell | Monatliche Zahlung | 21 | Q3 2026 | Mittel |
| Referral-Programm | Freunde werben | 8 | Sprint 11 | Mittel |
| Loyalty-Programm | Punkte sammeln | 13 | Q3 2026 | Mittel |
| Native Mobile App | iOS/Android | 34 | Q3 2026 | Hoch |
| Multi-Werkstatt-Routing | Expansion | 21 | Q2 2026 | Hoch |
| Azure Cloud Migration | Production-ready | 21 | Q2 2026 | Kritisch |

**Could-Have Total:** ~191 SP

---

### WON'T-HAVE (Diese Release)

| Feature | Begründung |
|---------|-----------|
| VIN-basierte Identifikation | Zu komplex, Marke/Modell reicht |
| Fahrzeugklassen-Pauschalen | ENTFERNT - nur Marke/Modell |
| B2B-Werkstatt-Portal | Anderer Use Case, separates Produkt |
| Führerschein-Kontrolle | Aufwand zu hoch für MVP |
| Werkstatt-Auswahl durch Kunde | MVP: 1:1 zu Witten |
| Chat-Support | E-Mail/Telefon reicht im MVP |
| Video-Call mit Werkstatt | Zu komplex |
| Eigendiagnose-Tool | Kunde wählt aus klarer Liste |
| KI-Preiskalkulation | Feste Preise im MVP |
| White-Label | B2B2C Use Case, zu komplex |

---

## Backlog Health Metrics

### Velocity-Tracking

| Sprint | Geplant (SP) | Erreicht (SP) | Velocity |
|--------|--------------|---------------|----------|
| Sprint 1 | 36 | TBD | TBD |
| Sprint 2 | 31 | TBD | TBD |
| Sprint 3 | 29 | TBD | TBD |
| Sprint 4 | 29 | TBD | TBD |
| Sprint 5 | 18 | TBD | TBD |
| Sprint 6 | 15 | TBD | TBD |

**Durchschnitt:** TBD (nach Sprint 3 berechenbar)

---

### Backlog Refinement Schedule

| Wann | Was | Teilnehmer |
|------|-----|-----------|
| Vor Sprint 1 | Sprint 1 Stories final schätzen | Team |
| Mitte Sprint 1 | Sprint 2 Stories schätzen | Team |
| Mitte Sprint 2 | Sprint 3 Stories schätzen | Team |
| Nach Sprint 3 | Sprint 4-6 re-evaluieren | Team + PO |
| Nach Sprint 6 | Sprint 7-8 planen | Team + PO |

---

## Dependencies Matrix

### Kritische Pfade

```
US-020 (Landing Page)
  └─> US-021 (Kunden-Login)
  └─> US-022 (Jockey-Login)
       └─> US-025 (Jockey-Dashboard)
            └─> US-028 (Übergabeprotokoll)
  └─> US-023 (Werkstatt-Login)
       └─> US-033 (Werkstatt-Dashboard)
            └─> US-035 (Auftragserweiterung)
                 └─> US-009 (Kunde gibt frei)
                      └─> US-010 (Payment-Erweiterung)

US-001 (Fahrzeugauswahl)
  └─> US-004 (Preiskalkulation)
       └─> US-011 (Payment)
            └─> US-016 (Odoo)

US-015 (Slot-Management)
  └─> US-003 (Terminbuchung)
       └─> US-011 (Payment)
```

### Blockers

**Potenzielle Blocker:**
- TECH-015 (Authentication) blockiert alle Portal-Features
- US-015 (Slot-Management) blockiert US-003 (Terminbuchung)
- TECH-001 (Stripe) blockiert US-011 (Payment)
- US-016 (Odoo) blockiert MVP-Launch (oder Fallback: Mock)

---

## Backlog Grooming Notes

### Offene Fragen (für Refinement)

**Sprint 1:**
- [ ] Sind alle Fahrzeugmarken/-modelle in der Datenbank?
- [ ] Pricing-Workshop durchgeführt? (Top 50 Modelle)
- [ ] E-Mail-Service: Welcher Provider? (SendGrid, AWS SES, lokal)

**Sprint 2:**
- [ ] Stripe-Account erstellt?
- [ ] Slot-Konfiguration für Witten festgelegt?
- [ ] E-Mail-Templates für Buchungsbestätigung geschrieben?

**Sprint 3:**
- [ ] Jockey-Checkliste definiert?
- [ ] Werkstatt Witten: Welches aktuelle System nutzen sie?

**Sprint 4:**
- [ ] Werkstatt Witten: Feedback zu Auftragserweiterung-UX?

**Sprint 5:**
- [ ] Odoo-Zugang geklärt?
- [ ] Fallback-Plan bei Odoo-Ausfall?

**Sprint 6:**
- [ ] Training-Termine mit Werkstatt + Jockey fix?
- [ ] Marketing-Material vorbereitet?

---

## Priorisierungs-Änderungen (Changelog)

| Datum | Änderung | Begründung |
|-------|----------|-----------|
| 2026-02-01 | US-020-040 hinzugefügt | Multi-Portal-Architektur für Demo |
| 2026-02-01 | US-019 als Pflichtfeld markiert | Präzise Wartungsbedarfsermittlung |
| 2026-02-01 | Fahrzeugklassen entfernt | Marke/Modell-spezifisch ist Differenzierung |
| - | Weitere Änderungen | TBD |

---

## Nächste Schritte

1. **Sprint 1 Planning:** Stories final committen
2. **Tech Spike:** Odoo API testen (parallel zu Sprint 1)
3. **Pricing-Workshop:** Top 50 Fahrzeugmodelle + Preise festlegen
4. **Design:** Wireframes für US-020, US-025, US-033 erstellen
5. **Backlog Refinement:** Sprint 2 Stories detaillieren

---

**Product Owner:** Sten Rauch
**Last Updated:** 2026-02-01
**Next Review:** Nach Sprint 1
