# MoSCoW-Priorisierung - B2C Autowartungs-App

**Version:** 1.0
**Datum:** 2026-02-01
**Letzte Aktualisierung:** 2026-02-01

---

## Priorisierungs-Framework

Die MoSCoW-Methode hilft uns, Features klar zu priorisieren:

- **Must-Have:** Ohne diese Features kann das Produkt nicht launchen. Kritisch für MVP.
- **Should-Have:** Wichtig für User Experience, aber MVP kann ohne starten. Sollte in Sprint 2-3 folgen.
- **Could-Have:** Nice-to-Have Features, die Mehrwert bringen, aber nicht kritisch sind.
- **Won't-Have:** Bewusst ausgeschlossen für diese Release-Phase. Kommt später oder nie.

---

## MUST-HAVE (MVP - Sprint 1-3)

### Buchungsprozess (Kern-Journey)

| Feature | User Story | Begründung | Sprint |
|---------|-----------|-----------|--------|
| **Fahrzeugauswahl mit Pflichtfeldern** | US-001 | Ohne Fahrzeugdaten (Marke, Modell, Baujahr, KM) keine präzise Wartung. Pflichtfelder für korrekte Bedarfsermittlung. | 1 |
| **Service-Auswahl (Inspektion/Wartung)** | US-002, US-013 | Hauptprodukt. Inspektion/Wartung ist Kernleistung, nicht nur Ölservice. | 1 |
| **Festpreis-Anzeige nach Marke/Modell** | US-004 | USP der App. Marke/modell-spezifische Preise statt pauschaler Fahrzeugklassen. | 1 |
| **Hol-/Bringzeitpunkt buchen** | US-003 | Concierge ist Kern-USP. Ohne Hol-/Bring-Service nur "weiteres Portal". | 2 |
| **Online-Bezahlung (Stripe)** | US-011 | Vorkasse ist Business-Modell. Ohne Payment keine Buchung. | 2 |
| **Buchungsbestätigung** | US-011 | Kunde muss Bestätigung erhalten. Rechtlich relevant. | 2 |

### Concierge-Service

| Feature | User Story | Begründung | Sprint |
|---------|-----------|-----------|--------|
| **Ersatzfahrzeug-Bereitstellung** | US-005 | Kern-Differenzierung. Ohne Ronja-Fahrzeug nur "Hol-/Bring", nicht "Premium Concierge". | 2 |
| **Fahrzeugübergabe mit Protokoll** | US-006 | Rechtliche Absicherung. Haftung bei Schäden muss dokumentiert sein. | 2 |
| **Fahrzeugrückgabe** | US-007 | Ohne Rückgabe kein abgeschlossener Service-Prozess. | 3 |

### Digitale Auftragserweiterung (Kern-USP)

| Feature | User Story | Begründung | Sprint |
|---------|-----------|-----------|--------|
| **Werkstatt erstellt digitales Angebot** | US-008 | Ohne digitale Auftragserweiterung kein USP gegenüber Wettbewerb. Dies hat "keiner in Deutschland". | 3 |
| **Kunde gibt Angebot frei (mit Foto)** | US-009 | Transparenz ist Kern-Versprechen. Kunde muss sehen, wofür er zahlt. | 3 |
| **Zahlung bei Freigabe** | US-010 | Ohne automatische Zahlung manueller Prozess → nicht skalierbar. | 3 |

### Technische Basis

| Feature | User Story | Begründung | Sprint |
|---------|-----------|-----------|--------|
| **Slot-Management Witten** | US-015 | Ohne Slots Doppelbuchungen und Chaos. Muss von Tag 1 funktionieren. | 2 |
| **Payment-Integration (Stripe)** | US-011 | Ohne funktionierende Zahlung kein Go-Live. | 2 |
| **Odoo-Integration (Buchhaltung)** | US-016 | Revenue Tracking und Buchhaltung kritisch. Ohne Odoo manuelle Prozesse → nicht skalierbar. | 3 |

### Multi-Portal-Architektur (Demo-Fähigkeit)

