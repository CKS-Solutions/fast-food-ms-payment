package di

import (
	driven_dynamodb "github.com/fiap/ms-payment/internal/adapters/driven/dynamodb"
	"github.com/fiap/ms-payment/internal/core/application/usecases"
	infra_aws "github.com/fiap/ms-payment/internal/infra/aws"
)

type CheckPaymentStatusContainer struct {
	CheckPaymentStatusUseCase *usecases.CheckPaymentStatusUseCase
}

func NewCheckPaymentStatusContainer(region infra_aws.AwsRegion, stage infra_aws.AwsStage) *CheckPaymentStatusContainer {
	dynamoClient := infra_aws.NewDynamoDBClient(region, stage)

	paymentRepo := driven_dynamodb.NewPaymentRepository(*dynamoClient)

	return &CheckPaymentStatusContainer{
		CheckPaymentStatusUseCase: usecases.NewCheckPaymentStatusUseCase(paymentRepo),
	}
}
