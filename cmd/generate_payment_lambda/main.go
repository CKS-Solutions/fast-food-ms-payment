package main

import (
	"github.com/aws/aws-lambda-go/lambda"
	driver_lambda "github.com/fiap/ms-payment/internal/adapters/driver/lambda"
	"github.com/fiap/ms-payment/internal/infra/di"
)

func main() {
	container := di.NewGeneratePaymentContainer()

	handler := driver_lambda.NewGeneratePaymentHandler(container.GeneratePaymentUseCase)

	lambda.Start(handler.Handle)
}
