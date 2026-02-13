# B2C PoC Azure Deployment - Status Report

**Date:** 2026-02-13 (updated from 2026-02-12)
**Author:** Andreas Dannhauer (assisted by Claude Code)

---

## Executive Summary

The B2C Autowartungs-App has been successfully deployed to Azure across two environments (preprod and production). A fully functional **CI/CD pipeline** is now operational in Azure DevOps, running on a **self-hosted agent** (Azure Container Instance) with Docker image builds via **ACR Tasks**. The pipeline covers build, deploy to preprod, and deploy to production (with manual approval gate). All changes are committed and pushed to GitHub.

---

## What Was Accomplished Today (2026-02-13)

### 1. CI/CD Pipeline - Fully Operational

The end-to-end Azure DevOps pipeline is now working. Run 9 completed successfully deploying to both preprod and production.

**Pipeline flow:**
```
Push to main (99 Code/**)
  → Build & Push Images (ACR Tasks)
    → Deploy to Preprod (migrations + backend + frontend)
      → Deploy to Production (manual approval + migrations + backend + frontend)
```

**Key design decisions:**
- **Self-hosted agent** on Azure Container Instances (ACI) — the Azure DevOps org has 0 hosted parallelism
- **ACR Tasks** (`az acr build`) for Docker image builds — the ACI agent has no Docker daemon, so builds are offloaded to ACR cloud build
- **Direct Node.js** for Prisma migrations — runs `npm ci` + `prisma migrate deploy` on the agent instead of inside Docker containers
- **`skipBuild` parameter** — allows deploy-only runs when code hasn't changed (saves 10+ min)
- **Stage conditions** — downstream stages work correctly even when Build is skipped

**Pipeline runs summary:**

| Run | Result | Notes |
|-----|--------|-------|
| 1 | Failed | Hosted pool, 0 parallelism |
| 2 | Canceled | Stuck on hosted pool |
| 3 | Canceled | Backend npm ci failed (missing package-lock.json) |
| 4 | Failed | Key Vault name wrong (kv-b2cpoc-preprod vs -preprod-01) |
| 5 | Failed | Same Key Vault issue |
| 6 | Canceled | Superseded |
| 7 | Succeeded | First successful deploy (preprod only, E2E skipped due to stage conditions) |
| 8 | Canceled | E2E stage hung (Playwright needs sudo for system deps) |
| **9** | **Succeeded** | **Full chain: Build(skipped) → Preprod → Prod** |

### 2. Self-Hosted Agent Infrastructure

Created and deployed a custom Azure DevOps agent:

| Component | Details |
|-----------|---------|
| Agent Pool | `Self-Hosted` (Pool ID: 10) |
| Agent Name | `b2cpoc-agent-01` |
| Hosting | Azure Container Instance (`aci-b2cpoc-agent` in `rg-b2cpoc-shared`) |
| Image | `crb2cpoc.azurecr.io/b2cpoc/devops-agent:latest` |
| Resources | 2 vCPU, 4 GB RAM |
| Base OS | Ubuntu 22.04 |
| Pre-installed | Docker CLI, Node.js 20, Azure CLI, Azure Pipelines Agent v4.268.0 |

### 3. Issues Resolved During Pipeline Setup

| Issue | Root Cause | Fix |
|-------|-----------|-----|
| Pipeline stuck at `notStarted` | Definition had `Hosted Ubuntu 1604` pool override | Updated definition via REST API to `Self-Hosted` |
| Agent pool not authorized | First-use resource authorization required | Authorized pool for all pipelines via API |
| `npm ci` failed | `package-lock.json` not in git (backend `.gitignore` excluded it) | Removed from `.gitignore`, committed `package-lock.json` |
| Key Vault `AKV10032: Invalid issuer` | Pipeline used `kv-b2cpoc-preprod` but actual name is `kv-b2cpoc-preprod-01` — the wrong name resolved to a vault in another tenant | Fixed vault names to `kv-b2cpoc-preprod-01` / `kv-b2cpoc-prod-01` |
| `P3005: Database schema is not empty` | Used `prisma db push` initially, so `_prisma_migrations` table didn't exist | Baselined all 3 migrations with `prisma migrate resolve --applied` on both databases |
| E2E stage skipped when Build skipped | Default `succeeded()` condition checks all ancestors including skipped Build stage | Added explicit `condition: in(dependencies.X.result, ...)` to each stage |
| Playwright install hanging | `--with-deps` needs sudo, agent runs as non-root user | Disabled E2E stage for now (noted as enhancement) |

### 4. Contact Email Update

Changed all occurrences of `info@ronya.de` to `b2c@centhree.com` across 8 files:
- `app/[locale]/privacy/page.tsx`
- `app/[locale]/booking/success/page.tsx`
- `app/[locale]/terms/page.tsx`
- `app/[locale]/support/page.tsx`
- `app/[locale]/imprint/page.tsx`
- `components/landing/Footer.tsx`
- `components/Footer.tsx`
- `e2e/qa-navigation-audit.spec.ts`

