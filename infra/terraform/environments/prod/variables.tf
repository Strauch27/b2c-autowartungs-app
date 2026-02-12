variable "environment" {
  description = "Environment name"
  type        = string
  default     = "prod"
}

variable "location" {
  description = "Azure region for resources"
  type        = string
  default     = "westeurope"
}

variable "vnet_address_space" {
  description = "Address space for the VNet"
  type        = string
}

variable "app_service_sku" {
  description = "SKU for the App Service Plan"
  type        = string
}

variable "storage_account_name" {
  description = "Globally unique name for the storage account"
  type        = string
}

variable "storage_replication_type" {
  description = "Replication type for the storage account"
  type        = string
  default     = "LRS"
}

variable "frontend_image_name" {
  description = "Container image name for the frontend"
  type        = string
  default     = "b2cpoc-frontend"
}

variable "frontend_image_tag" {
  description = "Container image tag for the frontend"
  type        = string
  default     = "latest"
}

variable "backend_image_name" {
  description = "Container image name for the backend"
  type        = string
  default     = "b2cpoc-backend"
}

variable "backend_image_tag" {
  description = "Container image tag for the backend"
  type        = string
  default     = "latest"
}

variable "database_url" {
  description = "Database connection string (from shared database deployment)"
  type        = string
  default     = ""
  sensitive   = true
}
