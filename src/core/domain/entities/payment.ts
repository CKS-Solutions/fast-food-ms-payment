import { randomUUID } from "node:crypto"
import { PaymentMethod, PaymentStatus } from "./payment.types"

export const DEFAULT_PAYMENT_EXPIRES_IN_SECONDS = 30 * 60

export class Payment {
	id: string
	external_id: string
	status: PaymentStatus
	method: PaymentMethod
	description: string
	code: string
	value: number
	expires_at: number
	created_at: number
	updated_at: number

	constructor({
		id,
		externalId,
		status,
		method,
		description,
		value,
		code,
		expiresAt,
		createdAt,
		updatedAt,
	}: {
		id: string,
		externalId: string,
		status: PaymentStatus,
		method: PaymentMethod,
		description: string,
		value: number,
		code: string,
		expiresAt: number,
		createdAt: number,
		updatedAt: number,
	}) {
		this.id = id
		this.external_id = externalId
		this.status = status
		this.method = method
		this.description = description
		this.value = value
		this.code = code
		this.expires_at = expiresAt
		this.created_at = createdAt
		this.updated_at = updatedAt
	}

	static create(externalId: string, value: number, description: string, code: string): Payment {
		return new Payment({
			id: randomUUID(),
			externalId,
			status: PaymentStatus.Pending,
			method: PaymentMethod.Pix,
			description,
			value,
			code,
			expiresAt: Date.now() + DEFAULT_PAYMENT_EXPIRES_IN_SECONDS,
			createdAt: Date.now(),
			updatedAt: Date.now(),
		})
	}
}
