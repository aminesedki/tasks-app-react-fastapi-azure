#!/bin/bash

# set the subscreption
export ARM_SUBSCRIPTION_ID="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

# set the application / environnment
export TF_VAR_application_name="terraform-state"
export TF_VAR_environment_name="dev"


# set the backend

# export BACKEND_RESSOURCE_GROUP="rg-terraform-state-dev"
# export BACKEND_STORAGE_ACCOUNT="st2f1ddscfh0"
# export BACKEND_STORAGE_CONTAINER="tfstate"
# export BACKEND_KEY=$TF_VAR_application_name-$TF_VAR_environment_name

# run terraform
terraform init

terraform $*

rm -rf .terraform