### 5. Git Commits Pushed

All changes committed and pushed to `main`:

```
51dfb4a Skip E2E stage for now (needs Playwright in agent image)
743e459 Fix stage conditions to work when Build stage is skipped
cca7eb0 Add skipBuild parameter to pipeline for deploy-only runs
3a3f699 Fix Key Vault names in pipeline (kv-b2cpoc-*-01)
a41208b Add backend package-lock.json to git for reproducible CI builds
72f4433 Switch CI/CD pipeline to self-hosted agent with ACR Tasks builds
445c79e Update contact email from info@ronya.de to b2c@centhree.com
59c8a3e Add Azure infrastructure, production Dockerfiles, basic auth, and deployment docs
```

---

## Current Resource State

| Resource | State | Notes |
|----------|-------|-------|
| PostgreSQL (`psql-b2cpoc-shared`) | **Running** | Both databases operational |
| Frontend preprod | **Running** | Last deployed by pipeline Run 9 |
| Backend preprod | **Running** | Last deployed by pipeline Run 9 |
| Frontend prod | **Stopped** | Container config updated by Run 9, needs manual start |
| Backend prod | **Stopped** | Container config updated by Run 9, needs manual start |
| ACI Agent (`aci-b2cpoc-agent`) | **Running** | Listening for pipeline jobs |
| ACR (`crb2cpoc`) | Running | Contains all images |

---

## Infrastructure Overview

### Per-Environment Resources

| Component | Preprod | Prod | Notes |
|-----------|---------|------|-------|
| Resource Group | rg-b2cpoc-preprod | rg-b2cpoc-prod | Both in westeurope |
| VNet | vnet-b2cpoc-preprod (10.1.0.0/16) | vnet-b2cpoc-prod (10.2.0.0/16) | 3 subnets each |
| App Service Plan | asp-b2cpoc-preprod (B1) | asp-b2cpoc-prod (B1) | Linux containers |
| Frontend App | app-b2cpoc-frontend-preprod | app-b2cpoc-frontend-prod | Next.js 16 standalone |
| Backend App | app-b2cpoc-backend-preprod | app-b2cpoc-backend-prod | Node.js/Express |
| Key Vault | kv-b2cpoc-preprod-01 | kv-b2cpoc-prod-01 | RBAC-enabled |
| Storage Account | stb2cpocpreprod | stb2cpocprod | Private blob storage |
| Log Analytics | log-b2cpoc-preprod | log-b2cpoc-prod | |
| App Insights | appi-b2cpoc-preprod | appi-b2cpoc-prod | |

### Shared Resources (`rg-b2cpoc-shared`)

- **ACR:** `crb2cpoc.azurecr.io` (admin enabled)
- **PostgreSQL:** `psql-b2cpoc-shared.postgres.database.azure.com` (westeurope)
  - Databases: `b2cpoc_preprod`, `b2cpoc_prod`
  - Prisma migrations baselined (3 migrations marked as applied)
- **Terraform State:** `stb2cpoctfstate` (tfstate container)
- **Self-Hosted Agent:** `aci-b2cpoc-agent` (2 vCPU, 4 GB RAM)

### Azure DevOps (`dev.azure.com/C3AdvancedMobility/B2C_PoC`)

| Resource | Details |
|----------|---------|
| Pipeline | `B2C App - Build & Deploy` (ID: 1) |
| Agent Pool | `Self-Hosted` (ID: 10, 1 agent) |
| Environment | `b2cpoc-prod` (ID: 1, approval gate: Andreas Dannhauer) |
| Service Connection (ARM) | `Azure-B2C-PoC` |
| Service Connection (ACR) | `crb2cpoc` |
| Service Connection (GitHub) | `GitHub-B2C` (using repo owner PAT) |

### Pipeline Files

| File | Purpose |
|------|---------|
| `infra/pipelines/azure-pipelines-app.yml` | Main CI/CD pipeline |
| `infra/pipelines/templates/docker-build.yml` | ACR Tasks build template |
| `infra/pipelines/templates/deploy-app-service.yml` | App Service deployment template |
| `infra/pipelines/templates/run-terraform.yml` | Terraform execution template |
| `infra/pipelines/azure-pipelines-infra.yml` | Infrastructure pipeline (not yet activated) |

---

## Key Vault Secrets Status

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

---

## Security

- **Basic Auth** on frontend via Next.js `proxy.ts`: `admin` / `b2cpoc2026`
  - Controlled by `BASIC_AUTH_ENABLED=true` env var
  - To disable at go-live: set `BASIC_AUTH_ENABLED=false`
- All secrets in Key Vault with RBAC (managed identity access)
- App Services use system-assigned managed identities
- TLS 1.2 minimum enforced
- VNet integration enabled
- Storage accounts are **private** (`allow_nested_items_to_be_public = false`)

