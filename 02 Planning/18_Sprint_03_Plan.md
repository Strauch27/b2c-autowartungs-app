# Sprint 3 Plan: Concierge & Werkstatt Start

**Sprint:** 3 von 6
**Dauer:** 2 Wochen (Woche 5-6)
**Sprint Goal:** "Jockey kann Fahrzeug abholen und dokumentieren. Werkstatt sieht Aufträge und kann arbeiten."
**Velocity Ziel:** 29 Story Points

---

## Sprint Objectives

Concierge-Service vollständig implementieren: Übergabeprotokoll mit Fotos, Status-Updates, Werkstatt-Portal für Auftragsverwaltung.

---

## User Stories

| Story ID | Story | SP | Priorität |
|----------|-------|----|-----------|
| **US-006** | Fahrzeugübergabe mit Protokoll | 3 | Critical |
| **US-028** | Übergabeprotokoll erstellen (digital) | 8 | Critical |
| **US-030** | Fahrzeugzustand dokumentieren (Fotos) | 5 | Critical |
| **US-031** | Status-Updates senden | 5 | Critical |
| **US-033** | Werkstatt-Dashboard | 5 | Critical |
| **US-034** | Auftrags-Details | 3 | High |

**Total:** 29 SP

---

## Key Tasks

### US-028: Übergabeprotokoll (8 SP)

**Tasks:**
1. Frontend: Übergabe-Wizard (Step-by-Step)
2. Checklist: Fahrzeugzustand prüfen
3. Foto-Upload von allen 4 Seiten (Kamera-API)
4. Kilometerstand eingeben (Pflicht)
5. Tankanzeige dokumentieren
6. Digitale Unterschrift (Canvas)
7. Backend: Protokoll speichern
8. E-Mail an Kunde: "Fahrzeug abgeholt"

**Akzeptanzkriterien:**
- Jockey kann Protokoll nur abschließen, wenn alle Pflichtfelder ausgefüllt
- Min. 4 Fotos erforderlich
- Unterschrift muss vorhanden sein
- Protokoll wird in DB gespeichert

---

### US-030: Fahrzeugzustand dokumentieren (5 SP)

**Tasks:**
1. Kamera-Integration (HTML5 oder Native)
2. Foto-Preview nach Aufnahme
3. Bild-Komprimierung (max. 1920x1080)
4. Upload zu lokalem Storage (später: Azure Blob)
5. UI: Icons für 4 Seiten (Vorne, Hinten, Links, Rechts)
6. Kommentar-Funktion bei Schäden

**Akzeptanzkriterien:**
- Min. 4 Fotos erforderlich (alle Seiten)
- Fotos werden komprimiert (< 2 MB)
- Upload funktioniert auch bei langsamer Verbindung

---

### US-031: Status-Updates senden (5 SP)

**Tasks:**
1. Backend: Status-Update-Endpoint (POST /bookings/:id/status)
2. Status-Optionen: "Unterwegs", "Abgeholt", "In Werkstatt", "Fertig", "Zurückgebracht"
3. E-Mail-Benachrichtigung an Kunde bei jedem Status-Wechsel
4. Frontend: Status-Update-Button im Jockey-Portal
5. WebSocket oder Polling für Real-Time Updates (optional)

**Akzeptanzkriterien:**
- Jockey kann Status aktualisieren
- Kunde erhält E-Mail bei jedem wichtigen Schritt
- Werkstatt sieht aktuellen Status

---

### US-033: Werkstatt-Dashboard (5 SP)

**Tasks:**
1. Frontend: Werkstatt-Dashboard Layout (Tablet-optimiert)
2. Backend: API für Aufträge (GET /api/workshop/orders)
3. Liste: Alle Aufträge mit Status
4. Filter: "Annahme ausstehend", "In Arbeit", "Fertig"
5. Cards: Kundendaten, Fahrzeugdaten, Service-Art
6. Button: "Details anzeigen"
7. Button: "Auftragserweiterung erstellen" (vorbereitet für Sprint 4)

