package infra_aws

import (
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
)

type DynamoDBClient struct {
	*dynamodb.Client
}

func NewDynamoDBClient(region AwsRegion, stage AwsStage) *DynamoDBClient {
	if stage != StageLocal {
		return &DynamoDBClient{
			Client: dynamodb.NewFromConfig(NewConfig(region)),
		}
	}

	return &DynamoDBClient{
		Client: dynamodb.NewFromConfig(NewLocalConfig(region)),
	}
}
