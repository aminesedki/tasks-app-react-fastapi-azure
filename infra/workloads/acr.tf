locals {
  acr_name = coalesce(
    var.acr_name,
    lower(replace("${var.application_name}${var.environment_name}acr", "-", ""))
  )
}

resource "azurerm_container_registry" "main" {
  name                = local.acr_name
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  sku                 = var.acr_sku
  admin_enabled       = true

  tags = {
    service = "acr"
  }
}
