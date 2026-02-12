# --------------------------------------------------------------------------
# Storage Account
# --------------------------------------------------------------------------

resource "azurerm_storage_account" "main" {
  name                     = var.storage_account_name
  location                 = var.location
  resource_group_name      = var.resource_group_name
  account_tier             = "Standard"
  account_replication_type = var.replication_type

  min_tls_version           = "TLS1_2"
  allow_nested_items_to_be_public = false

  tags = var.tags
}

# --------------------------------------------------------------------------
# Storage Container – uploads
# --------------------------------------------------------------------------

resource "azurerm_storage_container" "uploads" {
  name                  = "uploads"
  storage_account_name  = azurerm_storage_account.main.name
  container_access_type = "private"
}
