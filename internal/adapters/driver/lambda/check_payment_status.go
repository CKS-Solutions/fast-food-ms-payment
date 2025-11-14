package driver_lambda

import (
	"context"

	"github.com/aws/aws-lambda-go/events"
	"github.com/fiap/ms-payment/internal/core/application/usecases"
	"github.com/fiap/ms-payment/pkg/utils"
)

type CheckPaymentStatusHandler struct {
	useCase *usecases.CheckPaymentStatusUseCase
}

func NewCheckPaymentStatusHandler(useCase *usecases.CheckPaymentStatusUseCase) APIGatewayHandler {
	return &CheckPaymentStatusHandler{useCase: useCase}
}

func (h *CheckPaymentStatusHandler) Handle(ctx context.Context, event events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	externalId := event.PathParameters["external_id"]
	if externalId == "" {
		return utils.HandleHTTPError(utils.HTTPBadRequest("missing external_id in path parameters")), nil
	}

	res, err := h.useCase.Execute(ctx, externalId)
	if err != nil {
		return utils.HandleHTTPError(err), nil
	}

	return utils.HTTPSuccess(res), nil
}
