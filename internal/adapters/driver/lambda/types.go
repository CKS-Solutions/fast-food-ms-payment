package driver_lambda

import (
	"context"

	"github.com/aws/aws-lambda-go/events"
)

type APIGatewayHandler interface {
	Handle(context.Context, events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error)
}

type SQSHandler interface {
	Handle(context.Context, events.SQSEvent) error
}

type WebhookHandler[T any] interface {
	Handle(context.Context, T) error
}
