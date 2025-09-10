#!/bin/bash
set -e

# needed for aws-cli to work with local dynamodb
aws configure set aws_access_key_id test
aws configure set aws_secret_access_key test
aws configure set region localhost

TABLE_NAME="stripe-main-table"
AWS_REGION="localhost"
# Change to localhost if needed, depending on Docker setup
ENDPOINT_URL="http://dynamodb:8000"

echo "Starting DynamoDB setup"

# TODO Migrate to script from NP ATOBARAI
if ! aws dynamodb describe-table --table-name $TABLE_NAME --endpoint-url $ENDPOINT_URL --region $AWS_REGION >/dev/null 2>&1; then
	aws dynamodb create-table --table-name $TABLE_NAME \
		--attribute-definitions AttributeName=PK,AttributeType=S AttributeName=SK,AttributeType=S \
		--key-schema AttributeName=PK,KeyType=HASH AttributeName=SK,KeyType=RANGE \
		--provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
		--endpoint-url $ENDPOINT_URL \
		--region $AWS_REGION
else
	echo "Table $TABLE_NAME already exists - creation is skipped"
fi
