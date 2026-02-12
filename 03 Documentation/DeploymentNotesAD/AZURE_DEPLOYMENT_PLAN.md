# Azure Deployment Plan - B2C Autowartungs-App

## Executive Summary

This plan describes the deployment of the Ronya B2C Autowartungs-App PoC to Microsoft Azure. The goal is to make the PoC accessible for stakeholder demos, business validation, and user testing — while establishing the cloud foundations (IaC, CI/CD, environments) that will carry forward into the production rebuild.

**Current state**: Running locally via Docker Compose. No cloud infrastructure, no CI/CD, no custom domain.

**Target state**: Fully automated Azure deployment with two environments (preprod + prod), infrastructure-as-code, and continuous delivery.

### Key Decisions

| Decision | Choice |
|---|---|
| **Compute** | Azure App Service (PaaS) |
| **Database** | Azure Database for PostgreSQL - Flexible Server |
| **File Storage** | Azure Blob Storage (migrating from AWS S3) |
| **IaC** | Terraform (directory-based env separation) |
| **CI/CD** | Azure DevOps Pipelines |
| **DNS** | Azure DNS (domain to be registered) |
| **Secrets** | Azure Key Vault with Managed Identity |
| **Monitoring** | Application Insights + Log Analytics |
| **CDN / WAF** | Azure Front Door (Standard) |

### Environments

| | Preprod | Production |
|---|---|---|
| **URL** | `https://preprod.<domain>` | `https://app.<domain>` |
| **API URL** | `https://api-preprod.<domain>` | `https://api.<domain>` |
| **Deploy trigger** | Automatic on merge to `main` | Manual approval after preprod E2E pass |
| **Stripe** | Test mode | Live mode |
| **DB HA** | Disabled | Zone-redundant |
| **Est. cost** | ~$105/month | ~$320/month |

### 10-Step Implementation Roadmap (est. 2-4 weeks)

1. **Set up cloud foundation** — Create the shared Azure infrastructure (container registry, CDN, DNS, monitoring) that both environments build on
2. **Provision preprod environment** — Stand up the full preprod stack (compute, database, storage, networking, secrets management) via Infrastructure as Code
3. **Prepare production-grade containers** — Package the frontend and backend as optimized, deployment-ready container images
4. **Configure frontend for cloud deployment** — Adapt the Next.js application to run as a standalone server inside containers
5. **Migrate file storage to Azure** — Move from AWS S3 to Azure Blob Storage with credential-free access via Managed Identity
6. **Enable monitoring and observability** — Integrate Application Insights for real-time visibility into application health, performance, and errors
7. **Automate the delivery pipeline** — Set up Azure DevOps CI/CD: automated build, test, preprod deploy, E2E validation, and production deploy with approval gate
8. **Deploy and validate preprod** — First live deployment; run automated test suite; make the application accessible to stakeholders for demos and feedback
9. **Provision and deploy production** — Create the production environment with high availability and deploy via the automated pipeline
10. **Go live with custom domain** — Configure DNS, SSL certificates, CDN routing, and monitoring alerts — the application is publicly accessible

### What Carries Forward to the Enterprise Rebuild

The PoC deployment is not throwaway work. The following assets transfer directly to the .NET Aspire production system:

- **Terraform modules** — VNet, PostgreSQL, Blob Storage, Key Vault, DNS, and monitoring modules are reusable; only the compute module changes (App Service → Aspire containers)
- **Azure DevOps pipelines** — Pipeline structure, approval gates, and E2E test integration carry over; build steps change from Node.js to .NET
- **Azure infrastructure** — Resource groups, networking, Key Vault, and Front Door remain; database gets a fresh instance for the new schema
- **Operational knowledge** — Team gains hands-on experience with Azure, Terraform, and DevOps workflows before the production rebuild begins

### Cost & Timeline

#### Option 1: Full Setup (recommended for production-bound workloads)

Separate infrastructure per environment, CDN/WAF protection, dedicated monitoring.

