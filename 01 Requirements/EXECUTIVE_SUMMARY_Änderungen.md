# Executive Summary: Strategische Produktanpassungen

**Datum:** 2026-02-01
**Zielgruppe:** Stakeholder, Management, Investoren
**Status:** Anforderungen aktualisiert, bereit für Sprint Planning

---

## Kernaussagen in 60 Sekunden

1. **Hauptprodukt geändert:** Wir positionieren uns als **Inspektion/Wartungs-Service**, nicht als reiner Ölservice-Anbieter
2. **Präzisere Preise:** Baujahr und Kilometerstand sind jetzt **Pflichtfelder** für bessere Wartungsplanung
3. **Marke/Modell-spezifisch:** Keine pauschalen Fahrzeugklassen mehr - jeder Kunde bekommt einen **individuellen Preis** für sein spezifisches Fahrzeug
4. **Lokale Version zuerst:** MVP ist 100% lokal ausführbar (kein Cloud-Setup), Azure-Migration folgt später
5. **Demo-ready:** Drei separate Portale (Kunde, Jockey, Werkstatt) für vollständige Prozess-Demonstration

---

## Was ändert sich konkret?

### 1. Hauptprodukt: Inspektion/Wartung statt nur Ölservice

**Vorher:**
- Fokus auf Ölservice (wie Mac Oil)
- Einfaches Produkt: Öl wechseln, Filter, Service-Reset

**Nachher:**
- Hauptprodukt: **Inspektion/Wartung eines Fahrzeugs**
- Umfang abhängig von Kilometerstand (30.000 km / 60.000 km / 90.000 km Intervalle)
- Ölservice ist **zusätzliches Angebot**, nicht das Kernprodukt

**Business Impact:**
- ✅ Höherer durchschnittlicher Auftragswert
- ✅ Breitere Zielgruppe (nicht nur "Ölservice fällig")
- ✅ Differenzierung von reinen Ölservice-Portalen
- ⚠️ Höhere Komplexität in Preiskalkulation

---

### 2. Pflichtfelder: Baujahr + Kilometerstand

**Vorher:**
- Marke, Modell → Preis
- Baujahr optional
- Kilometerstand nicht erfasst

**Nachher:**
- Marke, Modell, **Baujahr (Pflicht)**, **Kilometerstand (Pflicht)** → Preis
- Ermöglicht präzise Wartungsbedarfsermittlung

**Business Impact:**
- ✅ Genauere Preise (weniger "böse Überraschungen")
- ✅ Bessere Service-Planung für Werkstatt
- ✅ Reduziert Verlustgeschäfte bei erster Buchung
- ⚠️ Höhere Abbruchrate bei Buchung? (Mehr Eingabefelder)

**Mitigation:**
- UX-Optimierung: Autovervollständigung, klare Validierung
- Begründung sichtbar: "Für präzisen Preis benötigen wir Kilometerstand"

---

### 3. Marke/Modell-spezifische Preise (keine Fahrzeugklassen)

**Vorher:**
- Pauschale Fahrzeugklassen: Kleinwagen, Kompakt, Mittel, Ober, SUV
- Beispiel: "Kompaktklasse Ölservice: 199 EUR"

**Nachher:**
- **Nur Marke/Modell-spezifische Preise**
- Beispiel: "VW Golf Inspektion (60.000 km): 219 EUR"
- Beispiel: "Audi A3 Inspektion (60.000 km): 239 EUR"

**Business Impact:**
- ✅ Wettbewerbsvorteil: Andere Portale nutzen pauschale Klassen
- ✅ Höhere Preise für Premium-Marken gerechtfertigt
- ✅ Kundenwahrnehmung: "Preis passt zu meinem Auto"
- ⚠️ Aufwand: Preistabelle für viele Marke/Modell-Kombinationen

**Lösung:**
- Initial: Top 20-50 Fahrzeuge abdecken
- Fallback: "Preis auf Anfrage" für seltene Modelle
- Später: Dynamische Preiskalkulation

