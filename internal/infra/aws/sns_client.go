package infra_aws

import (
	"github.com/aws/aws-sdk-go-v2/service/sns"
)

type SNSClient struct {
	*sns.Client
}

func NewSNSClient(region AwsRegion, stage AwsStage) *SNSClient {
	if stage != StageLocal {
		return &SNSClient{
			Client: sns.NewFromConfig(NewConfig(region)),
		}
	}

	return &SNSClient{
		Client: sns.NewFromConfig(NewLocalConfig(region)),
	}
}
