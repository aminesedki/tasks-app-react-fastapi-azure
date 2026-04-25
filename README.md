# Projects-tasks Fullstack — Local Deployment Guide with Terraform, Azure CLI, Container Apps, PostgreSQL, and Static Web Apps

This guide explains how to deploy the **WorkLog Fullstack** project step by step from a local machine using:

- **Terraform** for infrastructure provisioning
- **Azure CLI** for authentication and checks
- **Azure Container Apps** for the FastAPI backend
- **Azure Database for PostgreSQL** for the relational database
- **Azure Static Web Apps** for the frontend
- **SWA CLI** for manual frontend deployment from local

The deployment flow is split into **three Terraform layers**:

1. **bootstrap** → creates the Azure Storage Account used for the Terraform remote state
2. **workloads** → creates shared runtime infrastructure such as PostgreSQL, Container Apps environment, backend image registry access
3. **webapps** → creates frontend Static Web App and backend application resources

The guide also includes usage of the `debug-dev.sh` script pattern for each step.

---

## 1. Architecture overview

Deployment order:

```text
1) bootstrap
   -> Resource Group for Terraform state
   -> Storage Account
   -> Blob Container for tfstate

2) workloads
   -> Resource Group for application resources
   -> PostgreSQL
   -> Container Apps Environment
  

3) webapps
   -> Resource Group for webapps resources
   -> Static Web App
   -> Frontend deployment target
   -> Backend Container App

4) local deployment steps
   -> Build and push backend image with az cli
   -> Build frontend with VITE_API_BASE_URL
   -> Deploy frontend with SWA CLI
```

Suggested repository structure:

```text
worklog-fullstack/
├── backend/
│   ├── app/
│   ├── Dockerfile
│   ├── pyproject.toml
│   └── ...
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── staticwebapp.config.json
│   ├── package.json
│   ├── vite.config.ts
│   ├── .debug-deploy-dev.sh
│   └── ...
│
├── infra/
│   ├── bootstrap/
│   │   ├── env/
│   │   │   └── dev.tfvars
│   │   │   └── prod.tfvars
│   │   ├── debug-dev.sh
│   │   ├── main.tf
│   │   ├── outputs.tf
│   │   ├── terraform.tfvars
│   │   └── variables.tf
│   │
│   ├── workloads/
│   │   ├── env/
│   │   │   └── dev.tfvars
│   │   │   └── prod.tfvars
│   │   ├── postgresdb.tf
│   │   ├── debug-dev.sh
│   │   ├── main.tf
│   │   ├── outputs.tf
│   │   ├── acr.tf
│   │   ├── postgresdb.tf
│   │   ├── terraform.tfvars
│   │   ├── variables.acr.tf
│   │   ├── variables.postgresdb.tf
│   │   └── variables.shared.tf
│   │
│   └── webapps/
│       ├── env/
│       │   └── dev.tfvars
│       │   └── prod.tfvars
│       ├── backend.tf
│       ├── debug-dev.sh
│       ├── outputs.tf
│       ├── webapi.tf
│       ├── webapp.tf
│       ├── terraform.tfvars
│       ├── variables.webapi.tf
│       ├── variables.webapp.tf
│       └── variables.shared.tf
│
├── LICENSE
└── README.md
```

---

## 2. Prerequisites

Install the following tools locally.

### Azure CLI

```bash
az version
```

### Terraform

```bash
terraform version
```

### Docker

```bash
docker version
```

### Node.js and npm

```bash
node -v
npm -v
```

### SWA CLI

Recommended as a frontend project dependency:

```bash
cd frontend
npm install --save-dev @azure/static-web-apps-cli
```

Or global installation:

```bash
npm install -g @azure/static-web-apps-cli
```

Check installation:

```bash
swa --version
```

### Optional helpers



---

## 3. Azure login and subscription selection

Login:

```bash
az login
```

List subscriptions:

```bash
az account list --output table
```

Set the target subscription:

```bash
az account set --subscription "<your-subscription-id>"
```

Verify:

```bash
az account show --output table
```

---

## 4. Step 1 — Bootstrap layer

The bootstrap layer exists only to create the **remote backend storage** for Terraform state.

### 4.1 Why bootstrap is required

Terraform remote state must already exist before another Terraform configuration can use it as its backend.

That means:

- you **cannot** create the backend storage account and use it as the backend in the same configuration during the same `terraform init`
- you create it first in a small bootstrap project
- then you reuse its outputs in the other layers

### 4.2 Example bootstrap resources

Typical resources:

- Resource Group
- Storage Account
- Blob Container named `tfstate`

