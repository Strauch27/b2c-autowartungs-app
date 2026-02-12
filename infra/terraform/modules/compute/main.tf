# --------------------------------------------------------------------------
# App Service Plan
# --------------------------------------------------------------------------

resource "azurerm_service_plan" "main" {
  name                = "asp-b2cpoc-${var.environment}"
  location            = var.location
  resource_group_name = var.resource_group_name
  os_type             = "Linux"
  sku_name            = var.sku_name

  tags = var.tags
}

# --------------------------------------------------------------------------
# Frontend Web App
# --------------------------------------------------------------------------

resource "azurerm_linux_web_app" "frontend" {
  name                = "app-b2cpoc-frontend-${var.environment}"
  location            = var.location
  resource_group_name = var.resource_group_name
  service_plan_id     = azurerm_service_plan.main.id

  https_only = true

  virtual_network_subnet_id = var.appservice_subnet_id

  identity {
    type = "SystemAssigned"
  }

  site_config {
    minimum_tls_version                    = "1.2"
    always_on                              = var.sku_name != "F1" && var.sku_name != "B1" ? true : false
    container_registry_use_managed_identity = true

    application_stack {
      docker_image_name   = "${var.frontend_image_name}:${var.frontend_image_tag}"
      docker_registry_url = "https://${var.acr_login_server}"
    }
  }

  app_settings = {
    "WEBSITES_ENABLE_APP_SERVICE_STORAGE" = "false"
    "WEBSITES_PORT"                       = "3000"
    "NEXT_PUBLIC_API_URL"                 = "https://app-b2cpoc-backend-${var.environment}.azurewebsites.net"
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"  = "@Microsoft.KeyVault(SecretUri=${var.keyvault_uri}secrets/STRIPE-PUBLISHABLE-KEY/)"
    "BASIC_AUTH_ENABLED"                  = var.basic_auth_enabled ? "true" : "false"
    "BASIC_AUTH_USER"                     = var.basic_auth_user
    "BASIC_AUTH_PASS"                     = var.basic_auth_pass
    "APPINSIGHTS_INSTRUMENTATIONKEY"      = var.appinsights_instrumentation_key
    "APPLICATIONINSIGHTS_CONNECTION_STRING" = var.appinsights_connection_string
  }

  tags = var.tags
}

# --------------------------------------------------------------------------
# Backend Web App
# --------------------------------------------------------------------------

resource "azurerm_linux_web_app" "backend" {
  name                = "app-b2cpoc-backend-${var.environment}"
  location            = var.location
  resource_group_name = var.resource_group_name
  service_plan_id     = azurerm_service_plan.main.id

  https_only = true

  virtual_network_subnet_id = var.appservice_subnet_id

  identity {
    type = "SystemAssigned"
  }

  site_config {
    minimum_tls_version                    = "1.2"
    always_on                              = var.sku_name != "F1" && var.sku_name != "B1" ? true : false
    container_registry_use_managed_identity = true
    health_check_path                      = "/health"
    health_check_eviction_time_in_min      = 5

    application_stack {
      docker_image_name   = "${var.backend_image_name}:${var.backend_image_tag}"
      docker_registry_url = "https://${var.acr_login_server}"
    }
  }

  app_settings = {
    "WEBSITES_ENABLE_APP_SERVICE_STORAGE" = "false"
    "WEBSITES_PORT"                       = "5000"
    "DATABASE_URL"                        = "@Microsoft.KeyVault(SecretUri=${var.keyvault_uri}secrets/DATABASE-URL/)"
    "JWT_SECRET"                          = "@Microsoft.KeyVault(SecretUri=${var.keyvault_uri}secrets/JWT-SECRET/)"
    "MAGIC_LINK_SECRET"                   = "@Microsoft.KeyVault(SecretUri=${var.keyvault_uri}secrets/MAGIC-LINK-SECRET/)"
    "STRIPE_SECRET_KEY"                   = "@Microsoft.KeyVault(SecretUri=${var.keyvault_uri}secrets/STRIPE-SECRET-KEY/)"
    "STRIPE_PUBLISHABLE_KEY"              = "@Microsoft.KeyVault(SecretUri=${var.keyvault_uri}secrets/STRIPE-PUBLISHABLE-KEY/)"
    "STRIPE_WEBHOOK_SECRET"               = "@Microsoft.KeyVault(SecretUri=${var.keyvault_uri}secrets/STRIPE-WEBHOOK-SECRET/)"
    "RESEND_API_KEY"                      = "@Microsoft.KeyVault(SecretUri=${var.keyvault_uri}secrets/RESEND-API-KEY/)"
    "FIREBASE_PROJECT_ID"                 = "@Microsoft.KeyVault(SecretUri=${var.keyvault_uri}secrets/FIREBASE-PROJECT-ID/)"
    "FIREBASE_SERVICE_ACCOUNT"            = "@Microsoft.KeyVault(SecretUri=${var.keyvault_uri}secrets/FIREBASE-SERVICE-ACCOUNT/)"
    "FRONTEND_URL"                        = "https://app-b2cpoc-frontend-${var.environment}.azurewebsites.net"
    "NODE_ENV"                            = var.environment == "prod" ? "production" : "development"
    "APPINSIGHTS_INSTRUMENTATIONKEY"      = var.appinsights_instrumentation_key
    "APPLICATIONINSIGHTS_CONNECTION_STRING" = var.appinsights_connection_string
  }

  tags = var.tags
}
