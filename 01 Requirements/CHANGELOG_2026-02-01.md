# Änderungsprotokoll: Stakeholder-Feedback Integration

**Datum:** 2026-02-01
**Version:** 1.1
**Bearbeiter:** Product Owner

---

## Zusammenfassung der Änderungen

Diese Aktualisierung integriert drei wichtige strategische Änderungen basierend auf Stakeholder-Feedback:

1. **Hauptprodukt-Änderung:** Von Ölservice zu Inspektion/Wartung
2. **Pflichtfelder erweitert:** Baujahr und Kilometerstand sind nun Pflichtfelder
3. **Klassifizierung geändert:** Keine Fahrzeugklassen mehr, nur Marke/Modell
4. **Deployment-Strategie:** Lokale Version (MVP) → Azure Cloud (Post-MVP)
5. **Multi-Portal-Architektur:** Landing Page mit drei Login-Bereichen

---

## 1. Hauptprodukt-Änderung: Ölservice → Inspektion/Wartung

### Änderung
Das Hauptprodukt ist **NICHT** Ölservice, sondern die **Inspektion/Wartung eines Fahrzeugs**.

### Auswirkungen

**Product Vision (00_Product_Vision.md):**
- Hauptprodukt klar als "Inspektion/Wartung" definiert
- Ölservice ist ein zusätzlicher Service, nicht das Kernprodukt

**Epics (01_Epics.md):**
- Epic 1: Fokus auf Inspektion/Wartung statt nur Ölservice
- Scope erweitert um kilometerstand-basierte Wartungsempfehlungen

**User Stories (02_MVP_User_Stories.md):**
- **US-002:** Service-Auswahl priorisiert Inspektion/Wartung
- **US-013:** Umbenannt von "Ölservice als Hauptprodukt" zu "Inspektion/Wartung als Hauptprodukt"
- **US-014:** Ölservice als separate Option neben Inspektion

**MoSCoW-Priorisierung (03_MoSCoW_Priorisierung.md):**
- Must-Have: Inspektion/Wartung (nicht nur Ölservice)

### Begründung
- Inspektion/Wartung deckt breiteren Wartungsbedarf ab
- Kilometerstand ermöglicht präzise Wartungsplanung (30k, 60k, 90k km Intervalle)
- Differenzierung von reinen Ölservice-Anbietern (Mac Oil)

---

## 2. Pflichtfelder: Baujahr und Kilometerstand

### Änderung
Baujahr und Kilometerstand sind **Pflichtfelder** (nicht optional).

### Auswirkungen

**User Stories:**
- **US-001:** Fahrzeugauswahl jetzt mit 4 Pflichtfeldern:
  - Marke (Pflicht)
  - Modell (Pflicht)
  - Baujahr (Pflicht, vorher optional)
  - Kilometerstand (Pflicht, vorher nicht erfasst)

- **US-019:** Umbenannt von "Post-MVP" zu "MVP - IN SPRINT 1"
  - Kilometerstand ist jetzt Teil der initialen Buchung

**Technische Integration:**
- **Datenmodell (TECH-013):**
  ```typescript
  Vehicle {
    year: number // Pflichtfeld (vorher optional)
    mileage: number // Pflichtfeld (neu)
  }

  Booking {
    mileage_at_booking: number // Pflichtfeld (neu)
  }
  ```

**Komplexität:**
- Story Points erhöht: US-001 von 5 auf 8 SP
- Validierungslogik erforderlich (Plausibilitätsprüfung)
- Präzisere Wartungsbedarfsermittlung möglich

### Begründung
- Ermöglicht präzise Preiskalkulation
- Bessere Service-Planung (z.B. 90.000 km Inspektion vs. 30.000 km)
- Ältere Fahrzeuge benötigen mehr Verschleißteil-Checks

---

## 3. Klassifizierung: Fahrzeugklassen entfernt

### Änderung
Wir klassifizieren **NICHT** nach Fahrzeugklassen (Klein/Mittel/Ober/SUV), sondern **ausschließlich nach Marke und Modell**.

### Auswirkungen

**Product Vision:**
- Klare Aussage: "Keine pauschalen Fahrzeugklassen"
- Preiskalkulation spezifisch nach Marke/Modell

**User Stories:**
- **US-001:** Fahrzeugklassen-Mapping entfernt
- **US-004:** Umbenannt von "Festpreis-Anzeige nach Fahrzeugklassen" zu "Festpreis-Anzeige nach Marke und Modell"
- Preis-Beispiele jetzt marke/modell-spezifisch:
  - VW Golf (60.000 km): 219 EUR
  - Mercedes E-Klasse (60.000 km): 319 EUR
  - NICHT mehr: "Kompaktklasse: 199 EUR"

