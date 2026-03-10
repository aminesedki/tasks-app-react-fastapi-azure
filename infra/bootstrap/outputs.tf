output "storage_account_name" {
  description = "Storage account name used for Terraform state"
  value       = azurerm_storage_account.main.name
}
