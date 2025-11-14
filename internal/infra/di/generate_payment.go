package di

import (
	driven_dynamodb "github.com/fiap/ms-payment/internal/adapters/driven/dynamodb"
	driven_mercadopago "github.com/fiap/ms-payment/internal/adapters/driven/mercadopago"
	"github.com/fiap/ms-payment/internal/core/application/usecases"
	infra_aws "github.com/fiap/ms-payment/internal/infra/aws"
)

type GeneratePaymentContainer struct {
	GeneratePaymentUseCase *usecases.GeneratePaymentUseCase
}

func NewGeneratePaymentContainer(region infra_aws.AwsRegion, stage infra_aws.AwsStage) *GeneratePaymentContainer {
	dynamoClient := infra_aws.NewDynamoDBClient(region, stage)
	smClient := infra_aws.NewSMClient(region, stage)

	paymentRepo := driven_dynamodb.NewPaymentRepository(*dynamoClient)
	generateTokenMP := driven_mercadopago.NewMercadoPagoGenerateToken(smClient)
	generateQRCodeMP := driven_mercadopago.NewMercadoPagoGenerateQRCode(smClient)

	return &GeneratePaymentContainer{
		GeneratePaymentUseCase: &usecases.GeneratePaymentUseCase{
			PaymentRepo:      paymentRepo,
			GenerateTokenMP:  generateTokenMP,
			GenerateQRCodeMP: generateQRCodeMP,
		},
	}
}
