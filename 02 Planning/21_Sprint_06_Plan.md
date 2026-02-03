# Sprint 6 Plan: MVP Launch Vorbereitung

**Sprint:** 6 von 6
**Dauer:** 2 Wochen (Woche 11-12)
**Sprint Goal:** "Produkt ist produktionsreif für Witten-Pilot. Dokumentation vollständig. Team ist launch-ready."
**Velocity Ziel:** 15 Story Points

---

## Sprint Objectives

Finalisierung, Dokumentation, Stakeholder-Training, Launch-Vorbereitung. Fokus auf Stabilität, nicht auf neue Features.

---

## User Stories & Tasks

| Task | Beschreibung | SP | Priorität |
|------|-------------|----|-----------| | **Dokumentation** | User-Dokumentation, Admin-Handbuch | 3 | Critical |
| **Stakeholder-Training** | Werkstatt Witten schulen, Jockey-Training | 3 | Critical |
| **Final Bugfixes** | Letzte Bugs vor Launch | 5 | Critical |
| **Monitoring Setup** | Error-Tracking (Sentry), Logging | 3 | High |
| **Launch-Plan** | Marketing, Support, Go-Live-Checkliste | 2 | Critical |
| **Performance-Optimierung** | Letzte Optimierungen | 2 | High |
| **Security-Audit** | DSGVO-Check, Sicherheitsprüfung | 2 | Critical |

**Total:** 20 SP geplant (realistisch 15-18 SP)

---

## Key Tasks

### Dokumentation (3 SP)

**Tasks:**
1. **User-Dokumentation für Kunden** (1 Tag)
   - FAQ: Wie buche ich?
   - Troubleshooting: Was tun bei Problemen?
   - Video-Tutorial (optional)

2. **Jockey-Handbuch** (1 Tag)
   - Prozess: Abholung, Übergabeprotokoll, Rückgabe
   - Checklisten
   - Screenshots vom Jockey-Portal

3. **Werkstatt-Handbuch** (1 Tag)
   - Prozess: Auftragserweiterung erstellen
   - Tipps: Gute Fotos machen, klare Beschreibungen
   - Screenshots vom Werkstatt-Portal

4. **Admin-Handbuch** (1 Tag)
   - Slot-Management konfigurieren
   - User anlegen (Jockey, Werkstatt)
   - Troubleshooting

5. **Technical Documentation** (1 Tag)
   - Architecture-Diagramm aktualisieren
   - API-Dokumentation finalisieren
   - Deployment-Guide

**Deliverables:**
- User-FAQ auf Website
- Jockey-Handbuch als PDF
- Werkstatt-Handbuch als PDF
- Admin-Handbuch für internes Team

---

### Stakeholder-Training (3 SP)

**Tasks:**
1. **Werkstatt Witten Training** (1 Tag)
   - Termin: 2-3 Stunden vor Ort
   - Walkthrough: Werkstatt-Portal
   - Hands-on: Auftragserweiterung erstellen
   - Q&A-Session

2. **Jockey-Training** (0.5 Tage)
   - Termin: 1-2 Stunden
   - Walkthrough: Jockey-Portal, Übergabeprotokoll
   - Hands-on: Test-Abholung durchführen
   - Q&A-Session

3. **Support-Team Briefing** (0.5 Tage)
   - Wer ist erster Ansprechpartner bei Problemen?
   - Eskalationsprozess definieren
   - Support-Dokumentation teilen

**Deliverables:**
- Geschultes Werkstatt-Team
- Geschulte Jockeys
- Support-Prozess definiert

---

### Final Bugfixes (5 SP)

**Tasks:**
1. Bug-Triage: Alle offenen Bugs priorisieren
2. Critical Bugs fixen (Blocker für Launch)
3. High-Priority Bugs fixen (wenn Zeit)
4. Regression-Tests durchführen

**Ziel:**
- 0 Critical/Blocker Bugs
- < 5 High-Priority Bugs (dokumentiert, nicht launch-kritisch)

---

### Monitoring Setup (3 SP)

**Tasks:**
1. **Error-Tracking** (1 Tag)
   - Sentry-Setup (oder alternatives Tool)
   - Frontend-Fehler tracken
   - Backend-Fehler tracken
   - Alerts konfigurieren (bei Critical Errors)

