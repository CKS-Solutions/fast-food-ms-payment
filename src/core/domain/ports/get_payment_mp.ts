export interface IMercadoPagoGetPayment {
	getPaymentStatus(paymentId: string, token: string): Promise<string>;
	getPaymentStatusMock(paymentId: string, token: string): Promise<string>;
}
