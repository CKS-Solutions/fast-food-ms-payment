import { HTTPInternalServerError } from '@utils/http'
import { PaymentTopicType } from './payment.types'

jest.mock('@aws-sdk/client-sns', () => ({
  PublishCommand: jest.fn().mockImplementation((params) => params),
}))

jest.mock('@aws/sns_client', () => ({
  SNSClientWrapper: jest.fn(),
}))

import { PaymentSNS } from './payment'

describe('PaymentSNS', () => {
  let client: any
  let sns: PaymentSNS

  beforeEach(() => {
    client = { send: jest.fn().mockResolvedValue({}) }
    process.env.PAYMENT_TOPIC_ARN = 'arn:aws:sns:us-east-1:123456789012:CKSPaymentTopic'
    sns = new PaymentSNS(client)
    jest.clearAllMocks()
  })

  afterEach(() => {
    delete process.env.PAYMENT_TOPIC_ARN
  })

  it('should throw if PAYMENT_TOPIC_ARN is not set', async () => {
    delete process.env.PAYMENT_TOPIC_ARN
    const snsNoEnv = new PaymentSNS(client)
    await expect(snsNoEnv.publishPaymentStatus('ext-1', 'pending'))
      .rejects.toBeInstanceOf(HTTPInternalServerError)
  })

  it('should publish payment status update', async () => {
    await sns.publishPaymentStatus('ext-1', 'pending')

    expect(client.send).toHaveBeenCalledTimes(1)
    const cmd = client.send.mock.calls[0][0]
    expect(cmd.TopicArn).toBe(process.env.PAYMENT_TOPIC_ARN)
    const msg = JSON.parse(cmd.Message)
    expect(msg).toEqual({
      type: PaymentTopicType.StatusUpdate,
      external_id: 'ext-1',
      status: 'pending',
    })
  })

  it('should publish payment creation success', async () => {
    await sns.publishPaymentCreationSuccess('ext-2', 'CODE123')

    expect(client.send).toHaveBeenCalledTimes(1)
    const cmd = client.send.mock.calls[0][0]
    const msg = JSON.parse(cmd.Message)
    expect(msg).toEqual({
      type: PaymentTopicType.CreationSuccess,
      external_id: 'ext-2',
      code: 'CODE123',
    })
  })

  it('should publish payment creation failure', async () => {
    await sns.publishPaymentCreationFailure('ext-3', 'reason')

    expect(client.send).toHaveBeenCalledTimes(1)
    const cmd = client.send.mock.calls[0][0]
    const msg = JSON.parse(cmd.Message)
    expect(msg).toEqual({
      type: PaymentTopicType.CreationFailure,
      external_id: 'ext-3',
      reason: 'reason',
    })
  })
})
