package infra_aws

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
