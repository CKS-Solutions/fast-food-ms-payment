import { PublishCommand } from "@aws-sdk/client-sns"

import { HTTPInternalServerError } from "@utils/http"
import { IPaymentTopic } from "@ports/payment_topic"
import { SNSClientWrapper } from "@aws/sns_client"

import {
	PaymentCreationFailureMessage,
	PaymentCreationSuccessMessage,
	PaymentStatusUpdateMessage,
	PaymentTopicMessage,
	PaymentTopicType,
} from "./payment.types"

export class PaymentSNS implements IPaymentTopic {
	constructor(private client: SNSClientWrapper) {}

	private getTopicArn(): string {
		const arn = process.env.PAYMENT_TOPIC_ARN
		if (!arn) {
			throw new HTTPInternalServerError("PAYMENT_TOPIC_ARN environment variable is not set")
		}
		return arn
	}

	private async publish(input: PaymentTopicMessage): Promise<void> {
		const message = JSON.stringify(input)
		const topicArn = this.getTopicArn()

		const command = new PublishCommand({
			TopicArn: topicArn,
			Message: message,
		})

		await this.client.send(command)
	}

	async publishPaymentStatus(externalId: string, status: string): Promise<void> {
		const input: PaymentStatusUpdateMessage = {
			type: PaymentTopicType.StatusUpdate,
			external_id: externalId,
			status: status,
		}

		await this.publish(input)
	}

	async publishPaymentCreationSuccess(externalId: string, code: string): Promise<void> {
		const input: PaymentCreationSuccessMessage = {
			type: PaymentTopicType.CreationSuccess,
			external_id: externalId,
			code: code,
		}

		await this.publish(input)
	}

	async publishPaymentCreationFailure(externalId: string, reason: string): Promise<void> {
		const input: PaymentCreationFailureMessage = {
			type: PaymentTopicType.CreationFailure,
			external_id: externalId,
			reason: reason,
		}

		await this.publish(input)
	}
}