# Sprint 4 Plan: Digitale Auftragserweiterung

**Sprint:** 4 von 6
**Dauer:** 2 Wochen (Woche 7-8)
**Sprint Goal:** "Werkstatt kann Angebote erstellen. Kunde kann digital freigeben und zahlt automatisch."
**Velocity Ziel:** 29 Story Points

---

## Sprint Objectives

Kern-USP implementieren: Digitale Auftragserweiterung mit Foto-Upload, Kunde gibt frei, automatische Zahlung.

---

## User Stories

| Story ID | Story | SP | Priorität |
|----------|-------|----|-----------|
| **US-008** | Werkstatt erstellt digitales Angebot | 8 | Critical |
| **US-035** | Auftragserweiterung erstellen (Tech) | 8 | Critical |
| **US-036** | Fotos hochladen (Drag & Drop) | 5 | Critical |
| **US-037** | Kunde benachrichtigen | 3 | Critical |
| **US-009** | Kunde gibt Angebot frei | 5 | Critical |
| **US-038** | Status tracken | 3 | High |
| **US-010** | Zahlung Auftragserweiterung | 5 | Critical |
| **US-007** | Fahrzeugrückgabe | 2 | High |
| **US-032** | Rückgabe-Prozess | 5 | High |

**Total:** 44 SP geplant (realistisch 29-33 SP)

**Priorisierung:**
- **Must-Complete:** US-008, US-035, US-036, US-009, US-010
- **Should-Complete:** US-037, US-038, US-007, US-032
- **Nice-to-Have:** -

---

## Key Tasks

### US-035: Auftragserweiterung erstellen (8 SP)

**Tasks:**
1. Frontend: Formular für Angebot (Werkstatt-Portal)
2. Dropdown: Art der Arbeit (Bremse, Luftfilter, Steinschlag, etc.)
3. Textfeld: Beschreibung (min. 20 Zeichen)
4. Preiskalkulation: Festpreis eingeben
5. Foto-Upload-Sektion (US-036)
6. Backend: POST /api/workshop/additional-work
7. Datenmodell: AdditionalWork-Tabelle
8. Validierung: Alle Pflichtfelder

**Akzeptanzkriterien:**
- Werkstatt kann Angebot mit Text, Fotos, Preis erstellen
- Formular validiert Pflichtfelder
- Angebot wird in DB gespeichert (Status: "Offen")

---

### US-036: Fotos hochladen (Drag & Drop) (5 SP)

**Tasks:**
1. Frontend: Drag & Drop Upload-Box
2. Kamera-Zugriff (Mobile)
3. Bild-Komprimierung clientseitig
4. Multi-Upload (max. 10 Fotos)
5. Preview mit Lösch-Option
6. Progress Bar während Upload
7. Backend: Foto-Storage (lokal: File System)

**Akzeptanzkriterien:**
- Werkstatt kann Fotos per Drag & Drop hochladen
- Auf Tablet/Mobile: Kamera direkt nutzen
- Max. 10 Fotos, max. 5 MB pro Foto
- Fotos werden komprimiert vor Upload

---

### US-009: Kunde gibt Angebot frei (5 SP)

**Tasks:**
1. Frontend: Kunden-Portal Angebot-Detail-Seite
2. Anzeige: Beschreibung, Fotos (Galerie mit Zoom), Preis
3. Buttons: "Freigeben" (grün) und "Ablehnen" (rot)
4. Bestätigungs-Modal vor Freigabe: "Sie zahlen jetzt X EUR"
5. Backend: PUT /api/bookings/:id/additional-work/:id/approve
6. Status-Update: "Freigegeben" oder "Abgelehnt"
7. Bei Freigabe: Trigger Payment (US-010)

**Akzeptanzkriterien:**
- Kunde sieht Angebot mit allen Details
- Fotos sind zoombar
- Freigabe triggert Zahlung
- Ablehnung: Werkstatt wird informiert

---

### US-010: Zahlung Auftragserweiterung (5 SP)

**Tasks:**
1. Stripe Payment Intent für Nachzahlung erstellen
2. Karte des Kunden belasten (gespeichert aus erster Zahlung)
3. Webhook: payment_intent.succeeded für Auftragserweiterung
4. Bei Erfolg: Werkstatt benachrichtigen "Freigegeben und bezahlt"
5. Bei Fehler: Kunde benachrichtigen "Zahlung fehlgeschlagen"
6. Rechnung aktualisieren (Ergänzungsrechnung)
7. Odoo-Mock: Zusatz-Rechnung loggen

