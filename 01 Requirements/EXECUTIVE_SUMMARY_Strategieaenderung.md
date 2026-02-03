# Executive Summary: Strategische Produktanpassungen

**Datum:** 2026-02-01
**Für:** Management, Stakeholder, Investoren
**Von:** Product Owner
**Status:** Anforderungen vollständig aktualisiert

---

## TL;DR - Die 3 Kernänderungen

1. **Hauptprodukt ist INSPEKTION/WARTUNG** (nicht nur Ölservice)
2. **Baujahr + Kilometerstand sind PFLICHTFELDER** (für präzise Wartungsbedarfsermittlung)
3. **KEINE Fahrzeugklassen** - nur marke/modell-spezifische Preise

---

## 1. Warum diese Änderungen?

### Problem mit alter Strategie
- **Zu simpel:** Reiner Ölservice zu limitiert, zu geringer Durchschnittsumsatz
- **Ungenaue Preise:** Fahrzeugklassen (Klein/Mittel/Ober/SUV) zu pauschal
- **Fehlende Daten:** Ohne Kilometerstand kann Werkstatt Wartungsumfang nicht planen

### Lösung: Neue Strategie
- **Mehr Value:** Umfassende Inspektion/Wartung statt nur Ölwechsel
- **Faire Preise:** Marke/Modell-spezifisch (VW Golf ≠ BMW 3er)
- **Bessere Planung:** Kilometerstand zeigt, ob 30k, 60k oder 90k Inspektion fällig

---

## 2. Was ändert sich konkret?

### Für KUNDEN

#### VORHER:
- Fahrzeug auswählen: Marke, Modell
- Optional: Baujahr
- Service buchen: Ölservice
- Preis nach Fahrzeugklasse: "Kleinwagen 179 EUR"

#### NACHHER:
- Fahrzeug auswählen: Marke, Modell, **Baujahr (Pflicht), Kilometerstand (Pflicht)**
- Service buchen: **Inspektion/Wartung** (Hauptprodukt)
- Preis nach Marke/Modell: "VW Golf (60.000 km): 219 EUR"

**Vorteil für Kunde:**
- Präziserer, fairer Preis für sein spezifisches Fahrzeug
- Umfassendere Wartung (nicht nur Öl, sondern auch Verschleißteil-Check)
- Transparenz: Preis passt zu Kilometerstand und Wartungsbedarf

---

### Für BUSINESS

| Metrik | ALT (Ölservice) | NEU (Inspektion) | Change |
|--------|-----------------|------------------|--------|
| **Durchschnittspreis** | 179-269 EUR | 219-359 EUR | **+22-33%** |
| **Leistungsumfang** | Öl + Filter | Inspektion + Verschleißteil-Check | **Mehr Value** |
| **Preismodell** | Fahrzeugklassen (5 Kategorien) | Marke/Modell (Tausende) | **Präziser** |
| **Upsell-Potential** | Mittel | Hoch (mehr zu prüfen) | **+30%** |
| **Kundenbindung** | Niedrig (Commodity) | Hoch (professionelle Wartung) | **Besser** |

**Vorteile:**
- **Höhere Margen:** Inspektion rechtfertigt höhere Preise
- **Differenzierung:** Nicht "billiger Ölwechsel" sondern "professionelle Inspektion"
- **Kundenbindung:** Umfassende Wartung schafft Vertrauen
- **Upsell:** Mehr zu prüfen = mehr Auftragserweiterungen

**Risiken:**
- **Conversion:** Mehr Pflichtfelder könnten Absprungrate erhöhen (Mitigation: UX-Testing)
- **Complexity:** Preisdatenbank für Tausende Modelle (Mitigation: Start mit Top 50)

---

### Für TECHNIK

| Bereich | ALT | NEU | Aufwand |
|---------|-----|-----|---------|
| **Fahrzeugdaten** | Marke, Modell | + Baujahr (Pflicht), Kilometerstand (Pflicht) | +3 SP |
| **Preiskalkulation** | 5 Fahrzeugklassen | Tausende Marke/Modell-Kombinationen | +3 SP |
| **Validierung** | Basic | Baujahr/KM-Plausibilität | +2 SP |
| **Datenmodell** | Simple | Erweitert (Mileage Tracking) | +1 SP |

**Gesamt-Aufwand:**
- **MVP Story Points:** 85 SP → 91 SP (+7%)
- **Timeline-Impact:** +1 Sprint (oder Velocity erhöhen)

---

## 3. Business-Impact-Analyse

### Revenue-Potential

**Szenario 1: 100 Buchungen/Monat (Witten MVP)**

| Service | ALT (Ölservice) | NEU (Inspektion) | Diff |
|---------|-----------------|------------------|------|
| Durchschnittspreis | 220 EUR | 280 EUR | +60 EUR |
| **Monatsumsatz** | **22.000 EUR** | **28.000 EUR** | **+27%** |
| **Jahresumsatz** | **264.000 EUR** | **336.000 EUR** | **+72k EUR** |

**Szenario 2: 500 Buchungen/Monat (nach Expansion)**

| Service | ALT (Ölservice) | NEU (Inspektion) | Diff |
|---------|-----------------|------------------|------|
| Monatsumsatz | 110.000 EUR | 140.000 EUR | +30k EUR |
| **Jahresumsatz** | **1.32 Mio EUR** | **1.68 Mio EUR** | **+360k EUR** |

**ROI der Änderung:**
- Entwicklungs-Mehraufwand: +6 SP = ca. 1 Woche
- Revenue-Upside: +27% über Produktlebensdauer
- **Break-Even:** Nach ca. 10 Buchungen

---

### Wettbewerbspositionierung

