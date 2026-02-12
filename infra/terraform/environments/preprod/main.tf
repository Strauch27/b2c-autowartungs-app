terraform {
  required_version = ">= 1.5"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = ">= 3.80"
    }
  }
}

provider "azurerm" {
  features {
    key_vault {
      purge_soft_delete_on_destroy    = false
      recover_soft_deleted_key_vaults = true
    }

    resource_group {
      prevent_deletion_if_contains_resources = false
    }
  }

  subscription_id = "f98839a2-d7a3-428d-b83b-1e0891f043bc"
}

# --------------------------------------------------------------------------
# Data sources – shared state
# --------------------------------------------------------------------------

data "terraform_remote_state" "shared" {
  backend = "azurerm"

  config = {
    resource_group_name  = "rg-b2cpoc-shared"
    storage_account_name = "stb2cpoctfstate"
    container_name       = "tfstate"
    key                  = "shared.tfstate"
    subscription_id      = "f98839a2-d7a3-428d-b83b-1e0891f043bc"
  }
}

# --------------------------------------------------------------------------
# Resource Group
# --------------------------------------------------------------------------

resource "azurerm_resource_group" "main" {
  name     = "rg-b2cpoc-${var.environment}"
  location = var.location

  tags = local.tags
}

# --------------------------------------------------------------------------
# Networking
# --------------------------------------------------------------------------

module "networking" {
  source = "../../modules/networking"

  environment         = var.environment
  location            = var.location
  resource_group_name = azurerm_resource_group.main.name
  address_space       = var.vnet_address_space

  tags = local.tags
}

# --------------------------------------------------------------------------
# Monitoring
# --------------------------------------------------------------------------

module "monitoring" {
  source = "../../modules/monitoring"

  environment         = var.environment
  location            = var.location
  resource_group_name = azurerm_resource_group.main.name

  tags = local.tags
}

# --------------------------------------------------------------------------
# Compute (App Services)
# --------------------------------------------------------------------------

module "compute" {
  source = "../../modules/compute"

  environment         = var.environment
  location            = var.location
  resource_group_name = azurerm_resource_group.main.name
  sku_name            = var.app_service_sku
  appservice_subnet_id = module.networking.appservice_subnet_id
  acr_login_server    = data.terraform_remote_state.shared.outputs.acr_login_server
  frontend_image_name = var.frontend_image_name
  frontend_image_tag  = var.frontend_image_tag
  backend_image_name  = var.backend_image_name
  backend_image_tag   = var.backend_image_tag
  keyvault_uri        = module.keyvault.vault_uri

  appinsights_instrumentation_key = module.monitoring.instrumentation_key
  appinsights_connection_string   = module.monitoring.connection_string

  tags = local.tags
}

# --------------------------------------------------------------------------
# Key Vault
# --------------------------------------------------------------------------

module "keyvault" {
  source = "../../modules/keyvault"

  environment         = var.environment
  location            = var.location
  resource_group_name = azurerm_resource_group.main.name

  frontend_principal_id = module.compute.frontend_principal_id
  backend_principal_id  = module.compute.backend_principal_id

  database_url = var.database_url

  tags = local.tags
}

# --------------------------------------------------------------------------
# Storage
# --------------------------------------------------------------------------

module "storage" {
  source = "../../modules/storage"

  storage_account_name = var.storage_account_name
  location             = var.location
  resource_group_name  = azurerm_resource_group.main.name
  replication_type     = var.storage_replication_type

  tags = local.tags
}

# --------------------------------------------------------------------------
# ACR Pull permission for App Services
# --------------------------------------------------------------------------

resource "azurerm_role_assignment" "frontend_acr_pull" {
  scope                = data.terraform_remote_state.shared.outputs.acr_id
  role_definition_name = "AcrPull"
  principal_id         = module.compute.frontend_principal_id
}

resource "azurerm_role_assignment" "backend_acr_pull" {
  scope                = data.terraform_remote_state.shared.outputs.acr_id
  role_definition_name = "AcrPull"
  principal_id         = module.compute.backend_principal_id
}

# --------------------------------------------------------------------------
# Locals
# --------------------------------------------------------------------------

locals {
  tags = {
    project     = "b2cpoc"
    managed_by  = "terraform"
    environment = var.environment
  }
}
