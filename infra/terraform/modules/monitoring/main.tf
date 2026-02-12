# --------------------------------------------------------------------------
# Log Analytics Workspace
# --------------------------------------------------------------------------

resource "azurerm_log_analytics_workspace" "main" {
  name                = "log-b2cpoc-${var.environment}"
  location            = var.location
  resource_group_name = var.resource_group_name
  sku                 = "PerGB2018"
  retention_in_days   = 30

  tags = var.tags
}

# --------------------------------------------------------------------------
# Application Insights – free tier (daily cap 0.1 GB)
# --------------------------------------------------------------------------

resource "azurerm_application_insights" "main" {
  name                = "appi-b2cpoc-${var.environment}"
  location            = var.location
  resource_group_name = var.resource_group_name
  workspace_id        = azurerm_log_analytics_workspace.main.id
  application_type    = "web"

  daily_data_cap_in_gb = 0.1

  tags = var.tags
}
