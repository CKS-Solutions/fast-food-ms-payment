import { MercadoPagoGenerateToken } from "@driven_mercadopago/generate_token"
import { UpdatePaymentStatusUseCase } from "@usecases/update_payment_status"
import { PaymentRepository } from "@driven_dynamodb/payment_repository"
import { MercadoPagoGetPayment } from "@driven_mercadopago/get_payment"
import { DynamoDBClientWrapper } from "@aws/dynamodb_client"
import { SNSClientWrapper } from "@aws/sns_client"
import { AwsRegion, AwsStage } from "@aws/utils"
import { SMClientWrapper } from "@aws/sm_client"
import { PaymentSNS } from "@driven_sns/payment"

export class UpdatePaymentStatusContainerFactory {
	usecase: UpdatePaymentStatusUseCase

	constructor(region: AwsRegion, stage: AwsStage) {
		const dynamoClient = new DynamoDBClientWrapper(region, stage)
		const smClient = new SMClientWrapper(region, stage)
		const snsClient = new SNSClientWrapper(region, stage)

		const paymentRepo = new PaymentRepository(dynamoClient)
		const generateTokenMP = new MercadoPagoGenerateToken(smClient)
		const getPaymentMP = new MercadoPagoGetPayment()
		const notificationService = new PaymentSNS(snsClient)

		this.usecase = new UpdatePaymentStatusUseCase(
			paymentRepo,
			generateTokenMP,
			getPaymentMP,
			notificationService,
		)
	}
}
