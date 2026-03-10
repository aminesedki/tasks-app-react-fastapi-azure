terraform {
  required_version = ">= 1.11.0"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.57"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.8"
    }
  }
  backend "azurerm" {

  }
}

provider "azurerm" {
  features {}
}
