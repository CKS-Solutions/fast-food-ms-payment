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

type PaymentSNS struct {
	client *infra_aws.SNSClient
}

func NewPaymentSNS(client *infra_aws.SNSClient) ports.PaymentTopic {
	return &PaymentSNS{
		client: client,
	}
}

type PaymentTopicType string

const (
	PaymentTopicTypeStatusUpdate    PaymentTopicType = "payment_status_update"
	PaymentTopicTypeCreationSuccess PaymentTopicType = "payment_creation_success"
	PaymentTopicTypeCreationFailure PaymentTopicType = "payment_creation_failure"
)

func (p *PaymentSNS) PublishPaymentStatus(ctx context.Context, externalId string, status string) error {
	input := struct {
		Type       PaymentTopicType `json:"type"`
		ExternalId string           `json:"external_id"`
		Status     string           `json:"status"`
	}{
		Type:       PaymentTopicTypeStatusUpdate,
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

func (p *PaymentSNS) PublishPaymentCreationSuccess(ctx context.Context, externalId string, code string) error {
	input := struct {
		Type       PaymentTopicType `json:"type"`
		ExternalId string           `json:"external_id"`
		Code       string           `json:"code"`
	}{
		Type:       PaymentTopicTypeCreationSuccess,
		ExternalId: externalId,
		Code:       code,
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

func (p *PaymentSNS) PublishPaymentCreationFailure(ctx context.Context, externalId string, reason string) error {
	input := struct {
		Type       PaymentTopicType `json:"type"`
		ExternalId string           `json:"external_id"`
		Reason     string           `json:"reason"`
	}{
		Type:       PaymentTopicTypeCreationFailure,
		ExternalId: externalId,
		Reason:     reason,
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

func (p *PaymentSNS) getTopicArn() (string, error) {
	arn := os.Getenv("PAYMENT_TOPIC_ARN")
	if arn == "" {
		return "", errors.New("PAYMENT_TOPIC_ARN environment variable is not set")
	}

	return arn, nil
}
