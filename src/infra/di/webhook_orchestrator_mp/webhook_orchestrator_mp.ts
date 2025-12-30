import { LambdaAdapter } from "@driven_lambda/lambda"
import { LambdaClientWrapper } from "@aws/lambda_client"
import { AwsRegion, AwsStage } from "@aws/utils"

export class WebhookOrchestratorMPContainerFactory {
	lambdaAdapter: LambdaAdapter

	constructor(region: AwsRegion, stage: AwsStage) {
		const client = new LambdaClientWrapper(region, stage)

		this.lambdaAdapter = new LambdaAdapter(client)
	}
}