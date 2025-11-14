package driven_mercadopago

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/secretsmanager"
	"github.com/fiap/ms-payment/internal/core/domain/ports"
	infra_aws "github.com/fiap/ms-payment/internal/infra/aws"
)

type MercadoPagoGenerateToken struct {
	smClient *infra_aws.SMClient
}

type GenerateTokenBody struct {
	GrantType    string `json:"grant_type"`
	ClientID     string `json:"client_id"`
	ClientSecret string `json:"client_secret"`
}

func NewMercadoPagoGenerateToken(smClient *infra_aws.SMClient) ports.MercadoPagoGenerateToken {
	return &MercadoPagoGenerateToken{smClient: smClient}
}

func (m *MercadoPagoGenerateToken) GenerateToken(ctx context.Context) (string, error) {
	clientId, clientSecret, err := m.getCredentials(ctx)
	if err != nil {
		return "", err
	}

	data := url.Values{}
	data.Set("grant_type", "client_credentials")
	data.Set("client_id", clientId)
	data.Set("client_secret", clientSecret)

	url := fmt.Sprintf("%s/oauth/token", BASE_URL)
	request, err := http.NewRequest("POST", url, strings.NewReader(data.Encode()))
	if err != nil {
		return "", err
	}

	request.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	resp, err := http.DefaultClient.Do(request)
	if err != nil {
		return "", err
	}

	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode > 299 {
		bodyErr, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf(
			"failed to generate token (%d): %s",
			resp.StatusCode,
			string(bodyErr),
		)
	}

	responseBody := struct {
		AccessToken string `json:"access_token"`
	}{}
	err = json.NewDecoder(resp.Body).Decode(&responseBody)
	if err != nil {
		return "", err
	}

	return responseBody.AccessToken, nil
}

func (m *MercadoPagoGenerateToken) getCredentials(ctx context.Context) (string, string, error) {
	out, err := m.smClient.GetSecretValue(ctx, &secretsmanager.GetSecretValueInput{
		SecretId: aws.String(CREDENTIALS_SECRET_ID),
	})
	if err != nil {
		return "", "", err
	}

	var payload struct {
		ClientID     string `json:"clientId"`
		ClientSecret string `json:"clientSecret"`
	}

	if err := json.Unmarshal([]byte(*out.SecretString), &payload); err != nil {
		return "", "", fmt.Errorf("invalid secret value JSON: %w", err)
	}

	return payload.ClientID, payload.ClientSecret, nil
}
