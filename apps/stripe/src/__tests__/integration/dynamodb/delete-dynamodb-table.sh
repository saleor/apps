#!/bin/bash
set -e

# needed for aws-cli to work with local dynamodb
aws configure set aws_access_key_id test
aws configure set aws_secret_access_key test
aws configure set region localhost

TABLE_NAME="stripe-main-table-integration"
AWS_REGION="localhost"
# Change to localhost if needed, depending on Docker setup
ENDPOINT_URL="http://localhost:8000"


if ! aws dynamodb describe-table --table-name $TABLE_NAME --endpoint-url $ENDPOINT_URL --region $AWS_REGION >/dev/null 2>&1; then
  echo "table exists, will remove"
	aws aws dynamodb delete-table --table-name $TABLE_NAME --endpoint-url $ENDPOINT_URL
else
	echo "Table $TABLE_NAME already removed"
fi
