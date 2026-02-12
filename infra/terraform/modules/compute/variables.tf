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

variable "sku_name" {
  description = "SKU name for the App Service Plan (e.g. B1, P1v3)"
  type        = string
}

variable "appservice_subnet_id" {
  description = "Subnet ID for VNet integration"
  type        = string
}

variable "acr_login_server" {
  description = "Login server URL for Azure Container Registry"
  type        = string
}

variable "frontend_image_name" {
  description = "Container image name for the frontend app"
  type        = string
  default     = "b2cpoc/frontend"
}

variable "frontend_image_tag" {
  description = "Container image tag for the frontend app"
  type        = string
  default     = "latest"
}

variable "backend_image_name" {
  description = "Container image name for the backend app"
  type        = string
  default     = "b2cpoc/backend"
}

variable "backend_image_tag" {
  description = "Container image tag for the backend app"
  type        = string
  default     = "latest"
}

variable "keyvault_uri" {
  description = "URI of the Key Vault (with trailing slash)"
  type        = string
}

variable "appinsights_instrumentation_key" {
  description = "Application Insights instrumentation key"
  type        = string
  default     = ""
}

variable "appinsights_connection_string" {
  description = "Application Insights connection string"
  type        = string
  default     = ""
}

variable "basic_auth_enabled" {
  description = "Enable basic auth protection on the frontend"
  type        = bool
  default     = true
}

variable "basic_auth_user" {
  description = "Basic auth username for frontend protection"
  type        = string
  default     = "admin"
}

variable "basic_auth_pass" {
  description = "Basic auth password for frontend protection"
  type        = string
  default     = "b2cpoc2026"
  sensitive   = true
}

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default     = {}
}
