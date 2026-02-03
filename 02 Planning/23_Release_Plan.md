# Release Plan - B2C Autowartungs-App

**Version:** 1.0
**Datum:** 2026-02-01
**Timeline:** Q1-Q3 2026
**Ziel:** Von MVP zu deutschlandweiter Skalierung

---

## Executive Summary

**MVP Launch:** Ende Woche 12 (Sprint 6)
**Pilot-Phase:** 4 Wochen Witten (Sprint 7-8)
**Expansion:** Q2/Q3 2026 (Multi-Werkstatt, weitere Städte)
**Cloud Migration:** Q2 2026 (Azure)

---

## Release Timeline

```
Q1 2026                          Q2 2026                         Q3 2026
───────────────────────────────────────────────────────────────────────
│ Sprint 1-6 │ S7-8 │             │ Azure    │ Expansion │         │
│    MVP     │Pilot │   Optimize  │Migration │  Scaling  │  Growth │
│            │      │             │          │           │         │
Week 1────12  13─16   17────20      21───24    25───28      29───36
     │         │         │            │          │            │
  Fundament  Soft    Feature     Cloud      Multi-City    Q3 Goals
  Buchung  Launch   Additions   Migration   Roll-out
  Payment
  Concierge
```

---

## Phase 1: MVP Development (Sprint 1-6, Woche 1-12)

### Sprint 1-2: Core Fundament (Woche 1-4)
**Ziel:** Buchungsprozess + Payment funktionieren

**Deliverables:**
- Landing Page mit 3 Login-Bereichen
- Fahrzeugauswahl mit Preiskalkulation
- Online-Bezahlung (Stripe Test Mode)
- Slot-Management
- Jockey-Dashboard

**Milestone:** Kunde kann buchen und bezahlen

---

### Sprint 3-4: Concierge & USP (Woche 5-8)
**Ziel:** Concierge-Service + Digitale Auftragserweiterung

**Deliverables:**
- Übergabeprotokoll mit Fotos
- Werkstatt-Dashboard
- Auftragserweiterung (Werkstatt → Kunde)
- Kunde gibt digital frei
- Automatische Zahlung bei Freigabe
- Rückgabe-Prozess

**Milestone:** Kompletter End-to-End-Flow funktioniert

---

### Sprint 5-6: Stabilisierung & Launch Prep (Woche 9-12)
**Ziel:** Produktionsreif für Witten-Pilot

**Deliverables:**
- Odoo-Integration (oder Mock)
- E2E-Tests für kritische Journeys
- Dokumentation (User, Jockey, Werkstatt)
- Stakeholder-Training
- Monitoring aktiv (Sentry, Logging)
- Security-Audit (DSGVO)
- Launch-Plan

**Milestone:** **MVP Launch Review** - Go/No-Go Entscheidung

**Launch-Datum:** Ende Woche 12

---

## Phase 2: Witten Pilot (Sprint 7-8, Woche 13-16)

### Soft Launch (Woche 13-14)
**Ziel:** Erste echte Kunden, Feedback sammeln

**Strategie:**
- Max. 5 Buchungen/Tag (Kapazitätsbegrenzung)
- 10 Beta-Tester einladen (ausgewählte Kunden)
- Tägliches Monitoring
- Schnelle Bugfixes
- Wöchentliche Retros mit Werkstatt Witten

**KPIs:**
- Buchungsrate: 3-5 Buchungen/Tag
- Conversion Rate: > 20%
- Payment Success Rate: > 95%
- Kundenzufriedenheit: > 4/5

**Feedback-Schleifen:**
- Post-Service Survey (automatisch)
- Wöchentlicher Call mit Werkstatt Witten
- Jockey-Feedback täglich

---

### Full Launch Witten (Woche 15-16)
**Ziel:** Kapazität erhöhen, Marketing starten

**Strategie:**
- Kapazität erhöhen: 10-20 Buchungen/Tag
- Marketing-Push:
  - Social Media (Instagram, Facebook)
  - Google Ads (lokale Kampagne Witten)
  - Mund-zu-Mund-Propaganda
