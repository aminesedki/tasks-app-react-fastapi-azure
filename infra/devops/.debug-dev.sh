#!/bin/bash

# set the subscreption
export ARM_SUBSCRIPTION_ID="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

# set the application / environnment
export TF_VAR_application_name="devops"
export TF_VAR_environment_name="dev"


# set the backend
export BACKEND_RESSOURCE_GROUP="rg-terraform-state-dev"
export BACKEND_STORAGE_ACCOUNT="stbr3ihpx9u3"
export BACKEND_STORAGE_CONTAINER="tfstate"
export BACKEND_KEY=$TF_VAR_application_name-$TF_VAR_environment_name

# run terraform
terraform init \
    -backend-config="resource_group_name=${BACKEND_RESSOURCE_GROUP}" \
    -backend-config="storage_account_name=${BACKEND_STORAGE_ACCOUNT}" \
    -backend-config="container_name=${BACKEND_STORAGE_CONTAINER}" \
    -backend-config="key=${BACKEND_KEY}"

terraform $*

rm -rf .terraform