package infra_aws

import (
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
)

type DynamoDBClient struct {
	*dynamodb.Client
}

func NewDynamoDBClient(region AwsRegion, stage AwsStage) *DynamoDBClient {
	if stage != StageLocal {
		return &DynamoDBClient{
			Client: dynamodb.NewFromConfig(aws.Config{
				Region: string(region),
			}),
		}
	}

	return &DynamoDBClient{
		Client: dynamodb.NewFromConfig(aws.Config{
			BaseEndpoint: aws.String(LOCALSTACK_ENDPOINT),
			Region:       string(region),
		}),
	}
}
