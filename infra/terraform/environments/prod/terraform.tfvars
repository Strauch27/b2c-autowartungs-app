environment          = "prod"
location             = "westeurope"
vnet_address_space   = "10.2.0.0/16"
app_service_sku      = "B1"
storage_account_name = "stb2cpocprod"
storage_replication_type = "LRS"

# Container image overrides (update after CI pushes images)
# frontend_image_tag = "v1.0.0"
# backend_image_tag  = "v1.0.0"
