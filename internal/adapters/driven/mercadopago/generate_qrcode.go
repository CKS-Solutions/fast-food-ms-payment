package driven_mercadopago

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/secretsmanager"
	"github.com/fiap/ms-payment/internal/core/domain/ports"
	infra_aws "github.com/fiap/ms-payment/internal/infra/aws"
)

type MercadoPagoGenerateQRCode struct {
	smClient *infra_aws.SMClient
}

type GenerateQRCodeBodyItem struct {
	Title       string  `json:"title"`
	Description string  `json:"description"`
	UnitPrice   float64 `json:"unit_price"`
	Quantity    int     `json:"quantity"`
	TotalAmount float64 `json:"total_amount"`
	UnitMeasure string  `json:"unit_measure"`
}

type GenerateQRCodeBody struct {
	ExternalReference string                   `json:"external_reference"`
	Title             string                   `json:"title"`
	Description       string                   `json:"description"`
	TotalAmount       float64                  `json:"total_amount"`
	ExpirationDate    string                   `json:"expiration_date"`
	Items             []GenerateQRCodeBodyItem `json:"items"`

	NotificationURL string `json:"notification_url,omitempty"`
}

func NewMercadoPagoGenerateQRCode(smClient *infra_aws.SMClient) ports.MercadoPagoGenerateQRCode {
	return &MercadoPagoGenerateQRCode{smClient: smClient}
}

func (m *MercadoPagoGenerateQRCode) GenerateQRCode(
	ctx context.Context,
	paymentId string, amount float64, description string, token string,
) (string, error) {
	expirationDate := time.Now().Add(30 * time.Minute).UTC().Format("2006-01-02T15:04:05.000Z")
	input := GenerateQRCodeBody{
		ExternalReference: paymentId,
		Title:             "Payment QR Code",
		Description:       description,
		TotalAmount:       amount,
		ExpirationDate:    expirationDate,
		Items: []GenerateQRCodeBodyItem{
			{
				Title:       "Payment",
				Description: description,
				UnitPrice:   amount,
				Quantity:    1,
				TotalAmount: amount,
				UnitMeasure: "unit",
			},
		},
	}

	stage := os.Getenv("STAGE")
	if stage == string(infra_aws.StageLocal) {
		input.NotificationURL = "define_here_to_test"
	}

	body, err := json.Marshal(input)
	if err != nil {
		return "", err
	}

	userId, posId, err := m.getQRCodeInfo(ctx)
	if err != nil {
		return "", err
	}

	url := fmt.Sprintf("%s/instore/orders/qr/seller/collectors/%s/pos/%s/qrs", BASE_URL, userId, posId)
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(body))
	if err != nil {
		return "", err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", token))

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", err
	}

	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode > 299 {
		bodyErr, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf(
			"failed to generate qrcode (%d): %s",
			resp.StatusCode,
			string(bodyErr),
		)
	}

	responseBody := struct {
		QRCode string `json:"qr_data"`
	}{}
	err = json.NewDecoder(resp.Body).Decode(&responseBody)
	if err != nil {
		return "", err
	}

	return responseBody.QRCode, nil
}

func (m *MercadoPagoGenerateQRCode) getQRCodeInfo(ctx context.Context) (string, string, error) {
	out, err := m.smClient.GetSecretValue(ctx, &secretsmanager.GetSecretValueInput{
		SecretId: aws.String(QRCODE_INFO_SECRET_ID),
	})
	if err != nil {
		return "", "", err
	}

	var payload struct {
		UserId string `json:"userId"`
		PosId  string `json:"posId"`
	}

	if err := json.Unmarshal([]byte(*out.SecretString), &payload); err != nil {
		return "", "", fmt.Errorf("invalid secret value JSON: %w", err)
	}

	return payload.UserId, payload.PosId, nil
}
