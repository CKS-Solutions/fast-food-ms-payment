package utils

import (
	"os"

	infra_aws "github.com/fiap/ms-payment/internal/infra/aws"
)

func GetRegion() infra_aws.AwsRegion {
	region := os.Getenv("REGION")
	if region == "" {
		region = string(infra_aws.RegionUSEast1)
	}

	return infra_aws.AwsRegion(region)
}

func GetStage() infra_aws.AwsStage {
	stage := os.Getenv("STAGE")
	if stage == "" {
		stage = string(infra_aws.StageLocal)
	}

	return infra_aws.AwsStage(stage)
}
