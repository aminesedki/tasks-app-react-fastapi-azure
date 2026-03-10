terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~>4.57.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~>3.8.0"
    }
  }
}
provider "azurerm" {
  features {}
}
