output "resource_group_name" {
  description = "Name of the environment resource group"
  value       = azurerm_resource_group.main.name
}

output "frontend_url" {
  description = "URL of the frontend web app"
  value       = module.compute.frontend_url
}

output "backend_url" {
  description = "URL of the backend web app"
  value       = module.compute.backend_url
}

output "keyvault_uri" {
  description = "URI of the Key Vault"
  value       = module.keyvault.vault_uri
}

output "keyvault_name" {
  description = "Name of the Key Vault"
  value       = module.keyvault.vault_name
}

output "storage_account_name" {
  description = "Name of the storage account"
  value       = module.storage.storage_account_name
}

output "vnet_id" {
  description = "ID of the VNet"
  value       = module.networking.vnet_id
}

output "appinsights_instrumentation_key" {
  description = "Application Insights instrumentation key"
  value       = module.monitoring.instrumentation_key
  sensitive   = true
}

output "frontend_principal_id" {
  description = "Principal ID of the frontend managed identity"
  value       = module.compute.frontend_principal_id
}

output "backend_principal_id" {
  description = "Principal ID of the backend managed identity"
  value       = module.compute.backend_principal_id
}
