location            = "westeurope"
server_name         = "psql-b2cpoc-shared"
sku_name            = "B_Standard_B1ms"
storage_mb          = 32768
postgres_version    = "16"
preprod_database_name = "b2cpoc_preprod"
prod_database_name    = "b2cpoc_prod"

# IMPORTANT: admin_username and admin_password must be provided via
# environment variables or a .tfvars file that is NOT committed to git:
#   export TF_VAR_admin_username="b2cpoc_admin"
#   export TF_VAR_admin_password="<secure-password>"