Example bootstrap resources:

```hcl
resource "azurerm_resource_group" "main" {
  name     = "rg-${var.application_name}-${var.environment_name}-tfstate"
  location = var.primary_location
}

resource "random_string" "suffix" {
  length  = 10
  upper   = false
  special = false
}

resource "azurerm_storage_account" "main" {
  name                     = "st${random_string.suffix.result}"
  resource_group_name      = azurerm_resource_group.main.name
  location                 = azurerm_resource_group.main.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
}

resource "azurerm_storage_container" "tfstate" {
  name                  = "tfstate"
  storage_account_id    = azurerm_storage_account.main.id
  container_access_type = "private"
}
```

### 4.3 Example bootstrap outputs

```hcl
output "resource_group_name" {
  value = azurerm_resource_group.main.name
}

output "storage_account_name" {
  value = azurerm_storage_account.main.name
}

output "storage_container_name" {
  value = azurerm_storage_container.tfstate.name
}
```

### 4.4 Example `infra/bootstrap/debug-dev.sh`

```bash
#!/usr/bin/env bash
set -Eeuo pipefail

export ARM_SUBSCRIPTION_ID="<your-subscription-id>"
export TF_VAR_application_name="terraform-state"
export TF_VAR_environment_name="dev"

terraform init
terraform "$@" -var-file="./env/${TF_VAR_environment_name}.tfvars"
```

Make it executable:

```bash
chmod +x infra/bootstrap/debug-dev.sh
```

### 4.5 Run bootstrap

```bash
cd infra/bootstrap
./debug-dev.sh plan
./debug-dev.sh apply
```

### 4.6 Read bootstrap outputs

```bash
terraform output
```

Expected important values:

- `resource_group_name`
- `storage_account_name`
- `storage_container_name`

You will reuse them in the next Terraform layers.

---

## 5. Step 2 — Configure remote state for workloads and webapps

After bootstrap finishes, configure both `workloads` and `webapps` to use the Azure Storage backend.

### 5.1 Example backend block

In `infra/workloads/backend.tf` and `infra/webapps/backend.tf`:

```hcl
terraform {
  backend "azurerm" {}
}
```

Keep it empty and inject real values from the script.

### 5.2 Example `infra/workloads/debug-dev.sh`

```bash
#!/usr/bin/env bash
set -Eeuo pipefail

export ARM_SUBSCRIPTION_ID="<your-subscription-id>"
export TF_VAR_application_name="workloads"
export TF_VAR_environment_name="dev"

export BACKEND_RESOURCE_GROUP="<bootstrap-resource-group>"
export BACKEND_STORAGE_ACCOUNT="<bootstrap-storage-account>"
export BACKEND_STORAGE_CONTAINER="tfstate"
export BACKEND_KEY="${TF_VAR_application_name}-${TF_VAR_environment_name}.tfstate"

terraform init \
  -backend-config="resource_group_name=${BACKEND_RESOURCE_GROUP}" \
  -backend-config="storage_account_name=${BACKEND_STORAGE_ACCOUNT}" \
  -backend-config="container_name=${BACKEND_STORAGE_CONTAINER}" \
  -backend-config="key=${BACKEND_KEY}"

terraform "$@" -var-file="./env/${TF_VAR_environment_name}.tfvars"
```

### 5.3 Example `infra/webapps/debug-dev.sh`

```bash
#!/usr/bin/env bash
set -Eeuo pipefail

export ARM_SUBSCRIPTION_ID="<your-subscription-id>"
export TF_VAR_application_name="webapps"
export TF_VAR_environment_name="dev"

export BACKEND_RESOURCE_GROUP="<bootstrap-resource-group>"
export BACKEND_STORAGE_ACCOUNT="<bootstrap-storage-account>"
export BACKEND_STORAGE_CONTAINER="tfstate"
export BACKEND_KEY="${TF_VAR_application_name}-${TF_VAR_environment_name}.tfstate"

terraform init \
  -backend-config="resource_group_name=${BACKEND_RESOURCE_GROUP}" \
  -backend-config="storage_account_name=${BACKEND_STORAGE_ACCOUNT}" \
  -backend-config="container_name=${BACKEND_STORAGE_CONTAINER}" \
  -backend-config="key=${BACKEND_KEY}"

terraform "$@" -var-file="./env/${TF_VAR_environment_name}.tfvars"
```

---

## 6. Step 3 — Workloads layer

This layer creates the main backend infrastructure.

Typical resources:

- Resource Group for app resources
- Azure Database for PostgreSQL
- Azure Container Registry if needed
- Azure Container Apps Environment
- Azure Container App for the FastAPI backend
- Log Analytics Workspace if used by Container Apps
- Networking and secrets if included in your design

### 6.1 Typical workload responsibilities

The `workloads` layer should provision the resources that the backend needs to run:

- compute runtime
- database
- environment variables
- secrets references
- service connectivity

### 6.2 Typical runtime variables

Examples often needed in `dev.tfvars` or variables:

```hcl
application_name      = "workloads"
environment_name      = "dev"
primary_location      = "West Europe"
postgres_admin_login  = "pgadminuser"
postgres_db_name      = "worklogdb"
```

Sensitive values such as passwords should not be committed in plaintext.
Use one of these approaches:

- `TF_VAR_postgres_admin_password` exported locally
- `.auto.tfvars` excluded from Git
- Azure Key Vault if your design includes it

### 6.3 Deploy workloads

```bash
cd infra/workloads
./debug-dev.sh plan
./debug-dev.sh apply
```

### 6.4 Read outputs

```bash
terraform output
```

Expected useful outputs might include:

- PostgreSQL server hostname
- database name
- ACR login server
- container apps environment name

Example output blocks:

```hcl
output "api_url" {
  value = azurerm_container_app.api.latest_revision_fqdn
}

output "postgres_fqdn" {
  value = azurerm_postgresql_flexible_server.main.fqdn
}

output "postgres_db_name" {
  value = azurerm_postgresql_flexible_server_database.main.name
}
```

If the Container App FQDN output does not include the protocol, use:

```text
https://<container-app-fqdn>
```

---

## 7. Step 4 — Build and deploy the backend API

There are two common cases.

### Case A — Terraform already deploys the backend container image

If your Terraform configuration already references a valid image hosted in ACR or another registry, then applying `workloads` may already publish the backend service.

You then verify with:

```bash
az containerapp show \
  --name "<container-app-name>" \
  --resource-group "<resource-group-name>" \
  --query properties.configuration.ingress.fqdn \
  -o tsv
```

### Case B — You build and update the container manually from local

Build the backend image:

```bash
cd backend
docker build -t worklog-api:dev .
```

If using Azure Container Registry:

```bash
az acr login --name <acr-name>
```

Tag the image:

```bash
docker tag worklog-api:dev <acr-login-server>/worklog-api:dev
```

Push the image:

```bash
docker push <acr-login-server>/worklog-api:dev
```

Update the Container App image:

```bash
az containerapp update \
  --name <container-app-name> \
  --resource-group <resource-group-name> \
  --image <acr-login-server>/worklog-api:dev
```

### 7.1 Verify backend health

Test the root endpoint or health endpoint:

```bash
curl https://<your-api-url>/docs
```

### 7.2 Important PostgreSQL notes for FastAPI

For Azure Database for PostgreSQL, be careful with:

- SSL requirement
- firewall rules
- correct hostname
- SQLAlchemy connection string
- async driver if using `asyncpg`

Typical env values:

```text
DB_HOST=<postgres-hostname>
DB_PORT=5432
DB_NAME=worklogdb
DB_USER=pgadminuser
DB_PASSWORD=<password>
```

Typical SQLAlchemy async URL shape:

```text
postgresql+asyncpg://USER:PASSWORD@HOST:5432/DBNAME?ssl=require
```

---

## 8. Step 5 — Webapps layer

This layer provisions Azure resources for the frontend deployment target.

Typical resources:

- Resource Group for web apps
- Static Web App
- backend container app name


### 8.1 Deploy webapps layer

```bash
cd infra/webapps
./debug-dev.sh plan
./debug-dev.sh apply
```

Useful outputs might include:

- Static Web App name
- backend and frontend URL
- deployment token retrieval target names

Example output blocks:

```hcl
output "static_web_app_name" {
  value = azurerm_static_web_app.main.name
}

output "static_web_app_default_host_name" {
  value = azurerm_static_web_app.main.default_host_name
}
```

---

## 9. Step 6 — Frontend configuration

Place the frontend deployment script and Static Web Apps config in the `frontend/` folder.

Recommended structure:

```text
frontend/
├── src/
├── public/
├── dist/
├── staticwebapp.config.json
├── deploy.sh
├── package.json
└── vite.config.ts
```

### 9.1 Why `staticwebapp.config.json` belongs in `frontend/`

`dist/` is generated at build time and should not contain manually managed source files.

The correct approach is:

- keep `staticwebapp.config.json` in `frontend/`
- copy it to `dist/` before deployment