- Corporate Partnerships kontaktieren (MHC, Shell)

**KPIs:**
- Buchungsrate: 10-15 Buchungen/Tag
- Wiederbuchungsrate: > 15%
- Auftragserweiterung Acceptance: > 30%
- NPS: > 50

**Deliverables Sprint 7-8:**
- US-012: Light-Registrierung (Wiederbuchung)
- US-017: Automatisches Jockey-Assignment
- US-029: Fahrzeugschein-Foto
- Performance-Optimierungen
- Weitere Services (TÜV, Bremse, Klima)

---

## Phase 3: Optimierung & Azure-Migration (Woche 17-24, Q2)

### Woche 17-20: Feature-Additions & UX-Improvements
**Ziel:** Should-Have Features nachrüsten

**Features:**
- Bewertungssystem (Google Reviews)
- Push-Notifications
- QR-Code Schnellbuchung
- Multi-Fahrzeug-Management
- Service-Erinnerungen
- Native App (Start)

**KPIs Witten:**
- 100+ Buchungen gesamt
- Wiederbuchungsrate: > 25%
- Durchschnittlicher Umsatz/Buchung: 250 EUR

---

### Woche 21-24: Azure Cloud Migration
**Ziel:** Skalierbare Infrastruktur für Multi-Werkstatt-Betrieb

**Migration-Plan:**
1. **Woche 21:** Architektur-Refactoring
   - Containerisierung (Docker)
   - Azure-nativer Code
   - CI/CD Pipeline (GitHub Actions → Azure)

2. **Woche 22:** Infrastructure Setup
   - Azure App Service
   - Azure Database for PostgreSQL
   - Azure Blob Storage (Fotos)
   - Azure Key Vault (Secrets)

3. **Woche 23:** Migration & Testing
   - Datenmigration (PostgreSQL lokal → Azure)
   - Load Testing
   - Security-Audit
   - Performance-Tests

4. **Woche 24:** Go-Live Azure
   - Cutover zu Azure (Downtime < 1h)
   - Monitoring (Azure Application Insights)
   - Backup-Strategie (automatische Backups)

**Post-Migration KPIs:**
- Uptime: > 99.9%
- Response Times: < 500ms (API)
- Skalierbarkeit: 100+ Requests/Sekunde

---

## Phase 4: Expansion (Woche 25-36, Q2/Q3)

### Woche 25-28: Multi-Werkstatt-Routing
**Ziel:** Zweite Werkstatt onboarden (Dortmund oder Essen)

**Features:**
- Multi-Werkstatt-Logik (Routing nach PLZ)
- Werkstatt-Verwaltung (Admin-Interface)
- Slot-Management pro Werkstatt
- Jockey-Pool pro Stadt
- Pricing pro Werkstatt (optional)

**Expansion-Städte:**
1. **Dortmund** (Q2 2026)
   - Einwohner: 600.000
   - Potenzial: 500+ Buchungen/Monat
   - Partner-Werkstatt finden
   - Jockeys rekrutieren (3-5)
   - Lokales Marketing

2. **Essen** (Q3 2026)
   - Einwohner: 580.000
   - Potenzial: 450+ Buchungen/Monat

3. **Bochum / Wuppertal** (Q3 2026)
   - Weitere Städte im Ruhrgebiet

**Milestones:**
- Werkstatt Dortmund onboarded (Woche 26)
- Erste Buchung Dortmund (Woche 27)
- 50+ Buchungen Dortmund (Woche 32)

---

### Woche 29-32: Native Mobile App
**Ziel:** Bessere UX durch native App (iOS + Android)

**Features:**
- Native UI (React Native oder Flutter)
- Push-Notifications (echte Push)
- Offline-Funktionalität (Jockey-App)
- App Store / Play Store Launch
- Deep-Linking (Buchung aus App)

**KPIs:**
- App-Downloads: 500+ in erstem Monat
- App-Nutzer: 30% aller Buchungen via App

---

### Woche 33-36: Skalierung & Growth
**Ziel:** Deutschlandweite Expansion vorbereiten

