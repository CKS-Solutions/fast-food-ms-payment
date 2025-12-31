import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"

import { CheckPaymentStatusContainerFactory } from "@di/check_payment_status"
import { HTTPBadRequest, HTTPError, HTTPSuccessResponse } from "@utils/http"
import { getRegion, getStage } from "@utils/env"

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
	try {
		const externalId = event.pathParameters?.external_id
		if (!externalId) {
			throw new HTTPBadRequest("missing external_id in path parameters")
		}

		const stage = getStage()
		const region = getRegion()

		const container = new CheckPaymentStatusContainerFactory(region, stage)

		const res = await container.usecase.execute(externalId)

		return new HTTPSuccessResponse(res).toLambdaResponse()
	} catch (error) {
		if (error instanceof HTTPError) {
			return error.toLambdaResponse()
		}

		console.error("Unexpected error:", error)

		const genericError = new HTTPError("Internal Server Error", 500)
		return genericError.toLambdaResponse()
	}
}
