package driver_lambda

import (
	"context"
	"encoding/json"

	"github.com/aws/aws-lambda-go/events"
	"github.com/fiap/ms-payment/internal/adapters/driver/dto"
	"github.com/fiap/ms-payment/internal/core/application/usecases"
	"github.com/fiap/ms-payment/pkg/utils"
)

type GeneratePaymentHandler struct {
	useCase *usecases.GeneratePaymentUseCase
}

func NewGeneratePaymentHandler(useCase *usecases.GeneratePaymentUseCase) *GeneratePaymentHandler {
	return &GeneratePaymentHandler{useCase: useCase}
}

func (h *GeneratePaymentHandler) Handle(ctx context.Context, event events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	var input dto.GeneratePaymentInputDTO
	if err := json.Unmarshal([]byte(event.Body), &input); err != nil {
		return utils.HandleHTTPError(err), nil
	}

	externalId := event.PathParameters["external_id"]
	input.ExternalId = externalId

	res, err := h.useCase.Execute(ctx, input)
	if err != nil {
		return utils.HandleHTTPError(err), nil
	}

	return utils.HTTPSuccess(res), nil
}
