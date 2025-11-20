package driver_lambda

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/lambda"
	"github.com/aws/aws-sdk-go-v2/service/lambda/types"
	infra_aws "github.com/fiap/ms-payment/internal/infra/aws"
	"github.com/fiap/ms-payment/pkg/utils"
)

type WebhookOrchestratorHandler struct {
	lambdaClient *infra_aws.LambdaClient
}

func NewWebhookOrchestratorHandler(lambdaClient *infra_aws.LambdaClient) APIGatewayHandler {
	return &WebhookOrchestratorHandler{
		lambdaClient: lambdaClient,
	}
}

func (h *WebhookOrchestratorHandler) Handle(ctx context.Context, event events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	topic := event.QueryStringParameters["topic"]

	switch topic {
	case "payment":
		paymentId := event.QueryStringParameters["id"]
		if paymentId == "" {
			fmt.Println("Payment ID is missing")
			return utils.HTTPSuccess(nil), nil
		}

		externalId := event.QueryStringParameters["external_id"]
		if externalId == "" {
			fmt.Println("External ID is missing")
			return utils.HTTPSuccess(nil), nil
		}

		stage := utils.GetStage()

		payload, _ := json.Marshal(map[string]string{
			"payment_id":  paymentId,
			"external_id": externalId,
		})

		_, err := h.lambdaClient.Invoke(ctx, &lambda.InvokeInput{
			FunctionName:   aws.String(fmt.Sprintf("ms-payment-%s-updatePaymentStatus", stage)),
			InvocationType: types.InvocationTypeEvent,
			Payload:        payload,
		})
		if err != nil {
			fmt.Printf("Error invoking Lambda function: %v\n", err)
			return utils.HTTPSuccess(nil), nil
		}
	default:
		fmt.Println("Unhandled topic:", topic)
		return utils.HTTPSuccess(nil), nil
	}

	return utils.HTTPSuccess(nil), nil
}
