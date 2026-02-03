# 02 Planning - Technische Architektur & Planung

**Version:** 1.0  
**Datum:** 2026-02-01  
**Status:** READY FOR DEVELOPMENT

---

## Übersicht

Dieser Ordner enthält die vollständige technische Architektur und Planung für die B2C Autowartungs-App.

**Deployment-Strategie:** Zwei-Phasen-Ansatz
1. **Phase 1 (MVP):** 100% lokale Version für Testing & Demo
2. **Phase 2:** Azure Cloud Migration für Production

---

## Kern-Architektur-Dokumente

### 1. Technical Architecture (01_Technical_Architecture.md)
**Umfang:** 39 KB | **Lesezeit:** 15 Min

**Inhalt:**
- Technology Stack Decisions (Next.js, Node.js, PostgreSQL)
- Begründungen für Tech-Wahl
- System-Komponenten-Übersicht
- Lokales vs. Azure Setup
- Security & Compliance
- Performance & Skalierung

**Wer sollte das lesen:**
- Tech Lead (MUST)
- Alle Entwickler (MUST)
- Product Owner (SHOULD)
- Stakeholder (OPTIONAL)

---

### 2. Local Deployment Guide (02_Local_Deployment_Guide.md)
**Umfang:** 1.8 KB (kompakte Version) | **Lesezeit:** 5 Min

**Inhalt:**
- Systemanforderungen
- Installations-Anleitung Schritt-für-Schritt
- PostgreSQL Setup (Docker)
- Environment Variables
- Datenbank-Migration & Seeding
- Backend & Frontend starten
- Test-Accounts
- Troubleshooting
- Demo-Szenarien

**Wer sollte das lesen:**
- Alle Entwickler (MUST - vor Arbeitsbeginn)
- QA-Team (MUST)
- Product Owner (für Demo)

---

### 3. Azure Migration Plan (03_Azure_Migration_Plan.md)
**Umfang:** 5.9 KB | **Lesezeit:** 8 Min

**Inhalt:**
- Azure Services Mapping
- Migrations-Strategie (schrittweise, nicht Big Bang)
- Code-Änderungen (minimal!)
- CI/CD Pipeline (GitHub Actions)
- Monitoring & Logging
- Kosten-Skalierung (106 EUR/Monat → 226 EUR/Monat)
- Security-Checkliste
- Rollback-Strategie

**Wer sollte das lesen:**
- Tech Lead (MUST - für Phase 2)
- DevOps (MUST - für Phase 2)
- Product Owner (Kosten-Planung)

---

### 4. Database Schema (04_Database_Schema.md)
**Umfang:** 18 KB | **Lesezeit:** 10 Min

**Inhalt:**
- Entity Relationship Diagram
- Vollständiges Prisma-Schema (alle Models)
- Migrations-Strategie
- Performance-Optimierungen (Indexe)
- Data-Seeding (Test-Daten)
- Backup-Strategie

**Wichtige Änderungen (gemäß TECHNICAL_IMPACT_ANALYSIS):**
- **Fahrzeugklassen entfernt:** Keine pauschalen Klassen mehr
- **Pflichtfelder erweitert:** Baujahr + Kilometerstand jetzt PFLICHT
- **Neue Tabelle PriceMatrix:** Marke/Modell-spezifische Preise

**Wer sollte das lesen:**
- Backend-Developer (MUST)
- Tech Lead (MUST)
- Frontend-Developer (SHOULD - für API-Verständnis)

---

### 5. Integration Architecture (05_Integration_Architecture.md)
**Umfang:** 14 KB | **Lesezeit:** 10 Min

**Inhalt:**
- Stripe Integration (Payment-Flows)
- Odoo Integration (Buchhaltung-Sync)
- Driver-App Integration (Jockey-Koordination)
- Error-Handling & Retry-Strategien
- Security (Webhook-Verification)
- Monitoring & Health-Checks