| | Preprod | Production | Total |
|---|---|---|---|
| **Monthly Azure cost** | ~$105 | ~$320 | **~$425/month** |
| **Implementation effort** | Week 1-2 | Week 3-4 | **2-4 weeks** |
| **Ongoing maintenance** | Automated via CI/CD | Automated via CI/CD | Minimal ops overhead |

#### Option 2: Cost-Optimized Setup (recommended for PoC / demo phase)

Since the application is a PoC for business validation — not yet serving real customers — several infrastructure components can be shared or deferred to reduce cost without compromising the deployment automation.

| Saving | What changes | Impact | Saving/month |
|---|---|---|---|
| **Share one database server** | Run preprod and prod as separate logical databases on a single PostgreSQL Flexible Server instance | Same server, fully isolated databases with separate credentials and connection strings; no data mixing between environments | ~$25 |
| **Use free-tier monitoring** | Application Insights free tier includes 5 GB/month of log ingestion — sufficient for PoC-level traffic | No cost unless log volume exceeds 5 GB; alerts and dashboards still work | ~$20 |
| **Skip Front Door — use direct DNS** | Point custom domain directly at App Service via A/CNAME records; App Service provides a public IP, built-in SSL, and custom domain binding out of the box | No CDN edge caching, no WAF layer; add Front Door later if DDoS protection or global distribution is needed | ~$35 |
| **Smaller App Service Plans** | Use `B1` (1 core, 1.75 GB) instead of `B2` for preprod; sufficient for demo traffic | Slower under concurrent load; fine for a handful of testers | ~$25 |

**Cost-optimized total: ~$260/month** (both environments, shared DB server, direct DNS, free monitoring)

| | Option 1 (Full) | Option 2 (Cost-Optimized) |
|---|---|---|
| **Monthly cost** | ~$425 | **~$260** |
| **Environments** | Preprod + Prod | Preprod + Prod |
| **CI/CD (Azure DevOps)** | Yes | Yes (non-negotiable) |
| **Terraform IaC** | Yes | Yes (non-negotiable) |
| **Key Vault secrets** | Yes | Yes (non-negotiable) |
| **Database server** | Separate server per env | Shared server, separate logical databases |
| **Custom domain + SSL** | Via Front Door (CDN + WAF) | Via App Service direct (DNS A/CNAME + managed SSL) |
| **Monitoring** | Paid tier | Free tier (5 GB/month) |
| **Path to full setup** | — | Terraform makes upgrading a single `apply` |

The cost-optimized setup is not a shortcut — it uses the same Terraform modules, the same CI/CD pipelines, and the same container images. Both environments are fully operational. When the business needs CDN/WAF or a dedicated database server per environment, upgrading is a configuration change, not a rebuild.

---

## 1. Azure Resource Architecture

### Naming Convention
`{resource-type}-ronya-{component}-{environment}` (e.g., `app-ronya-backend-preprod`)

### Resource Groups
| Resource Group | Purpose |
|---|---|
| `rg-ronya-shared` | ACR, Log Analytics, Front Door, Azure DNS Zone, TF state storage |
| `rg-ronya-preprod` | All preprod resources |
| `rg-ronya-prod` | All production resources |

### Per-Environment Resources

| Resource | Preprod | Prod |
|---|---|---|
| **App Service Plan** | `B2` (2 cores, 3.5 GB) | `P1v3` (2 cores, 8 GB, VNet support) |
| **App Service (Frontend)** | `app-ronya-frontend-preprod` | `app-ronya-frontend-prod` |
| **App Service (Backend)** | `app-ronya-backend-preprod` | `app-ronya-backend-prod` |
| **PostgreSQL Flexible** | `Burstable B1ms` (1 vCore, 32 GB) | `GP D2ds_v4` (2 vCores, 64 GB, zone-redundant HA) |
| **Blob Storage** | `stronyapreprod` (LRS) | `stronyaprod` (ZRS) |
| **Key Vault** | `kv-ronya-preprod` | `kv-ronya-prod` |
| **App Insights** | `ai-ronya-preprod` | `ai-ronya-prod` |
| **VNet** | `10.1.0.0/16` | `10.2.0.0/16` |

