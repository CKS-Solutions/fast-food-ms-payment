package infra_aws

import (
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
)

type DynamoDBClient struct {
	*dynamodb.Client
}

func NewDynamoDBClient(region string) *DynamoDBClient {
	return &DynamoDBClient{
		Client: dynamodb.NewFromConfig(aws.Config{
			EndpointResolver: aws.EndpointResolverFunc(
				func(service, region string) (aws.Endpoint, error) {
					return aws.Endpoint{
						URL: "http://localstack:4566",
					}, nil
				},
			),
			Region: region,
		}),
	}
}