2. **Logging** (0.5 Tage)
   - Strukturiertes Logging (JSON-Format)
   - Log-Levels konfigurieren (INFO, WARN, ERROR)
   - Wichtige Events loggen (Buchung, Payment, Odoo-Sync)

3. **Monitoring-Dashboard** (0.5 Tage)
   - Uptime-Monitoring (z.B. UptimeRobot)
   - Performance-Metriken (Response Times)
   - Stripe-Dashboard beobachten

**Deliverables:**
- Sentry (oder Alternative) aktiv
- Logging funktioniert
- Monitoring-Dashboard für Team

---

### Launch-Plan (2 SP)

**Tasks:**
1. **Go-Live-Checkliste** (0.5 Tage)
   - [ ] Alle Must-Have Features funktionieren
   - [ ] 0 Critical Bugs
   - [ ] Dokumentation vollständig
   - [ ] Training abgeschlossen
   - [ ] Monitoring aktiv
   - [ ] Support-Prozess definiert

2. **Marketing-Vorbereitung** (1 Tag)
   - Landing Page finalisieren
   - Social Media Posts vorbereiten
   - E-Mail an Beta-Tester
   - PR-Material (optional)

3. **Launch-Strategie** (0.5 Tage)
   - Soft Launch: Erste 2 Wochen limitiert (5 Buchungen/Tag)
   - Beta-Tester: 10 ausgewählte Kunden
   - Full Launch: Nach 2 Wochen Beta

**Deliverables:**
- Go-Live-Checkliste abgehakt
- Marketing-Material bereit
- Launch-Strategie kommuniziert

---

### Performance-Optimierung (2 SP)

**Tasks:**
1. Ladezeiten optimieren (Lazy Loading, Code-Splitting)
2. Bild-Komprimierung prüfen
3. API-Response-Zeiten verbessern
4. Caching implementieren (wo sinnvoll)

**Ziel:**
- Ladezeiten < 2 Sekunden
- Lighthouse Score > 90

---

### Security-Audit (2 SP)

**Tasks:**
1. **DSGVO-Check** (1 Tag)
   - Datenschutzerklärung vollständig?
   - Cookie-Consent implementiert?
   - Recht auf Löschung funktioniert?
   - Datenexport möglich?

2. **Sicherheitsprüfung** (1 Tag)
   - SQL-Injection-Tests
   - XSS-Tests
   - CSRF-Protection aktiv?
   - HTTPS korrekt konfiguriert?
   - Rate Limiting aktiv?

**Deliverables:**
- DSGVO-konform
- Keine kritischen Security-Lücken

---

## Sprint Backlog Timeline

### Day 1-2: Dokumentation
- [ ] User-Dokumentation schreiben
- [ ] Jockey-Handbuch erstellen
- [ ] Werkstatt-Handbuch erstellen
- [ ] Admin-Dokumentation

### Day 3-4: Training & Monitoring
- [ ] Werkstatt Witten Training durchführen
- [ ] Jockey-Training durchführen
- [ ] Monitoring-Setup (Sentry, Logging)

### Day 5-7: Bugfixes & Optimierung
- [ ] Final Bugfixes
- [ ] Performance-Optimierung
- [ ] Security-Audit

### Day 8-9: Launch-Vorbereitung
- [ ] Launch-Plan finalisieren
- [ ] Marketing-Material
- [ ] Go-Live-Checkliste durchgehen

### Day 10: Sprint Review & MVP Launch Review
- [ ] Sprint Review: Alle Deliverables präsentieren
- [ ] MVP Launch Review: Management-Präsentation
- [ ] Go/No-Go Entscheidung
- [ ] Retrospective

---

## MVP Launch Criteria

**Go-Live nur, wenn:**
- [ ] Alle Must-Have Features funktionieren
- [ ] 0 Critical/Blocker Bugs
- [ ] E2E-Tests grün
- [ ] Performance: Ladezeiten < 2 Sek
- [ ] Dokumentation vollständig
- [ ] Werkstatt + Jockey geschult
- [ ] Monitoring aktiv
- [ ] DSGVO-konform
- [ ] Support-Prozess definiert

**Launch-Strategie:**
- **Soft Launch:** Erste 2 Wochen
  - Max. 5 Buchungen/Tag
  - 10 Beta-Tester einladen
  - Täglich Monitoring
  - Feedback sammeln

- **Full Launch:** Nach 2 Wochen (wenn alles stabil)
  - Erhöhung auf 10-20 Buchungen/Tag
  - Marketing-Push (Social Media, Google Ads)
  - Offizielle Ankündigung

