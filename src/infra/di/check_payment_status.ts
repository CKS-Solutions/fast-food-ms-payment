import { CheckPaymentStatusUseCase } from "@usecases/check_payment_status"
import { PaymentRepository } from "@driven_dynamodb/payment_repository"
import { DynamoDBClientWrapper } from "@aws/dynamodb_client"
import { AwsRegion, AwsStage } from "@aws/utils"

export class CheckPaymentStatusContainerFactory {
	usecase: CheckPaymentStatusUseCase

	constructor(region: AwsRegion, stage: AwsStage) {
		const dynamoClient = new DynamoDBClientWrapper(region, stage)
		const paymentRepo = new PaymentRepository(dynamoClient)

		this.usecase = new CheckPaymentStatusUseCase(paymentRepo)
	}
}