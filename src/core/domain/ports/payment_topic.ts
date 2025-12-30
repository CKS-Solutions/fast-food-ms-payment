export interface IPaymentTopic {
	publishPaymentCreationSuccess(externalId: string, code: string): Promise<void>
	publishPaymentCreationFailure(externalId: string, reason: string): Promise<void>
	publishPaymentStatus(externalId: string, status: string): Promise<void>
}