**Aktivitäten:**
- 5-10 Werkstätten onboarded
- 50+ Jockeys im Netzwerk
- 500+ Buchungen/Monat gesamt
- Corporate Partnerships (MHC, Shell, etc.)
- PR & Media Coverage
- Fundraising (optional, Series A)

**Q3 2026 Ziele:**
- Total Buchungen: 2000+ (seit Launch)
- Wiederbuchungsrate: > 30%
- NPS: > 60
- Revenue: 500.000 EUR+ (kumulativ)
- Marge: Break-even oder besser

---

## Release Criteria

### MVP Release (Phase 1)

**Go-Live wenn:**
- [ ] Alle Must-Have Features funktionieren
- [ ] 0 Critical/Blocker Bugs
- [ ] E2E-Tests grün
- [ ] Performance: Ladezeiten < 2 Sek
- [ ] Dokumentation vollständig
- [ ] Werkstatt + Jockey geschult
- [ ] Monitoring aktiv (Sentry, Uptime)
- [ ] DSGVO-konform
- [ ] Support-Prozess definiert
- [ ] Payment-Integration produktionsreif (Stripe Production)

---

### Expansion Release (Phase 4)

**Neue Stadt nur wenn:**
- [ ] Partner-Werkstatt gefunden
- [ ] Werkstatt geschult
- [ ] 3-5 Jockeys rekrutiert und geschult
- [ ] Ersatzfahrzeuge vorhanden (Ronja-Flotte)
- [ ] Lokales Marketing vorbereitet
- [ ] Slot-Management konfiguriert
- [ ] Test-Buchungen erfolgreich

---

## Success Metrics (KPIs)

### MVP Success (nach 4 Wochen)

| Metric | Ziel | Tatsächlich |
|--------|------|-------------|
| Total Bookings | 100+ | TBD |
| Conversion Rate | > 20% | TBD |
| Payment Success Rate | > 95% | TBD |
| Kundenzufriedenheit | > 4.5/5 | TBD |
| Auftragserweiterung Acceptance | > 30% | TBD |
| Wiederbuchungsrate | > 15% | TBD |
| NPS | > 50 | TBD |
| Technical Uptime | > 99% | TBD |

---

### Q2 2026 Success

| Metric | Ziel |
|--------|------|
| Total Bookings | 500+ |
| Active Werkstätten | 2-3 |
| Active Jockeys | 10+ |
| Revenue | 120.000 EUR+ |
| Customer Acquisition Cost | < 50 EUR |
| Average Order Value | 250 EUR |
| Wiederbuchungsrate | > 25% |

---

### Q3 2026 Success

| Metric | Ziel |
|--------|------|
| Total Bookings | 2000+ |
| Active Werkstätten | 5-10 |
| Active Jockeys | 50+ |
| Revenue | 500.000 EUR+ |
| Break-even | Ja (oder nahe dran) |
| NPS | > 60 |
| App-Downloads | 1000+ |

---

## Risk Management

### Phase 1 Risks (MVP)

| Risiko | Wahrscheinlichkeit | Impact | Mitigation |
|--------|-------------------|--------|-----------|
| MVP nicht rechtzeitig fertig | Mittel | Hoch | Buffer in Sprint 6, Priorisierung |
| Odoo-Integration scheitert | Mittel | Hoch | Fallback: Mock-Integration |
| Werkstatt Witten nicht bereit | Niedrig | Kritisch | Frühzeitiges Training, enge Abstimmung |
| Keine Beta-Tester | Niedrig | Mittel | Vorab Interessenten sammeln |

---

### Phase 4 Risks (Expansion)

| Risiko | Wahrscheinlichkeit | Impact | Mitigation |
|--------|-------------------|--------|-----------|
| Keine Partner-Werkstätten finden | Mittel | Hoch | Aktives Outreach, attraktive Konditionen |
| Jockey-Rekrutierung schwierig | Mittel | Hoch | Attraktive Bezahlung, Ronja-Netzwerk nutzen |
| Multi-Werkstatt-Logik buggy | Mittel | Hoch | Extensive Tests, stufenweise Rollout |
| Kapital für Expansion fehlt | Mittel | Kritisch | Fundraising vorbereiten, Break-even anstreben |