---

### 4. Deployment-Strategie: Lokal → Azure

**Zwei-Phasen-Ansatz:**

**Phase 1 (MVP - jetzt):**
- 100% lokale Version (localhost)
- Kein Cloud-Setup, kein Deployment
- Stripe Test Mode, Odoo-Mock
- Zweck: **Testen, Demonstrieren, Proof of Concept**

**Phase 2 (Post-MVP - später):**
- Refactoring für Azure Cloud
- Azure App Service, Azure SQL, Azure Blob Storage
- Production-ready Deployment

**Business Impact:**
- ✅ Schnellerer Time-to-Demo (keine Cloud-Setup-Zeit)
- ✅ Kostenersparnis (keine Cloud-Kosten während Entwicklung)
- ✅ Flexibilität für Entwickler (lokales Testing)
- ⚠️ Migrations-Aufwand später

**Risiko-Mitigation:**
- PostgreSQL (Azure-kompatibel) schon im MVP nutzen
- Clean Architecture (einfache Migration)

---

### 5. Multi-Portal-Architektur: Drei Login-Bereiche

**Neue Struktur:**

```
Landing Page
├── Kundenbereich → Buchung, Buchungshistorie
├── Jockey-Portal → Abholungen, Fahrzeugübergabe
└── Werkstatt-Portal → Aufträge, Auftragserweiterungen
```

**Business Impact:**
- ✅ **Demo-Fähigkeit:** Stakeholder sehen kompletten Prozess
- ✅ **Operational Excellence:** Jeder Stakeholder hat optimiertes Interface
- ✅ **Proof of Concept:** Alle User Journeys testbar
- ⚠️ Entwicklungsaufwand steigt (drei Interfaces statt eines)

---

## Auswirkungen auf Timeline

### Story Points

| Bereich | Vorher | Nachher | Differenz |
|---------|--------|---------|-----------|
| MVP Must-Haves | ~85 SP | ~112 SP | +27 SP |
| Geschätzte Sprints | 4-5 | 6-7 | +1-2 Sprints |

### Gründe für Erhöhung
1. Marke/Modell-Preiskalkulation (+6 SP)
2. Pflichtfeld-Validierung (+3 SP)
3. Multi-Portal-Architektur (+21 SP)
4. Lokales Deployment Setup (+8 SP)
5. RBAC-Implementation (+13 SP)

**Neue Timeline:**
- Sprint 1-3: Core-Features (Buchung, Payment, Concierge)
- Sprint 4-5: Zusätzliche Services, Optimierungen
- Sprint 6-7: Polishing, Testing, Demo-Vorbereitung

---

## ROI-Betrachtung

### Investition
- **Zusätzlicher Entwicklungsaufwand:** ~2 Sprints (4 Wochen)
- **Geschätzte Kosten:** 2 Entwickler × 4 Wochen = ca. 16 Personentage

### Return
- **Höherer Auftragswert:** Inspektion (250 EUR) vs. Ölservice (180 EUR) = +39%
- **Präzisere Preise:** Weniger Verlustgeschäfte bei Erstbuchung
- **Bessere Positionierung:** Premium-Service statt Commodity
- **Demo-Fähigkeit:** Erhöht Chance auf Investoren-Buy-In

**Break-Even:** Nach ca. 100 Buchungen (Mehrwert 70 EUR/Buchung × 100 = 7.000 EUR)

---

## Risiken & Mitigation

| Risiko | Wahrscheinlichkeit | Impact | Mitigation |
|--------|-------------------|--------|-----------|
| Höhere Abbruchrate (mehr Pflichtfelder) | Mittel | Hoch | A/B-Testing, UX-Optimierung |
| Preistabelle zu komplex | Mittel | Mittel | Top 20 Fahrzeuge initial, Fallback "auf Anfrage" |
| Lokales Setup-Aufwand | Niedrig | Mittel | Docker Compose, ausführliche Doku |
| Multi-Portal erhöht Bugs | Hoch | Mittel | Shared Components, ausführliches Testing |

