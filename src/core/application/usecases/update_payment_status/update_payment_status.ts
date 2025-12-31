import { IMercadoPagoGenerateToken } from "@ports/generate_token_mp"
import { HTTPNotFound, HTTPPreconditionFailed } from "@utils/http"
import { IPaymentRepository } from "@ports/payment_repository"
import { IMercadoPagoGetPayment } from "@ports/get_payment_mp"
import { PaymentStatus } from "@entities/payment.types"
import { IPaymentTopic } from "@ports/payment_topic"

export class UpdatePaymentStatusUseCase {
	private readonly paymentRepository: IPaymentRepository
	private readonly generateTokenMP: IMercadoPagoGenerateToken
	private readonly getPaymentMP: IMercadoPagoGetPayment
	private readonly paymentTopic: IPaymentTopic

	constructor(
		paymentRepository: IPaymentRepository,
		generateTokenMP: IMercadoPagoGenerateToken,
		getPaymentMP: IMercadoPagoGetPayment,
		paymentTopic: IPaymentTopic,
	) {
		this.paymentRepository = paymentRepository
		this.generateTokenMP = generateTokenMP
		this.getPaymentMP = getPaymentMP
		this.paymentTopic = paymentTopic
	}

	async execute(paymentId: string, externalId: string): Promise<void> {
		const payment = await this.paymentRepository.getByExternalId(externalId)
		if (!payment) {
			throw new HTTPNotFound("Payment not found")
		}

		const token = await this.generateTokenMP.generateToken()
		if (!token) {
			throw new HTTPPreconditionFailed("Failed to generate token")
		}

		const status = await this.getPaymentMP.getPaymentStatusMock(paymentId, token)
		if (!status) {
			throw new HTTPPreconditionFailed("Failed to get payment")
		}

		const mappedStatus = this.mapStatus(status)
		if (payment.status === mappedStatus) {
			console.info("Payment status already up to date")
			return
		}

		await this.paymentRepository.updateStatusByExternalId(externalId, mappedStatus)
		await this.paymentTopic.publishPaymentStatus(externalId, mappedStatus)
	}

	private mapStatus(status: string): PaymentStatus {
		switch (status) {
			case "pending":
			case "authorized":
			case "in_process":
				return PaymentStatus.Pending
			case "approved":
			case "in_mediation":
				return PaymentStatus.Paid
			case "cancelled":
			case "refunded":
			case "charged_back":
				return PaymentStatus.Canceled
			default:
				return PaymentStatus.Rejected
		}
	}
}