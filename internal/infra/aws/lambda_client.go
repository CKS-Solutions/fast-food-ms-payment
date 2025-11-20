package infra_aws

import (
	"github.com/aws/aws-sdk-go-v2/service/lambda"
)

type LambdaClient struct {
	*lambda.Client
}

func NewLambdaClient(region AwsRegion, stage AwsStage) *LambdaClient {
	if stage == StageLocal {
		return &LambdaClient{
			Client: lambda.NewFromConfig(NewLocalConfig(region)),
		}
	}

	return &LambdaClient{
		Client: lambda.NewFromConfig(NewConfig(region)),
	}
}