**Wer sollte das lesen:**
- Backend-Developer (MUST - für Integrationen)
- Tech Lead (MUST)
- QA-Team (Testing-Szenarien)

---

## Design & UI-Dokumente

### 6-8. Portal-Designs
- **06_Landing_Page_Design.md** (41 KB)
- **07_Customer_Portal_Wireframes.md** (79 KB)
- **08_Jockey_Portal_Wireframes.md** (41 KB)

**Inhalt:** Detaillierte Wireframes, User-Flows, UI-Komponenten

**Wer sollte das lesen:**
- Frontend-Developer (MUST)
- UX/UI-Designer (MUST)
- Product Owner (SHOULD)

---

### 10. Design System (10_Design_System.md)
**Umfang:** 21 KB

**Inhalt:**
- Farben, Typography, Spacing
- Component-Library (shadcn/ui)
- Accessibility-Standards (WCAG 2.1 AA)
- Responsive-Design-Regeln

**Wer sollte das lesen:**
- Frontend-Developer (MUST)
- UX/UI-Designer (MUST)

---

## Planung & User Stories

### 13-16. Sprint-Planung
- **13_Additional_User_Stories.md** (30 KB)
- **14_Updated_MoSCoW.md** (14 KB)
- **15_Sprint_Plan_Overview.md** (14 KB)
- **16_Sprint_01_Plan.md** (18 KB)

