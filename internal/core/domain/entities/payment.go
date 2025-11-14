package entities

import (
	"time"

	"github.com/google/uuid"
)

const (
	DEFAULT_PAYMENT_EXPIRES_IN_MINUTES = 30
)

type PaymentStatus string

const (
	PaymentStatus_Pending  = "pending"
	PaymentStatus_Paid     = "paid"
	PaymentStatus_Rejected = "rejected"
	PaymentStatus_Canceled = "canceled"
)

type PaymentMethod string

const (
	PaymentMethod_Pix = "pix"
)

type Payment struct {
	Id          string        `dynamodbav:"id"`
	ExternalId  string        `dynamodbav:"external_id"`
	Status      PaymentStatus `dynamodbav:"status"`
	Method      PaymentMethod `dynamodbav:"method"`
	Description string        `dynamodbav:"description"`
	Code        string        `dynamodbav:"code"`
	Value       float64       `dynamodbav:"value"`
	ExpiresAt   int64         `dynamodbav:"expires_at"`
	CreatedAt   int64         `dynamodbav:"created_at"`
	UpdatedAt   int64         `dynamodbav:"updated_at"`
}

func NewPayment(externalId string, value float64, description string, code string) *Payment {
	return &Payment{
		Id:          uuid.New().String(),
		ExternalId:  externalId,
		Status:      PaymentStatus_Pending,
		Method:      PaymentMethod_Pix,
		Description: description,
		Value:       value,
		Code:        code,
		ExpiresAt:   time.Now().Add(DEFAULT_PAYMENT_EXPIRES_IN_MINUTES * time.Minute).Unix(),
		CreatedAt:   time.Now().Unix(),
		UpdatedAt:   time.Now().Unix(),
	}
}
