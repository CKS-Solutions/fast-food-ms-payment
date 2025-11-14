package ports

import (
	"context"

	"github.com/fiap/ms-payment/internal/core/domain/entities"
)

type PaymentRepository interface {
	GetByExternalId(ctx context.Context, externalId string) (entities.Payment, error)
	Create(ctx context.Context, payment entities.Payment) error
	Delete(ctx context.Context, externalId string) error
}
