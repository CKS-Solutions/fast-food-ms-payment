package driver_lambda

import (
	"context"
	"fmt"

	"github.com/fiap/ms-payment/internal/core/application/usecases"
)

type UpdatePaymentStatusHandler struct {
	useCase *usecases.UpdatePaymentStatusUseCase
}

type UpdatePaymentStatusEvent struct {
	PaymentID  string `json:"payment_id"`
	ExternalID string `json:"external_id"`
}

func NewUpdatePaymentStatusHandler(useCase *usecases.UpdatePaymentStatusUseCase) WebhookHandler[UpdatePaymentStatusEvent] {
	return &UpdatePaymentStatusHandler{useCase: useCase}
}

func (h *UpdatePaymentStatusHandler) Handle(ctx context.Context, event UpdatePaymentStatusEvent) error {
	err := h.useCase.Execute(ctx, event.PaymentID, event.ExternalID)
	if err != nil {
		fmt.Println("Error updating payment status:", err)
		return err
	}

	return nil
}
