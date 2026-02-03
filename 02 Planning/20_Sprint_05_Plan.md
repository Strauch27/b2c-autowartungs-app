# Sprint 5 Plan: Odoo-Integration & Testing

**Sprint:** 5 von 6
**Dauer:** 2 Wochen (Woche 9-10)
**Sprint Goal:** "Odoo-Integration funktioniert. Alle kritischen User Journeys sind getestet und bugfrei."
**Velocity Ziel:** 18 Story Points

---

## Sprint Objectives

Odoo-Integration für Buchhaltung implementieren, umfassende Tests durchführen, Performance optimieren, kritische Bugs fixen.

---

## User Stories

| Story ID | Story | SP | Priorität |
|----------|-------|----|-----------|
| **US-016** | Odoo-Integration (Buchhaltung) | 13 | Critical |
| **TECH-004** | Odoo Real-Time Sync | - | Critical (in US-016) |
| **US-014** | Weitere Services (TÜV, Bremse, Klima) | 3 | Should-Have |
| **US-039** | Auftrag abschließen | 5 | High |
| **TECH-017** | Test-Coverage & QA | 8 | Critical |
| **Bugfixes** | Kritische Bugs aus Sprint 1-4 | 10 | Critical |

**Total:** 39 SP geplant (realistisch 18-23 SP für New Features + Bugfixes)

**Fokus:** Qualität vor Quantität. Stabilität ist Ziel.

---

## Key Tasks

### US-016: Odoo-Integration (13 SP)

**Wichtig:** Wenn Odoo-Integration fehlschlägt → Fallback: Mock-Integration (JSON-Log)

**Tasks:**
1. **Odoo API Zugang** (1 Tag)
   - Zugang klären: Haben wir Odoo-Instanz?
   - API-Keys erhalten
   - Dokumentation lesen
   - Test-API-Calls durchführen

2. **Kundenstammdaten-Sync** (1 Tag)
   - POST /res.partner (Kunde anlegen)
   - Mapping: Name, E-Mail, Telefon, Adresse
   - Error Handling: Duplikate vermeiden

3. **Buchungen & Rechnungen** (2 Tage)
   - POST /account.move (Rechnung erstellen)
   - POST /sale.order (Auftrag erstellen)
   - POST /account.payment (Zahlungseingang)
   - Mapping: Fahrzeugdaten, Service-Typ, Preis

4. **Auftragserweiterungen** (1 Tag)
   - Ergänzungsrechnung bei Freigabe
   - Zusatz-Positionen hinzufügen

5. **Retry-Logik** (1 Tag)
   - Queue-System bei Odoo-Ausfall
   - Exponential Backoff
   - Error-Logging

6. **Testing** (1 Tag)
   - Unit-Tests für Odoo-Integration
   - Mock-Tests
   - Integration-Tests

**Akzeptanzkriterien:**
- Buchung wird in Odoo angelegt (Kunde, Rechnung, Zahlung)
- Bei Odoo-Ausfall: Retry-Mechanismus
- Auftragserweiterungen werden korrekt gebucht
- **Fallback:** Wenn Odoo nicht verfügbar → Mock-Integration (JSON-Log)

---

### TECH-017: Test-Coverage & QA (8 SP)

**Tasks:**
1. **E2E-Tests schreiben** (3 Tage)
   - Test: Kompletter Buchungsprozess (Fahrzeug → Payment)
   - Test: Jockey-Abholung mit Übergabeprotokoll
   - Test: Werkstatt-Auftragserweiterung → Kunde gibt frei
   - Test: Rückgabe-Prozess
   - Playwright oder Cypress

2. **Integration-Tests** (2 Tage)
   - Payment-Flow (Stripe Test Mode)
   - Odoo-Sync (Mock und echte API)
   - E-Mail-Versand
   - Slot-Management Concurrency

3. **Performance-Tests** (1 Tag)
   - Ladezeiten messen (Ziel: < 2 Sek)
   - Bildkomprimierung testen
   - API-Response-Zeiten

4. **Bug-Hunting** (1 Tag)
   - Explorative Tests
   - Edge Cases

**Akzeptanzkriterien:**
- Code Coverage > 70%
- Alle kritischen User Journeys haben E2E-Tests
- Performance: Ladezeiten < 2 Sekunden
- Keine Critical/Blocker Bugs

---

### US-014: Weitere Services (3 SP)

**Tasks:**
1. Content: TÜV, Bremsservice, Klimaservice definieren
2. Preise festlegen (nach Marke/Modell)
3. Frontend: Service-Auswahl erweitern
4. Backend: Preiskalkulation für neue Services

**Akzeptanzkriterien:**
- Kunde kann TÜV, Bremsservice, Klimaservice buchen
- Preise werden korrekt berechnet