| Feature | User Story | Begründung | Sprint |
|---------|-----------|-----------|--------|
| **Landing Page mit 3 Login-Bereichen** | US-020 | Zentraler Einstiegspunkt für Demo. Alle Stakeholder können Customer Journey nachvollziehen. | 1 |
| **Jockey-Portal Dashboard** | US-021 | Jockey muss Abholungen sehen und durchführen können. Kritisch für Concierge-Service. | 2 |
| **Werkstatt-Portal Dashboard** | US-022 | Werkstatt muss Auftragserweiterungen erstellen können. Kritisch für digitale Auftragserweiterung. | 3 |

**Summe Must-Have:** ~77 Story Points (Sprint 1-3)

HINWEISE:
- Erhöhte Komplexität durch marke/modell-spezifische Preiskalkulation und erweiterte Pflichtfeld-Validierung
- Multi-Portal-Architektur erhöht Aufwand, ist aber kritisch für Demo-Fähigkeit und PoC
- Lokale Deployment-Strategie vereinfacht Infrastruktur (kein Cloud-Setup im MVP)

---

## SHOULD-HAVE (Post-MVP - Sprint 4-5)

### Erweiterte Funktionen

| Feature | User Story | Begründung | Priorität |
|---------|-----------|-----------|-----------|
| **Light-Registrierung (Magic Link)** | US-012 | Verbessert UX für Wiederbuchung. Im MVP: Payment-Daten erfassen reicht. | Hoch |
| **Weitere Services (TÜV, Bremse, Klima)** | US-014 | Erhöht Produktportfolio. Ölservice muss erst laufen, bevor wir erweitern. | Hoch |
| **Jockey-Assignment (automatisch)** | US-017 | Im MVP: Manuelles Assignment durch Witten-Team. Automatisierung erst bei Skalierung. | Mittel |
| **Auto-Wäsche bei Rückgabe** | US-007 | Premium-Feature für Kundenzufriedenheit. Nicht kritisch für Launch. | Mittel |
| **Fahrzeugschein-Upload durch Jockey** | US-006 | Optimiert Wiederbuchung. Im MVP: Kunde gibt nur Marke/Modell ein. | Mittel |

### Optimierungen

| Feature | Beschreibung | Begründung | Priorität |
|---------|-------------|-----------|-----------|
| **Mobile App** | Native iOS/Android App | Im MVP: Responsive Web-App reicht. Native App für bessere UX später. | Mittel |
| **Push-Notifications** | Real-time Updates für Kunde | Im MVP: E-Mail-Benachrichtigung reicht. Push erhöht Engagement. | Mittel |
| **Jockey Live-Tracking** | Kunde sieht Jockey-Position | "Uber-like" Feature. Nice-to-have, nicht kritisch. | Niedrig |
| **Bewertungssystem** | Kunde bewertet Service | Wichtig für Trust-Building. Kann nach 50-100 Buchungen kommen. | Mittel |

**Summe Should-Have:** ~30 Story Points (Sprint 4-5)

---

## COULD-HAVE (Later - Sprint 6+)

### Erweiterte Features

| Feature | Beschreibung | Begründung | Timeframe |
|---------|-------------|-----------|-----------|
| **QR-Code Schnellbuchung** | US-018 | QR-Code-Aufkleber im Auto für Wiederbuchung | Sprint 6 |
| **Multi-Fahrzeug Management** | Kunde verwaltet mehrere Autos | Erst relevant bei größerer Nutzerbasis | Sprint 7 |
| **Abo-Modell / Subscription** | Monatliche Zahlung für regelmäßige Services | Später, wenn Retention-Daten vorliegen | Q3 2026 |
| **Finanzierung / Ratenzahlung** | Klarna/PayPal Ratenkauf | Für teure Reparaturen. Erst bei hohem Ticket-Size | Q4 2026 |
| **Service-Erinnerungen** | Auto-Reminder nach X Monaten/km | CRM-Funktion. Erst bei Bestandskunden-Basis | Sprint 8 |

