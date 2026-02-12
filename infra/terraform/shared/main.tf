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
# Shared Resource Group
# --------------------------------------------------------------------------

resource "azurerm_resource_group" "shared" {
  name     = "rg-b2cpoc-shared"
  location = var.location

  tags = local.tags
}

# --------------------------------------------------------------------------
# Azure Container Registry
# --------------------------------------------------------------------------

resource "azurerm_container_registry" "main" {
  name                = "crb2cpoc"
  resource_group_name = azurerm_resource_group.shared.name
  location            = azurerm_resource_group.shared.location
  sku                 = "Basic"
  admin_enabled       = true

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
  }
}