---

## Nächste Schritte

### Sofort (diese Woche)
1. ✅ Anforderungen aktualisiert (erledigt)
2. ⏳ Sprint 1 Planning (Priorisierung US-001, US-020)
3. ⏳ Marke/Modell-Preistabelle erstellen (Top 20 Fahrzeuge)
4. ⏳ Wireframes Landing Page (3 Login-Bereiche)

### Sprint 1 (Woche 1-2)
- US-001: Fahrzeugauswahl mit Pflichtfeldern
- US-020: Landing Page mit drei Portalen
- TECH-014: Lokales Setup dokumentieren

### Sprint 2 (Woche 3-4)
- US-003: Hol-/Bring-Buchung
- US-011: Payment-Integration (Stripe Test)
- US-021: Jockey-Portal

### Sprint 3 (Woche 5-6)
- US-008, US-009, US-010: Auftragserweiterung
- US-022: Werkstatt-Portal
- TECH-016: Odoo-Integration (Mock)

---

## Empfehlungen

### Must-Do
1. **Preistabelle priorisieren:** Marke/Modell-Preise für Top 20 Fahrzeuge bis Sprint 1
2. **UX-Testing:** Früh testen, ob Pflichtfelder Abbruchrate erhöhen
3. **Lokales Setup dokumentieren:** README muss für Nicht-Entwickler verständlich sein

### Should-Do
1. **A/B-Test vorbereiten:** Pflichtfelder vs. optionale Felder
2. **Fallback-Prozess:** "Preis auf Anfrage" für seltene Modelle definieren
3. **Demo-Script:** Customer Journey für Stakeholder vorbereiten

### Nice-to-Have
1. **Video-Walkthrough:** Lokales Setup als Screencast
2. **Benchmark:** Preise mit Wettbewerb vergleichen (Mac Oil, ATU, Pitstop)
3. **Analytics:** Tracking für Abbruchrate bei Pflichtfeldern

---

## Entscheidungsbedarf

| Entscheidung | Optionen | Empfehlung | Deadline |
|--------------|---------|-----------|----------|
| Datenbank (lokal) | PostgreSQL vs. SQLite | SQLite (einfacher Setup) | Sprint 1 Start |
| Preis-Fallback | "Auf Anfrage" vs. Pauschale | "Auf Anfrage" (weniger Commitment) | Sprint 1 Start |
| Kilometerstand-Validierung | Strict (Fehler) vs. Soft (Warnung) | Soft (UX-freundlicher) | Sprint 1 |
| Multi-Portal-Auth | Magic Link für alle vs. Mixed | Mixed (Magic für Kunden, PW für Staff) | Sprint 1 |

---

## Stakeholder-Alignment

**Wer muss zustimmen?**
- ✅ Product Owner (Sten): Zustimmung erteilt
- ⏳ Tech Lead: Review ausstehend
- ⏳ Finance (Amjad): Budgetfreigabe für +2 Sprints
- ⏳ Operations (Werkstatt Witten): Werkstatt-Portal absegnen

**Nächstes Meeting:**
- Termin: [TBD]
- Agenda: Sprint 1 Kick-Off, Marke/Modell-Preistabelle Review
- Teilnehmer: PO, Tech Lead, Finance, Operations

---

**Zusammenfassung:**

Diese Änderungen erhöhen die Komplexität um ca. 30% (27 Story Points), positionieren das Produkt aber deutlich besser am Markt. Der Mehraufwand von 2 Sprints ist gerechtfertigt durch:

1. Höhere Auftragswerte (Inspektion > Ölservice)
2. Präzisere Preise (weniger Verlustgeschäfte)
3. Bessere Demo-Fähigkeit (drei Portale)
4. Wettbewerbsvorteil (marke/modell-spezifisch)

**Empfehlung:** ✅ **Änderungen umsetzen** wie dokumentiert.

---

**Kontakt:**
- Product Owner: [Sten Rauch]
- Fragen/Feedback: [E-Mail/Slack]