| Wettbewerber | Hauptprodukt | Preismodell | Differenzierung |
|--------------|--------------|-------------|-----------------|
| **Mac Oil** | Ölservice | 3 Klassen (Klein/Mittel/Groß) | Schnell, günstig |
| **Werkstattportale** | Alle Services | Auktion/Angebote | Viele Optionen, intransparent |
| **Traditionelle Werkstatt** | Inspektion | Nach Aufwand | Lokal, persönlich |
| **WIR (NEU)** | **Inspektion/Wartung** | **Marke/Modell-spezifisch + Festpreis** | **Professionell + Transparent + Concierge** |

**Unique Selling Proposition:**
- Nicht "billigster Ölwechsel" (Mac Oil)
- Nicht "Werkstatt-Auktion" (Portale)
- Sondern: **Professionelle Inspektion mit Festpreis-Garantie und Premium-Concierge**

---

## 4. Risiken & Mitigation

| Risiko | Auswirkung | Wahrscheinlichkeit | Mitigation |
|--------|-----------|-------------------|-----------|
| **Mehr Pflichtfelder = höhere Absprungrate** | -10-20% Conversions | MITTEL | UX-Testing, klare Begründung ("Für Ihren präzisen Preis") |
| **Preisdatenbank zu komplex** | Verzögerung MVP | MITTEL | Start mit Top 50 Modellen, Rest manuell |
| **Kilometerstand unrealistisch** | Falsche Preise | NIEDRIG | Validierung + Plausibilitätsprüfung (z.B. 2015er mit 500k km = Warnung) |
| **Inspektion zu teuer für Erstkunden** | Weniger Neukunden | MITTEL | Ölservice als günstige Einstiegsoption beibehalten |

**Gesamt-Risiko: MITTEL** - Manageable durch Prototyping und Testing

---

## 5. Nächste Schritte & Timeline

### Kritischer Pfad (vor MVP Launch)

| Schritt | Verantwortlich | Deadline | Status |
|---------|---------------|----------|--------|
| **1. Pricing-Workshop** | PO + Business | KW 6 | ⏳ PENDING |
| - Preisdatenbank definieren | Business | | |
| - Top 50 Modelle priorisieren | PO | | |
| - Fallback-Strategie | PO + UX | | |
| **2. UX-Prototyping** | UX Designer | KW 7 | ⏳ PENDING |
| - Wireframes mit Pflichtfeldern | UX | | |
| - A/B-Test Konzept | UX | | |
| **3. Tech Spike** | Tech Lead | Sprint 1 Woche 1 | ⏳ PENDING |
| - Preisdatenbank-Design | Backend | | |
| - Validierungs-Logik | Frontend | | |
| **4. Sprint Planning Anpassung** | PO + Team | KW 7 | ✅ ERLEDIGT |
| - Story Points aktualisiert | PO | | ✅ |
| - Anforderungen dokumentiert | PO | | ✅ |

---

## 6. Entscheidungsvorlage für Stakeholder

### Option A: NEUE Strategie (Empfohlen)
**PRO:**
- ✅ Höherer Revenue (+27%)
- ✅ Bessere Differenzierung am Markt
- ✅ Faire, präzise Preise für Kunden
- ✅ Professionelleres Positioning

**CONTRA:**
- ⚠️ +7% Entwicklungsaufwand
- ⚠️ Risiko: Conversion könnte sinken (mittelbar)
- ⚠️ Preisdatenbank-Pflege erforderlich

**Business-Case:**
- **Zusätzlicher Entwicklungsaufwand:** 1 Woche
- **Zusätzlicher Revenue:** +72k EUR/Jahr (Witten allein)
- **ROI:** Positiv nach 10 Buchungen

### Option B: ALTE Strategie (Nicht empfohlen)
**PRO:**
- ✅ Einfacher, schneller
- ✅ Weniger Conversion-Risiko

**CONTRA:**
- ❌ Niedrigerer Revenue
- ❌ Schwächere Marktpositionierung
- ❌ Ungenaue Preise (Kundenfrust)
- ❌ Nicht differenziert von Mac Oil

---

## 7. Empfehlung des Product Owners

### ✅ EMPFEHLUNG: Option A - NEUE Strategie implementieren

**Begründung:**
1. **Business-Case ist klar:** +27% Revenue bei nur +7% Aufwand
2. **Marktdifferenzierung:** Wir positionieren uns als "professionelle Inspektion", nicht "billiger Ölwechsel"
3. **Kundennutzen:** Faire, präzise Preise schaffen Vertrauen
4. **Risiken beherrschbar:** UX-Testing kann Conversion-Risiko minimieren

**Timing:**
- Änderungen JETZT umsetzen (vor Sprint 1)
- Pricing-Workshop KW 6
- UX-Prototyp KW 7
- MVP-Launch wie geplant (Sprint 6)

**Nächste Aktion:**
- ✅ Anforderungsdokumente aktualisiert (erledigt)
- ⏳ Pricing-Workshop terminieren (KW 6)
- ⏳ Stakeholder-Alignment einholen (diese Woche)

---

## 8. Anlagen

- **Detailliertes Change-Log:** `CHANGELOG_Produktstrategie_2026-02-01.md`
- **Aktualisierte Dokumente:**
  - `00_Product_Vision.md`
  - `01_Epics.md`
  - `02_MVP_User_Stories.md`
  - `03_MoSCoW_Priorisierung.md`
  - `04_Technische_Integration_Stories.md`

---

## Kontakt & Fragen

**Product Owner:** Sten Rauch
**Nächstes Review:** Sprint Planning (KW 7)

Für Rückfragen oder Diskussion: Bitte Termin über Kalender buchen oder direkt ansprechen.

---

**STATUS: ✅ READY FOR STAKEHOLDER REVIEW**
