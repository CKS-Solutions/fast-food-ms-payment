package infra_aws

import (
	"github.com/aws/aws-sdk-go-v2/service/secretsmanager"
)

type SMClient struct {
	*secretsmanager.Client
}

func NewSMClient(region AwsRegion, stage AwsStage) *SMClient {
	if stage != StageLocal {
		return &SMClient{
			Client: secretsmanager.NewFromConfig(NewConfig(region)),
		}
	}

	return &SMClient{
		Client: secretsmanager.NewFromConfig(NewLocalConfig(region)),
	}
}