### Shared Resources
- **ACR**: `crronya` (Basic SKU)
- **Front Door**: `afd-ronya` (Standard) with WAF
- **Log Analytics**: `law-ronya-shared`
- **Azure DNS Zone**: `<domain>` (managed in shared, records per env)
- **TF State Storage**: `stronytfstate`

### Network Topology (per env)
```
vnet-ronya-{env}
├── snet-appservice (10.X.1.0/24)  → App Service VNet integration
├── snet-postgres   (10.X.2.0/24)  → PostgreSQL private access
└── snet-storage    (10.X.3.0/24)  → Blob Storage private endpoint
```
PostgreSQL: private access only (no public endpoint). App Services reach DB via VNet integration.

---

## 2. Terraform Structure

```
infra/
  terraform/
    environments/
      preprod/
        main.tf, variables.tf, terraform.tfvars, backend.tf, outputs.tf
      prod/
        main.tf, variables.tf, terraform.tfvars, backend.tf, outputs.tf
    modules/
      networking/       # VNet, subnets, NSGs
      database/         # PostgreSQL Flexible Server, private DNS
      compute/          # App Service Plan + App Services
      storage/          # Blob Storage, containers, private endpoint
      keyvault/         # Key Vault, access policies, secrets
      monitoring/       # App Insights, alerts, Log Analytics
      dns/              # Azure DNS Zone, DNS records per environment
    shared/
      main.tf           # ACR, Front Door, DNS Zone, Log Analytics, TF state storage
```

**State**: Remote in Azure Storage (`stronytfstate` container `tfstate`) with separate state files per environment.
**Approach**: Directory-based separation (not workspaces) — prevents accidental cross-env applies.

---

## 3. Docker Production Builds

### Backend (`99 Code/backend/Dockerfile`) — Replace with multi-stage:
1. **deps stage**: `npm ci --only=production` + `npx prisma generate`
2. **build stage**: `npm ci` (full) + `npm run build` (tsc → `dist/`)
3. **production stage**: Copy prod `node_modules`, Prisma client, compiled `dist/`, email templates. Uses `dumb-init`, health check on `/health`, runs `node dist/server.js`

### Frontend (`99 Code/frontend/Dockerfile`) — Replace with standalone:
1. **deps stage**: `npm ci`
2. **build stage**: `npm run build` with `NEXT_PUBLIC_*` build args per environment
3. **production stage**: Copy `.next/standalone`, `.next/static`, `public/`, `messages/`. Runs `node server.js`

**Prerequisite**: Add `output: 'standalone'` to `99 Code/frontend/next.config.ts`

Frontend images are built separately per env (preprod/prod) because `NEXT_PUBLIC_*` vars are inlined at build time.

---

## 4. Azure DevOps CI/CD Pipelines

### Pipeline Files
```
infra/pipelines/
  azure-pipelines-infra.yml     # Terraform plan/apply
  azure-pipelines-app.yml       # App build + deploy
  templates/
    docker-build.yml
    deploy-app-service.yml
    run-terraform.yml
```

### Infrastructure Pipeline (`azure-pipelines-infra.yml`)
**Trigger**: Manual or on changes to `infra/terraform/**`

Stages: Validate → Plan Shared → Apply Shared (approval) → Plan Preprod → Apply Preprod (approval) → Plan Prod → Apply Prod (2-approver gate)

### Application Pipeline (`azure-pipelines-app.yml`)
**Trigger**: Push to `main` (paths: `99 Code/**`)

```
Stage 1: Build & Test (parallel jobs)
  ├── Backend:  npm ci → lint → prisma generate → build → test:unit → Docker build+push
  └── Frontend: npm ci → lint → build (x2: preprod + prod args) → Docker build+push

Stage 2: Deploy Preprod (automatic)
  ├── Run prisma migrate deploy (via ACI in VNet)
  ├── Update backend App Service image tag → health check
  └── Update frontend App Service image tag → smoke test

Stage 3: E2E Tests
  └── Playwright smoke suite against preprod URL → publish results

Stage 4: Deploy Prod (manual approval gate)
  ├── Run prisma migrate deploy (prod)
  ├── Update backend App Service image → health check
  └── Update frontend App Service image → smoke test
```

