package di

import infra_aws "github.com/fiap/ms-payment/internal/infra/aws"

type WebhookOrchestratorMPContainer struct {
	LambdaClient *infra_aws.LambdaClient
}

func NewWebhookOrchestratorMPContainer(region infra_aws.AwsRegion, stage infra_aws.AwsStage) *WebhookOrchestratorMPContainer {
	lambdaClient := infra_aws.NewLambdaClient(region, stage)
	return &WebhookOrchestratorMPContainer{
		LambdaClient: lambdaClient,
	}
}
