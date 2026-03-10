output "frontend_name" {
  value = azurerm_static_web_app.frontend.name
}

output "frontend_url" {
  value = "https://${azurerm_static_web_app.frontend.default_host_name}"
}

output "api_url" {
  value = "https://${azurerm_container_app.api.latest_revision_fqdn}"
}
