#!/bin/bash
set -euo pipefail

###############################################################################
# bootstrap.sh
#
# Sets up Azure infrastructure prerequisites for Terraform:
#   1. Sets the active Azure subscription
#   2. Creates a shared resource group
#   3. Creates a Storage Account + blob container for Terraform remote state
#   4. Creates a Service Principal with Contributor role
#   5. Prints the credentials needed for Terraform / CI pipelines
#
# This script is idempotent -- re-running it is safe.
###############################################################################

SUBSCRIPTION_ID="f98839a2-d7a3-428d-b83b-1e0891f043bc"
LOCATION="germanywestcentral"
RESOURCE_GROUP="rg-b2cpoc-shared"
STORAGE_ACCOUNT="stb2cpoctfstate"
CONTAINER_NAME="tfstate"
SP_NAME="sp-b2cpoc-terraform"

###############################################################################
# Pre-flight: verify az CLI is logged in
###############################################################################
echo "==> Checking Azure CLI login status..."
if ! az account show --only-show-errors > /dev/null 2>&1; then
  echo "ERROR: You are not logged in to the Azure CLI."
  echo "       Run 'az login' first, then re-run this script."
  exit 1
fi
echo "    Azure CLI is authenticated."

###############################################################################
# Step 1 -- Set the subscription
###############################################################################
echo ""
echo "==> Step 1: Setting active subscription to ${SUBSCRIPTION_ID}..."
az account set --subscription "${SUBSCRIPTION_ID}" --only-show-errors
echo "    Subscription set."

###############################################################################
# Step 2 -- Create resource group
###############################################################################
echo ""
echo "==> Step 2: Creating resource group '${RESOURCE_GROUP}' in '${LOCATION}'..."
if az group show --name "${RESOURCE_GROUP}" --only-show-errors > /dev/null 2>&1; then
  echo "    Resource group '${RESOURCE_GROUP}' already exists -- skipping."
else
  az group create \
    --name "${RESOURCE_GROUP}" \
    --location "${LOCATION}" \
    --only-show-errors > /dev/null
  echo "    Resource group '${RESOURCE_GROUP}' created."
fi

###############################################################################
# Step 3 -- Create storage account for Terraform state
###############################################################################
echo ""
echo "==> Step 3: Creating storage account '${STORAGE_ACCOUNT}' (Standard_LRS) in '${LOCATION}'..."
if az storage account show --name "${STORAGE_ACCOUNT}" --resource-group "${RESOURCE_GROUP}" --only-show-errors > /dev/null 2>&1; then
  echo "    Storage account '${STORAGE_ACCOUNT}' already exists -- skipping."
else
  az storage account create \
    --name "${STORAGE_ACCOUNT}" \
    --resource-group "${RESOURCE_GROUP}" \
    --location "${LOCATION}" \
    --sku "Standard_LRS" \
    --only-show-errors > /dev/null
  echo "    Storage account '${STORAGE_ACCOUNT}' created."
fi

###############################################################################
# Step 4 -- Create blob container for Terraform state
###############################################################################
echo ""
echo "==> Step 4: Creating blob container '${CONTAINER_NAME}' in storage account '${STORAGE_ACCOUNT}'..."
ACCOUNT_KEY=$(az storage account keys list \
  --resource-group "${RESOURCE_GROUP}" \
  --account-name "${STORAGE_ACCOUNT}" \
  --query "[0].value" \
  --output tsv \
  --only-show-errors)

if az storage container show \
  --name "${CONTAINER_NAME}" \
  --account-name "${STORAGE_ACCOUNT}" \
  --account-key "${ACCOUNT_KEY}" \
  --only-show-errors > /dev/null 2>&1; then
  echo "    Blob container '${CONTAINER_NAME}' already exists -- skipping."
else
  az storage container create \
    --name "${CONTAINER_NAME}" \
    --account-name "${STORAGE_ACCOUNT}" \
    --account-key "${ACCOUNT_KEY}" \
    --only-show-errors > /dev/null
  echo "    Blob container '${CONTAINER_NAME}' created."
fi

###############################################################################
# Step 5 -- Create Service Principal with Contributor role
###############################################################################
echo ""
echo "==> Step 5: Creating Service Principal '${SP_NAME}' with Contributor role..."
SP_OUTPUT=$(az ad sp create-for-rbac \
  --name "${SP_NAME}" \
  --role "Contributor" \
  --scopes "/subscriptions/${SUBSCRIPTION_ID}" \
  --only-show-errors 2>&1) || true

APP_ID=$(echo "${SP_OUTPUT}" | grep -o '"appId": *"[^"]*"' | cut -d'"' -f4)
PASSWORD=$(echo "${SP_OUTPUT}" | grep -o '"password": *"[^"]*"' | cut -d'"' -f4)
TENANT_ID=$(echo "${SP_OUTPUT}" | grep -o '"tenant": *"[^"]*"' | cut -d'"' -f4)

if [[ -z "${APP_ID}" || -z "${PASSWORD}" || -z "${TENANT_ID}" ]]; then
  echo "    WARNING: Could not parse Service Principal credentials from output."
  echo "    This may happen if the SP already exists. Raw output:"
  echo ""
  echo "${SP_OUTPUT}"
  echo ""
  echo "    If the SP already exists you can reset its credentials with:"
  echo "      az ad sp credential reset --name '${SP_NAME}'"
  echo ""
else
  echo "    Service Principal '${SP_NAME}' created."
fi

###############################################################################
# Summary
###############################################################################
echo ""
echo "==========================================================================="
echo " BOOTSTRAP COMPLETE"
echo "==========================================================================="
echo ""
echo " Resource Group:   ${RESOURCE_GROUP}"
echo " Storage Account:  ${STORAGE_ACCOUNT}"
echo " Blob Container:   ${CONTAINER_NAME}"
echo " Service Principal: ${SP_NAME}"
echo ""

if [[ -n "${APP_ID:-}" && -n "${PASSWORD:-}" && -n "${TENANT_ID:-}" ]]; then
  echo " *** SAVE THE FOLLOWING CREDENTIALS -- the password will NOT be shown again ***"
  echo ""
  echo " ARM_CLIENT_ID       = ${APP_ID}"
  echo " ARM_CLIENT_SECRET   = ${PASSWORD}"
  echo " ARM_SUBSCRIPTION_ID = ${SUBSCRIPTION_ID}"
  echo " ARM_TENANT_ID       = ${TENANT_ID}"
  echo ""
  echo " Export them in your shell or add them to your CI/CD secrets:"
  echo ""
  echo "   export ARM_CLIENT_ID=\"${APP_ID}\""
  echo "   export ARM_CLIENT_SECRET=\"${PASSWORD}\""
  echo "   export ARM_SUBSCRIPTION_ID=\"${SUBSCRIPTION_ID}\""
  echo "   export ARM_TENANT_ID=\"${TENANT_ID}\""
fi

echo ""
echo "==========================================================================="
