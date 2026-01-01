import { SendMessageCommand } from "@aws-sdk/client-sqs";
import { SQSClientWrapper } from "@aws/sqs_client";
import { GeneratePaymentInputDTO } from "@dto/generate_payment";
import { IPaymentQueue } from "@ports/payment_queue";

export class PaymentQueue implements IPaymentQueue {
  constructor(private readonly client: SQSClientWrapper) {}

  async sendPaymentProcessingRequest(params: GeneratePaymentInputDTO): Promise<void> {
    const messageBody = JSON.stringify(params);

    const command = new SendMessageCommand({
      QueueUrl: this.getQueueUrl(),
      MessageBody: messageBody,
    });

    await this.client.send(command);
  }

  private getQueueUrl(): string {
    const url = process.env.PAYMENT_QUEUE_URL;
    if (!url) {
      throw new Error("PAYMENT_QUEUE_URL environment variable is not set");
    }

    return url;
  }
}