import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"

import { UpdatePaymentStatusContainerFactory } from "@di/update_payment_status"
import { HTTPBadRequest, HTTPError, HTTPSuccessResponse } from "@utils/http"
import { getRegion, getStage } from "@utils/env"

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
	try {
		console.log('event body type', typeof event.body);
		console.log('event body', event.body);
		
		const body = typeof event.body === 'string' ? JSON.parse(event.body ?? "{}") : event.body ?? {}

		const externalId = body.external_id
		if (!externalId) {
			throw new HTTPBadRequest("missing external_id in path parameters")
		}

		const paymentId = body.payment_id
		if (!paymentId) {
			throw new HTTPBadRequest("missing payment_id in path parameters")
		}

		const stage = getStage()
		const region = getRegion()

		const container = new UpdatePaymentStatusContainerFactory(region, stage)
		const res = await container.usecase.execute(paymentId, externalId)

		return new HTTPSuccessResponse(res).toLambdaResponse()
	} catch (error) {
		if (error instanceof HTTPError) {
			console.error("Handled error:", error)
			return error.toLambdaResponse()
		}

		console.error("Unexpected error:", error)

		const genericError = new HTTPError("Internal Server Error", 500)
		return genericError.toLambdaResponse()
	}
}