### 9.2 Example `frontend/staticwebapp.config.json`

For a SPA frontend such as React or Vue:

```json
{
  "navigationFallback": {
    "rewrite": "/index.html",
    "exclude": ["/assets/*", "/images/*", "/favicon.ico"]
  },
  "responseOverrides": {
    "404": {
      "rewrite": "/index.html"
    }
  }
}
```

This avoids 404 errors when refreshing a client-side route.

---

## 10. Step 7 — Frontend deploy script using Azure CLI and SWA CLI

Example `frontend/deploy.sh`:

```bash
#!/usr/bin/env bash
set -Eeuo pipefail

FRONTEND_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DIST_DIR="$FRONTEND_DIR/dist"
CONFIG_FILE="$FRONTEND_DIR/staticwebapp.config.json"

export VITE_API_BASE_URL="https://<your-api-url>"
SWA_NAME="<your-static-web-app-name>"

command -v npm >/dev/null 2>&1 || { echo "npm is required"; exit 1; }
command -v az >/dev/null 2>&1 || { echo "Azure CLI is required"; exit 1; }

if command -v swa >/dev/null 2>&1; then
  SWA_CMD="swa"
else
  SWA_CMD="npx swa"
fi

echo "Checking Azure login..."
az account show >/dev/null 2>&1 || { echo "You are not logged into Azure CLI"; exit 1; }

echo "Building frontend..."
pushd "$FRONTEND_DIR" >/dev/null
npm ci
npm run build
popd >/dev/null

[[ -d "$DIST_DIR" ]] || { echo "Build output folder not found: $DIST_DIR"; exit 1; }

if [[ -f "$CONFIG_FILE" ]]; then
  cp "$CONFIG_FILE" "$DIST_DIR/staticwebapp.config.json"
  echo "Copied staticwebapp.config.json"
fi

echo "Fetching deployment token..."
DEPLOY_TOKEN="$((az staticwebapp secrets list \
  --name "$SWA_NAME" \
  --query "properties.apiKey" \
  -o tsv))"

[[ -n "$DEPLOY_TOKEN" ]] || { echo "Could not retrieve deployment token"; exit 1; }

echo "Deploying $DIST_DIR to $SWA_NAME..."
# shellcheck disable=SC2086
$SWA_CMD deploy "$DIST_DIR" --deployment-token "$DEPLOY_TOKEN"

echo "Deployment completed."
```

> Note: if your shell complains about the `DEPLOY_TOKEN` command substitution formatting, use the simpler multi-line version below instead:

```bash
DEPLOY_TOKEN="$({
  az staticwebapp secrets list \
    --name "$SWA_NAME" \
    --query "properties.apiKey" \
    -o tsv
})"
```

Or the plain version:

```bash
DEPLOY_TOKEN="$(az staticwebapp secrets list --name "$SWA_NAME" --query "properties.apiKey" -o tsv)"
```

Make the script executable:

```bash
chmod +x frontend/deploy.sh
```

---

## 11. Step 8 — Deploy the frontend locally

From the project root:

```bash
cd frontend
./deploy.sh
```

The script performs these actions:

1. checks required tools
2. checks Azure login
3. builds the frontend with Vite
4. copies `staticwebapp.config.json` into `dist/`
5. retrieves the Static Web App deployment token
6. deploys the built app with SWA CLI

### 11.1 Verify frontend

Open the frontend URL desplayed after deploy finished or from Azure Portal.

If your SPA uses client-side routing, test:

- `/`
- `/login`
- `/projects`
- `/tasks`

and refresh the page to confirm routing works.

---

## 12. Full end-to-end deployment sequence

Use this exact order on a fresh setup.

### 12.1 Bootstrap

```bash
cd infra/bootstrap
./debug-dev.sh apply
terraform output
```

Save these values:

- bootstrap resource group name
- bootstrap storage account name
- bootstrap container name

### 12.2 Workloads

Update `infra/workloads/debug-dev.sh` with backend values from bootstrap, then run:

```bash
cd ../workloads
./debug-dev.sh apply
terraform output
```

Save these values:

- PostgreSQL hostname
- ACR login server if used
- container app name
- application resource group

### 12.3 Webapps

Update `infra/webapps/debug-dev.sh` with backend values from bootstrap, then run:

```bash
cd ../webapps
./debug-dev.sh apply
terraform output
```

Save these values:
- backend API URL
- Static Web App name
- frontend hostname

### 12.4 Frontend deployment

Update `frontend/deploy.sh` with:

- `VITE_API_BASE_URL`
- `SWA_NAME`

Then deploy:

