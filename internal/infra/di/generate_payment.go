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

func NewGeneratePaymentContainer() *GeneratePaymentContainer {
	dynamoClient := infra_aws.NewDynamoDBClient("us-east-1")
	smClient := infra_aws.NewSMClient("us-east-1")

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
