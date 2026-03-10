locals {
  static_web_app_sku_tier = "Free"
  static_web_app_sku_size = "Free"
}

resource "azurerm_static_web_app" "frontend" {
  name                = "${var.application_name}-${var.environment_name}-swa"
  resource_group_name = azurerm_resource_group.main.name
  location            = var.static_web_app_location

  sku_tier = local.static_web_app_sku_tier
  sku_size = local.static_web_app_sku_size

  tags = {
    application = var.application_name
    environment = var.environment_name
    managed_by  = "terraform"
    service     = "frontend"
  }
}
