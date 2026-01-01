import { GeneratePaymentInputDTO } from "@dto/generate_payment";
import { IPaymentQueue } from "@ports/payment_queue";
import { HTTPBadRequest } from "@utils/http";

export class GeneratePaymentProcessorUseCase {
  private readonly paymentQueue: IPaymentQueue;

  constructor(paymentQueue: IPaymentQueue) {
    this.paymentQueue = paymentQueue;
  }

  async execute(params: GeneratePaymentInputDTO): Promise<{ message: string }> {
    if (!params.amount || params.amount <= 0) {
      throw new HTTPBadRequest("Amount must be greater than zero");
    }

    if (!params.description || params.description.trim() === "") {
      throw new HTTPBadRequest("Description is required");
    }

    if (!params.external_id || String(params.external_id).trim() === "") {
      throw new HTTPBadRequest("External ID is required");
    }

    await this.paymentQueue.sendPaymentProcessingRequest(params);

    return {
      message: "Payment processing request queued successfully",
    }
  }
}