package infra_aws

import "github.com/aws/aws-sdk-go-v2/aws"

const (
	LOCALSTACK_ENDPOINT = "http://localstack:4566"
)

type AwsStage string

const (
	StageLocal AwsStage = "local"
	StageProd  AwsStage = "api"
)

type AwsRegion string

const (
	RegionUSEast1 AwsRegion = "us-east-1"
)

func NewConfig(region AwsRegion) aws.Config {
	return aws.Config{
		Region: string(region),
	}
}

func NewLocalConfig(region AwsRegion) aws.Config {
	return aws.Config{
		BaseEndpoint: aws.String(LOCALSTACK_ENDPOINT),
		Region:       string(region),
	}
}
