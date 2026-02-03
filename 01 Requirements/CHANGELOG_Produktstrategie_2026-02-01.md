# Change-Log: Strategische Produktänderungen

**Datum:** 2026-02-01
**Version:** 1.1
**Verantwortlich:** Product Owner
**Status:** Implementiert in allen Requirement-Dokumenten

---

## Übersicht der strategischen Änderungen

Basierend auf Stakeholder-Feedback wurden drei fundamentale Änderungen an der Produktstrategie vorgenommen:

1. **Hauptprodukt-Fokus:** Von Ölservice zu Inspektion/Wartung
2. **Pflichtfelder erweitert:** Baujahr und Kilometerstand sind nun Pflichtangaben
3. **Klassifizierung geändert:** Keine Fahrzeugklassen mehr, nur Marke/Modell

---

## 1. Hauptprodukt-Änderung: Ölservice → Inspektion/Wartung

### ALTE Strategie
- Hauptprodukt: Ölservice (wie Mac Oil)
- Inspektion als "großer Bruder" für Post-MVP
- Fokus auf einfachen, standardisierten Ölwechsel

### NEUE Strategie
- **Hauptprodukt: Inspektion/Wartung eines Fahrzeugs**
- Ölservice als separate Option neben der Inspektion
- Umfassendere Wartung abhängig von Kilometerstand und Baujahr

### Auswirkungen

#### Product Vision (00_Product_Vision.md)
- **GEÄNDERT:** Hauptprodukt-Sektion komplett überarbeitet
- Inspektion/Wartung als Kernleistung definiert
- Datenerfassung (Baujahr, Kilometerstand) als Pflicht festgelegt

#### Epics (01_Epics.md)
- **GEÄNDERT:** Epic 1 - Scope erweitert
- Hauptprodukt von "Ölservice" zu "Inspektion/Wartung"
- Abhängigkeiten um Kilometerstand-basierte Wartungsermittlung erweitert

#### User Stories (02_MVP_User_Stories.md)
- **US-002 ÜBERARBEITET:** Service-Auswahl
  - Inspektion/Wartung als Hauptprodukt statt Ölservice
  - Kilometerstand-basierte Empfehlungen (30k, 60k, 90k Intervalle)
  - Baujahr-basierte Hinweise für Verschleißteile

- **US-013 ÜBERARBEITET:** Von "Ölservice als Hauptprodukt" zu "Inspektion/Wartung als Hauptprodukt"
  - Erweiterte Leistungsbeschreibung mit Fahrzeugprüfung
  - Kilometerstand-abhängiger Wartungsumfang
  - Sichtprüfung Verschleißteile hinzugefügt

- **US-014 ÜBERARBEITET:** Weitere Services
  - Ölservice jetzt als separate Option neben Inspektion aufgeführt

#### MoSCoW-Priorisierung (03_MoSCoW_Priorisierung.md)
- **GEÄNDERT:** Must-Have Features
  - Service-Auswahl: "Inspektion/Wartung" statt "Ölservice"
  - Feature-Matrix aktualisiert: Inspektion/Wartung als MVP-Service

### Business-Implikationen
- **Höhere Durchschnittspreise:** Inspektion ist umfassender als reiner Ölservice
- **Mehr Value für Kunden:** Umfassende Wartung statt nur Ölwechsel
- **Differenzierung:** Nicht nur "billiger Ölwechsel" sondern professionelle Inspektion
- **Komplexität:** Wartungsumfang variiert nach Kilometerstand

---

## 2. Pflichtfelder: Baujahr und Kilometerstand

### ALTE Strategie
- Baujahr: Optional (für präzisere Preise)
- Kilometerstand: Nicht im MVP (Post-MVP Feature US-019)
- Festpreise nach Fahrzeugklassen

### NEUE Strategie
- **Baujahr: PFLICHTFELD**
- **Kilometerstand: PFLICHTFELD**
- Beides erforderlich für präzise Wartungsbedarfsermittlung

### Auswirkungen

