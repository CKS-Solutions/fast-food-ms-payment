export interface IMercadoPagoGenerateQRCode {
	generateQRCode(paymentId: string, amount: number, description: string, token: string): Promise<string|null>;
}
