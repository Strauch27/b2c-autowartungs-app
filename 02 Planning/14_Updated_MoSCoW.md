# MoSCoW-Priorisierung (Aktualisiert) - B2C Autowartungs-App

**Version:** 2.0
**Datum:** 2026-02-01
**Inkludiert:** Alle User Stories US-001 bis US-040

---

## MUST-HAVE (MVP - Sprints 1-6)

### Fundament & Multi-Portal-Architektur

| Story | Feature | Begründung | Sprint | SP |
|-------|---------|-----------|--------|-----|
| US-020 | Landing Page mit drei Login-Bereichen | Demo-Anforderung. Zentraler Einstiegspunkt für alle Stakeholder. | 1 | 5 |
| US-021 | Kunden-Login (Magic Link) | Einfacher Login ohne Passwort für Kunden. | 1 | 5 |
| US-022 | Jockey-Login (Username/Password) | Jockey muss sich anmelden können für Concierge-Service. | 1 | 3 |
| US-023 | Werkstatt-Login (Username/Password) | Werkstatt muss Zugang haben für Auftragsverwaltung. | 1 | 3 |
| US-024 | Session Management & Logout | Sicherheit und Session-Verwaltung. | 1 | 2 |

### Buchungsprozess (Kernfunktion)

| Story | Feature | Begründung | Sprint | SP |
|-------|---------|-----------|--------|-----|
| US-001 | Fahrzeugauswahl mit Pflichtfeldern | Basis für Preiskalkulation. KEINE Buchung ohne Fahrzeugdaten. | 1 | 8 |
| US-002 | Service-Auswahl (Inspektion als Hauptprodukt) | Kernprodukt definieren. Kunde muss wählen können. | 1 | 5 |
| US-004 | Festpreis nach Marke/Modell | USP der App. Ohne Festpreis kein Vertrauen. | 1 | 8 |
| US-013 | Inspektion/Wartung als Hauptprodukt | Produktdefinition. Nicht nur Ölservice. | 1 | 2 |
| US-019 | Kilometerstand als Pflichtfeld | Präzise Wartungsbedarfsermittlung. | 1 | 2 |
| US-003 | Hol-/Bringzeitpunkt buchen | Concierge ist Kern-USP. Ohne Termin keine Abholung. | 2 | 8 |
| US-011 | Online-Bezahlung (Stripe) | Ohne Payment keine Buchung. Vorkasse ist Business-Modell. | 2 | 8 |

### Concierge-Service (Differenzierung)

| Story | Feature | Begründung | Sprint | SP |
|-------|---------|-----------|--------|-----|
| US-005 | Ersatzfahrzeug-Bereitstellung | Kern-USP. Ohne Ronja-Fahrzeug nur "Hol-/Bring", nicht "Premium". | 2 | 2 |
| US-025 | Jockey-Dashboard | Jockey muss Abholungen sehen können. Kritisch für Concierge. | 2 | 5 |
| US-026 | Auftrags-Details einsehen | Jockey benötigt Infos für Abholung. | 2 | 3 |
| US-027 | Navigation zur Abholadresse | Effizienz für Jockey. One-Click Navigation. | 2 | 2 |
| US-006 | Fahrzeugübergabe mit Protokoll | Rechtliche Absicherung. Haftung bei Schäden dokumentieren. | 3 | 3 |
| US-028 | Übergabeprotokoll erstellen | Digitale Dokumentation für Haftung. | 3 | 8 |
| US-030 | Fahrzeugzustand dokumentieren | Fotos zur Schadensdokumentation. Pflicht. | 3 | 5 |
| US-031 | Status-Updates senden | Kunde muss informiert werden. Transparenz. | 3 | 5 |
| US-007 | Fahrzeugrückgabe | Ohne Rückgabe kein abgeschlossener Service. | 4 | 2 |
| US-032 | Rückgabe-Prozess | Digitale Rückgabe-Dokumentation. | 4 | 5 |

### Digitale Auftragserweiterung (Kern-USP)

| Story | Feature | Begründung | Sprint | SP |
|-------|---------|-----------|--------|-----|
| US-033 | Werkstatt-Dashboard | Werkstatt muss Aufträge sehen. Einstieg für Auftragserweiterung. | 3 | 5 |
| US-034 | Auftrags-Details | Werkstatt braucht Fahrzeuginfos. | 3 | 3 |
| US-008 | Werkstatt erstellt digitales Angebot | Kern-USP. "Keiner in Deutschland hat das." | 4 | 8 |
| US-035 | Auftragserweiterung erstellen | Technische Umsetzung Angebot-Erstellung. | 4 | 8 |
| US-036 | Fotos hochladen | Transparenz durch Bilder. | 4 | 5 |
| US-037 | Kunde benachrichtigen | Kunde muss Angebot erhalten. | 4 | 3 |
| US-009 | Kunde gibt Angebot frei | Transparenz. Kunde entscheidet. | 4 | 5 |
| US-038 | Status tracken | Werkstatt muss wissen: Freigegeben oder abgelehnt? | 4 | 3 |
| US-010 | Zahlung Auftragserweiterung | Automatische Zahlung bei Freigabe. | 4 | 5 |

