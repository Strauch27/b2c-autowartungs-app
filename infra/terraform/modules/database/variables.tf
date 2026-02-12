variable "server_name" {
  description = "Name of the PostgreSQL flexible server"
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

variable "sku_name" {
  description = "SKU name for the PostgreSQL server (e.g. B_Standard_B1ms)"
  type        = string
  default     = "B_Standard_B1ms"
}

variable "storage_mb" {
  description = "Storage capacity in MB"
  type        = number
  default     = 32768
}

variable "postgres_version" {
  description = "PostgreSQL major version"
  type        = string
  default     = "16"
}

variable "admin_username" {
  description = "Administrator login for the PostgreSQL server"
  type        = string
  sensitive   = true
}

variable "admin_password" {
  description = "Administrator password for the PostgreSQL server"
  type        = string
  sensitive   = true
}

variable "preprod_database_name" {
  description = "Name of the preprod logical database"
  type        = string
  default     = "b2cpoc_preprod"
}

variable "prod_database_name" {
  description = "Name of the prod logical database"
  type        = string
  default     = "b2cpoc_prod"
}

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default     = {}
}
