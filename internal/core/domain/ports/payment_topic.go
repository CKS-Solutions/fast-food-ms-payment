package ports

import "context"

type PaymentTopic interface {
	PublishPaymentCreationSuccess(ctx context.Context, externalId string, code string) error
	PublishPaymentCreationFailure(ctx context.Context, externalId string, reason string) error
	PublishPaymentStatus(ctx context.Context, externalId string, status string) error
}
