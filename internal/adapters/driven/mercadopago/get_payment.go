package driven_mercadopago

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"github.com/fiap/ms-payment/internal/core/domain/ports"
)

type MercadoPagoGetPayment struct{}

func NewMercadoPagoGetPayment() ports.MercadoPagoGetPayment {
	return &MercadoPagoGetPayment{}
}

func (m *MercadoPagoGetPayment) GetPayment(ctx context.Context, paymentId string, token string) (string, error) {
	url := fmt.Sprintf("%s/v1/payments/%s", BASE_URL, paymentId)
	req, err := http.NewRequest("GET", url, nil)
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
			"failed to get payment (%d): %s",
			resp.StatusCode,
			string(bodyErr),
		)
	}

	responseBody := struct {
		Status string `json:"status"`
	}{}
	err = json.NewDecoder(resp.Body).Decode(&responseBody)
	if err != nil {
		return "", err
	}

	return responseBody.Status, nil
}

func (m *MercadoPagoGetPayment) GetPaymentMock(ctx context.Context, paymentId string, token string) (string, error) {
	mockStatus := "approved" // or "pending", "rejected", etc.
	return mockStatus, nil
}