### Zusätzliche Services

| Service | Beschreibung | Begründung | Timeframe |
|---------|-------------|-----------|-----------|
| **Reifenwechsel** | Saisonaler Reifen-Service | Logistik komplex (Lagerung). Erst bei Skalierung. | Q3 2026 |
| **Glasreparatur** | Steinschlag-Reparatur | Kooperation mit Partner nötig (z.B. Carglass). | Q4 2026 |
| **Wischblätter-Tausch** | Low-Price Add-On | Impulskauf-Artikel. Erst wenn Produkt läuft. | Sprint 6 |
| **Fahrzeugaufbereitung** | Innenreinigung, Polieren | Kommt in Sprint 4-5 als Should-Have. | Sprint 5 |
| **E-Auto-Services** | Hochvolt-Checks, Software-Updates | Separates Segment. Erst wenn E-Auto-Anteil steigt. | 2027 |

### Marketing & Growth

| Feature | Beschreibung | Begründung | Timeframe |
|---------|-------------|-----------|-----------|
| **Referral-Programm** | "Freunde werben Freunde" | Erst bei funktionierendem Produkt. | Sprint 8 |
| **Corporate Partnerships** | MHC, Shell etc. als Trust-Siegel | Trust-Building. Sollte vor Launch vorbereitet sein (Verhandlungen). | Launch-Phase |
| **Loyalty-Programm** | Punkte sammeln bei Buchungen | Retention-Maßnahme. Erst bei 500+ Kunden. | Q3 2026 |

---

## WON'T-HAVE (Diese Release / Bewusst ausgeschlossen)

### Scope bewusst ausgeschlossen

| Feature | Begründung für Ausschluss | Alternative |
|---------|---------------------------|-------------|
| **VIN-basierte Fahrzeugidentifikation** | Zu komplex für MVP. VIN-Eingabe reduziert Conversion. Marke/Modell/Baujahr/KM reichen aus. | Post-MVP: VIN-Scanner für noch präzisere Daten (Sprint 6+) |
| **B2B-Werkstatt-Portal** | Anderer Use Case. Würde Scope sprengen. | Separates Produkt. Nicht Teil dieser App. |
| **Fahrzeugklassen-Pauschalen** | ENTFERNT: Wir klassifizieren NUR nach Marke/Modell, NICHT nach Fahrzeugklassen (Klein/Mittel/Ober/SUV). | Marke/modell-spezifische Preiskalkulation ist Must-Have |
| **Führerschein-Kontrolle** | Compliance-Risiko gering bei B2C. Aufwand zu hoch für MVP. | Später bei Skalierung / Versicherungspartnerschaft |
| **Werkstatt-Auswahl durch Kunde** | Im MVP: 1:1 zu Witten. Kunde wählt nicht, wohin Auto kommt. | Post-MVP: Multi-Werkstatt-Routing ab Sprint 6 |
| **Reparatur-Historie (PDF-Export)** | Nice-to-have für Wiederverkauf. Im MVP: Digitale Akte reicht. | Q3 2026 |
| **Chat-Support** | Im MVP: E-Mail/Telefon. Live-Chat erst bei hohem Volumen. | Q4 2026 (bei 1000+ Buchungen/Monat) |
| **Video-Call mit Werkstatt** | Zu innovativ für MVP. Kunde will Einfachheit, nicht Komplexität. | Eventuell 2027 als Premium-Feature |
| **Eigendiagnose-Tool** | "Was brauche ich?"-Wizard. Im MVP: Kunde wählt aus klarer Liste. | Post-MVP: KI-gestützter Assistent (2027) |

### Technische Entscheidungen (bewusst simpel halten)