**Inhalt:**
- User Stories mit Akzeptanzkriterien
- MoSCoW-Priorisierung (Must/Should/Could/Won't)
- Sprint-Planung (Velocity, Story Points)
- Task-Breakdown

**Wer sollte das lesen:**
- Product Owner (MUST)
- Tech Lead (MUST)
- Alle Entwickler (SHOULD)
- Scrum Master (MUST)

---

## Testing-Strategie

### 24-26. Testing-Dokumente
- **24_Test_Strategy_Playwright.md** (21 KB)
- **25_E2E_Test_Scenarios.md** (27 KB)
- **26_Playwright_Setup_Guide.md** (21 KB)

**Inhalt:**
- Test-Pyramide (Unit, Integration, E2E)
- Playwright-Setup & Konfiguration
- E2E-Test-Szenarien
- CI/CD-Integration

**Wer sollte das lesen:**
- QA-Engineer (MUST)
- Alle Entwickler (SHOULD - für TDD)

---

## Schnellstart für neue Team-Mitglieder

**Wenn du neu im Team bist, lies in dieser Reihenfolge:**

1. **01_Technical_Architecture.md** (Gesamtübersicht)
2. **02_Local_Deployment_Guide.md** (Setup durchführen!)
3. **04_Database_Schema.md** (Datenmodell verstehen)
4. Dein Fachbereich:
   - Frontend → Design-Docs (06-10)
   - Backend → Integration-Docs (05)
   - Testing → Test-Docs (24-26)
5. **Sprint_01_Plan.md** (aktuelle Tasks)

**Geschätzte Onboarding-Zeit:** 1 Tag (Lesen + Setup)

---

## Tech-Stack Übersicht

### Frontend
- **Framework:** Next.js 14+ (App Router)
- **Sprache:** TypeScript 5.3+
- **Styling:** Tailwind CSS 3.4+
- **UI-Komponenten:** shadcn/ui (Radix UI)
- **State:** React Context + Zustand
- **Forms:** React Hook Form + Zod

### Backend
- **Runtime:** Node.js 20 LTS
- **Framework:** Express.js 4.18+
- **Sprache:** TypeScript 5.3+
- **ORM:** Prisma 5.22+
- **Auth:** JWT (Magic Link für Kunden)

### Datenbank
- **DB:** PostgreSQL 16
- **Lokal:** Docker Container
- **Production:** Azure Database for PostgreSQL

### Integrationen
- **Payment:** Stripe (Test Mode → Production)
- **Buchhaltung:** Odoo (Mock → Echte API)
- **Jockey-App:** Webhook-basiert

### Tools
- **Testing:** Vitest (Unit), Supertest (Integration), Playwright (E2E)
- **Linting:** ESLint + Prettier
- **CI/CD:** GitHub Actions (später)
- **Monitoring:** Azure Application Insights (Phase 2)

---

## Wichtige Entscheidungen

### 1. Lokale MVP-Version zuerst
**Warum:** Schneller PoC ohne Cloud-Komplexität, kostenoptimiert

### 2. Azure Cloud Migration später (Phase 2)
**Warum:** Skalierbarkeit, Hochverfügbarkeit, Production-ready

### 3. Keine Fahrzeugklassen mehr
**Warum:** Preise marke/modell-spezifisch, präziser, keine pauschalen Klassen

### 4. Baujahr + Kilometerstand PFLICHT
**Warum:** Präzise Wartungsbedarfsermittlung, kilometer-basierte Inspektion

### 5. Multi-Portal-Architektur
**Warum:** Separate Interfaces für Kunde, Jockey, Werkstatt (Demo-Fähigkeit)

---

## Nächste Schritte

### Phase 0: Vorbereitung (JETZT)
- [ ] Alle Architektur-Docs lesen
- [ ] Fragen klären mit Tech Lead
- [ ] Lokales Setup durchführen (02_Local_Deployment_Guide.md)

### Phase 1: Sprint 1 (Woche 1-2)
- [ ] Basis-Setup (Next.js, Express, PostgreSQL)
- [ ] Authentication (JWT + Magic Link)
- [ ] Datenmodell implementieren (Prisma Schema)
- [ ] Base-UI-Komponenten (shadcn/ui)

### Phase 2: Sprint 2-3 (Woche 3-6)
- [ ] Buchungs-Flow (Frontend + Backend)
- [ ] Stripe-Integration
- [ ] Slot-Management
- [ ] 3 Portale (Landing, Customer, Jockey, Werkstatt)

### Phase 3: Sprint 4-5 (Woche 7-10)
- [ ] Odoo-Integration (Mock → Echt)
- [ ] Driver-App-Integration
- [ ] Testing (Unit + Integration + E2E)
- [ ] Bug-Fixing & Polish

### Phase 4: Azure-Migration (Woche 11-13)
- [ ] Azure-Setup
- [ ] CI/CD-Pipeline
- [ ] Production-Deployment
- [ ] Monitoring & Alerts

---

## Kontakte & Verantwortlichkeiten

| Rolle | Name | Verantwortung | Dokumente |
|-------|------|---------------|-----------|
| **Product Owner** | Sten Rauch | Requirements, Priorisierung | 13-16 (Planung) |
| **Tech Lead** | [TBD] | Architektur, Code-Reviews | 01-05 (Architektur) |
| **Frontend-Dev** | [TBD] | Next.js, UI-Komponenten | 06-10 (Design) |
| **Backend-Dev** | [TBD] | Express, Prisma, Integrationen | 04-05 (DB, Integration) |
| **DevOps** | [TBD] | Azure-Setup, CI/CD | 03 (Azure Migration) |
| **QA-Engineer** | [TBD] | Testing, Qualitätssicherung | 24-26 (Testing) |

---

## Changelog

### Version 1.0 (2026-02-01)
- Initiale Erstellung aller Architektur-Dokumente
- Tech-Stack definiert: Next.js + Node.js + PostgreSQL
- Deployment-Strategie: Lokal MVP → Azure Cloud
- Datenmodell: Fahrzeugklassen entfernt, PriceMatrix hinzugefügt
- Integration-Architektur: Stripe + Odoo + Driver-App
- Sprint-Planung: 5 Sprints für MVP

---

**Status:** READY FOR SPRINT 1 KICK-OFF

**Letzte Aktualisierung:** 2026-02-01 13:00 Uhr
