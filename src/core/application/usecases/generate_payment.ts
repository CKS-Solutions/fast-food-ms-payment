import { IMercadoPagoGenerateQRCode } from "@ports/generate_qrcode_mp"
import { IMercadoPagoGenerateToken } from "@ports/generate_token_mp"
import { GeneratePaymentInputDTO } from "@dto/generate_payment"
import { IPaymentRepository } from "@ports/payment_repository"
import { PaymentStatus } from "@entities/payment.types"
import { IPaymentTopic } from "@ports/payment_topic"
import { Payment } from "@entities/payment"

export class GeneratePaymentUseCase {
	private paymentRepository: IPaymentRepository
	private generateTokenMP: IMercadoPagoGenerateToken
	private generateQRCodeMP: IMercadoPagoGenerateQRCode
	private paymentTopic: IPaymentTopic

	constructor(
		paymentRepository: IPaymentRepository,
		generateTokenMP: IMercadoPagoGenerateToken,
		generateQRCodeMP: IMercadoPagoGenerateQRCode,
		paymentTopic: IPaymentTopic,
	) {
		this.paymentRepository = paymentRepository
		this.generateTokenMP = generateTokenMP
		this.generateQRCodeMP = generateQRCodeMP
		this.paymentTopic = paymentTopic
	}

	async execute(params: GeneratePaymentInputDTO): Promise<void> {
		if (!params.external_id) {
			await this.paymentTopic.publishPaymentCreationFailure(params.external_id, "missing external ID")
			return
		}

		if (params.amount <= 0) {
			await this.paymentTopic.publishPaymentCreationFailure(params.external_id, "missing amount")
			return
		}

		if (!params.description) {
			await this.paymentTopic.publishPaymentCreationFailure(params.external_id, "missing description")
			return
		}

		const existingPayment = await this.paymentRepository.getByExternalId(params.external_id)
		if (existingPayment) {
			if (existingPayment.status === PaymentStatus.Paid) {
				await this.paymentTopic.publishPaymentCreationFailure(params.external_id, "payment already paid")
				return
			}

			if (existingPayment.expires_at > Date.now()) {
				await this.paymentTopic.publishPaymentCreationSuccess(params.external_id, existingPayment.code)
				return
			}

			await this.paymentRepository.delete(params.external_id)
		}

		const token = await this.generateTokenMP.generateToken()
		if (!token) {
			await this.paymentTopic.publishPaymentCreationFailure(params.external_id, "failed to generate MercadoPago token")
			return
		}

		const qrCode = await this.generateQRCodeMP.generateQRCode(
			params.external_id,
			params.amount,
			params.description,
			token,
		)
		if (!qrCode) {
			await this.paymentTopic.publishPaymentCreationFailure(params.external_id, "failed to generate MercadoPago QR Code")
			return
		}

		const newPayment = Payment.create(
			params.external_id,
			params.amount,
			params.description,
			qrCode,
		)

		await this.paymentRepository.create(newPayment)

		await this.paymentTopic.publishPaymentCreationSuccess(params.external_id, newPayment.code)
	}
}