export interface IMercadoPagoGenerateToken {
	generateToken(): Promise<string | null>
}