---

## URLs

| Environment | Frontend | Backend |
|-------------|----------|---------|
| Preprod | https://app-b2cpoc-frontend-preprod.azurewebsites.net | https://app-b2cpoc-backend-preprod.azurewebsites.net |
| Prod | https://app-b2cpoc-frontend-prod.azurewebsites.net | https://app-b2cpoc-backend-prod.azurewebsites.net |

**Azure DevOps Pipeline:** https://dev.azure.com/C3AdvancedMobility/B2C_PoC/_build?definitionId=1

---

## Pending / Next Steps

### 1. Re-enable E2E Tests
- Pre-install Playwright + Chromium + system dependencies in the agent Docker image
- Re-enable the E2E stage in the pipeline YAML
- E2E tests are already written (`qa-navigation-audit.spec.ts`)

### 2. Start Production App Services
Prod container configs were updated by the pipeline but the App Services are still stopped:
```bash
az webapp start --name app-b2cpoc-backend-prod --resource-group rg-b2cpoc-prod
az webapp start --name app-b2cpoc-frontend-prod --resource-group rg-b2cpoc-prod
```

### 3. Third-Party Secret Values
Replace placeholder secrets in both Key Vaults:
- **Stripe:** Get keys from https://dashboard.stripe.com/apikeys
- **Resend:** Get API key from https://resend.com/api-keys
- **Firebase:** Get project ID + service account JSON from Firebase Console

```bash
az keyvault secret set --vault-name "kv-b2cpoc-preprod-01" --name "STRIPE-SECRET-KEY" --value "sk_test_..."
az keyvault secret set --vault-name "kv-b2cpoc-prod-01" --name "STRIPE-SECRET-KEY" --value "sk_live_..."
```

### 4. Request Free Hosted Parallelism
Submit request at https://aka.ms/azpipelines-parallelism-request to get free hosted agent capacity. Once granted, the pipeline can optionally switch back to `vmImage: 'ubuntu-latest'` for faster parallel builds.

### 5. Conditional Build Check
Add logic to skip the Build stage automatically when only pipeline/infra files changed (not `99 Code/`). Currently requires manual `skipBuild: true` parameter.

### 6. Custom Domain & SSL
- Map custom domain(s) to App Services
- Configure managed certificates or bring your own

### 7. Infrastructure Pipeline
- Activate `azure-pipelines-infra.yml` for Terraform plan/apply via CI/CD
- Currently infrastructure changes are applied manually via `terraform apply`

---

## How to Operate

### Trigger a Full Pipeline Run (Build + Deploy)
Push changes to `99 Code/**` on `main`, or manually trigger from Azure DevOps portal.

### Trigger a Deploy-Only Run (Skip Builds)
From Azure DevOps portal: Run pipeline → Set `skipBuild` to `true`.

Or via CLI:
```bash
az pipelines run --name "B2C App - Build & Deploy" --parameters skipBuild=true
```

### Start/Stop Resources
```bash
# Start PostgreSQL (takes ~2 min)
az postgres flexible-server start --name psql-b2cpoc-shared --resource-group rg-b2cpoc-shared

# Start preprod
az webapp start --name app-b2cpoc-backend-preprod --resource-group rg-b2cpoc-preprod
az webapp start --name app-b2cpoc-frontend-preprod --resource-group rg-b2cpoc-preprod

# Start prod
az webapp start --name app-b2cpoc-backend-prod --resource-group rg-b2cpoc-prod
az webapp start --name app-b2cpoc-frontend-prod --resource-group rg-b2cpoc-prod

# Stop all (to save costs)
az webapp stop --name app-b2cpoc-frontend-preprod --resource-group rg-b2cpoc-preprod
az webapp stop --name app-b2cpoc-backend-preprod --resource-group rg-b2cpoc-preprod
az webapp stop --name app-b2cpoc-frontend-prod --resource-group rg-b2cpoc-prod
az webapp stop --name app-b2cpoc-backend-prod --resource-group rg-b2cpoc-prod
az postgres flexible-server stop --name psql-b2cpoc-shared --resource-group rg-b2cpoc-shared
```

### Stop/Start the CI/CD Agent
```bash
# Stop (saves ~$2/day)
az container stop --name aci-b2cpoc-agent --resource-group rg-b2cpoc-shared

# Start
az container start --name aci-b2cpoc-agent --resource-group rg-b2cpoc-shared
```

---

## Credentials Reference

Credentials are stored securely and should NOT be committed to the repository.
Refer to your team's password manager or Azure Key Vault for:
- Service Principal credentials (Client ID, Client Secret, Tenant ID)
- Database admin credentials
- ACR admin credentials
- Basic Auth credentials
- Azure DevOps Agent PAT
- GitHub PAT (repo owner)