**Akzeptanzkriterien:**
- Bei Freigabe: Automatische Zahlung
- Bei Erfolg: Werkstatt kann mit Arbeit beginnen
- Bei Fehler: Kunde kann Zahlungsmethode aktualisieren

---

### US-037: Kunde benachrichtigen (3 SP)

**Tasks:**
1. E-Mail-Template: "Zusätzliche Arbeiten vorgeschlagen"
2. E-Mail-Versand nach Angebot-Erstellung
3. Link zur Angebot-Detail-Seite
4. Erinnerung nach 2 Stunden (Delayed Job)
5. Push-Notification (optional, Post-MVP)

**Akzeptanzkriterien:**
- Kunde erhält sofort E-Mail nach Angebot
- Link führt direkt zur Angebot-Seite
- Erinnerung wird gesendet, wenn Kunde nicht reagiert

---

### US-038: Status tracken (3 SP)

**Tasks:**
1. Werkstatt-Dashboard: Status-Spalte für Angebote
2. Farbcodierung: Gelb=Offen, Grün=Freigegeben, Rot=Abgelehnt
3. Real-Time Updates (WebSocket oder Polling)
4. Benachrichtigung bei Status-Änderung

**Akzeptanzkriterien:**
- Werkstatt sieht Status aller Angebote
- Bei Freigabe: Benachrichtigung "Kann durchgeführt werden"

---

### US-007 & US-032: Fahrzeugrückgabe (2 + 5 = 7 SP)

**Tasks:**
1. Rückgabe-Protokoll (analog zu Übergabe)
2. Fotos nach Service
3. Unterschrift Kunde (Bestätigung Erhalt)
4. Google-Bewertungs-Link (QR-Code oder SMS)
5. Status auf "Abgeschlossen" setzen
6. E-Mail: Abschluss-Rechnung

**Akzeptanzkriterien:**
- Jockey kann Rückgabe dokumentieren
- Kunde unterschreibt Rückgabe
- Status wird auf "Abgeschlossen" gesetzt

---

## Sprint Backlog Timeline

### Day 1-3: Auftragserweiterung Formular
- [ ] US-035: Formular bauen (Werkstatt)
- [ ] US-036: Foto-Upload implementieren
- [ ] US-008: Backend AdditionalWork-Tabelle

### Day 4-6: Kunde gibt frei & Payment
- [ ] US-009: Kunden-Portal Angebot-Seite
- [ ] US-010: Payment-Erweiterung Stripe
- [ ] US-037: E-Mail-Benachrichtigung
- [ ] US-038: Status-Tracking

### Day 7-8: Rückgabe-Prozess
- [ ] US-032: Rückgabe-Protokoll
- [ ] US-007: Google-Bewertungs-Link
- [ ] Integration mit Auftrag-Abschluss

### Day 9-10: Testing & Finalisierung
- [ ] End-to-End Test: Auftragserweiterung komplett
- [ ] Payment-Tests (Erfolg, Fehler)
- [ ] Bugfixes
- [ ] Sprint Review

---

## Risks & Mitigation

| Risiko | Wahrscheinlichkeit | Impact | Mitigation |
|--------|-------------------|--------|-----------|
| Auftragserweiterung UX unklar | Mittel | Hoch | Wireframes, Feedback Werkstatt |
| Payment-Erweiterung Fehler | Niedrig | Hoch | Stripe Test-Szenarien |
| Foto-Upload buggy | Mittel | Mittel | Extensive Tests |

---

## Deliverables

- Werkstatt kann Auftragserweiterung mit Fotos erstellen
- Kunde erhält Benachrichtigung und kann freigeben
- Automatische Zahlung bei Freigabe
- Werkstatt sieht Status (Freigegeben/Abgelehnt)
- Rückgabe-Prozess funktioniert

---

## Action Items für Product Owner

**Vor Sprint:**
- [ ] Wireframes für Angebot-Erstellung reviewen
- [ ] E-Mail-Templates schreiben
- [ ] Werkstatt Witten Feedback einholen

**Während Sprint:**
- [ ] UX-Testing: Auftragserweiterung
- [ ] Payment-Flow testen

**Ende Sprint:**
- [ ] Demo: Kompletter Auftragserweiterungs-Flow

---

**Nächster Sprint:** Sprint 5 - Odoo-Integration & Testing
