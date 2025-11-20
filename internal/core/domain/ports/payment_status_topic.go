package ports

import "context"

type PaymentStatusTopic interface {
	PublishPaymentStatus(ctx context.Context, externalId string, status string) error
}
