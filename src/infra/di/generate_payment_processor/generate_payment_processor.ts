import { SQSClientWrapper } from "@aws/sqs_client"
import { AwsRegion, AwsStage } from "@aws/utils"
import { GeneratePaymentProcessorUseCase } from "@usecases/generate_payment_processor"
import { PaymentQueue } from "@driven_sqs/payment"

export class GeneratePaymentProcessorContainerFactory {
  usecase: GeneratePaymentProcessorUseCase

  constructor(region: AwsRegion, stage: AwsStage) {
    const sqsClient = new SQSClientWrapper(region, stage)
    const paymentQueue = new PaymentQueue(sqsClient)

    this.usecase = new GeneratePaymentProcessorUseCase(paymentQueue)
  }
}