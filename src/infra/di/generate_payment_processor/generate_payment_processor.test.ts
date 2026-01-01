import { GeneratePaymentProcessorContainerFactory } from './generate_payment_processor'
import { AwsRegion, AwsStage } from '@aws/utils'

jest.mock('@aws/sqs_client', () => ({
  SQSClientWrapper: jest.fn(),
}))

jest.mock('@driven_sqs/payment', () => ({
  PaymentQueue: jest.fn(),
}))

jest.mock('@usecases/generate_payment_processor', () => ({
  GeneratePaymentProcessorUseCase: jest.fn(),
}))

import { GeneratePaymentProcessorUseCase } from '@usecases/generate_payment_processor'
import { SQSClientWrapper } from '@aws/sqs_client'
import { PaymentQueue } from '@driven_sqs/payment'

describe('GeneratePaymentProcessorContainerFactory', () => {
  const region = AwsRegion.USEast1
  const stage = AwsStage.Local

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should correctly wire all dependencies and expose usecase', () => {
    const factory = new GeneratePaymentProcessorContainerFactory(region, stage)

    expect(SQSClientWrapper).toHaveBeenCalledWith(region, stage)

    const sqsClient = (SQSClientWrapper as jest.Mock).mock.instances[0]

    expect(PaymentQueue).toHaveBeenCalledWith(sqsClient)

    const paymentQueue = (PaymentQueue as jest.Mock).mock.instances[0]

    expect(GeneratePaymentProcessorUseCase).toHaveBeenCalledWith(paymentQueue)

    expect(factory.usecase).toBe(
      (GeneratePaymentProcessorUseCase as jest.Mock).mock.instances[0]
    )
  })
})

