#!/bin/bash
set -e

# needed for aws-cli to work with local dynamodb
aws configure set aws_access_key_id test
aws configure set aws_secret_access_key test
aws configure set region localhost

if ! aws dynamodb describe-table --table-name avatax-logs --endpoint-url http://dynamodb:8000 --region localhost >/dev/null 2>&1; then
	aws dynamodb create-table --table-name avatax-logs \
		--attribute-definitions AttributeName=PK,AttributeType=S AttributeName=SK,AttributeType=S \
		--key-schema AttributeName=PK,KeyType=HASH AttributeName=SK,KeyType=RANGE \
		--provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
		--endpoint-url http://dynamodb:8000 \
		--region localhost
else
	echo "Table avatax-logs already exists - creation is skipped"
fi
