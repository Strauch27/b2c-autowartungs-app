# Local Deployment Guide - B2C Autowartungs-App

**Version:** 1.0  
**Datum:** 2026-02-01  
**Status:** READY FOR USE

---

## Executive Summary

Diese Anleitung beschreibt die vollständige lokale Installation der B2C Autowartungs-App. Nach diesem Setup läuft die gesamte Anwendung auf einem einzigen Rechner ohne Cloud-Abhängigkeiten.

**Setup-Zeit:** ca. 30-45 Minuten

**Ergebnis:**
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`
- PostgreSQL: `localhost:5432`
- 3 Portale voll funktionsfähig

---

## 1. Systemanforderungen

### Hardware
- CPU: 4 Cores (min. 2 Cores)
- RAM: 8 GB (min. 4 GB)
- Disk: 20 GB frei

### Software
- Node.js 20 LTS
- Docker Desktop
- Git

---

## 2. Installation

### 2.1 Repository klonen
\`\`\`bash
git clone <repository-url> "B2C App v2"
cd "B2C App v2"
\`\`\`

### 2.2 Dependencies installieren
\`\`\`bash
npm install
\`\`\`

### 2.3 PostgreSQL starten
\`\`\`bash
docker-compose up -d
\`\`\`

### 2.4 Environment Variables
\`\`\`bash
cp .env.example .env.local
# .env.local bearbeiten mit Stripe Keys etc.
\`\`\`

### 2.5 Datenbank Setup
\`\`\`bash
npx prisma migrate dev
npm run db:seed
\`\`\`

### 2.6 Backend starten
\`\`\`bash
npm run backend:dev
\`\`\`

### 2.7 Frontend starten
\`\`\`bash
npm run dev
\`\`\`

---

## 3. Zugriff

- Landing Page: http://localhost:3000
- Backend API: http://localhost:5000
- Prisma Studio: npx prisma studio

### Test-Accounts
- Kunde: kunde@test.de (Magic Link)
- Jockey: jockey1 / password
- Werkstatt: werkstatt_witten / password

---

## 4. Troubleshooting

### Port bereits belegt
\`\`\`bash
lsof -i :3000
kill -9 <PID>
\`\`\`

### PostgreSQL Verbindung fehlgeschlagen
\`\`\`bash
docker-compose restart postgres
\`\`\`

---

**Vollständige Dokumentation:** Siehe vollständige Version dieses Dokuments
