environment_name = "prod"
application_name = "webapps"
primary_location = "westus2"

static_web_app_location = "westus2"

container_app_environment_name = "workloads-prod-cae"

api_container_app_name = "workloads-prod-api"
api_container_image    = "docker.io/yourdockerhubuser/workloads-fastapi:latest"
api_min_replicas       = 0
api_max_replicas       = 1

postgres_server_name      = "workloads-prod-psql"
postgres_database_name    = "worklogdb"
postgres_admin_username   = "pgadminuser"
postgres_admin_password   = "ChangeMe123456!"
postgres_storage_mb       = 32768
postgres_version          = "16"
allowed_postgres_ip       = "1.2.3.4"
allowed_cidr_for_postgres = "1.2.3.4/32"
