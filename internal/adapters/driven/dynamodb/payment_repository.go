package driven_dynamodb

import (
	"context"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
	"github.com/fiap/ms-payment/internal/core/domain/entities"
	"github.com/fiap/ms-payment/internal/core/domain/ports"
	aws_internal "github.com/fiap/ms-payment/internal/infra/aws"
)

type PaymentRepository struct {
	client aws_internal.DynamoDBClient
}

func NewPaymentRepository(client aws_internal.DynamoDBClient) ports.PaymentRepository {
	return &PaymentRepository{
		client: client,
	}
}

const TABLE_NAME = "Payments"

func (r *PaymentRepository) GetByExternalId(ctx context.Context, externalId string) (entities.Payment, error) {
	out, err := r.client.Query(ctx, &dynamodb.QueryInput{
		TableName:              aws.String(TABLE_NAME),
		KeyConditionExpression: aws.String("external_id = :external_id"),
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":external_id": &types.AttributeValueMemberS{Value: externalId},
		},
	})

	if err != nil {
		return entities.Payment{}, err
	}

	if len(out.Items) == 0 {
		return entities.Payment{}, nil
	}

	var payment entities.Payment
	attributevalue.UnmarshalMap(out.Items[0], &payment)

	return payment, nil
}

func (r *PaymentRepository) Create(ctx context.Context, payment entities.Payment) error {
	item, err := attributevalue.MarshalMap(payment)
	if err != nil {
		return err
	}

	_, err = r.client.PutItem(ctx, &dynamodb.PutItemInput{
		TableName: aws.String(TABLE_NAME),
		Item:      item,
	})
	if err != nil {
		return err
	}

	return nil
}

func (r *PaymentRepository) Delete(ctx context.Context, externalId string) error {
	_, err := r.client.DeleteItem(ctx, &dynamodb.DeleteItemInput{
		TableName: aws.String(TABLE_NAME),
		Key: map[string]types.AttributeValue{
			"external_id": &types.AttributeValueMemberS{Value: externalId},
		},
	})
	if err != nil {
		return err
	}

	return nil
}
