package usecases

import (
	"context"
	"fmt"

	"github.com/fiap/ms-payment/internal/core/domain/entities"
	"github.com/fiap/ms-payment/internal/core/domain/ports"
	"github.com/fiap/ms-payment/pkg/utils"
)

type UpdatePaymentStatusUseCase struct {
	paymentRepository        ports.PaymentRepository
	generateTokenMP          ports.MercadoPagoGenerateToken
	getPaymentMP             ports.MercadoPagoGetPayment
	updatePaymentStatusTopic ports.PaymentStatusTopic
}

func NewUpdatePaymentStatusWebhookUseCase(
	paymentRepository ports.PaymentRepository,
	generateTokenMP ports.MercadoPagoGenerateToken,
	getPaymentMP ports.MercadoPagoGetPayment,
	updatePaymentStatusTopic ports.PaymentStatusTopic,
) *UpdatePaymentStatusUseCase {
	return &UpdatePaymentStatusUseCase{
		paymentRepository:        paymentRepository,
		generateTokenMP:          generateTokenMP,
		getPaymentMP:             getPaymentMP,
		updatePaymentStatusTopic: updatePaymentStatusTopic,
	}
}

func (u *UpdatePaymentStatusUseCase) Execute(ctx context.Context, paymentId string, externalId string) error {
	payment, err := u.paymentRepository.GetByExternalId(ctx, externalId)
	if err != nil {
		return utils.HTTPInternalServerError("failed to get payment by external ID")
	}

	if payment.Id == "" {
		fmt.Println("Payment not found")
		return nil
	}

	token, err := u.generateTokenMP.GenerateToken(ctx)
	if err != nil {
		return utils.HTTPPreconditionFailed("failed to generate token")
	}

	status, err := u.getPaymentMP.GetPaymentMock(ctx, paymentId, token)
	if err != nil {
		return utils.HTTPPreconditionFailed("failed to get payment")
	}

	mappedStatus := u.mapStatus(status)
	if payment.Status == mappedStatus {
		fmt.Println("Payment status already up to date")
		return nil
	}

	err = u.paymentRepository.UpdateStatusByExternalId(ctx, externalId, string(mappedStatus))
	if err != nil {
		return utils.HTTPInternalServerError("failed to update payment status")
	}

	err = u.updatePaymentStatusTopic.PublishPaymentStatus(ctx, externalId, string(mappedStatus))
	if err != nil {
		return utils.HTTPInternalServerError("failed to publish payment status")
	}

	return nil
}

func (u *UpdatePaymentStatusUseCase) mapStatus(status string) entities.PaymentStatus {
	switch status {
	case "pending", "authorized", "in_process":
		return entities.PaymentStatus_Pending
	case "approved", "in_mediation":
		return entities.PaymentStatus_Paid
	case "cancelled", "refunded", "charged_back":
		return entities.PaymentStatus_Canceled
	default:
		return entities.PaymentStatus_Rejected
	}
}
