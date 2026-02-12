output "frontend_url" {
  description = "Default hostname of the frontend web app"
  value       = "https://${azurerm_linux_web_app.frontend.default_hostname}"
}

output "backend_url" {
  description = "Default hostname of the backend web app"
  value       = "https://${azurerm_linux_web_app.backend.default_hostname}"
}

output "frontend_principal_id" {
  description = "Principal ID of the frontend managed identity"
  value       = azurerm_linux_web_app.frontend.identity[0].principal_id
}

output "backend_principal_id" {
  description = "Principal ID of the backend managed identity"
  value       = azurerm_linux_web_app.backend.identity[0].principal_id
}

output "service_plan_id" {
  description = "ID of the App Service Plan"
  value       = azurerm_service_plan.main.id
}
