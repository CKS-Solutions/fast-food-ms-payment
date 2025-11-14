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
	PaymentRepo      ports.PaymentRepository
	GenerateTokenMP  ports.MercadoPagoGenerateToken
	GenerateQRCodeMP ports.MercadoPagoGenerateQRCode
}

func NewGeneratePaymentUseCase(
	paymentRepo ports.PaymentRepository,
	generateTokenMP ports.MercadoPagoGenerateToken,
	generateQRCodeMP ports.MercadoPagoGenerateQRCode,
) *GeneratePaymentUseCase {
	return &GeneratePaymentUseCase{
		PaymentRepo:      paymentRepo,
		GenerateTokenMP:  generateTokenMP,
		GenerateQRCodeMP: generateQRCodeMP,
	}
}

func (u *GeneratePaymentUseCase) Execute(ctx context.Context, input dto.GeneratePaymentInputDTO) (dto.GeneratePaymentOutputDTO, error) {
	payment, err := u.PaymentRepo.GetByExternalId(ctx, input.ExternalId)
	if err != nil {
		return dto.GeneratePaymentOutputDTO{}, utils.HTTPInternalServerError("failed to get payment by external ID")
	}

	if payment.Id != "" {
		if payment.Status == entities.PaymentStatus_Paid {
			return dto.GeneratePaymentOutputDTO{}, utils.HTTPConflict("payment already paid")
		}

		if time.Unix(payment.ExpiresAt, 10).After(time.Now()) {
			return dto.GeneratePaymentOutputDTO{Code: payment.Code}, nil
		}

		err := u.PaymentRepo.Delete(ctx, payment.ExternalId)
		if err != nil {
			return dto.GeneratePaymentOutputDTO{}, utils.HTTPInternalServerError("failed to delete expired payment")
		}
	}

	token, err := u.GenerateTokenMP.GenerateToken(ctx)
	if err != nil {
		return dto.GeneratePaymentOutputDTO{}, utils.HTTPPreconditionFailed("failed to generate MercadoPago token")
	}

	qrCode, err := u.GenerateQRCodeMP.GenerateQRCode(ctx, input.ExternalId, input.Amount, input.Description, token)
	if err != nil {
		return dto.GeneratePaymentOutputDTO{}, utils.HTTPPreconditionFailed("failed to generate MercadoPago QR Code")
	}

	newPayment := entities.NewPayment(input.ExternalId, input.Amount, input.Description, qrCode)

	err = u.PaymentRepo.Create(ctx, *newPayment)
	if err != nil {
		return dto.GeneratePaymentOutputDTO{}, utils.HTTPInternalServerError("failed to create new payment")
	}

	return dto.GeneratePaymentOutputDTO{Code: newPayment.Code}, nil
}
