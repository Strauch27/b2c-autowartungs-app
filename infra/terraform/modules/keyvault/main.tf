data "azurerm_client_config" "current" {}

# --------------------------------------------------------------------------
# Key Vault
# --------------------------------------------------------------------------

resource "azurerm_key_vault" "main" {
  name                = "kv-b2cpoc-${var.environment}-01"
  location            = var.location
  resource_group_name = var.resource_group_name
  tenant_id           = data.azurerm_client_config.current.tenant_id
  sku_name            = "standard"

  rbac_authorization_enabled = true
  soft_delete_retention_days = 7
  purge_protection_enabled   = false # PoC – set to true for production hardening

  tags = var.tags
}

# --------------------------------------------------------------------------
# RBAC – Key Vault Secrets User for App Service managed identities
# --------------------------------------------------------------------------

resource "azurerm_role_assignment" "frontend_secrets_user" {
  scope                = azurerm_key_vault.main.id
  role_definition_name = "Key Vault Secrets User"
  principal_id         = var.frontend_principal_id
}

resource "azurerm_role_assignment" "backend_secrets_user" {
  scope                = azurerm_key_vault.main.id
  role_definition_name = "Key Vault Secrets User"
  principal_id         = var.backend_principal_id
}

# Give the deploying principal admin access so Terraform can manage secrets
resource "azurerm_role_assignment" "deployer_secrets_officer" {
  scope                = azurerm_key_vault.main.id
  role_definition_name = "Key Vault Secrets Officer"
  principal_id         = data.azurerm_client_config.current.object_id
}

# --------------------------------------------------------------------------
# Placeholder secrets – values must be replaced after initial deployment
# --------------------------------------------------------------------------

resource "azurerm_key_vault_secret" "database_url" {
  name         = "DATABASE-URL"
  value        = var.database_url != "" ? var.database_url : "PLACEHOLDER-UPDATE-ME"
  key_vault_id = azurerm_key_vault.main.id

  depends_on = [azurerm_role_assignment.deployer_secrets_officer]
}

resource "azurerm_key_vault_secret" "jwt_secret" {
  name         = "JWT-SECRET"
  value        = "PLACEHOLDER-UPDATE-ME"
  key_vault_id = azurerm_key_vault.main.id

  depends_on = [azurerm_role_assignment.deployer_secrets_officer]

  lifecycle {
    ignore_changes = [value]
  }
}

resource "azurerm_key_vault_secret" "magic_link_secret" {
  name         = "MAGIC-LINK-SECRET"
  value        = "PLACEHOLDER-UPDATE-ME"
  key_vault_id = azurerm_key_vault.main.id

  depends_on = [azurerm_role_assignment.deployer_secrets_officer]

  lifecycle {
    ignore_changes = [value]
  }
}

resource "azurerm_key_vault_secret" "stripe_secret_key" {
  name         = "STRIPE-SECRET-KEY"
  value        = "PLACEHOLDER-UPDATE-ME"
  key_vault_id = azurerm_key_vault.main.id

  depends_on = [azurerm_role_assignment.deployer_secrets_officer]

  lifecycle {
    ignore_changes = [value]
  }
}

resource "azurerm_key_vault_secret" "stripe_publishable_key" {
  name         = "STRIPE-PUBLISHABLE-KEY"
  value        = "PLACEHOLDER-UPDATE-ME"
  key_vault_id = azurerm_key_vault.main.id

  depends_on = [azurerm_role_assignment.deployer_secrets_officer]

  lifecycle {
    ignore_changes = [value]
  }
}

resource "azurerm_key_vault_secret" "stripe_webhook_secret" {
  name         = "STRIPE-WEBHOOK-SECRET"
  value        = "PLACEHOLDER-UPDATE-ME"
  key_vault_id = azurerm_key_vault.main.id

  depends_on = [azurerm_role_assignment.deployer_secrets_officer]

  lifecycle {
    ignore_changes = [value]
  }
}

resource "azurerm_key_vault_secret" "resend_api_key" {
  name         = "RESEND-API-KEY"
  value        = "PLACEHOLDER-UPDATE-ME"
  key_vault_id = azurerm_key_vault.main.id

  depends_on = [azurerm_role_assignment.deployer_secrets_officer]

  lifecycle {
    ignore_changes = [value]
  }
}

resource "azurerm_key_vault_secret" "firebase_project_id" {
  name         = "FIREBASE-PROJECT-ID"
  value        = "PLACEHOLDER-UPDATE-ME"
  key_vault_id = azurerm_key_vault.main.id

  depends_on = [azurerm_role_assignment.deployer_secrets_officer]

  lifecycle {
    ignore_changes = [value]
  }
}

resource "azurerm_key_vault_secret" "firebase_service_account" {
  name         = "FIREBASE-SERVICE-ACCOUNT"
  value        = "PLACEHOLDER-UPDATE-ME"
  key_vault_id = azurerm_key_vault.main.id

  depends_on = [azurerm_role_assignment.deployer_secrets_officer]

  lifecycle {
    ignore_changes = [value]
  }
}
