import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"

import { WebhookOrchestratorMPContainerFactory } from "@di/webhook_orchestrator_mp"
import { HTTPSuccessResponse } from "@utils/http"
import { getRegion, getStage } from "@utils/env"

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
	try {
		const topic = event.queryStringParameters?.["topic"]

		const stage = getStage()
		const region = getRegion()

		const container = new WebhookOrchestratorMPContainerFactory(region, stage)

		if (topic === 'payment') {
			const paymentId = event.queryStringParameters?.["id"]
			const externalId = event.queryStringParameters?.["external_id"]
			if (!paymentId || !externalId) {
				console.log("Missing payment ID or external ID")
				return new HTTPSuccessResponse(null).toLambdaResponse()
			}

			await container.lambdaAdapter.invokeEvent(
				`ms-payment-${stage}-updatePaymentStatus`,
				{
					external_id: externalId,
					payment_id: paymentId,
				},
			)

			return new HTTPSuccessResponse(null).toLambdaResponse()
		}

		console.log("Unhandled topic:", topic)
		return new HTTPSuccessResponse(null).toLambdaResponse()
	} catch (error) {
		console.error("Unexpected error:", error)
		return new HTTPSuccessResponse(null).toLambdaResponse()
	}
}
