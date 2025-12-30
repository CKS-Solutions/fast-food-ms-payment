import { GetCommand, PutCommand, DeleteCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb"

import { IPaymentRepository } from "@ports/payment_repository"
import { DynamoDBClientWrapper } from "@aws/dynamodb_client"
import { Payment } from "@entities/payment"

const TABLE_NAME = "CKS.Payments"

export class PaymentRepository implements IPaymentRepository {
	client: DynamoDBClientWrapper

	constructor(client: DynamoDBClientWrapper) {
		this.client = client
	}

	async getByExternalId(externalId: string): Promise<Payment | null> {
		const command = new GetCommand({
			TableName: TABLE_NAME,
			Key: {
				external_id: externalId,
			},
		})

		const { Item } = await this.client.send(command)

		if (!Item) {
			return null
		}

		return Item as Payment
	}

	async create(payment: Payment): Promise<void> {
		const command = new PutCommand({
			TableName: TABLE_NAME,
			Item: payment,
		})

		await this.client.send(command)
	}

	async delete(externalId: string): Promise<void> {
		const command = new DeleteCommand({
			TableName: TABLE_NAME,
			Key: {
				external_id: externalId,
			},
		})
		
		await this.client.send(command)
	}

	async updateStatusByExternalId(externalId: string, status: string): Promise<void> {
		const command = new UpdateCommand({
			TableName: TABLE_NAME,
			Key: {
				external_id: externalId,
			},
			UpdateExpression: "SET #s = :status",
			ExpressionAttributeNames: {
				"#s": "status",
			},
			ExpressionAttributeValues: {
				":status": status,
			},
		})

		await this.client.send(command)
	}
}