package usecases

import (
	"context"

	"github.com/fiap/ms-payment/internal/adapters/driver/dto"
	"github.com/fiap/ms-payment/internal/core/domain/ports"
	"github.com/fiap/ms-payment/pkg/utils"
)

type CheckPaymentStatusUseCase struct {
	paymentRepository ports.PaymentRepository
}

func NewCheckPaymentStatusUseCase(paymentRepository ports.PaymentRepository) *CheckPaymentStatusUseCase {
	return &CheckPaymentStatusUseCase{paymentRepository: paymentRepository}
}

func (u *CheckPaymentStatusUseCase) Execute(ctx context.Context, externalId string) (dto.CheckPaymentStatusOutputDTO, error) {
	payment, err := u.paymentRepository.GetByExternalId(ctx, externalId)
	if err != nil {
		return dto.CheckPaymentStatusOutputDTO{}, err
	}

	if payment.ExternalId == "" {
		return dto.CheckPaymentStatusOutputDTO{}, utils.HTTPNotFound("Payment not found")
	}

	return dto.CheckPaymentStatusOutputDTO{
		Status: string(payment.Status),
	}, nil
}