**Akzeptanzkriterien:**
- Werkstatt sieht alle heutigen Aufträge
- Aufträge sind nach Priorität sortiert
- Status wird farblich markiert (Rot=Dringend, Grün=Fertig)

---

### US-034: Auftrags-Details (3 SP)

**Tasks:**
1. Frontend: Detail-Seite für Auftrag
2. Kundendaten anzeigen
3. Fahrzeugdaten mit Kilometerstand
4. Fotos vom Jockey (Übergabeprotokoll)
5. Service-Buchung Details
6. Historie (falls Bestandskunde)

**Akzeptanzkriterien:**
- Werkstatt sieht alle relevanten Infos
- Fotos vom Fahrzeugzustand sind einsehbar (Zoom-Funktion)

---

### US-006: Fahrzeugübergabe mit Protokoll (3 SP)

**Tasks:**
1. Konzept: Ablauf Fahrzeugübergabe definieren
2. Checkliste erstellen (was muss Jockey prüfen?)
3. Integration US-028 (Übergabeprotokoll)
4. Training-Material für Jockeys erstellen

**Akzeptanzkriterien:**
- Prozess ist dokumentiert
- Jockey weiß, was zu tun ist

---

## Sprint Backlog Timeline

### Day 1-3: Übergabeprotokoll Start
- [ ] US-028: Wizard-UI bauen
- [ ] US-030: Kamera-Integration
- [ ] US-030: Foto-Upload

### Day 4-6: Übergabeprotokoll Finalisierung
- [ ] US-028: Unterschrift-Feature
- [ ] US-028: Backend Protokoll speichern
- [ ] US-006: Konzept dokumentieren
- [ ] US-031: Status-Updates implementieren

### Day 7-8: Werkstatt-Portal
- [ ] US-033: Werkstatt-Dashboard bauen
- [ ] US-034: Detail-Seite
- [ ] API: Werkstatt-Aufträge

### Day 9-10: Testing & Finalisierung
- [ ] End-to-End Test: Abholung → Übergabe → Werkstatt
- [ ] Mobile-Testing (Jockey-App)
- [ ] Bugfixes
- [ ] Sprint Review

---

## Risks & Mitigation

| Risiko | Wahrscheinlichkeit | Impact | Mitigation |
|--------|-------------------|--------|-----------|
| Foto-Upload Performance | Mittel | Mittel | Bild-Komprimierung, max. 5 MB |
| Übergabeprotokoll UX zu komplex | Mittel | Hoch | Wizard-UI, User-Testing |
| Unterschrift-Feature buggy | Niedrig | Mittel | Canvas-API testen, Fallback: Checkbox |
| Offline-Funktionalität fehlt | Hoch | Mittel | Akzeptiert im MVP, Post-MVP Feature |

---

## Definition of Done

Siehe Sprint 1 DoD + zusätzlich:
- [ ] Fotos werden korrekt hochgeladen und angezeigt
- [ ] Übergabeprotokoll kann nicht ohne alle Pflichtfelder abgeschlossen werden
- [ ] Mobile-Testing durchgeführt (iOS + Android)

---

## Deliverables

- Jockey kann Fahrzeug abholen und dokumentieren
- Übergabeprotokoll mit Fotos und Unterschrift
- Status-Updates funktionieren (Kunde wird informiert)
- Werkstatt-Portal zeigt Aufträge an
- Werkstatt kann Auftrag-Details einsehen

---

## Action Items für Product Owner

**Vor Sprint:**
- [ ] User-Flow Übergabeprotokoll finalisieren
- [ ] Checkliste für Fahrzeugübergabe schreiben
- [ ] Wireframes für Werkstatt-Dashboard reviewen

**Während Sprint:**
- [ ] UX-Testing mit Jockey durchführen
- [ ] Feedback zu Werkstatt-Portal geben

**Ende Sprint:**
- [ ] Demo: Kompletter Concierge-Prozess (Abholung → Werkstatt)

---

**Nächster Sprint:** Sprint 4 - Auftragserweiterung
