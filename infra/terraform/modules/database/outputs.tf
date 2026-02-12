output "server_id" {
  description = "ID of the PostgreSQL flexible server"
  value       = azurerm_postgresql_flexible_server.main.id
}

output "server_fqdn" {
  description = "FQDN of the PostgreSQL flexible server"
  value       = azurerm_postgresql_flexible_server.main.fqdn
}

output "preprod_database_name" {
  description = "Name of the preprod database"
  value       = azurerm_postgresql_flexible_server_database.preprod.name
}

output "prod_database_name" {
  description = "Name of the prod database"
  value       = azurerm_postgresql_flexible_server_database.prod.name
}

output "preprod_connection_string" {
  description = "Connection string for the preprod database"
  value       = "postgresql://${var.admin_username}:${var.admin_password}@${azurerm_postgresql_flexible_server.main.fqdn}:5432/${azurerm_postgresql_flexible_server_database.preprod.name}?sslmode=require"
  sensitive   = true
}

output "prod_connection_string" {
  description = "Connection string for the prod database"
  value       = "postgresql://${var.admin_username}:${var.admin_password}@${azurerm_postgresql_flexible_server.main.fqdn}:5432/${azurerm_postgresql_flexible_server_database.prod.name}?sslmode=require"
  sensitive   = true
}
