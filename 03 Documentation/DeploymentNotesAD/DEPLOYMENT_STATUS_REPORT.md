# B2C PoC Azure Deployment - Status Report

**Date:** 2026-02-12
**Author:** Andreas Dannhauer (assisted by Claude Code)

---

## Executive Summary

The B2C Autowartungs-App has been successfully deployed to Azure across two environments (preprod and production). Both environments are fully operational with Docker containers running on Azure App Service, connected to Azure PostgreSQL, with secrets managed via Azure Key Vault. A basic auth gate has been added to protect the frontend before go-live. All resources are currently **stopped** to save costs.

---

## Completed

### Infrastructure (Terraform)

| Component | Preprod | Prod | Notes |
|-----------|---------|------|-------|
| Resource Group | rg-b2cpoc-preprod | rg-b2cpoc-prod | Both in westeurope |
| VNet | vnet-b2cpoc-preprod (10.1.0.0/16) | vnet-b2cpoc-prod (10.2.0.0/16) | 3 subnets each |
| App Service Plan | asp-b2cpoc-preprod (B1) | asp-b2cpoc-prod (B1) | Linux containers |
| Frontend App | app-b2cpoc-frontend-preprod | app-b2cpoc-frontend-prod | Next.js 16 standalone |
| Backend App | app-b2cpoc-backend-preprod | app-b2cpoc-backend-prod | Node.js/Express |
| Key Vault | kv-b2cpoc-preprod-01 | kv-b2cpoc-prod-01 | RBAC-enabled |
| Storage Account | stb2cpocpreprod | stb2cpocprod | Blob uploads container |
| Log Analytics | log-b2cpoc-preprod | log-b2cpoc-prod | |
| App Insights | appi-b2cpoc-preprod | appi-b2cpoc-prod | |

**Shared Resources (rg-b2cpoc-shared, germanywestcentral):**
- Azure Container Registry: `crb2cpoc.azurecr.io` (admin enabled)
- PostgreSQL Flexible Server: `psql-b2cpoc-shared.postgres.database.azure.com` (westeurope)
  - Databases: `b2cpoc_preprod`, `b2cpoc_prod`
- Terraform State Storage: `stb2cpoctfstate` (tfstate container)

### Docker Images

Both images built natively for **linux/amd64** via ACR Tasks (cloud build):
- `crb2cpoc.azurecr.io/b2cpoc/frontend:latest` (v2, includes basic auth middleware)
- `crb2cpoc.azurecr.io/b2cpoc/backend:latest` (v1)

### Database

- Schema synced via `prisma db push` (both preprod and prod)
- 8 analytics views created (DailyBookingStats, MonthlyRevenue, CustomerLifetimeValue, JockeyPerformance, WorkshopPerformance, ServiceTypePerformance, UserRetentionMetrics, BookingFunnel)
- 7 performance indexes created
- **Note:** Prisma migrations are out of sync with the current schema. `prisma db push` was used instead of `prisma migrate deploy` due to significant schema drift between init migration and current schema.

### Security

- **Basic Auth** added to frontend via Next.js `proxy.ts` middleware
  - Credentials: `admin` / `b2cpoc2026`
  - Controlled by env var `BASIC_AUTH_ENABLED=true`
  - To disable at go-live: set `BASIC_AUTH_ENABLED=false` on App Service
- All secrets stored in Key Vault with managed identity access (RBAC)
- App Services use system-assigned managed identities for ACR pulls and Key Vault access
- TLS 1.2 minimum enforced on all App Services
- VNet integration enabled for all App Services

### Key Vault Secrets Status

| Secret | Preprod | Prod |
|--------|---------|------|
| DATABASE-URL | Real value | Real value |
| JWT-SECRET | Real value (generated) | Real value (generated, different) |
| MAGIC-LINK-SECRET | Real value (generated) | Real value (generated, different) |
| STRIPE-SECRET-KEY | PLACEHOLDER | PLACEHOLDER |
| STRIPE-PUBLISHABLE-KEY | PLACEHOLDER | PLACEHOLDER |
| STRIPE-WEBHOOK-SECRET | PLACEHOLDER | PLACEHOLDER |
| RESEND-API-KEY | PLACEHOLDER | PLACEHOLDER |
| FIREBASE-PROJECT-ID | PLACEHOLDER | PLACEHOLDER |
| FIREBASE-SERVICE-ACCOUNT | PLACEHOLDER | PLACEHOLDER |

### Azure DevOps CI/CD (Partial)

Service connections created in Azure DevOps (B2C_PoC project):
- `Azure-B2C-PoC` — Azure Resource Manager (Service Principal)
- `crb2cpoc` — Docker Registry (ACR admin credentials)
- `GitHub-B2C` — GitHub PAT connection

