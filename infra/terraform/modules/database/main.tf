# --------------------------------------------------------------------------
# Shared PostgreSQL Flexible Server – public access for PoC simplicity
# Private networking can be added later as an enhancement.
# --------------------------------------------------------------------------

resource "azurerm_postgresql_flexible_server" "main" {
  name                = var.server_name
  location            = var.location
  resource_group_name = var.resource_group_name

  sku_name   = var.sku_name
  storage_mb = var.storage_mb
  version    = var.postgres_version

  administrator_login    = var.admin_username
  administrator_password = var.admin_password

  backup_retention_days = 7

  # Public access – allow Azure services through firewall rule below
  public_network_access_enabled = true

  tags = var.tags

  lifecycle {
    ignore_changes = [
      # Prevent Terraform from trying to reset the admin password on every apply
      administrator_password,
    ]
  }
}

# Allow Azure services to access the database server
resource "azurerm_postgresql_flexible_server_firewall_rule" "allow_azure_services" {
  name      = "AllowAzureServices"
  server_id = azurerm_postgresql_flexible_server.main.id

  # 0.0.0.0 – 0.0.0.0 is the special Azure-services range
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"
}

# Enforce SSL connections
resource "azurerm_postgresql_flexible_server_configuration" "require_secure_transport" {
  name      = "require_secure_transport"
  server_id = azurerm_postgresql_flexible_server.main.id
  value     = "on"
}

# --------------------------------------------------------------------------
# Logical databases – one per environment
# --------------------------------------------------------------------------

resource "azurerm_postgresql_flexible_server_database" "preprod" {
  name      = var.preprod_database_name
  server_id = azurerm_postgresql_flexible_server.main.id
  charset   = "UTF8"
  collation = "en_US.utf8"
}

resource "azurerm_postgresql_flexible_server_database" "prod" {
  name      = var.prod_database_name
  server_id = azurerm_postgresql_flexible_server.main.id
  charset   = "UTF8"
  collation = "en_US.utf8"
}
