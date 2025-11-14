package infra_aws

import (
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/secretsmanager"
)

type SMClient struct {
	*secretsmanager.Client
}

func NewSMClient(region string) *SMClient {
	return &SMClient{
		Client: secretsmanager.NewFromConfig(aws.Config{
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