| Feature | Begründung für Ausschluss | Alternative |
|---------|---------------------------|-------------|
| **Native Mobile App** | Web-App (PWA) reicht für MVP. Native App zu teuer in Entwicklung. | Responsive Web-App. Native App in Q3 2026 |
| **Multi-Werkstatt-Routing** | Nur Witten im MVP. Routing-Logik zu komplex für Start. | Sprint 6+ bei Expansion |
| **KI-Preiskalkulation** | Im MVP: Feste Fahrzeugklassen-Preise. KI-Optimierung später. | Post-MVP: Machine Learning für dynamische Preise |
| **White-Label für Werkstätten** | Andere Use Case (B2B2C). Würde Architektur verkomplizieren. | Separates Produkt-Roadmap-Item (2027) |

---

## Priorisierungs-Kriterien (RICE Score)

Für größere Entscheidungen nutzen wir RICE:

**Formel:** (Reach × Impact × Confidence) / Effort

### Beispiel-Bewertung: Digitale Auftragserweiterung

| Kriterium | Wert | Begründung |
|-----------|------|-----------|
| **Reach** | 100% | Betrifft jede Buchung (100% der User) |
| **Impact** | 10/10 | Kern-USP. "Keiner in Deutschland hat das." |
| **Confidence** | 80% | Technisch machbar (ähnlich wie Ronja B2B), aber neuer Kontext |
| **Effort** | 13 SP | Hoch (Werkstatt-Integration, Payment, UX) |

**RICE Score:** (100 × 10 × 0.8) / 13 = **61.5** → **Sehr hohe Priorität**

### Beispiel-Bewertung: Reifenwechsel

| Kriterium | Wert | Begründung |
|-----------|------|-----------|
| **Reach** | 30% | Nur 2x pro Jahr relevant (saisonal) |
| **Impact** | 5/10 | Erhöht Frequenz, aber kein USP |
| **Confidence** | 50% | Logistik unklar (Lagerung, Zeitaufwand) |
| **Effort** | 8 SP | Mittel (Slot-Management anpassen, Prozess definieren) |

**RICE Score:** (30 × 5 × 0.5) / 8 = **9.4** → **Niedrige Priorität (Could-Have)**

---

## Sprint-Planung (Empfehlung)

### Sprint 1-3: MVP Must-Haves

**Velocity:** 15-20 SP pro Sprint (angenommen 1 Dev + 1 Frontend + PO)

| Sprint | Features | Story Points | Ziel |
|--------|----------|--------------|------|
| **Sprint 1** | US-001, US-002, US-004, US-013 | 15 SP | Buchungs-Flow ohne Payment (Wireframe-Testing) |
| **Sprint 2** | US-003, US-011, US-015, US-005 | 20 SP | Payment + Slot-Management + Concierge-Prozess |
| **Sprint 3** | US-006, US-007, US-008, US-009, US-010, US-016 | 25 SP | Auftragserweiterung + Odoo-Integration |

**Ziel Sprint 3:** Funktionsfähiger MVP für interne Tests

### Sprint 4-5: Should-Haves + Witten-Pilot

| Sprint | Features | Story Points | Ziel |
|--------|----------|--------------|------|
| **Sprint 4** | US-012, US-014 (TÜV, Bremse), US-017 | 18 SP | Weitere Services + Jockey-Assignment |
| **Sprint 5** | Bugfixes, UX-Optimierungen, Marketing-Vorbereitung | 10 SP | Go-Live Vorbereitung Witten |

**Ziel Sprint 5:** Witten Soft-Launch (Beta mit 50 Kunden)

### Sprint 6+: Skalierung & Could-Haves

- Multi-Werkstatt-Routing
- Weitere Standorte (Dortmund, Essen)
- QR-Code Schnellbuchung
- Native App (iOS/Android)

---

## Entscheidungsmatrix: Wann kommt was?

