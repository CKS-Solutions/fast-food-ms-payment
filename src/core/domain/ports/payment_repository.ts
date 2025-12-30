import { Payment } from "@entities/payment"

export interface IPaymentRepository {
	getByExternalId(externalId: string): Promise<Payment | null>
	create(payment: Payment): Promise<void>
	delete(externalId: string): Promise<void>
	updateStatusByExternalId(externalId: string, status: string): Promise<void>
}
