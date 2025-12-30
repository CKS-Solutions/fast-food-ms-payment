type GenerateQRCodeBodyItem = {
	title: string
	description: string
	unit_price: number
	quantity: number
	total_amount: number
	unit_measure: string
}

export type GenerateQRCodeBody = {
	external_reference: string
	title: string
	description: string
	total_amount: number
	expiration_date: string
	items: GenerateQRCodeBodyItem[]
	notification_url?: string
}

export type GenerateQRCodeInfo = {
  userId: string
  posId: string
}

export type GenerateQRCodeResponse = {
  qr_data: string
}