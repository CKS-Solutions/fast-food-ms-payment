package main

import (
	"github.com/aws/aws-lambda-go/lambda"
	driver_lambda "github.com/fiap/ms-payment/internal/adapters/driver/lambda"
	"github.com/fiap/ms-payment/internal/infra/di"
	"github.com/fiap/ms-payment/pkg/utils"
)

func main() {
	region := utils.GetRegion()
	stage := utils.GetStage()

	container := di.NewCheckPaymentStatusContainer(region, stage)
	handler := driver_lambda.NewCheckPaymentStatusHandler(container.CheckPaymentStatusUseCase)

	lambda.Start(handler.Handle)
}
