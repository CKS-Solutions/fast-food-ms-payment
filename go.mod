module github.com/fiap/ms-payment

go 1.25.3

require (
	github.com/aws/aws-lambda-go v1.6.0
	github.com/aws/aws-sdk-go-v2 v1.39.6
	github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue v1.20.20
	github.com/aws/aws-sdk-go-v2/service/dynamodb v1.52.3
	github.com/aws/aws-sdk-go-v2/service/secretsmanager v1.39.13
	github.com/google/uuid v1.6.0
)

require (
	github.com/aws/aws-sdk-go-v2/internal/configsources v1.4.13 // indirect
	github.com/aws/aws-sdk-go-v2/internal/endpoints/v2 v2.7.13 // indirect
	github.com/aws/aws-sdk-go-v2/service/dynamodbstreams v1.32.1 // indirect
	github.com/aws/aws-sdk-go-v2/service/internal/accept-encoding v1.13.2 // indirect
	github.com/aws/aws-sdk-go-v2/service/internal/endpoint-discovery v1.11.12 // indirect
	github.com/aws/smithy-go v1.23.2 // indirect
	github.com/stretchr/testify v1.11.1 // indirect
)