---

## Rollback-Plan

### Wenn MVP Launch scheitert

**Szenarien:**
1. **Critical Bug im Production:** Rollback zu vorheriger Version, Bugfix, Re-Deploy
2. **Payment-Integration fällt aus:** Stripe-Support kontaktieren, manuelle Buchungen (notfalls)
3. **Werkstatt überlastet:** Slot-Limits reduzieren, temporär keine neuen Buchungen
4. **Keine Kunden:** Marketing intensivieren, Preise anpassen, Beta-Testing verlängern

**Kommunikation:**
- Transparente Kommunikation mit Kunden (E-Mail, Website)
- Stakeholder informieren (Management, Werkstatt)
- Post-Mortem nach Incident

---

## Communication Plan

### Stakeholder-Updates

| Stakeholder | Frequenz | Format |
|-------------|----------|--------|
| Management | Monatlich | Presentation (KPIs, Status, Risks) |
| Investor | Nach jeder Phase | Demo + Business Metrics |
| Werkstatt Witten | Wöchentlich | Call (Feedback, Issues) |
| Weitere Werkstätten | Bi-weekly | Call + Newsletter |
| Team | Daily | Stand-up |
| Kunden | Bei Änderungen | E-Mail, Website-Update |

---

### Marketing Timeline

| Phase | Maßnahmen |
|-------|-----------|
| **Pre-Launch (Woche 11-12)** | Teaser Social Media, Landing Page live |
| **Soft Launch (Woche 13-14)** | Beta-Tester einladen, erste Posts |
| **Full Launch (Woche 15-16)** | Offizielle Ankündigung, PR, Google Ads |
| **Expansion (Q2/Q3)** | Stadt-spezifische Kampagnen, Partnerships |

---

## Budget & Resources

### MVP Development (Q1)

| Kostenart | Budget |
|-----------|--------|
| Entwicklung (2-3 Devs, 12 Wochen) | 60.000 EUR |
| Stripe Fees (Test + erste Buchungen) | 1.000 EUR |
| E-Mail-Service (SendGrid) | 200 EUR |
| Monitoring (Sentry) | 100 EUR |
| Hosting (lokal, minimal) | 0 EUR |
| **Total Q1** | **61.300 EUR** |

---

### Expansion (Q2/Q3)

| Kostenart | Budget |
|-----------|--------|
| Azure Cloud (3 Monate) | 3.000 EUR |
| Weitere Entwicklung (Sprint 7-12) | 60.000 EUR |
| Marketing (Google Ads, Social) | 10.000 EUR |
| Jockey-Rekrutierung & Training | 5.000 EUR |
| Werkstatt-Onboarding | 5.000 EUR |
| Ersatzfahrzeuge (Leasing/Kauf) | 50.000 EUR |
| **Total Q2/Q3** | **133.000 EUR** |

**Total Budget 2026:** ~200.000 EUR

---

## Next Steps

### Immediate (vor Sprint 1)

- [ ] Team-Onboarding
- [ ] Development-Environment aufsetzen
- [ ] Pricing-Workshop durchführen
- [ ] Wireframes finalisieren

### Short-Term (Sprint 1-3)

- [ ] MVP Features entwickeln
- [ ] Werkstatt Witten enger einbinden
- [ ] Beta-Tester Liste aufbauen

### Mid-Term (Sprint 4-6)

- [ ] MVP finalisieren
- [ ] Training durchführen
- [ ] Marketing vorbereiten
- [ ] Launch planen

### Long-Term (Q2/Q3)

- [ ] Azure-Migration
- [ ] Expansion-Städte identifizieren
- [ ] Partner-Werkstätten akquirieren
- [ ] Fundraising (optional)

---

**Product Owner:** Sten Rauch
**Last Updated:** 2026-02-01
**Next Review:** Nach Sprint 3 (Mid-MVP Check-in)

---

**Vision:** Größter Ersatzmobilitätsdienstleister in Deutschland mit 10.000-20.000 Fahrzeugen.

**Let's make it happen!**
