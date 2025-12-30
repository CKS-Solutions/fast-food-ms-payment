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

		switch (topic) {
			case "payment": {
				const paymentId = event.queryStringParameters?.["id"]
				const externalId = event.queryStringParameters?.["external_id"]
				if (!paymentId || !externalId) {
					console.log("Missing payment ID or external ID")
					break
				}

				await container.lambdaAdapter.invokeEvent(
					`ms-payment-${stage}-updatePaymentStatus`,
					{
						external_id: externalId,
						payment_id: paymentId,
					},
				)

				break
			}

			default:
				console.log("Unhandled topic:", topic)
		}

		
	} catch (error) {
		console.error("Unexpected error:", error)
	} finally {
		return new HTTPSuccessResponse(null).toLambdaResponse()
	}
}