### Technische Basis (Kritisch)

| Story | Feature | Begründung | Sprint | SP |
|-------|---------|-----------|--------|-----|
| US-015 | Slot-Management Witten | Ohne Slots Doppelbuchungen. Muss von Tag 1 funktionieren. | 2 | 8 |
| US-016 | Odoo-Integration | Revenue Tracking kritisch. Ohne Odoo manuelle Prozesse. | 5 | 13 |
| TECH-001 | Stripe Payment Setup | Payment-Integration essentiell. | 2 | 8 |
| TECH-014 | Lokales Deployment Setup | 100% lokal lauffähig für PoC. | 1 | 8 |
| TECH-015 | Multi-Portal Authentication & RBAC | Drei Portale benötigen separate Auth. | 1 | 13 |

**Summe Must-Have:** 180 Story Points (Sprints 1-6)

---

## SHOULD-HAVE (Post-MVP - Sprints 7-8)

### Erweiterte Funktionen

| Story | Feature | Begründung | Priorität | SP |
|-------|---------|-----------|-----------|-----|
| US-012 | Light-Registrierung | Verbessert UX für Wiederbuchung. Im MVP: Payment-Daten reichen. | Hoch | 5 |
| US-014 | Weitere Services (TÜV, Bremse, Klima) | Erweitert Produktportfolio. Inspektion muss erst laufen. | Hoch | 3 |
| US-029 | Fahrzeugschein fotografieren | Optimiert Wiederbuchung. Nicht kritisch für MVP. | Mittel | 3 |
| US-039 | Auftrag abschließen | Werkstatt-Workflow vervollständigen. | Hoch | 5 |
| US-040 | Kommunikation Jockey | Für Rückfragen hilfreich, aber nicht kritisch. | Mittel | 5 |
| US-017 | Jockey-Assignment (automatisch) | MVP: Manuelles Assignment reicht. Automatisierung später. | Mittel | 8 |
| TECH-009 | Driver-App Integration | Integration bestehende App. Nice-to-have. | Mittel | 5 |

### Optimierungen

| Feature | Beschreibung | Begründung | Priorität | SP |
|---------|-------------|-----------|-----------|-----|
| Auto-Wäsche | Fahrzeug bei Rückgabe gewaschen | Premium-Feature. Kundenzufriedenheit. Nicht kritisch. | Mittel | 2 |
| Push-Notifications | Real-time Updates für Kunde | Erhöht Engagement. E-Mail reicht im MVP. | Mittel | 5 |
| Mobile App | Native iOS/Android | Responsive Web reicht für MVP. Native später. | Mittel | 21 |
| Bewertungssystem | Kunde bewertet Service | Trust-Building. Nach 50-100 Buchungen. | Mittel | 8 |

**Summe Should-Have:** 70 Story Points (Sprints 7-8)

---

## COULD-HAVE (Later - Sprint 9+)

### Erweiterte Features

| Feature | Beschreibung | Timeframe | SP |
|---------|-------------|-----------|-----|
| US-018 | QR-Code Schnellbuchung | Aufkleber im Auto für Wiederbuchung | Sprint 9 | 3 |
| Jockey Live-Tracking | "Uber-like" GPS-Tracking | Sprint 10 | 13 |
| Multi-Fahrzeug Management | Kunde verwaltet mehrere Autos | Sprint 10 | 8 |
| Service-Erinnerungen | Auto-Reminder nach X Monaten/km | Sprint 11 | 5 |
| Abo-Modell | Monatliche Zahlung für Services | Q3 2026 | 21 |

### Zusätzliche Services

| Service | Beschreibung | Timeframe | SP |
|---------|-------------|-----------|-----|
| Reifenwechsel | Saisonaler Service | Q3 2026 | 13 |
| Glasreparatur | Steinschlag-Reparatur (Kooperation) | Q4 2026 | 8 |
| Wischblätter | Low-Price Add-On | Sprint 9 | 2 |
| E-Auto-Services | Hochvolt-Checks | 2027 | 21 |

### Marketing & Growth

| Feature | Beschreibung | Timeframe | SP |
|---------|-------------|-----------|-----|
| Referral-Programm | Freunde werben Freunde | Sprint 11 | 8 |
| Loyalty-Programm | Punkte sammeln | Q3 2026 | 13 |
| Corporate Partnerships | MHC, Shell als Trust-Siegel | Launch-Phase | 5 |

