import { handler } from './webhook_orchestrator_mp'
import { WebhookOrchestratorMPContainerFactory } from '@di/webhook_orchestrator_mp'

jest.mock('@di/webhook_orchestrator_mp', () => ({
  WebhookOrchestratorMPContainerFactory: jest.fn(),
}))

describe('WebhookOrchestratorMP Lambda', () => {
  const mockInvokeEvent = jest.fn()
  const containerMock = { lambdaAdapter: { invokeEvent: mockInvokeEvent } }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(WebhookOrchestratorMPContainerFactory as jest.Mock).mockImplementation(() => containerMock)
  })

  it('should invoke updatePaymentStatus Lambda when topic=payment', async () => {
    const event = {
      queryStringParameters: {
        topic: 'payment',
        id: 'pay-123',
        external_id: 'ext-123',
      },
    } as any

    const response = await handler(event)

    expect(mockInvokeEvent).toHaveBeenCalledWith(
      'ms-payment-local-updatePaymentStatus',
      { payment_id: 'pay-123', external_id: 'ext-123' }
    )
    expect(response.statusCode).toBe(200)
  })

  it('should handle missing payment ID or external ID', async () => {
    const event = {
      queryStringParameters: {
        topic: 'payment',
      },
    } as any

    const response = await handler(event)
    expect(mockInvokeEvent).not.toHaveBeenCalled()
    expect(response.statusCode).toBe(200)
  })

  it('should handle unhandled topic gracefully', async () => {
    const event = {
      queryStringParameters: {
        topic: 'other',
      },
    } as any

    const response = await handler(event)
    expect(mockInvokeEvent).not.toHaveBeenCalled()
    expect(response.statusCode).toBe(200)
  })

  it('should handle unexpected errors gracefully', async () => {
    const event = {
      queryStringParameters: {
        topic: 'payment',
        id: 'pay-123',
        external_id: 'ext-123',
      },
    } as any

    mockInvokeEvent.mockRejectedValue(new Error('unexpected'))

    const response = await handler(event)
    expect(response.statusCode).toBe(200)
  })
})
