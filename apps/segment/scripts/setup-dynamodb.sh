#!/bin/bash
if ! aws dynamodb describe-table --table-name segment-apl-table --endpoint-url http://localhost:8000 --region localhost >/dev/null 2>&1; then
	aws dynamodb create-table --table-name segment-apl-table \
		--attribute-definitions AttributeName=PK,AttributeType=S AttributeName=SK,AttributeType=S \
		--key-schema AttributeName=PK,KeyType=HASH AttributeName=SK,KeyType=RANGE \
		--provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
		--endpoint-url http://localhost:8000 \
		--region localhost
else
	echo "Table segment-apl-table already exists - creation is skipped"
fi