#### User Stories (02_MVP_User_Stories.md)
- **US-001 KOMPLETT ÜBERARBEITET:** "Minimale Fahrzeugauswahl (3 Klicks)" → "Fahrzeugauswahl mit Pflichtfeldern"
  - Baujahr ist nun Pflichtfeld (Dropdown: aktuelles Jahr bis 30 Jahre zurück)
  - Kilometerstand ist nun Pflichtfeld (numerische Eingabe, 0-500.000 km)
  - Validierung für realistische Werte
  - Titel geändert: nicht mehr "3 Klicks" (da mehr Eingaben erforderlich)

- **US-019 VERSCHOBEN:** Von Post-MVP zu MVP Sprint 1
  - War: "Kilometer-Abfrage für präzisere Preise (Post-MVP)"
  - Jetzt: "Kilometerstand als Pflichtfeld (MVP - IN SPRINT 1)"
  - Status: Must-Have statt Nice-to-Have

- **Story Points ERHÖHT:** US-001 von 5 SP auf 8 SP
  - Grund: Mehr Eingabefelder, mehr Validierung, mehr Komplexität

#### Technische Integration (04_Technische_Integration_Stories.md)
- **Datenmodell AKTUALISIERT:** Vehicle Entity
  ```typescript
  year: number // Pflichtfeld (war: year?: number optional)
  mileage: number // NEU: Pflichtfeld
  ```

- **Datenmodell AKTUALISIERT:** Booking Entity
  ```typescript
  mileage_at_booking: number // NEU: Kilometerstand bei Buchung
  ```

#### MoSCoW-Priorisierung (03_MoSCoW_Priorisierung.md)
- **Won't-Have ENTFERNT:** "Kilometerstand-Abfrage"
- **Must-Have HINZUGEFÜGT:** Pflichtfelder für Baujahr und Kilometerstand
- **Story Points erhöht:** Must-Have von ~50 SP auf ~56 SP

### Business-Implikationen
- **Präzisere Preise:** Kilometerstand ermöglicht korrekte Wartungsbedarfsermittlung
- **Bessere Service-Planung:** Werkstatt kann sich vorbereiten (90k Inspektion = mehr Zeit)
- **Conversion-Risiko:** Mehr Pflichtfelder könnten Absprungrate erhöhen
- **Mitigation:** Felder sind sinnvoll und schnell auszufüllen

### UX-Überlegungen
- **Positiv:** Kunden verstehen, warum Kilometerstand nötig ist (präziser Preis)
- **Risiko:** "3-Klick-Versprechen" nicht mehr haltbar (jetzt 5 Eingaben)
- **Lösung:** Kommunikation anpassen: "In 2 Minuten zum Festpreis"

---

## 3. Klassifizierung: Fahrzeugklassen ENTFERNT

### ALTE Strategie
- Preiskalkulation nach Fahrzeugklassen: Klein, Kompakt, Mittel, Ober, SUV
- Marke/Modell wurde auf Fahrzeugklasse gemappt
- Pauschale Preise pro Klasse (wie bei Mac Oil)

### NEUE Strategie
- **KEINE Fahrzeugklassen mehr**
- **Preiskalkulation ausschließlich nach Marke und Modell**
- Spezifische Preise für jedes Fahrzeugmodell

### Auswirkungen

#### Product Vision (00_Product_Vision.md)
- **GEÄNDERT:** Hauptprodukt-Sektion
  - "KEINE pauschalen Fahrzeugklassen"
  - "Ausschließlich nach Marke und Modell"
  - Explizite Differenzierung hinzugefügt

#### Epics (01_Epics.md)
- **GEÄNDERT:** Epic 1 - Scope
  - "KEINE pauschalen Fahrzeugklassen" (Großschreibung für Betonung)
  - Abhängigkeiten: "Fahrzeugklassen-Zuordnung" → "Marke/Modell-spezifische Preiskalkulation"

#### User Stories (02_MVP_User_Stories.md)
- **US-001 BEREINIGT:**
  - Fallback "allgemeiner Festpreis nach Fahrzeugklasse" ENTFERNT
  - "Fahrzeugklassen-Mapping nach ATU-Modell" ENTFERNT
  - Nur noch marke/modell-spezifische Preise