### Database Migration Strategy
Run `npx prisma migrate deploy` in a short-lived Azure Container Instance within the VNet before deploying new app code. Migrations are idempotent — only pending migrations run.

### Rollback Strategy
- **Prod**: Use App Service deployment slots (deploy to staging slot, swap after verification, swap back if issues)
- **Quick rollback**: Re-deploy previous image tag from ACR
- **DB rollback**: Point-in-time restore from PostgreSQL backups. Design migrations to be backward-compatible (additive only)

---

## 5. AWS S3 → Azure Blob Storage Migration

### Files to Modify
- `99 Code/backend/src/services/upload.service.ts` — Replace S3 SDK calls with Azure Blob SDK
- `99 Code/backend/src/config/upload.config.ts` — Replace S3 config with Azure Blob config
- `99 Code/backend/package.json` — Remove `@aws-sdk/*`, add `@azure/storage-blob` + `@azure/identity`

### SDK Mapping
| AWS S3 | Azure Blob Storage |
|---|---|
| `S3Client` | `BlobServiceClient` |
| `PutObjectCommand` | `blockBlobClient.uploadData()` |
| `DeleteObjectCommand` | `blockBlobClient.delete()` |
| `getSignedUrl` (presigned) | `generateBlobSASQueryParameters` |
| Bucket | Container |

### Auth: Use `DefaultAzureCredential` (Managed Identity on Azure, Azure CLI locally) — zero secrets needed for storage access in production.

---

## 6. Monitoring & Observability

### Application Insights
- Add `applicationinsights` npm package to backend
- Initialize as first import in `server.ts` with auto-collection (requests, dependencies, exceptions)
- Existing Winston logs flow automatically via console transport

### Alerts
| Alert | Condition | Severity |
|---|---|---|
| High Error Rate | >10 exceptions/5min | Sev 1 |
| API Latency | P95 > 5s | Sev 2 |
| DB Connection Failures | >5 failures/5min | Sev 1 |
| App Down | 3+ consecutive health check failures | Sev 0 |
| High Memory | >85% | Sev 2 |

---

## 7. Environment Configuration

### Secret Flow
```
Key Vault → App Service Configuration (@Microsoft.KeyVault references) → Container env vars
```

### Key Vault Secrets (per env)
`DATABASE-URL`, `JWT-SECRET`, `MAGIC-LINK-SECRET`, `STRIPE-SECRET-KEY`, `STRIPE-PUBLISHABLE-KEY`, `STRIPE-WEBHOOK-SECRET`, `RESEND-API-KEY`, `FIREBASE-PROJECT-ID`, `FIREBASE-SERVICE-ACCOUNT`

### Stripe
- **Preprod**: Test mode keys (`sk_test_*`, `pk_test_*`)
- **Prod**: Live mode keys (`sk_live_*`, `pk_live_*`)
- Separate webhook registrations per environment in Stripe dashboard

---

## 8. DNS & Custom Domains

### Prerequisites
- **Register a domain** (e.g., `ronya-autowartung.de` or similar) with any registrar (IONOS, Namecheap, etc.)
- After registration, delegate DNS to Azure by updating the registrar's nameservers to point to Azure DNS

### Azure DNS Zone
- Resource: `dns-ronya` in `rg-ronya-shared` — managed via Terraform
- Terraform creates the zone and outputs the Azure nameserver addresses (e.g., `ns1-01.azure-dns.com`)
- You then update these nameservers at your domain registrar (one-time manual step)

### DNS Records (managed by Terraform)

