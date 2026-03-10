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

  backend "azurerm" {
    resource_group_name  = "rg-terraform-state-dev"
    storage_account_name = "st1sxre3lm6k"
    container_name       = "tfstate"
    key                  = "devops-dev"


  }
}

provider "azurerm" {
  features {}
}
