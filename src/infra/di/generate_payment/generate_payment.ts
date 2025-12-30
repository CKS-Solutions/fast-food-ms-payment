import { MercadoPagoGenerateQRCode } from "@driven_mercadopago/generate_qrcode"
import { MercadoPagoGenerateToken } from "@driven_mercadopago/generate_token"
import { PaymentRepository } from "@driven_dynamodb/payment_repository"
import { GeneratePaymentUseCase } from "@usecases/generate_payment"
import { DynamoDBClientWrapper } from "@aws/dynamodb_client"
import { SNSClientWrapper } from "@aws/sns_client"
import { AwsRegion, AwsStage } from "@aws/utils"
import { SMClientWrapper } from "@aws/sm_client"
import { PaymentSNS } from "@driven_sns/payment"

export class GeneratePaymentContainerFactory {
	usecase: GeneratePaymentUseCase

	constructor(region: AwsRegion, stage: AwsStage) {
		const dynamoClient = new DynamoDBClientWrapper(region, stage)
		const smClient = new SMClientWrapper(region, stage)
		const snsClient = new SNSClientWrapper(region, stage)

		const paymentRepo = new PaymentRepository(dynamoClient)
		const generateTokenMP = new MercadoPagoGenerateToken(smClient)
		const generateQRCodeMP = new MercadoPagoGenerateQRCode(smClient)
		const paymentTopic = new PaymentSNS(snsClient)

		this.usecase = new GeneratePaymentUseCase(paymentRepo, generateTokenMP, generateQRCodeMP, paymentTopic)
	}
}