**Technische Integration:**
- **Datenmodell:** `VehicleClass` Enum entfernt
- **Preiskalkulation:** Marke/Modell-Mapping-Tabelle statt Klassen-Mapping
- **Komplexität erhöht:** Mehr Datenpunkte für Preise

**MoSCoW-Priorisierung:**
- Won't-Have: "Fahrzeugklassen-Pauschalen" explizit ausgeschlossen

### Begründung
- Präzisere Preise (VW Golf ≠ Audi A3, obwohl beide "Kompakt")
- Kundenerwartung: "Ich fahre einen Golf, nicht eine Kompaktklasse"
- Wettbewerbsvorteil: Andere Portale arbeiten mit pauschalen Klassen

---

## 4. Deployment-Strategie: Lokal → Azure

### Änderung
Zwei-Phasen-Ansatz:
- **Phase 1 (MVP):** 100% lokale Version
- **Phase 2 (Post-MVP):** Azure Cloud Migration

### Auswirkungen

**Neue Dokumentation:**
- **Epic 8:** "Lokale Deployment-Strategie" hinzugefügt
- **TECH-012:** Vollständig überarbeitet mit lokaler Architektur
- **TECH-014:** "Lokales Deployment Setup" (neue Story, 8 SP)

**Technische Architektur:**
- Localhost-Setup (Frontend: 3000, Backend: 5000, DB: 5432)
- PostgreSQL (lokal) ODER SQLite (einfacher)
- Stripe Test Mode + Stripe CLI für Webhooks
- Odoo Mock-Integration (JSON-Logs statt echte API)
- Docker Compose optional

**Betroffene Epics/Stories:**
- ALLE technischen Stories (TECH-001 bis TECH-018)
- Epic 6 (Payment & Accounting): Stripe Test, Odoo-Mock
- Epic 4 (Slot-Management): Lokale DB, keine Cloud-Sync
- TECH-18 (CI/CD): Nicht im MVP, erst bei Azure-Migration

**Migrations-Plan:**
- Datenbank: PostgreSQL → Azure SQL (kompatibel)
- File Storage: Lokal (./uploads) → Azure Blob Storage
- Secrets: .env → Azure Key Vault
- Deployment: localhost → Azure App Service

### Begründung
- Schnellerer PoC (kein Cloud-Setup-Overhead)
- Kosteneffizienz (keine Cloud-Kosten während Entwicklung)
- Ausführlich testbar vor Cloud-Deployment
- Flexibilität für Entwickler

---

## 5. Multi-Portal-Architektur: Drei Login-Bereiche

### Änderung
Landing Page mit drei separaten Login-Bereichen:
1. **Kundenlogin** - Buchungen verwalten
2. **Jockey Login** - Abholungen/Rückgaben
3. **Werkstatt Login** - Auftragserweiterungen

### Auswirkungen

**Neue Epics:**
- **Epic 7:** "Multi-Portal-Architektur & Demo-Fähigkeit"

**Neue User Stories:**
- **US-020:** Landing Page mit drei Login-Bereichen (8 SP)
- **US-021:** Jockey-Portal Dashboard (5 SP)
- **US-022:** Werkstatt-Portal Dashboard (8 SP)

**Technische Stories:**
- **TECH-015:** Multi-Portal Authentication & RBAC (13 SP)
- User Roles: Customer, Jockey, Workshop, Admin
- Separate Authentifizierungs-Flows:
  - Customer: Magic Link (passwordless)
  - Jockey/Workshop: Username + Passwort

**Frontend-Routing:**
- `/` - Landing Page
- `/customer/*` - Kunden-Portal (geschützt)
- `/jockey/*` - Jockey-Portal (geschützt)
- `/workshop/*` - Werkstatt-Portal (geschützt)

**MoSCoW-Priorisierung:**
- Must-Have: Alle drei Portale (kritisch für Demo)

### Begründung
- Demo-Fähigkeit: Stakeholder können kompletten Prozess sehen
- Operational Excellence: Jeder Stakeholder hat optimiertes Interface
- Proof of Concept: Alle User Journeys testbar

---

## Story Points Auswirkung

### Vorher
- MVP: ~85 Story Points (4-5 Sprints)

### Nachher
- MVP: ~112 Story Points (6-7 Sprints)

