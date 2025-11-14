package dto

type GeneratePaymentInputDTO struct {
	Description string  `json:"description"`
	ExternalId  string  `json:"external_id"`
	Amount      float64 `json:"amount"`
}

type GeneratePaymentOutputDTO struct {
	Code string `json:"code"`
}
