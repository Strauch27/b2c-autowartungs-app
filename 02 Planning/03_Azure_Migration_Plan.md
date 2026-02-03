# Azure Migration Plan - B2C Autowartungs-App

**Version:** 1.0  
**Datum:** 2026-02-01  
**Phase:** Post-MVP (nach lokalem Testing)

---

## Executive Summary

Dieser Plan beschreibt die Migration von der lokalen MVP-Version zur produktionsreifen Azure Cloud-Infrastruktur.

**Timeline:** 2-3 Wochen nach MVP-Validierung  
**Budget:** ca. 106 EUR/Monat initial, skalierbar auf 226 EUR/Monat

---

## 1. Azure Services Mapping

| Komponente | Lokal (MVP) | Azure (Production) | Kosten/Monat |
|------------|-------------|-------------------|--------------|
| Frontend | localhost:3000 | Azure Static Web Apps | 10 EUR |
| Backend | localhost:5000 | Azure App Service B1 | 50 EUR |
| Datenbank | PostgreSQL Docker | Azure DB for PostgreSQL B1ms | 30 EUR |
| Storage | ./uploads | Azure Blob Storage | 5 EUR |
| Secrets | .env.local | Azure Key Vault | 1 EUR |
| Monitoring | Console Logs | Application Insights | 10 EUR |
| **TOTAL** | - | - | **106 EUR/Monat** |

---

## 2. Migrations-Strategie

### Ansatz: Schrittweise Migration (nicht Big Bang)

**Phase 1: Datenbank**
\`\`\`bash
# Export lokal
pg_dump b2c_autowartung > backup.sql

# Import nach Azure
psql -h <azure-server>.postgres.database.azure.com \\
     -U admin -d b2c_autowartung < backup.sql
\`\`\`

**Phase 2: Backend**
- Docker-Image bauen
- Azure Container Registry pushen
- Azure App Service deployen

**Phase 3: Frontend**
- Azure Static Web App erstellen
- GitHub Actions CI/CD einrichten
- Custom Domain konfigurieren

**Phase 4: Secrets & Monitoring**
- Secrets in Azure Key Vault
- Application Insights aktivieren
- Alerts einrichten

---

## 3. Code-Änderungen

**Minimal! Nur Environment Variables ändern:**

### .env.production
\`\`\`bash
DATABASE_URL="postgresql://admin@<server>:pass@<server>.postgres.database.azure.com:5432/b2c_autowartung?sslmode=require"
STRIPE_SECRET_KEY="sk_live_..."
ODOO_API_URL="https://your-odoo-instance.com"
NEXT_PUBLIC_API_URL="https://api.yourapp.com"
\`\`\`

### File-Upload Adapter
\`\`\`typescript
// lib/storage/index.ts
export const storage = process.env.NODE_ENV === 'production'
  ? new AzureBlobProvider()   // Azure Blob Storage
  : new LocalStorageProvider(); // ./uploads
\`\`\`

Keine weiteren Code-Änderungen erforderlich!

---

## 4. CI/CD Pipeline (GitHub Actions)

### .github/workflows/deploy-azure.yml
\`\`\`yaml
name: Deploy to Azure

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test
      - run: npm run build
      
      - name: Deploy Backend
        uses: azure/webapps-deploy@v2
        with:
          app-name: 'b2c-app-backend'
          publish-profile: \${{ secrets.AZURE_PUBLISH_PROFILE }}
          
      - name: Deploy Frontend
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: \${{ secrets.AZURE_TOKEN }}
          app_location: "/"
          output_location: "out"
\`\`\`

---

## 5. Monitoring & Logging

### Azure Application Insights Integration
\`\`\`typescript
import { ApplicationInsights } from '@azure/monitor-opentelemetry';

const appInsights = new ApplicationInsights({
  connectionString: process.env.APPLICATIONINSIGHTS_CONNECTION_STRING,
});

appInsights.start();

// Custom Events tracken
export const trackEvent = (name: string, properties?: Record<string, any>) => {
  appInsights.defaultClient.trackEvent({ name, properties });
};
\`\`\`

### Dashboards
- Request-Performance (P95, P99)
- Error-Rate
- Dependency-Latenz (Stripe, Odoo)
- Business-Metrics (Bookings/Tag, Conversion-Rate)

---

## 6. Kosten-Skalierung

### MVP-Volumen (100 Bookings/Monat): 106 EUR/Monat

### Skalierung auf 500 Bookings/Monat: 226 EUR/Monat
- App Service: Basic B1 → Standard S1 (70 EUR)
- PostgreSQL: B1ms → General Purpose 2 vCore (120 EUR)
- Blob Storage: 10 GB → 50 GB (15 EUR)

### Break-Even Analyse
\`\`\`
Annahme: 249 EUR/Buchung, 15% Marge (37 EUR)

100 Bookings:
  Revenue: 3.735 EUR
  Azure-Kosten: 106 EUR (2,8%)

500 Bookings:
  Revenue: 18.675 EUR
  Azure-Kosten: 226 EUR (1,2%)
\`\`\`

**Bewertung:** Azure-Kosten vernachlässigbar

---

## 7. Sicherheits-Checkliste

### Pre-Production
- [ ] SSL-Zertifikate konfiguriert
- [ ] Firewall-Regeln (nur notwendige IPs)
- [ ] Azure Key Vault für Secrets
- [ ] DDoS-Protection aktiviert
- [ ] Backup-Strategie definiert
- [ ] Disaster-Recovery getestet

### Compliance
- [ ] DSGVO-konform (Daten in EU-Region)
- [ ] Penetration-Tests durchgeführt
- [ ] OWASP Top 10 geprüft
- [ ] Security-Audit abgeschlossen

---

## 8. Rollback-Strategie

**Falls Probleme bei Migration:**

1. DNS zurück auf lokale IP
2. Traffic zurück zu lokalem Setup
3. Datenbank-Backup wiederherstellen
4. Issue-Analyse, Fix, erneuter Versuch

**Deployment Slots nutzen:**
- Staging-Slot testen
- Swap zu Production nur nach Success

---

## 9. Timeline & Meilensteine

### Woche 1: Vorbereitung
- [ ] Azure-Account einrichten
- [ ] Resources provisionieren
- [ ] Secrets migrieren
- [ ] CI/CD-Pipeline bauen

### Woche 2: Migration
- [ ] Datenbank migrieren
- [ ] Backend deployen
- [ ] Frontend deployen
- [ ] DNS konfigurieren

### Woche 3: Testing & Launch
- [ ] Smoke-Tests auf Staging
- [ ] Performance-Tests
- [ ] Security-Scan
- [ ] Production-Launch

---

## 10. Risiken & Mitigation

| Risiko | Wahrscheinlichkeit | Mitigation |
|--------|-------------------|-----------|
| Datenbank-Migration fehlschlägt | Niedrig | Test-Migration auf Staging, Backup |
| Performance-Probleme | Mittel | Load-Testing vor Launch |
| Kosten explodieren | Niedrig | Budget-Alerts, Auto-Scaling-Limits |
| Downtime bei Migration | Mittel | Blue-Green-Deployment |

---

## 11. Success Criteria

**Migration erfolgreich wenn:**
- [ ] Alle Features funktionieren
- [ ] Performance: < 2s Page Load
- [ ] Uptime: 99.9%
- [ ] Kosten: < Budget
- [ ] Zero Data-Loss
- [ ] Alle Tests laufen durch

---

**Status:** READY FOR PHASE 2

**Letzte Aktualisierung:** 2026-02-01