| Feature-Kategorie | MVP (M) | Post-MVP (S) | Later (C) | Won't (W) |
|-------------------|---------|--------------|-----------|-----------|
| Buchungsprozess | Pflichtfelder (Marke, Modell, Baujahr, KM), Festpreis nach Marke/Modell | Light-Registrierung | Multi-Fahrzeug | VIN-Scanner |
| Concierge | Hol-/Bring, Ersatzfahrzeug, Übergabe | Auto-Wäsche, Giveaways | Live-Tracking | Video-Call |
| Services | Inspektion/Wartung (Hauptprodukt) | TÜV, Bremse, Klima, Ölservice | Reifen, Glas, Aufbereitung | Karosserie-Reparatur |
| Auftragserweiterung | Digital mit Foto, Zahlung | Video-Upload | KI-Diagnose | - |
| Payment | Stripe (Kreditkarte, PayPal) | Ratenzahlung (Klarna) | Abo-Modell | Crypto |
| Technisch | Odoo, Slot-Management | Jockey-Auto-Assignment | Native App, KI-Routing | Blockchain |
| Marketing | Corporate Partners (MHC) | Bewertungen, Google | Referral-Programm | Influencer-Kampagnen |

---

## Review-Zyklus: Priorisierung anpassen

**Wann überprüfen wir MoSCoW?**

1. **Sprint Review:** Nach jedem Sprint - sind Should-Haves jetzt Must-Haves?
2. **Kunden-Feedback:** Nach Witten-Pilot - was brauchen Kunden wirklich?
3. **Competitive Analysis:** Quartalsweise - was macht Wettbewerb?
4. **Strategie-Meeting:** Alle 3 Monate mit Stakeholdern

**Kriterien für Repriorisierung:**

- **Should → Must:** Wenn Beta-User Feature explizit einfordern (z.B. "Ohne Auto-Wäsche 3 Sterne")
- **Could → Should:** Wenn Wettbewerb Feature launcht (Competitive Parity)
- **Won't → Could:** Wenn Business-Modell sich ändert (z.B. B2B-Pivot)

---

## Risiken & Mitigation

| Risiko | Auswirkung | Wahrscheinlichkeit | Mitigation | Priorität |
|--------|-----------|-------------------|-----------|-----------|
| Digitale Auftragserweiterung wird nicht genutzt | USP fällt weg | Mittel | User-Testing vor Launch, Tutorial im Onboarding | Must-Fix |
| Concierge-Kosten zu hoch | Negative Marge | Hoch | Preiskalkulation validieren, ggf. Concierge-Aufpreis ab Sprint 4 | Must-Monitor |
| Werkstatt Witten überlastet | Schlechte Reviews | Mittel | Kapazitätsplanung, Slot-Limits konservativ setzen | Must-Monitor |
| Payment-Ausfälle (Stripe) | Keine Buchungen | Niedrig | Backup Payment-Provider (PayPal), Error-Handling testen | Should-Fix |
| No-Show bei Abholung | Leerlauf Jockey | Hoch | Vorkasse minimiert Risiko, Reminder 24h vor Termin | Should-Fix |

---

## Stakeholder-Alignment

**Wer entscheidet über Priorisierung?**

- **Product Owner (Sten):** Finale Entscheidung über Must/Should/Could
- **Tech Lead:** Veto-Recht bei technischen Won't-Haves (z.B. "Blockchain nicht machbar")
- **Business (Amjad):** Input zu Business-Value (Revenue-Impact)
- **Operations (Werkstatt Witten):** Input zu Machbarkeit (z.B. "Klimaservice braucht neues Gerät")

**Eskalation bei Konflikten:**

1. PO + Tech Lead versuchen Konsens
2. Wenn nicht möglich: Business-Case erstellen (RICE Score)
3. Wenn immer noch unklar: Stakeholder-Meeting einberufen

---

## Nächste Schritte

1. **Sprint Planning:** Must-Haves in Sprint 1-3 aufteilen
2. **Design:** Wireframes für US-001 bis US-004 erstellen
3. **Tech Spike:** Odoo-Integration testen (Machbarkeit klären)
4. **Marketing:** Corporate Partnerships verhandeln (MHC, Shell)
5. **Legal:** AGB, Datenschutz, Storno-Bedingungen klären

---

**Letzte Überarbeitung:** 2026-02-01
**Nächstes Review:** Nach Sprint 1 (ca. 2 Wochen nach Start)