- **US-004 KOMPLETT ÜBERARBEITET:** "Festpreis-Anzeige nach Fahrzeugklassen" → "Festpreis-Anzeige nach Marke und Modell"
  - Titel geändert
  - Alle Akzeptanzkriterien überarbeitet
  - "Fahrzeugklasse" durch "Marke/Modell" ersetzt
  - Preis-Beispiele umgeschrieben:
    * ALT: "Kleinwagen: 179 EUR", "Kompaktklasse: 199 EUR"
    * NEU: "VW Polo (30k km): 179 EUR", "VW Golf (60k km): 219 EUR"
  - Geschäftsregeln: "KEINE pauschalen Fahrzeugklassen"
  - Story Points: 5 SP → 8 SP (erhöhte Komplexität)

- **US-013 AKTUALISIERT:**
  - Pricing-Orientierung: "KEINE pauschalen Fahrzeugklassen-Preise"

- **US-014 AKTUALISIERT:** Weitere Services
  - "nach Fahrzeugklasse" → "nach Marke/Modell"
  - "ALLE Preise sind marke/modell-spezifisch"

#### MoSCoW-Priorisierung (03_MoSCoW_Priorisierung.md)
- **Won't-Have HINZUGEFÜGT:** "Fahrzeugklassen-Pauschalen"
  - Explizit als ENTFERNT markiert
  - Alternative: "Marke/modell-spezifische Preiskalkulation ist Must-Have"

- **Feature-Matrix AKTUALISIERT:**
  - "3-Klick Auswahl" → "Pflichtfelder (Marke, Modell, Baujahr, KM)"
  - "Festpreis nach Marke/Modell" statt "Festpreis"

#### Technische Integration (04_Technische_Integration_Stories.md)
- **Datenmodell BEREINIGT:** Vehicle Entity
  - `class: VehicleClass` ENTFERNT
  - Kommentar hinzugefügt: "Fahrzeugklassen werden NICHT mehr verwendet"

- **Odoo-Datenmodell AKTUALISIERT:**
  - `"class": "Kompakt"` ENTFERNT
  - Nur noch `brand`, `model`, `year`, `mileage`

### Business-Implikationen
- **Höhere Preistransparenz:** Kunde sieht, dass Preis für sein spezifisches Modell gilt
- **Fairness:** VW Polo und Fiat 500 haben unterschiedliche Wartungskosten
- **Technische Komplexität:** Preisdatenbank muss Tausende Modelle abdecken
- **Preispflege:** Mehr Aufwand, Preise für jedes Modell zu kalkulieren

### Technische Implikationen
- **Preisdatenbank erforderlich:**
  ```javascript
  PriceMatrix {
    brand: "VW",
    model: "Golf 7",
    year_range: [2012, 2019],
    services: {
      inspection_30k: 189,
      inspection_60k: 219,
      inspection_90k: 289,
      oil_service: 159,
      brake_service: 349
    }
  }
  ```

- **Fallback-Strategie:** Was, wenn Modell nicht in Datenbank?
  - Option 1: Manuelle Preisabfrage (Call-to-Action)
  - Option 2: Durchschnittspreis für Marke
  - Option 3: "Preis wird nach Fahrzeugprüfung mitgeteilt"

---

## Sprint-Planung: Auswirkungen auf Timelines

### ALTE Sprint-Planung
- Sprint 1-3: 50 Story Points
- US-001: 5 SP
- US-004: 5 SP

### NEUE Sprint-Planung
- Sprint 1-3: 56 Story Points (+6 SP = +12% mehr Aufwand)
- US-001: 8 SP (+3 SP wegen Pflichtfelder und Validierung)
- US-004: 8 SP (+3 SP wegen marke/modell-Preiskalkulation)

### Gesamtsumme MVP
- ALT: ~85 Story Points
- NEU: ~91 Story Points
- **Erhöhung: +6 SP (+7%)**

### Empfehlung
- Sprint-Planung anpassen: 5-6 Sprints statt 4-5
- Oder: Velocity erhöhen (mehr Ressourcen)
- Priorisieren: Marke/Modell-Preisdatenbank muss früh starten

---

## Offene Fragen & Next Steps

### Kritische Fragen zu klären

