import { CheckPaymentStatusOutputDTO } from "@dto/check_payment_status"
import { IPaymentRepository } from "@ports/payment_repository"
import { HTTPNotFound } from "@utils/http"

export class CheckPaymentStatusUseCase {
	private readonly paymentRepository: IPaymentRepository

	constructor(paymentRepository: IPaymentRepository) {
		this.paymentRepository = paymentRepository
	}

	async execute(externalId: string): Promise<CheckPaymentStatusOutputDTO> {
		const payment = await this.paymentRepository.getByExternalId(externalId)
		if (!payment) {
			throw new HTTPNotFound("Payment not found")
		}

		return {
			status: payment.status,
		}
	}
}