import { SQSClientWrapper } from '@aws/sqs_client'
import { GeneratePaymentInputDTO } from '@dto/generate_payment'

jest.mock('@aws-sdk/client-sqs', () => ({
  SendMessageCommand: jest.fn().mockImplementation((params) => params),
}))

jest.mock('@aws/sqs_client', () => ({
  SQSClientWrapper: jest.fn(),
}))

import { PaymentQueue } from './payment'

describe('PaymentQueue', () => {
  let sqsClient: jest.Mocked<SQSClientWrapper>
  let paymentQueue: PaymentQueue

  beforeEach(() => {
    sqsClient = {
      send: jest.fn().mockResolvedValue({}),
    } as any

    paymentQueue = new PaymentQueue(sqsClient)

    process.env.PAYMENT_QUEUE_URL = 'https://sqs.aws/queue-url'
  })

  afterEach(() => {
    delete process.env.PAYMENT_QUEUE_URL
    jest.clearAllMocks()
  })

  describe('when PAYMENT_QUEUE_URL is not set', () => {
    it('should throw an error', async () => {
      delete process.env.PAYMENT_QUEUE_URL

      const params = {} as GeneratePaymentInputDTO

      await expect(
        paymentQueue.sendPaymentProcessingRequest(params),
      ).rejects.toThrow('PAYMENT_QUEUE_URL environment variable is not set')

      expect(sqsClient.send).not.toHaveBeenCalled()
    })
  })

  describe('when input is valid', () => {
    it('should send a message to SQS with correct payload', async () => {
      const params: GeneratePaymentInputDTO = {
        amount: 100,
        description: 'Payment description',
        external_id: 'ext-123',
      }

      await paymentQueue.sendPaymentProcessingRequest(params)

      expect(sqsClient.send).toHaveBeenCalledTimes(1)

      const command = (sqsClient.send as jest.Mock).mock.calls[0][0]

      expect(command.QueueUrl).toBe(process.env.PAYMENT_QUEUE_URL)
      expect(command.MessageBody).toBe(JSON.stringify(params))
    })
  })
})