---

## WON'T-HAVE (Diese Release)

### Bewusst ausgeschlossen

| Feature | Begründung | Alternative |
|---------|-----------|-------------|
| VIN-basierte Identifikation | Zu komplex. Marke/Modell reicht. | Post-MVP: VIN-Scanner (Sprint 10+) |
| Fahrzeugklassen-Pauschalen | ENTFERNT. Nur noch Marke/Modell-Preise. | Marke/modell-spezifisch ist Must-Have |
| B2B-Werkstatt-Portal | Anderer Use Case. Würde Scope sprengen. | Separates Produkt |
| Führerschein-Kontrolle | Aufwand zu hoch für MVP. | Bei Skalierung / Versicherungspartner |
| Werkstatt-Auswahl | MVP: 1:1 zu Witten. Keine Multi-Werkstatt. | Post-MVP ab Sprint 9 |
| Chat-Support | E-Mail/Telefon reicht im MVP. | Q4 2026 (bei 1000+ Buchungen/Monat) |
| Video-Call mit Werkstatt | Zu komplex für MVP. | Eventuell 2027 |
| Eigendiagnose-Tool | Kunde wählt aus klarer Liste. | Post-MVP: KI-Assistent (2027) |

### Technische Entscheidungen

| Feature | Begründung | Alternative |
|---------|-----------|-------------|
| Native Mobile App | Web-App (PWA) reicht. Native zu teuer. | Q3 2026 |
| Multi-Werkstatt-Routing | Nur Witten im MVP. | Sprint 9+ bei Expansion |
| KI-Preiskalkulation | Feste Preise im MVP. KI später. | Post-MVP: Machine Learning |
| White-Label | B2B2C Use Case. Verkompliziert Architektur. | Roadmap 2027 |

---

## Priorisierungs-Matrix

| Feature-Kategorie | Must (M) | Should (S) | Could (C) | Won't (W) |
|-------------------|----------|------------|-----------|-----------|
| **Buchungsprozess** | Pflichtfelder, Festpreis | Light-Registrierung | Multi-Fahrzeug | VIN-Scanner |
| **Concierge** | Hol-/Bring, Ersatzfahrzeug, Übergabe | Auto-Wäsche | Live-Tracking | Video-Call |
| **Services** | Inspektion/Wartung | TÜV, Bremse, Klima | Reifen, Glas | Karosserie |
| **Auftragserweiterung** | Digital mit Foto, Zahlung | Workflow-Optimierung | Video-Upload, KI | - |
| **Payment** | Stripe (Kreditkarte, PayPal) | Ratenzahlung | Abo-Modell | Crypto |
| **Technisch** | Odoo, Slot-Management, RBAC | Jockey-Auto-Assignment | Native App | Blockchain |
| **Marketing** | Corporate Partners | Bewertungen, Google | Referral | Influencer |

---

## RICE Score: Top-Prioritäten

### Must-Haves nach RICE bewertet

| Feature | Reach | Impact | Confidence | Effort | RICE | Priorität |
|---------|-------|--------|-----------|--------|------|-----------|
| Digitale Auftragserweiterung | 100% | 10/10 | 80% | 21 SP | **38.1** | 1 |
| Festpreis nach Marke/Modell | 100% | 10/10 | 90% | 8 SP | **112.5** | 2 |
| Online-Bezahlung (Stripe) | 100% | 10/10 | 95% | 8 SP | **118.8** | 3 |
| Landing Page (3 Portale) | 100% | 8/10 | 90% | 5 SP | **144.0** | 4 |
| Concierge-Service (komplett) | 100% | 9/10 | 85% | 30 SP | **25.5** | 5 |
| Slot-Management | 100% | 9/10 | 80% | 8 SP | **90.0** | 6 |
| Odoo-Integration | 80% | 7/10 | 70% | 13 SP | **30.8** | 7 |

### Should-Haves nach RICE

| Feature | Reach | Impact | Confidence | Effort | RICE | Priorität |
|---------|-------|--------|-----------|--------|------|-----------|
| Weitere Services (TÜV, Bremse) | 60% | 6/10 | 80% | 3 SP | **96.0** | 1 |
| Light-Registrierung | 80% | 5/10 | 90% | 5 SP | **72.0** | 2 |
| Jockey-Assignment (auto) | 50% | 7/10 | 60% | 8 SP | **26.3** | 3 |
| Bewertungssystem | 40% | 8/10 | 70% | 8 SP | **28.0** | 4 |

---

## Sprint-Verteilung (Übersicht)

