import { GeneratePaymentInputDTO } from "@dto/generate_payment";

export interface IPaymentQueue {
  sendPaymentProcessingRequest(params: GeneratePaymentInputDTO): Promise<void>
}