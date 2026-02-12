terraform {
  backend "azurerm" {
    resource_group_name  = "rg-b2cpoc-shared"
    storage_account_name = "stb2cpoctfstate"
    container_name       = "tfstate"
    key                  = "database.tfstate"
    subscription_id      = "f98839a2-d7a3-428d-b83b-1e0891f043bc"
    use_oidc             = false
  }
}
