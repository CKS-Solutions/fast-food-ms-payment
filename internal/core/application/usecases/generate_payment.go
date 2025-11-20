package usecases

import (
	"context"
	"time"

	"github.com/fiap/ms-payment/internal/adapters/driver/dto"
	"github.com/fiap/ms-payment/internal/core/domain/entities"
	"github.com/fiap/ms-payment/internal/core/domain/ports"
	"github.com/fiap/ms-payment/pkg/utils"
)

type GeneratePaymentUseCase struct {
	paymentRepo      ports.PaymentRepository
	generateTokenMP  ports.MercadoPagoGenerateToken
	generateQRCodeMP ports.MercadoPagoGenerateQRCode
	paymentTopic     ports.PaymentTopic
}

func NewGeneratePaymentUseCase(
	paymentRepo ports.PaymentRepository,
	generateTokenMP ports.MercadoPagoGenerateToken,
	generateQRCodeMP ports.MercadoPagoGenerateQRCode,
	paymentTopic ports.PaymentTopic,
) *GeneratePaymentUseCase {
	return &GeneratePaymentUseCase{
		paymentRepo:      paymentRepo,
		generateTokenMP:  generateTokenMP,
		generateQRCodeMP: generateQRCodeMP,
		paymentTopic:     paymentTopic,
	}
}

func (u *GeneratePaymentUseCase) Execute(ctx context.Context, input dto.GeneratePaymentInputDTO) error {
	if input.ExternalId == "" {
		_ = u.paymentTopic.PublishPaymentCreationFailure(ctx, input.ExternalId, "missing external ID")
		return nil
	}

	if input.Amount <= 0 {
		_ = u.paymentTopic.PublishPaymentCreationFailure(ctx, input.ExternalId, "missing amount")
		return nil
	}

	if input.Description == "" {
		_ = u.paymentTopic.PublishPaymentCreationFailure(ctx, input.ExternalId, "missing description")
		return nil
	}

	payment, err := u.paymentRepo.GetByExternalId(ctx, input.ExternalId)
	if err != nil {
		_ = u.paymentTopic.PublishPaymentCreationFailure(ctx, input.ExternalId, "failed to get payment by external ID")
		return utils.HTTPInternalServerError("failed to get payment by external ID")
	}

	if payment.Id != "" {
		if payment.Status == entities.PaymentStatus_Paid {
			_ = u.paymentTopic.PublishPaymentCreationFailure(ctx, input.ExternalId, "payment already paid")
			return utils.HTTPConflict("payment already paid")
		}

		if time.Unix(payment.ExpiresAt, 10).After(time.Now()) {
			_ = u.paymentTopic.PublishPaymentCreationSuccess(ctx, input.ExternalId, payment.Code)
			return nil
		}

		err := u.paymentRepo.Delete(ctx, payment.ExternalId)
		if err != nil {
			_ = u.paymentTopic.PublishPaymentCreationFailure(ctx, input.ExternalId, "failed to delete expired payment")
			return utils.HTTPInternalServerError("failed to delete expired payment")
		}
	}

	token, err := u.generateTokenMP.GenerateToken(ctx)
	if err != nil {
		_ = u.paymentTopic.PublishPaymentCreationFailure(ctx, input.ExternalId, "failed to generate MercadoPago token")
		return utils.HTTPPreconditionFailed("failed to generate MercadoPago token")
	}

	qrCode, err := u.generateQRCodeMP.GenerateQRCode(ctx, input.ExternalId, input.Amount, input.Description, token)
	if err != nil {
		_ = u.paymentTopic.PublishPaymentCreationFailure(ctx, input.ExternalId, "failed to generate MercadoPago QR Code")
		return utils.HTTPPreconditionFailed("failed to generate MercadoPago QR Code")
	}

	newPayment := entities.NewPayment(input.ExternalId, input.Amount, input.Description, qrCode)

	err = u.paymentRepo.Create(ctx, *newPayment)
	if err != nil {
		_ = u.paymentTopic.PublishPaymentCreationFailure(ctx, input.ExternalId, "failed to create new payment")
		return utils.HTTPInternalServerError("failed to create new payment")
	}

	_ = u.paymentTopic.PublishPaymentCreationSuccess(ctx, input.ExternalId, newPayment.Code)

	return nil
}
