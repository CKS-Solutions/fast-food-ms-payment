package ports

import "context"

type MercadoPagoGenerateToken interface {
	GenerateToken(ctx context.Context) (string, error)
}