---

## Risks & Mitigation

| Risiko | Wahrscheinlichkeit | Impact | Mitigation |
|--------|-------------------|--------|-----------|
| Last-Minute Critical Bug | Mittel | Hoch | Buffer für Bugfixes, Regression-Tests |
| Training läuft nicht gut | Niedrig | Mittel | Dokumentation als Backup |
| Stakeholder nicht bereit | Niedrig | Hoch | Frühzeitige Kommunikation, verbindliche Termine |

---

## Definition of Done (Sprint 6)

- [ ] Alle Dokumentation vollständig und reviewed
- [ ] Training durchgeführt, Feedback positiv
- [ ] 0 Critical/Blocker Bugs
- [ ] Monitoring aktiv
- [ ] Go-Live-Checkliste abgehakt
- [ ] Product Owner Abnahme

---

## Deliverables

**Funktional:**
- Alle MVP-Features vollständig und stabil
- Keine Critical Bugs

**Dokumentation:**
- User-FAQ
- Jockey-Handbuch
- Werkstatt-Handbuch
- Admin-Handbuch
- Technical Documentation

**Training:**
- Werkstatt Witten geschult
- Jockeys geschult
- Support-Team gebrieft

**Launch:**
- Marketing-Material bereit
- Launch-Plan kommuniziert
- Go-Live-Checkliste abgehakt

---

## Sprint Ceremonies

- **Sprint Planning:** Tag 1, 9:00 Uhr (1.5h)
- **Daily Stand-up:** Jeden Tag, 9:00 Uhr (15 Min)
- **Sprint Review:** Tag 10, 15:00 Uhr (1h)
- **MVP Launch Review:** Tag 10, 16:00 Uhr (1h) - **Alle Stakeholder**
- **Sprint Retrospective:** Tag 10, 17:00 Uhr (1h)

---

## Action Items für Product Owner

**Vor Sprint:**
- [ ] Go-Live-Checkliste vorbereiten
- [ ] Training-Termine mit Werkstatt + Jockey vereinbaren
- [ ] Stakeholder für MVP Launch Review einladen

**Während Sprint:**
- [ ] Training-Sessions begleiten
- [ ] Launch-Plan mit Marketing abstimmen
- [ ] Management auf Launch Review vorbereiten

**Ende Sprint:**
- [ ] MVP Launch Review moderieren
- [ ] Go/No-Go Entscheidung treffen
- [ ] Sprint 7-8 Planning (Should-Haves)

---

## MVP Launch Review Agenda (Tag 10, 16:00 Uhr)

**Teilnehmer:** Management, Stakeholder, Tech Team, Werkstatt Witten (optional)

**Agenda:**
1. **Rückblick:** Was haben wir in 6 Sprints erreicht? (10 Min)
2. **Live-Demo:** Komplette User Journey (30 Min)
   - Kunde bucht
   - Jockey holt ab
   - Werkstatt erstellt Auftragserweiterung
   - Kunde gibt frei
   - Rückgabe
3. **Metriken:** Story Points, Velocity, Features (5 Min)
4. **Go-Live-Checkliste:** Review (5 Min)
5. **Launch-Plan:** Soft Launch → Full Launch (5 Min)
6. **Q&A:** Fragen von Stakeholdern (10 Min)
7. **Go/No-Go Entscheidung:** (5 Min)

---

## Go/No-Go Entscheidung

**GO:**
- MVP ist produktionsreif
- Soft Launch startet nächste Woche
- Team ist bereit

**NO-GO:**
- Kritische Probleme gefunden
- Weitere Woche Stabilisierung nötig
- Stakeholder nicht bereit

---

## Post-MVP Roadmap (Sprint 7-8)

**Should-Have Features:**
- US-012: Light-Registrierung
- US-014: Weitere Services (wenn nicht in Sprint 5)
- US-017: Automatisches Jockey-Assignment
- US-029: Fahrzeugschein fotografieren
- Optimierungen: Performance, UX-Improvements

**Expansion (Q2/Q3 2026):**
- Multi-Werkstatt-Routing
- Weitere Standorte (Dortmund, Essen)
- Native Mobile App
- Azure Cloud Migration

---

**Team:** Herzlichen Glückwunsch! Wir haben es geschafft!

**Let's launch this MVP!**
