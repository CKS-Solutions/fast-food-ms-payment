import { handler } from './generate_payment'
import { GeneratePaymentContainerFactory } from '@di/generate_payment'
import { HTTPStatus } from '@utils/http'

jest.mock('@di/generate_payment', () => ({
  GeneratePaymentContainerFactory: jest.fn(),
}))

describe('GeneratePayment Lambda', () => {
  const mockExecute = jest.fn()
  const containerMock = { usecase: { execute: mockExecute } }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(GeneratePaymentContainerFactory as jest.Mock).mockImplementation(() => containerMock)
  })

  it('should return 404 if no SQS records', async () => {
    const event = { Records: [] } as any
    const response = await handler(event)
    expect(response.statusCode).toBe(HTTPStatus.NotFound)
    expect(JSON.parse(response.body)).toEqual({ message: 'No records found' })
  })

  it('should process SQS record and return 200 on success', async () => {
    const recordBody = { external_id: 'ext-123', amount: 100, description: 'Test' }
    const event = { Records: [{ body: JSON.stringify(recordBody) }] } as any

    mockExecute.mockResolvedValue({ foo: 'bar' })

    const response = await handler(event)
    expect(mockExecute).toHaveBeenCalledWith(recordBody)
    expect(response.statusCode).toBe(HTTPStatus.OK)
    expect(JSON.parse(response.body)).toEqual({ data: { foo: 'bar' } })
  })

  it('should return 500 on unexpected error', async () => {
    const recordBody = { external_id: 'ext-123', amount: 100, description: 'Test' }
    const event = { Records: [{ body: JSON.stringify(recordBody) }] } as any

    mockExecute.mockRejectedValue(new Error('unexpected'))

    const response = await handler(event)
    expect(response.statusCode).toBe(500)
    expect(JSON.parse(response.body)).toEqual({ message: 'Internal Server Error' })
  })
})
