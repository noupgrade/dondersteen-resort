#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e
# Exit if any command in a pipeline fails
set -o pipefail

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
  echo "gcloud is not installed. Please install it from https://cloud.google.com/sdk."
  exit 1
fi

# Check user is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo "You are not authenticated. Logging in..."
    gcloud auth login
fi

# Attempt to retrieve an access token using ADC
TOKEN=$(gcloud auth application-default print-access-token 2>/dev/null)

# Check if the token is empty or if the quota project is not dondersteen-resort
if [ -z "$TOKEN" ] || [ "$(gcloud config get-value project)" != "dondersteen-resort" ]; then
    echo "Error: Google Application Default Credentials (ADC) are not set up or the quota project is incorrect. Setting them up..."
    gcloud config set project dondersteen-resort
    gcloud auth application-default login
    gcloud auth application-default set-quota-project dondersteen-resort
else
    echo "Google Application Default Credentials (ADC) are set up and the quota project is correct."
fi


