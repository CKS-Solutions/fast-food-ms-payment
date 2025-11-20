package ports

import "context"

type MercadoPagoGetPayment interface {
	GetPayment(ctx context.Context, paymentId string, token string) (string, error)
	GetPaymentMock(ctx context.Context, paymentId string, token string) (string, error)
}