| Sprint | Fokus | Must-Have SP | Velocity | Auslastung |
|--------|-------|--------------|----------|------------|
| **Sprint 1** | Fundament & Buchung | 36 SP | 35-40 SP | 90-100% |
| **Sprint 2** | Payment & Concierge Start | 31 SP | 35-40 SP | 78-89% |
| **Sprint 3** | Concierge & Werkstatt Start | 29 SP | 35-40 SP | 73-83% |
| **Sprint 4** | Auftragserweiterung | 29 SP | 35-40 SP | 73-83% |
| **Sprint 5** | Odoo & Finalisierung | 18 SP | 35-40 SP | 45-51% |
| **Sprint 6** | Testing & MVP Launch | 15 SP | 35-40 SP | 38-43% |

**Total MVP:** 158 SP Must-Have (technische Stories hinzugerechnet)

**Sprint 7-8:** Should-Haves (~35 SP pro Sprint)

---

## Risiken & Dependencies

### Kritische Abhängigkeiten

| Story | Abhängig von | Risiko bei Verzögerung |
|-------|-------------|------------------------|
| US-021, US-022, US-023 | US-020 (Landing Page) | Keine Logins möglich → Blocker |
| US-025, US-028 | US-022 (Jockey-Login) | Jockey kann nicht arbeiten → Blocker |
| US-035 | US-033 (Werkstatt-Dashboard) | Keine Auftragserweiterung → USP fehlt |
| US-011 | TECH-001 (Stripe) | Keine Zahlung → Blocker |
| US-016 | TECH-004 (Odoo) | Keine Buchhaltung → Kritisch |

### Technische Risiken

| Risiko | Auswirkung | Wahrscheinlichkeit | Mitigation |
|--------|-----------|-------------------|-----------|
| Odoo-Integration scheitert | Keine Buchhaltung | Mittel | Spike in Sprint 1, Fallback: Manueller Export |
| Stripe-Integration komplex | Payment verzögert | Niedrig | Frühzeitiger Start Sprint 2, Stripe Test Mode |
| Multi-Portal RBAC zu komplex | Verzögerung Sprint 1 | Mittel | Vereinfachte Auth im MVP, Optimierung Post-MVP |
| Foto-Upload Performance | Langsame Uploads | Mittel | Bild-Komprimierung, CDN später |

---

## Entscheidungsprotokoll

### Wichtige Priorisierungs-Entscheidungen

**Entscheidung 1: Landing Page mit 3 Portalen ist Must-Have**
- **Warum:** Demo-Anforderung. Stakeholder müssen komplette Journey sehen.
- **Datum:** 2026-02-01
- **Entscheider:** Product Owner

**Entscheidung 2: Kilometerstand ist Pflichtfeld (US-019)**
- **Warum:** Präzise Wartungsbedarfsermittlung. Ohne KM keine korrekte Preiskalkulation.
- **Datum:** 2026-02-01
- **Entscheider:** Product Owner, Tech Lead

**Entscheidung 3: Fahrzeugklassen ENTFERNT**
- **Warum:** Marke/Modell-spezifische Preise sind Differenzierung. Keine Pauschalen.
- **Datum:** 2026-02-01
- **Entscheider:** Product Owner, Business

**Entscheidung 4: Jockey Live-Tracking ist Could-Have**
- **Warum:** Nice-to-have, aber nicht kritisch. Status-Updates reichen im MVP.
- **Datum:** 2026-02-01
- **Entscheider:** Product Owner

**Entscheidung 5: Odoo-Integration ist Must-Have trotz Risiko**
- **Warum:** Ohne Buchhaltung nicht skalierbar. Risiko durch Spike reduzieren.
- **Datum:** 2026-02-01
- **Entscheider:** Product Owner, CFO

---

## Review-Zyklus

**Wann MoSCoW überprüfen?**

1. **Sprint Review:** Nach jedem Sprint - Repriorisierung bei Bedarf
2. **Kunden-Feedback:** Nach Witten-Pilot (Sprint 6) - Was brauchen User wirklich?
3. **Competitive Analysis:** Quartalsweise - Was macht Wettbewerb?
4. **Strategie-Meeting:** Alle 3 Monate mit Stakeholdern

**Kriterien für Repriorisierung:**

- **Should → Must:** Wenn Beta-User Feature explizit einfordern
- **Could → Should:** Wenn Wettbewerb Feature launcht
- **Won't → Could:** Wenn Business-Modell sich ändert

---

## Nächste Schritte

1. Sprint Planning: Must-Haves in Sprints 1-6 aufteilen (detailliert)
2. Design: Wireframes für US-020, US-025, US-033
3. Tech Spike: Odoo-API testen (Sprint 1)
4. Marketing: Corporate Partnerships vorbereiten
5. Legal: AGB, Datenschutz, Storno-Bedingungen

---

**Letzte Überarbeitung:** 2026-02-01
**Nächstes Review:** Nach Sprint 1 (ca. 2 Wochen)