| Frage | Betroffene Area | Priorität | Owner |
|-------|-----------------|-----------|-------|
| Wie groß ist die Marke/Modell-Preisdatenbank? | Preiskalkulation | HOCH | PO + Pricing |
| Woher kommen die Preise pro Modell? | Pricing | HOCH | Business |
| Fallback, wenn Modell nicht in DB? | US-001, US-004 | HOCH | PO + UX |
| Wie validieren wir Kilometerstand-Plausibilität? | US-001 | MITTEL | Tech Lead |
| Impact auf Conversion durch mehr Pflichtfelder? | UX | MITTEL | PO + Analytics |
| Können wir Preise dynamisch aus Werkstatt-Daten ziehen? | Technisch | NIEDRIG | Tech Lead |

### Nächste Schritte

1. **Pricing-Workshop** (nächste Woche)
   - Preisdatenbank definieren: Umfang, Quellen, Pflege
   - Fallback-Strategie bei unbekannten Modellen
   - Kalkulationslogik mit Kilometerstand-Multiplikator

2. **UX-Testing** (Sprint 1)
   - Prototyp mit Pflichtfeldern testen
   - Absprungrate messen
   - A/B-Test: "Warum Kilometerstand?" Erklärung

3. **Technisches Spike** (vor Sprint 1)
   - Preisdatenbank-Struktur designen
   - API für Marke/Modell-Lookup
   - Validierung Baujahr/Kilometerstand

4. **Dokumentation aktualisieren** (ERLEDIGT)
   - ✅ 00_Product_Vision.md
   - ✅ 01_Epics.md
   - ✅ 02_MVP_User_Stories.md
   - ✅ 03_MoSCoW_Priorisierung.md
   - ✅ 04_Technische_Integration_Stories.md

---

## Risiken & Mitigation

| Risiko | Auswirkung | Wahrscheinlichkeit | Mitigation |
|--------|-----------|-------------------|-----------|
| Preisdatenbank zu komplex | Verzögerung MVP | MITTEL | Start mit Top 50 Modellen, Rest manuell |
| Mehr Pflichtfelder = höhere Absprungrate | Weniger Conversions | MITTEL | UX-Testing, klare Begründung zeigen |
| Kilometerstand-Angaben unrealistisch | Falsche Preise | NIEDRIG | Validierung + Plausibilitätsprüfung |
| Inspektion zu teuer für Erstbuchung | Weniger Kunden | MITTEL | Ölservice als günstige Einstiegsoption beibehalten |
| Wartungsumfang-Schätzung falsch | Nachkalkulationen | MITTEL | Digitale Auftragserweiterung fängt Abweichungen ab |

---

## Kommunikation an Stakeholder

### Management Summary

**TL;DR:**
- Hauptprodukt ist jetzt Inspektion/Wartung (nicht nur Ölservice)
- Baujahr und Kilometerstand sind Pflichtfelder für präzise Wartungsbedarfsermittlung
- Keine pauschalen Fahrzeugklassen mehr - nur marke/modell-spezifische Preise
- Sprint-Aufwand erhöht sich um ca. 7% (91 statt 85 Story Points)
- MVP-Timeline könnte sich um 1 Sprint verlängern

### Was bedeutet das konkret?

**FÜR KUNDEN:**
- Präzisere, faire Preise basierend auf ihrem spezifischen Fahrzeug
- Umfassendere Wartung statt nur Ölwechsel
- Transparenz: Preis passt zu Marke/Modell und Kilometerstand

**FÜR BUSINESS:**
- Höhere Durchschnittspreise (Inspektion > Ölservice)
- Bessere Kundenbindung durch umfassendere Leistung
- Differenzierung: Nicht "billiger Ölwechsel" sondern "professionelle Inspektion"

**FÜR TECHNIK:**
- Höhere Komplexität: Preisdatenbank für Tausende Modelle
- Mehr Validierung: Baujahr/Kilometerstand-Plausibilität
- Wartungslogik: Kilometerstand-basierte Empfehlungen

---

## Version History

| Version | Datum | Änderungen | Autor |
|---------|-------|-----------|-------|
| 1.0 | 2026-02-01 | Initiales Change-Log erstellt | Product Owner |
| 1.1 | 2026-02-01 | Alle Requirement-Dokumente aktualisiert | Product Owner |

---

**STATUS: ✅ ALLE DOKUMENTE AKTUALISIERT**

Alle Anforderungsdokumente im Ordner "01 Requirements" sind jetzt konsistent und spiegeln die neue Produktstrategie wider.
