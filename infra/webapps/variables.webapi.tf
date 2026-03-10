variable "container_app_environment_name" {
  type    = string
  default = null
}

variable "api_container_app_name" {
  type    = string
  default = null
}
variable "api_container_image" {
  type = string
}
variable "api_min_replicas" {
  type    = number
  default = 0
}

variable "api_max_replicas" {
  type    = number
  default = 1
}
variable "api_target_port" {
  type    = number
  default = 8080
}

variable "api_cpu" {
  type    = number
  default = 0.25
}

variable "api_memory" {
  type    = string
  default = "0.5Gi"
}

variable "api_image_repository" {
  type    = string
  default = "fastapi-api"
}

variable "api_image_tag" {
  type    = string
  default = "latest"
}

variable "postgres_database_name" {
  type    = string
  default = "appdb"
}

variable "postgres_server_name" {
  type    = string
  default = null
}

variable "postgres_admin_username" {
  type = string
}

variable "postgres_admin_password" {
  type      = string
  sensitive = true
}

variable "postgres_version" {
  type    = string
  default = "16"
}

variable "allowed_postgres_ip" {
  type = string
}

variable "allowed_cidr_for_postgres" {
  type        = string
  description = "Your public IP CIDR for PostgreSQL access, for example 1.2.3.4/32"
}

variable "postgres_storage_mb" {
  type    = number
  default = 32768
}


variable "postgres_sku_name" {
  type    = string
  default = "B_Standard_B1ms"
}
