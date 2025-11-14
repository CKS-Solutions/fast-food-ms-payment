package main

import (
	"os"

	"github.com/aws/aws-lambda-go/lambda"
	driver_lambda "github.com/fiap/ms-payment/internal/adapters/driver/lambda"
	infra_aws "github.com/fiap/ms-payment/internal/infra/aws"
	"github.com/fiap/ms-payment/internal/infra/di"
)

func main() {
	region, stage := getEnv()

	container := di.NewGeneratePaymentContainer(region, stage)

	handler := driver_lambda.NewGeneratePaymentHandler(container.GeneratePaymentUseCase)

	lambda.Start(handler.Handle)
}

func getEnv() (infra_aws.AwsRegion, infra_aws.AwsStage) {
	region := os.Getenv("REGION")
	if region == "" {
		region = string(infra_aws.RegionUSEast1)
	}

	stage := os.Getenv("STAGE")
	if stage == "" {
		stage = string(infra_aws.StageLocal)
	}

	return infra_aws.AwsRegion(region), infra_aws.AwsStage(stage)
}
