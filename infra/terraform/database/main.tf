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
    resource_group {
      prevent_deletion_if_contains_resources = false
    }
  }

  subscription_id = "f98839a2-d7a3-428d-b83b-1e0891f043bc"
}

# --------------------------------------------------------------------------
# Data source – shared state (for resource group)
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
# Shared Database
# --------------------------------------------------------------------------

module "database" {
  source = "../modules/database"

  server_name         = var.server_name
  location            = var.location
  resource_group_name = data.terraform_remote_state.shared.outputs.shared_resource_group_name

  sku_name         = var.sku_name
  storage_mb       = var.storage_mb
  postgres_version = var.postgres_version

  admin_username = var.admin_username
  admin_password = var.admin_password

  preprod_database_name = var.preprod_database_name
  prod_database_name    = var.prod_database_name

  tags = local.tags
}

# --------------------------------------------------------------------------
# Locals
# --------------------------------------------------------------------------

locals {
  tags = {
    project     = "b2cpoc"
    managed_by  = "terraform"
    environment = "shared"
    component   = "database"
  }
}
