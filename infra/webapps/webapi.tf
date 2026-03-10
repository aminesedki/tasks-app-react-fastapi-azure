data "azurerm_container_registry" "acr" {
  name                = "workloadsdevacr"
  resource_group_name = "rg-workloads-dev"
}
data "azurerm_postgresql_flexible_server" "db" {
  name                = "workloads-dev-psql"
  resource_group_name = "rg-workloads-dev"
}

data "azurerm_container_app_environment" "env" {
  name                = "workloads-dev-cae"
  resource_group_name = "rg-workloads-dev"
}

resource "azurerm_container_app" "api" {
  name                         = var.api_container_app_name
  container_app_environment_id = data.azurerm_container_app_environment.env.id
  resource_group_name          = azurerm_resource_group.main.name
  revision_mode                = "Single"

  registry {
    server               = data.azurerm_container_registry.acr.login_server
    username             = data.azurerm_container_registry.acr.admin_username
    password_secret_name = "acr-password"
  }

  secret {
    name  = "acr-password"
    value = data.azurerm_container_registry.acr.admin_password
  }

  secret {
    name  = "db-password"
    value = var.postgres_admin_password
  }

  template {
    min_replicas = var.api_min_replicas
    max_replicas = var.api_max_replicas

    container {
      name   = "fastapi"
      image  = "${data.azurerm_container_registry.acr.login_server}/${var.api_image_repository}:${var.api_image_tag}"
      cpu    = var.api_cpu
      memory = var.api_memory

      env {
        name  = "DB_HOST"
        value = data.azurerm_postgresql_flexible_server.db.fqdn
      }

      env {
        name  = "DB_PORT"
        value = "5432"
      }

      env {
        name  = "DB_NAME"
        value = var.postgres_database_name
      }

      env {
        name  = "DB_USER"
        value = var.postgres_admin_username
      }

      env {
        name        = "DB_PASSWORD"
        secret_name = "db-password"
      }
    }
  }

  ingress {
    external_enabled = true
    target_port      = var.api_target_port
    transport        = "auto"

    traffic_weight {
      percentage      = 100
      latest_revision = true
    }
  }

  tags = {
    service = "fastapi-api"
  }
}
