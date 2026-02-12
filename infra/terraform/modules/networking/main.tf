resource "azurerm_virtual_network" "main" {
  name                = "vnet-b2cpoc-${var.environment}"
  location            = var.location
  resource_group_name = var.resource_group_name
  address_space       = [var.address_space]

  tags = var.tags
}

# --------------------------------------------------------------------------
# Subnets
# --------------------------------------------------------------------------

resource "azurerm_subnet" "appservice" {
  name                 = "snet-b2cpoc-appservice-${var.environment}"
  resource_group_name  = var.resource_group_name
  virtual_network_name = azurerm_virtual_network.main.name
  address_prefixes     = [cidrsubnet(var.address_space, 8, 1)] # /24

  delegation {
    name = "appservice-delegation"

    service_delegation {
      name = "Microsoft.Web/serverFarms"
      actions = [
        "Microsoft.Network/virtualNetworks/subnets/action",
      ]
    }
  }
}

resource "azurerm_subnet" "postgres" {
  name                 = "snet-b2cpoc-postgres-${var.environment}"
  resource_group_name  = var.resource_group_name
  virtual_network_name = azurerm_virtual_network.main.name
  address_prefixes     = [cidrsubnet(var.address_space, 8, 2)] # /24

  service_endpoints = ["Microsoft.Storage"]
}

resource "azurerm_subnet" "storage" {
  name                 = "snet-b2cpoc-storage-${var.environment}"
  resource_group_name  = var.resource_group_name
  virtual_network_name = azurerm_virtual_network.main.name
  address_prefixes     = [cidrsubnet(var.address_space, 8, 3)] # /24

  service_endpoints = ["Microsoft.Storage"]
}

# --------------------------------------------------------------------------
# Network Security Group – App Service subnet
# --------------------------------------------------------------------------

resource "azurerm_network_security_group" "appservice" {
  name                = "nsg-b2cpoc-appservice-${var.environment}"
  location            = var.location
  resource_group_name = var.resource_group_name

  security_rule {
    name                       = "AllowHTTPS"
    priority                   = 100
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "443"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }

  security_rule {
    name                       = "AllowHTTP"
    priority                   = 110
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "80"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }

  tags = var.tags
}

resource "azurerm_subnet_network_security_group_association" "appservice" {
  subnet_id                 = azurerm_subnet.appservice.id
  network_security_group_id = azurerm_network_security_group.appservice.id
}