---

### US-039: Auftrag abschließen (5 SP)

**Tasks:**
1. Frontend: Abschluss-Formular (Werkstatt)
2. Checklist: "Serviceheft eingetragen", "Fahrzeug gewaschen"
3. Backend: Status auf "Fertig" setzen
4. Jockey benachrichtigen: "Fahrzeug bereit für Rückgabe"
5. Kunde benachrichtigen: "Service abgeschlossen"
6. Odoo: Rechnung finalisieren

**Akzeptanzkriterien:**
- Werkstatt kann Auftrag abschließen
- Jockey erhält Benachrichtigung
- Status wird aktualisiert

---

### Bugfixes (10 SP Buffer)

**Bekannte Bugs aus Sprint 1-4:**
- [ ] Login-Flow: Session-Expiry Handling
- [ ] Payment: Error-Handling bei abgelehnten Karten
- [ ] Slot-Management: Race Conditions
- [ ] Foto-Upload: Komprimierung auf iOS
- [ ] E-Mail-Versand: Zuverlässigkeit

**Priorisierung:**
- Critical Bugs: Sofort fixen
- High Bugs: In diesem Sprint
- Medium/Low Bugs: Backlog für Post-MVP

---

## Sprint Backlog Timeline

### Day 1-3: Odoo-Integration Start
- [ ] Odoo API-Zugang klären
- [ ] Kundenstammdaten-Sync implementieren
- [ ] Buchungen & Rechnungen

### Day 4-6: Odoo finalisieren & Testing Start
- [ ] Auftragserweiterungen in Odoo
- [ ] Retry-Logik
- [ ] E2E-Tests schreiben (Buchungsprozess)

### Day 7-8: Testing & Bugfixes
- [ ] Integration-Tests (Payment, Odoo)
- [ ] Performance-Tests
- [ ] Kritische Bugs fixen

### Day 9-10: Weitere Services & Finalisierung
- [ ] US-014: TÜV, Bremse, Klima implementieren
- [ ] US-039: Auftrag abschließen
- [ ] Final Bug-Hunting
- [ ] Sprint Review vorbereiten

---

## Risks & Mitigation

| Risiko | Wahrscheinlichkeit | Impact | Mitigation |
|--------|-------------------|--------|-----------|
| Odoo-Integration scheitert | Hoch | Kritisch | Fallback: Mock-Integration (JSON-Log) |
| Testing deckt viele Bugs auf | Mittel | Hoch | Buffer für Bugfixes eingeplant |
| Performance-Probleme | Mittel | Mittel | Optimierung: Bild-Komprimierung, Caching |
| Zu wenig Zeit für Testing | Mittel | Hoch | Priorisierung: Kritische Tests zuerst |

---

## Definition of Done

Siehe Sprint 1 DoD + zusätzlich:
- [ ] Odoo-Integration funktioniert (oder Mock ist vollständig)
- [ ] E2E-Tests für alle kritischen Journeys vorhanden
- [ ] Code Coverage > 70%
- [ ] Keine Critical/Blocker Bugs
- [ ] Performance: Ladezeiten < 2 Sek

---

## Deliverables

- Odoo-Integration funktioniert (Buchungen, Rechnungen)
- Umfassende Test-Suite (E2E, Integration, Unit)
- Performance-Optimierungen durchgeführt
- Weitere Services verfügbar (TÜV, Bremse, Klima)
- Kritische Bugs gefixt
- Produkt ist stabil und produktionsreif

---

## Action Items für Product Owner

**Vor Sprint:**
- [ ] Odoo-Zugang mit Finance-Team klären
- [ ] Preise für TÜV, Bremse, Klima festlegen
- [ ] Bug-Priorisierung mit Team durchführen

**Während Sprint:**
- [ ] Odoo-Integration testen (mit Finance)
- [ ] Testing-Sessions teilnehmen
- [ ] Go/No-Go Entscheidung vorbereiten

**Ende Sprint:**
- [ ] Demo: Kompletter Flow mit Odoo-Integration
- [ ] Entscheidung: Ist MVP launch-ready?

---

## Go/No-Go Entscheidung

**Am Ende dieses Sprints:** Entscheidung treffen
- **Go:** MVP ist stabil genug für Sprint 6 Launch Prep
- **No-Go:** Wir brauchen Sprint 6 für weitere Stabilisierung

**Kriterien für Go:**
- [ ] Keine Critical Bugs
- [ ] Odoo-Integration funktioniert (oder Mock ist akzeptabel)
- [ ] E2E-Tests grün
- [ ] Performance akzeptabel

---

**Nächster Sprint:** Sprint 6 - MVP Launch Vorbereitung
