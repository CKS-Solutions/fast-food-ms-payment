import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"

import { HTTPBadRequest, HTTPError, HTTPInternalServerError, HTTPSuccessResponse } from "@utils/http"
import { getRegion, getStage } from "@utils/env"
import { GeneratePaymentProcessorContainerFactory } from "@di/generate_payment_processor"
import { GeneratePaymentInputDTO } from "@dto/generate_payment"

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    if (!event.body) {
			throw new HTTPBadRequest("request body is required")
		}

		try {
			if (typeof event.body === 'string') {
				JSON.parse(event.body)
			}
		} catch {
			throw new HTTPBadRequest("request body is required")
		}

		const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body

    const stage = getStage()
    const region = getRegion()

    const container = new GeneratePaymentProcessorContainerFactory(region, stage)

    const res = await container.usecase.execute(body as GeneratePaymentInputDTO)

    return new HTTPSuccessResponse(res).toLambdaResponse()
  } catch (error) {
    if (error instanceof HTTPError) {
      return error.toLambdaResponse()
    }

    console.error("Unexpected error:", error)

    const genericError = new HTTPInternalServerError("Internal Server Error")
    return genericError.toLambdaResponse()
  }
}