```bash
cd ../../frontend
./deploy.sh
```

---

## 13. Example placeholder values safe for GitHub

Do not commit real identifiers or secrets.

Use placeholders like these:

```bash
export ARM_SUBSCRIPTION_ID="<your-subscription-id>"
export VITE_API_BASE_URL="https://<your-api-url>"
SWA_NAME="<your-static-web-app-name>"
```

For UUID-style placeholders:

```text
xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

Never commit:

- real subscription IDs if you do not want them public
- database passwords
- deployment tokens
- `.env` files with secrets
- Terraform state files

---

## 14. Suggested `.gitignore`

```gitignore
# Terraform
.terraform/
*.tfstate
*.tfstate.*
.terraform.lock.hcl
crash.log

# Env files
.env
.env.*

# Frontend
frontend/dist/
frontend/node_modules/

# Python
__pycache__/
.venv/
venv/

# OS / editor
.DS_Store
.vscode/
.idea/
```

If you want to keep `.terraform.lock.hcl`, remove it from `.gitignore`.
It is often committed intentionally in Terraform projects.

---

## 15. Troubleshooting

### Terraform backend init fails

Check:

- bootstrap was applied successfully
- resource group name is correct
- storage account name is correct
- container `tfstate` exists
- subscription is the expected one

Useful commands:

```bash
az account show --output table
az storage account list --output table
```

### Azure PostgreSQL connection timeout

Check:

- firewall rules
- SSL requirement
- hostname correctness
- database user format if Azure requires it
- app environment variables

### FastAPI returns 500 on startup

Check:

- DB connection string
- migrations or table creation logic
- missing secrets
- wrong database host or password

### Static Web App shows 404 on refresh

Check `frontend/staticwebapp.config.json` and ensure SPA fallback is configured.

### `swa` command not found

Use one of:

```bash
npm install -g @azure/static-web-apps-cli
```

or inside frontend:

```bash
npm install --save-dev @azure/static-web-apps-cli
npx swa --version
```

### `az staticwebapp secrets list` fails

Check:

- Static Web App exists
- your Azure account has access
- the `SWA_NAME` is correct
- the active subscription is correct

---

## 16. Recommended next improvements

Once local deployment works, the next natural improvements are:

- add Alembic migrations for PostgreSQL schema management
- move secrets to Azure Key Vault
- automate Docker build and push through CI/CD
- automate frontend deployment with GitHub Actions
- add custom domain and certificates if needed
- split Terraform into reusable modules

---

## 17. Quick command recap

### Bootstrap

```bash
cd infra/bootstrap
./debug-dev.sh init
./debug-dev.sh plan
./debug-dev.sh apply
terraform output
```

### Workloads

```bash
cd infra/workloads
./debug-dev.sh init
./debug-dev.sh plan
./debug-dev.sh apply
terraform output
```

### Webapps

```bash
cd infra/webapps
./debug-dev.sh init
./debug-dev.sh plan
./debug-dev.sh apply
terraform output
```

### Frontend

```bash
cd frontend
./deploy.sh
```

---

## 18. Conclusion

This deployment approach gives a clean separation of concerns:

- **bootstrap** handles Terraform state storage
- **workloads** handles backend runtime and data layer
- **webapps** handles frontend hosting resources
- **frontend deploy script** handles the actual static asset deployment from local

This structure is practical for local development, clear for maintenance, and strong for a portfolio project because it demonstrates:

- Terraform remote state bootstrapping
- Azure infrastructure provisioning
- PostgreSQL cloud integration
- Azure Container Apps deployment
- Azure Static Web Apps deployment
- end-to-end fullstack delivery

If you use this README in your repo, replace placeholders with your actual resource names only where appropriate, and keep all sensitive values out of Git.

## 📷 Screenshots

Click any image to open the full-size screenshot.

### Authentification pages

[![Register Page](screenshots/register-page.png)](screenshots/register-page.png)

[![Login Page](screenshots/login-page.png)](screenshots/login-page.png)

### Azure ressources

[![All ressources](screenshots/az-all-ressources.png)](screenshots/az-all-ressources.png)

[![Ressources Groups](screenshots/az-ressources-groups.png)](screenshots/az-ressources-groups.png)

### Project pages

[![Create project](screenshots/create-project.png)](screenshots/create-project.png)

[![Create project modal](screenshots/create-project-modal.png)](screenshots/create-project-modal.png)

### Task pages

[![Create task](screenshots/create-task.png)](screenshots/create-task.png)

[![Create task modal](screenshots/create-task-modal.png)](screenshots/create-task-modal.png)