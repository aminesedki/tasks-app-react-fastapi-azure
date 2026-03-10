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