### Erhöhung um 27 SP durch:
1. Marke/Modell-spezifische Preiskalkulation (+3 SP pro betroffene Story)
2. Pflichtfeld-Validierung (Baujahr, Kilometerstand) (+3 SP)
3. Multi-Portal-Architektur (+21 SP: US-020, US-021, US-022)
4. Lokales Deployment Setup (+8 SP: TECH-014)
5. RBAC-Implementation (+13 SP: TECH-015)

---

## Betroffene Dokumente

| Dokument | Änderungen | Status |
|----------|-----------|--------|
| **00_Product_Vision.md** | Hauptprodukt, Pflichtfelder, keine Fahrzeugklassen | ✅ Aktualisiert |
| **01_Epics.md** | Epic 1 (Scope), Epic 7 (Multi-Portal), Epic 8 (Deployment) | ✅ Aktualisiert |
| **02_MVP_User_Stories.md** | US-001, US-002, US-004, US-013, US-014, US-019, US-020, US-021, US-022 | ✅ Aktualisiert |
| **03_MoSCoW_Priorisierung.md** | Must-Haves erweitert, Won't-Have angepasst | ✅ Aktualisiert |
| **04_Technische_Integration_Stories.md** | TECH-012, TECH-013, TECH-014, TECH-015, TECH-016 umbenannt | ✅ Aktualisiert |

---

## Risiken & Mitigation

| Risiko | Auswirkung | Wahrscheinlichkeit | Mitigation |
|--------|-----------|-------------------|-----------|
| Marke/Modell-Preise zu komplex | Verzögerung Sprint 1 | Mittel | Vereinfachte Preistabelle für MVP, später: dynamische Kalkulation |
| Lokales Setup zu aufwändig | Entwickler-Onboarding schwierig | Niedrig | Docker Compose für One-Click-Setup, ausführliche README |
| Multi-Portal erhöht Komplexität | Längere Entwicklungszeit | Hoch | Shared Components nutzen, klare Trennung der Concerns |
| Kilometerstand-Validierung fehleranfällig | Falsche Preise | Mittel | Plausibilitätsprüfung (0-500.000 km), manuelle Review-Option |

---

## Offene Fragen

1. **Preistabelle:** Wie viele Marke/Modell-Kombinationen müssen wir initial abdecken?
   - **Empfehlung:** Top 20 Modelle (VW, Audi, BMW, Mercedes, Ford, Opel)
   - **Fallback:** "Preis auf Anfrage" für seltene Modelle

2. **Lokales Setup:** PostgreSQL oder SQLite?
   - **Empfehlung:** SQLite für MVP (einfacher), PostgreSQL für Post-MVP (Azure-kompatibel)

3. **Jockey/Werkstatt-Accounts:** Wer legt diese an?
   - **Empfehlung:** Admin-Interface (später), initial: manuell via SQL-Script

4. **Odoo-Mock:** Wie detailliert soll Mock-Integration sein?
   - **Empfehlung:** JSON-Logging reicht, keine echte API-Calls im MVP

---

## Nächste Schritte

1. **Sprint Planning:**
   - Sprint 1: US-001, US-002, US-004, US-020 (Landing Page + Buchung)
   - Sprint 2: US-003, US-011, US-015, US-021 (Payment + Jockey-Portal)
   - Sprint 3: US-008, US-009, US-010, US-022 (Auftragserweiterung + Werkstatt-Portal)

2. **Technische Vorbereitung:**
   - TECH-014: Lokales Setup dokumentieren (README.md)
   - TECH-015: RBAC-Konzept finalisieren
   - TECH-013: Marke/Modell-Preistabelle erstellen

3. **Design:**
   - Wireframes für Landing Page (3 Login-Bereiche)
   - UI für Jockey-Portal und Werkstatt-Portal
   - Mobile-First Design für alle drei Portale

4. **Daten:**
   - Marke/Modell-Liste (Top 20-50 Fahrzeuge)
   - Preis-Matrix (Marke/Modell × Kilometerstand)
   - Seed-Data für lokales Testing

---

**Version Control:**
- Diese Änderungen wurden am 2026-02-01 dokumentiert
- Alle betroffenen Dokumente sind auf Version 1.1
- Nächstes Review: Nach Sprint 1 (ca. 2 Wochen)

---

**Approved by:**
- Product Owner: [Unterschrift erforderlich]
- Tech Lead: [Unterschrift erforderlich]
- Stakeholder: [Unterschrift erforderlich]
