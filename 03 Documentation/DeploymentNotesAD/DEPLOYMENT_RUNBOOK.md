# Deployment Runbook — Ronya B2C Autowartungs-App

## Prerequisites

| Item | Value |
|---|---|
| Azure Subscription | `f98839a2-d7a3-428d-b83b-1e0891f043bc` |
| Azure DevOps Org | `https://dev.azure.com/C3AdvancedMobility/` |
| Region | `germanywestcentral` (Frankfurt) |
| Cost Option | Option 2 — Cost-Optimized (~$260/month) |

**Tools required on your machine:**
- Azure CLI (`az`) — [Install](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli)
- Terraform >= 1.5 — [Install](https://developer.hashicorp.com/terraform/downloads)
- Node.js 20 — [Install](https://nodejs.org/)
- Docker — [Install](https://www.docker.com/get-started/)

---

## Step 1: Azure CLI Login

```bash
az login
az account set --subscription f98839a2-d7a3-428d-b83b-1e0891f043bc
```

---

## Step 2: Run Bootstrap Script

Creates the Terraform state storage account and Service Principal.

```bash
chmod +x infra/scripts/bootstrap.sh
./infra/scripts/bootstrap.sh
```

**Save the output credentials** — you will need them for Terraform and Azure DevOps:
- `ARM_CLIENT_ID`
- `ARM_CLIENT_SECRET`
- `ARM_SUBSCRIPTION_ID`
- `ARM_TENANT_ID`

Export them in your terminal:

```bash
export ARM_CLIENT_ID="<from bootstrap output>"
export ARM_CLIENT_SECRET="<from bootstrap output>"
export ARM_SUBSCRIPTION_ID="f98839a2-d7a3-428d-b83b-1e0891f043bc"
export ARM_TENANT_ID="<from bootstrap output>"
```

---

## Step 3: Terraform — Deploy Shared Resources

Creates the shared resource group and Azure Container Registry.

```bash
cd infra/terraform/shared
terraform init
terraform plan
terraform apply
```

This creates:
- `rg-ronya-shared` resource group
- `crronya` Azure Container Registry (Basic SKU)

---

## Step 4: Terraform — Deploy Database

Creates the shared PostgreSQL Flexible Server with separate logical databases.

```bash
cd ../database
terraform init
terraform plan
terraform apply
```

**Important:** Terraform will prompt for `admin_password`. Choose a strong password and save it securely.

This creates:
- PostgreSQL Flexible Server `psql-ronya-shared` (B_Standard_B1ms)
- Database `ronya_preprod`
- Database `ronya_prod`
- SSL enforcement + Azure services firewall rule

---

## Step 5: Terraform — Deploy Preprod Environment

```bash
cd ../environments/preprod
terraform init
terraform plan
terraform apply
```

**Required variable:** `database_url` — construct it from Step 4:
```
postgresql://<admin_user>:<admin_password>@psql-ronya-shared.postgres.database.azure.com:5432/ronya_preprod?sslmode=require
```

This creates:
- `rg-ronya-preprod` resource group
- VNet `vnet-ronya-preprod` (10.1.0.0/16)
- App Service Plan (B1)
- Frontend Web App `app-ronya-frontend-preprod`
- Backend Web App `app-ronya-backend-preprod`
- Key Vault `kv-ronya-preprod`
- Storage Account + `uploads` container
- Log Analytics + Application Insights
- ACR Pull role assignments

---

## Step 6: Terraform — Deploy Production Environment

```bash
cd ../prod
terraform init
terraform plan
terraform apply
```

**Required variable:** `database_url` — same server, different database:
```
postgresql://<admin_user>:<admin_password>@psql-ronya-shared.postgres.database.azure.com:5432/ronya_prod?sslmode=require
```

This creates the same resources as preprod with:
- P1v3 App Service Plan (instead of B1)
- VNet `10.2.0.0/16`
- Separate Key Vault, Storage, and monitoring

---

## Step 7: Populate Key Vault Secrets

After Terraform deploys, populate the real secret values in each Key Vault.

### Preprod

```bash
KV=kv-ronya-preprod

az keyvault secret set --vault-name $KV --name DATABASE-URL --value "<preprod connection string>"
az keyvault secret set --vault-name $KV --name JWT-SECRET --value "<generate with: openssl rand -hex 32>"
az keyvault secret set --vault-name $KV --name MAGIC-LINK-SECRET --value "<generate with: openssl rand -hex 32>"
az keyvault secret set --vault-name $KV --name STRIPE-SECRET-KEY --value "<Stripe test mode secret key>"
az keyvault secret set --vault-name $KV --name STRIPE-PUBLISHABLE-KEY --value "<Stripe test mode publishable key>"
az keyvault secret set --vault-name $KV --name STRIPE-WEBHOOK-SECRET --value "<Stripe test mode webhook secret>"
az keyvault secret set --vault-name $KV --name RESEND-API-KEY --value "<Resend API key>"
az keyvault secret set --vault-name $KV --name FIREBASE-PROJECT-ID --value "<Firebase project ID>"
az keyvault secret set --vault-name $KV --name FIREBASE-SERVICE-ACCOUNT --value "<Firebase service account JSON>"
```

### Production

Repeat the same for `kv-ronya-prod` with production values (Stripe live mode keys, etc.).

---

## Step 8: Build and Push Docker Images

### Login to ACR

```bash
az acr login --name crronya
```

### Build and Push Backend

```bash
cd "99 Code/backend"
docker build -t crronya.azurecr.io/ronya/backend:latest .
docker push crronya.azurecr.io/ronya/backend:latest
```

### Build and Push Frontend (Preprod)

```bash
cd "../frontend"
docker build \
  --build-arg NEXT_PUBLIC_API_URL=https://app-ronya-backend-preprod.azurewebsites.net \
  -t crronya.azurecr.io/ronya/frontend:preprod .
docker push crronya.azurecr.io/ronya/frontend:preprod
```

### Build and Push Frontend (Production)

```bash
docker build \
  --build-arg NEXT_PUBLIC_API_URL=https://app-ronya-backend-prod.azurewebsites.net \
  -t crronya.azurecr.io/ronya/frontend:prod .
docker push crronya.azurecr.io/ronya/frontend:prod
```

---

## Step 9: Run Database Migrations

```bash
cd "99 Code/backend"

# Preprod
DATABASE_URL="<preprod connection string>" npx prisma migrate deploy

# Production
DATABASE_URL="<prod connection string>" npx prisma migrate deploy
```

---

## Step 10: Deploy to App Services

```bash
# Preprod Backend
az webapp config container set \
  --name app-ronya-backend-preprod \
  --resource-group rg-ronya-preprod \
  --container-image-name crronya.azurecr.io/ronya/backend:latest

# Preprod Frontend
az webapp config container set \
  --name app-ronya-frontend-preprod \
  --resource-group rg-ronya-preprod \
  --container-image-name crronya.azurecr.io/ronya/frontend:preprod

# Restart to pick up new images
az webapp restart --name app-ronya-backend-preprod --resource-group rg-ronya-preprod
az webapp restart --name app-ronya-frontend-preprod --resource-group rg-ronya-preprod
```

Repeat for production (`app-ronya-backend-prod`, `app-ronya-frontend-prod`, `rg-ronya-prod`).

---

## Step 11: Set Up Azure DevOps CI/CD

### 11.1 Create a Project in Azure DevOps

Go to `https://dev.azure.com/C3AdvancedMobility/` and create a new project (e.g., `Ronya-B2C`).

### 11.2 Connect GitHub Repository

1. **Project Settings** > **Service connections** > **New service connection**
2. Select **GitHub** > Authorize > Select your repository
3. Name it `GitHub-Ronya-B2C`

### 11.3 Create ARM Service Connection

1. **Project Settings** > **Service connections** > **New service connection**
2. Select **Azure Resource Manager** > **Service principal (manual)**
3. Enter the Service Principal credentials from Step 2:
   - Subscription ID: `f98839a2-d7a3-428d-b83b-1e0891f043bc`
   - Service Principal ID: `<ARM_CLIENT_ID>`
   - Service Principal Key: `<ARM_CLIENT_SECRET>`
   - Tenant ID: `<ARM_TENANT_ID>`
4. Name it `Azure-Ronya-B2C`

### 11.4 Create Docker Registry Service Connection

1. **Project Settings** > **Service connections** > **New service connection**
2. Select **Docker Registry** > **Azure Container Registry**
3. Select subscription and registry `crronya`
4. Name it `crronya`

### 11.5 Create Pipeline Environments

Go to **Pipelines** > **Environments** and create:
- `ronya-shared`
- `ronya-database`
- `ronya-preprod`
- `ronya-prod` (add manual approval check for production)

### 11.6 Import Pipelines

1. **Pipelines** > **New pipeline** > **GitHub** > Select repo
2. Select **Existing Azure Pipelines YAML file**
3. Path: `infra/pipelines/azure-pipelines-infra.yml` — save as "Infrastructure"
4. Repeat for `infra/pipelines/azure-pipelines-app.yml` — save as "Application"

---

## Verification Checklist

After deployment, verify:

- [ ] `https://app-ronya-frontend-preprod.azurewebsites.net` loads the customer portal
- [ ] `https://app-ronya-backend-preprod.azurewebsites.net/health` returns 200
- [ ] Stripe test payments work in preprod
- [ ] File uploads go to Azure Blob Storage
- [ ] Application Insights shows incoming requests
- [ ] Azure DevOps pipelines trigger on push to `main`

---

## Useful Commands

```bash
# View App Service logs
az webapp log tail --name app-ronya-backend-preprod --resource-group rg-ronya-preprod

# Check App Service status
az webapp show --name app-ronya-backend-preprod --resource-group rg-ronya-preprod --query state

# List Key Vault secrets
az keyvault secret list --vault-name kv-ronya-preprod --query "[].name" -o tsv

# Check database connectivity
az postgres flexible-server show --name psql-ronya-shared --resource-group rg-ronya-shared
```

---

## Estimated Monthly Cost (Option 2 — Cost-Optimized)

| Resource | Preprod | Production |
|---|---|---|
| App Service Plan | B1 (~$13) | P1v3 (~$115) |
| PostgreSQL (shared) | — | B_Standard_B1ms (~$50) |
| Storage (LRS) | ~$1 | ~$1 |
| Key Vault | ~$0 | ~$0 |
| App Insights (free tier) | ~$0 | ~$0 |
| Container Registry (Basic) | — | ~$5 |
| **Subtotal** | **~$14** | **~$171** |
| **Total** | | **~$260/month** |
