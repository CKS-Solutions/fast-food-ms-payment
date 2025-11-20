package driven_sns

import (
	"context"
	"encoding/json"
	"errors"
	"os"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/sns"
	"github.com/fiap/ms-payment/internal/core/domain/ports"
	infra_aws "github.com/fiap/ms-payment/internal/infra/aws"
)

type PaymentStatusSNS struct {
	client *infra_aws.SNSClient
}

func NewPaymentStatusSNS(client *infra_aws.SNSClient) ports.PaymentStatusTopic {
	return &PaymentStatusSNS{
		client: client,
	}
}

func (p *PaymentStatusSNS) PublishPaymentStatus(ctx context.Context, externalId string, status string) error {
	input := struct {
		ExternalId string `json:"external_id"`
		Status     string `json:"status"`
	}{
		ExternalId: externalId,
		Status:     status,
	}

	message, err := json.Marshal(input)
	if err != nil {
		return err
	}

	topicArn, err := p.getTopicArn()
	if err != nil {
		return err
	}

	_, err = p.client.Publish(ctx, &sns.PublishInput{
		TopicArn: aws.String(topicArn),
		Message:  aws.String(string(message)),
	})
	if err != nil {
		return err
	}

	return nil
}

func (p *PaymentStatusSNS) getTopicArn() (string, error) {
	arn := os.Getenv("PAYMENTS_STATUS_TOPIC_ARN")
	if arn == "" {
		return "", errors.New("PAYMENTS_STATUS_TOPIC_ARN environment variable is not set")
	}

	return arn, nil
}
