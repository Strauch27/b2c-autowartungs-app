output "server_fqdn" {
  description = "FQDN of the PostgreSQL flexible server"
  value       = module.database.server_fqdn
}

output "server_id" {
  description = "Resource ID of the PostgreSQL flexible server"
  value       = module.database.server_id
}

output "preprod_database_name" {
  description = "Name of the preprod database"
  value       = module.database.preprod_database_name
}

output "prod_database_name" {
  description = "Name of the prod database"
  value       = module.database.prod_database_name
}

output "preprod_connection_string" {
  description = "Connection string for the preprod database"
  value       = module.database.preprod_connection_string
  sensitive   = true
}

output "prod_connection_string" {
  description = "Connection string for the prod database"
  value       = module.database.prod_connection_string
  sensitive   = true
}
