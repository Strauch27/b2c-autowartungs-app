variable "environment" {
  description = "Environment name (preprod, prod)"
  type        = string
}

variable "location" {
  description = "Azure region for resources"
  type        = string
}

variable "resource_group_name" {
  description = "Name of the resource group"
  type        = string
}

variable "frontend_principal_id" {
  description = "Principal ID of the frontend App Service managed identity"
  type        = string
}

variable "backend_principal_id" {
  description = "Principal ID of the backend App Service managed identity"
  type        = string
}

variable "database_url" {
  description = "Database connection string to store in Key Vault"
  type        = string
  default     = ""
  sensitive   = true
}

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default     = {}
}