Pipeline YAML files ready:
- `infra/pipelines/azure-pipelines-app.yml` — Full CI/CD (build, deploy preprod, E2E, deploy prod)
- `infra/pipelines/azure-pipelines-infra.yml` — Infrastructure pipeline
- `infra/pipelines/templates/docker-build.yml`
- `infra/pipelines/templates/deploy-app-service.yml`
- `infra/pipelines/templates/run-terraform.yml`

---

## Pending / Next Steps

### 1. Azure DevOps Pipeline Creation (blocked)
- **Blocker:** Your GitHub account needs **admin** permission on `Strauch27/b2c-autowartungs-app` to allow Azure DevOps to install a webhook
- **Action:** Ask repo owner (Strauch27) to grant admin access
- **Then:** Run pipeline creation command (automated, ~1 minute)
- Also need to create `b2cpoc-prod` environment with approval gate

### 2. Third-Party Secret Values
Replace placeholder secrets in both Key Vaults with real values:
- **Stripe:** Get keys from https://dashboard.stripe.com/apikeys
- **Resend:** Get API key from https://resend.com/api-keys
- **Firebase:** Get project ID + service account JSON from Firebase Console

Commands to update (example):
```bash
az keyvault secret set --vault-name "kv-b2cpoc-preprod-01" --name "STRIPE-SECRET-KEY" --value "sk_test_..."
az keyvault secret set --vault-name "kv-b2cpoc-prod-01" --name "STRIPE-SECRET-KEY" --value "sk_live_..."
```

### 3. Prisma Migration Cleanup
The migration files are out of sync with the current Prisma schema:
- Init migration creates old table structures (Customer, Workshop, Jockey tables)
- Current schema uses a unified User model with role-based profiles
- **Recommendation:** Regenerate migrations from current schema using `prisma migrate diff` or `prisma migrate reset` followed by a fresh migration

### 4. Custom Domain & SSL
- Map custom domain(s) to App Services
- Configure managed certificates or bring your own

### 5. Frontend Image per Environment
Currently both environments use the same frontend image with the preprod API URL baked in at build time (`NEXT_PUBLIC_API_URL`). For production:
- Rebuild with `NEXT_PUBLIC_API_URL=https://app-b2cpoc-backend-prod.azurewebsites.net`
- Or use runtime environment injection

### 6. No Commits Made
All local file changes are uncommitted as requested. Modified files:
- `infra/terraform/modules/compute/main.tf` — Added WEBSITES_PORT, basic auth vars, container_registry_use_managed_identity
- `infra/terraform/modules/compute/variables.tf` — Fixed image name defaults (slash vs dash), added basic_auth variables
- `infra/terraform/environments/prod/terraform.tfvars` — Changed location to westeurope, SKU to B1
- `infra/terraform/environments/prod/variables.tf` — Changed default location to westeurope
- `99 Code/frontend/proxy.ts` — Added basic auth gate
- `99 Code/frontend/package-lock.json` — Updated (was stale)
- `99 Code/backend/package-lock.json` — Generated (was missing)
- `99 Code/backend/prisma/migrations/add_analytics_views/migration.sql` — Fixed DELIVERED enum + table alias bugs

---

## URLs (currently stopped)

| Environment | Frontend | Backend |
|-------------|----------|---------|
| Preprod | https://app-b2cpoc-frontend-preprod.azurewebsites.net | https://app-b2cpoc-backend-preprod.azurewebsites.net |
| Prod | https://app-b2cpoc-frontend-prod.azurewebsites.net | https://app-b2cpoc-backend-prod.azurewebsites.net |

**Basic Auth:** `admin` / `b2cpoc2026` (both environments)

---

## How to Restart

```bash
# Login with service principal (credentials in Azure Key Vault / team password manager)
az login --service-principal -u <CLIENT_ID> -p <CLIENT_SECRET> --tenant <TENANT_ID>

# Start PostgreSQL first (takes ~2 min)
az postgres flexible-server start --name psql-b2cpoc-shared --resource-group rg-b2cpoc-shared

# Start preprod
az webapp start --name app-b2cpoc-backend-preprod --resource-group rg-b2cpoc-preprod
az webapp start --name app-b2cpoc-frontend-preprod --resource-group rg-b2cpoc-preprod

# Start prod
az webapp start --name app-b2cpoc-backend-prod --resource-group rg-b2cpoc-prod
az webapp start --name app-b2cpoc-frontend-prod --resource-group rg-b2cpoc-prod
```

---

## Credentials Reference

Credentials are stored securely and should NOT be committed to the repository.
Refer to your team's password manager or Azure Key Vault for:
- Service Principal credentials (Client ID, Client Secret, Tenant ID)
- Database admin credentials
- ACR admin credentials
- Basic Auth credentials
