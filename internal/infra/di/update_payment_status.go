package di

import (
	driven_dynamodb "github.com/fiap/ms-payment/internal/adapters/driven/dynamodb"
	driven_mercadopago "github.com/fiap/ms-payment/internal/adapters/driven/mercadopago"
	driven_sns "github.com/fiap/ms-payment/internal/adapters/driven/sns"
	"github.com/fiap/ms-payment/internal/core/application/usecases"
	infra_aws "github.com/fiap/ms-payment/internal/infra/aws"
)

type UpdatePaymentStatusContainer struct {
	UpdatePaymentStatusUseCase *usecases.UpdatePaymentStatusUseCase
}

func NewUpdatePaymentStatusContainer(region infra_aws.AwsRegion, stage infra_aws.AwsStage) *UpdatePaymentStatusContainer {
	dynamoClient := infra_aws.NewDynamoDBClient(region, stage)
	smClient := infra_aws.NewSMClient(region, stage)
	snsClient := infra_aws.NewSNSClient(region, stage)

	paymentRepo := driven_dynamodb.NewPaymentRepository(*dynamoClient)
	generateTokenMP := driven_mercadopago.NewMercadoPagoGenerateToken(smClient)
	getPaymentMP := driven_mercadopago.NewMercadoPagoGetPayment()
	notificationService := driven_sns.NewPaymentSNS(snsClient)

	return &UpdatePaymentStatusContainer{
		UpdatePaymentStatusUseCase: usecases.NewUpdatePaymentStatusWebhookUseCase(
			paymentRepo,
			generateTokenMP,
			getPaymentMP,
			notificationService,
		),
	}
}
