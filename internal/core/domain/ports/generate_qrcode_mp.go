package ports

import "context"

type MercadoPagoGenerateQRCode interface {
	GenerateQRCode(ctx context.Context, paymentId string, amount float64, description string, token string) (string, error)
}