| Record | Type | Value | Purpose |
|---|---|---|---|
| `app.<domain>` | CNAME | Front Door endpoint (`afd-ronya-xxxxx.z01.azurefd.net`) | Production frontend |
| `api.<domain>` | CNAME | `app-ronya-backend-prod.azurewebsites.net` | Production API |
| `preprod.<domain>` | CNAME | Front Door endpoint (preprod origin) | Preprod frontend |
| `api-preprod.<domain>` | CNAME | `app-ronya-backend-preprod.azurewebsites.net` | Preprod API |
| `@` (root) | A / ALIAS | Front Door or redirect to `app.<domain>` | Root domain |

### SSL/TLS Certificates
- **Front Door**: Azure-managed free TLS certificates for custom domains (auto-renewed)
- **App Service (API)**: Azure-managed App Service certificate (free for custom domains)
- All endpoints enforce HTTPS-only, TLS 1.2 minimum

### Traffic Flow
```
User → app.<domain>
       → Azure Front Door (TLS termination, WAF, caching)
         → app-ronya-frontend-{env}.azurewebsites.net

User → api.<domain>
       → app-ronya-backend-{env}.azurewebsites.net (direct, HTTPS)
```

### Frontend → Backend Communication
- The frontend's `NEXT_PUBLIC_API_URL` is set to `https://api.<domain>` (prod) or `https://api-preprod.<domain>` (preprod)
- Backend `CORS_ORIGIN` is set to `https://app.<domain>` or `https://preprod.<domain>` accordingly
- Stripe webhook URL registered at `https://api.<domain>/api/payment/webhook`

### Initial Bootstrapping (before custom domain)
During initial setup, the app is accessible via Azure default URLs:
- `app-ronya-frontend-preprod.azurewebsites.net`
- `app-ronya-backend-preprod.azurewebsites.net`

Custom domain and Front Door are added in step 10 once the app is verified working.

---

## 9. Security Hardening

- PostgreSQL: Private access only, SSL enforced, TLS 1.2
- Blob Storage: Private endpoint, deny public access
- App Service: HTTPS-only, TLS 1.2 minimum
- Key Vault: Managed Identity access (no stored credentials)
- ACR: Managed Identity pull (no admin credentials)
- Front Door: WAF policy, DDoS protection, rate limiting
- Security headers: HSTS, X-Content-Type-Options, X-Frame-Options, CSP

---

## 10. Implementation Sequence

| Step | What | Files |
|---|---|---|
| 1 | Create Terraform modules + shared infra | `infra/terraform/**` (new) |
| 2 | Provision preprod environment | `infra/terraform/environments/preprod/` |
| 3 | Production Dockerfiles (multi-stage) | `99 Code/backend/Dockerfile`, `99 Code/frontend/Dockerfile` |
| 4 | Next.js standalone output | `99 Code/frontend/next.config.ts` |
| 5 | Azure Blob Storage migration | `upload.service.ts`, `upload.config.ts`, `package.json` |
| 6 | Application Insights integration | `99 Code/backend/src/server.ts`, `package.json` |
| 7 | Azure DevOps pipelines | `infra/pipelines/` (new) |
| 8 | Deploy + test preprod | Pipeline execution |
| 9 | Provision + deploy prod | Terraform + pipeline |
| 10 | DNS, Front Door, monitoring alerts | Terraform + Azure Portal |

## 11. Verification

- **Terraform**: `terraform plan` shows expected resources, `terraform apply` succeeds
- **Docker**: Build locally with `docker build --target production`, verify images run and respond on health endpoints
- **Preprod deploy**: Pipeline deploys successfully, health checks pass, E2E smoke tests pass
- **Prod deploy**: Manual approval gate works, deployment succeeds, smoke tests pass
- **Blob Storage**: File upload/download works via Azure Blob SDK
- **Monitoring**: Requests appear in Application Insights, alerts trigger on test errors
- **Security**: PostgreSQL unreachable from public internet, Key Vault secrets resolve in App Service

### Estimated Monthly Cost
- **Preprod**: ~$105/month
- **Prod**: ~$320/month
- **Total**: ~$425/month
