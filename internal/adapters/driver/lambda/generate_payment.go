package driver_lambda

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/aws/aws-lambda-go/events"
	"github.com/fiap/ms-payment/internal/adapters/driver/dto"
	"github.com/fiap/ms-payment/internal/core/application/usecases"
)

type GeneratePaymentHandler struct {
	useCase *usecases.GeneratePaymentUseCase
}

func NewGeneratePaymentHandler(useCase *usecases.GeneratePaymentUseCase) SQSHandler {
	return &GeneratePaymentHandler{useCase: useCase}
}

func (h *GeneratePaymentHandler) Handle(ctx context.Context, event events.SQSEvent) error {
	if len(event.Records) == 0 {
		fmt.Println("No SQS records received")
		return nil
	}

	var input dto.GeneratePaymentInputDTO
	if err := json.Unmarshal([]byte(event.Records[0].Body), &input); err != nil {
		fmt.Println("Error unmarshaling SQS record:", err)
		return nil
	}

	err := h.useCase.Execute(ctx, input)
	if err != nil {
		return nil
	}

	return nil
}
