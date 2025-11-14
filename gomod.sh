#!/bin/bash
set -eu

if [ -f ./go.mod ]; then
    exit 0
fi

touch go.mod

PROJECT_NAME=$(basename $(pwd | xargs dirname))
CURRENT_DIR=$(basename $(pwd))

CONTENT=$(cat <<-EOD
module github.com/${PROJECT_NAME}/${CURRENT_DIR}

require (
	github.com/aws/aws-lambda-go v1.6.0
	github.com/aws/aws-sdk-go-v2 v1.39.6
	github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue v1.20.20
	github.com/aws/aws-sdk-go-v2/service/dynamodb v1.52.3
	github.com/aws/aws-sdk-go-v2/service/secretsmanager v1.39.13
	github.com/google/uuid v1.6.0
)
EOD
)

echo "$CONTENT" > go.mod
