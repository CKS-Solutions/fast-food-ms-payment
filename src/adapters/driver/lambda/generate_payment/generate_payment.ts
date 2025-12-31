import { APIGatewayProxyResult, SQSEvent } from "aws-lambda"

import { HTTPError, HTTPNotFound, HTTPSuccessResponse } from "@utils/http"
import { GeneratePaymentContainerFactory } from "@di/generate_payment"
import { GeneratePaymentInputDTO } from "@dto/generate_payment"
import { getRegion, getStage } from "@utils/env"

export async function handler(event: SQSEvent): Promise<APIGatewayProxyResult> {
	try {
		if (event.Records.length === 0) {
			console.log("No SQS records received")
			throw new HTTPNotFound("No records found")
		}

		const stage = getStage()
		const region = getRegion()

		const container = new GeneratePaymentContainerFactory(region, stage)

		const record = JSON.parse(event.Records[0].body) as GeneratePaymentInputDTO
		const res = await container.usecase.execute(record)

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