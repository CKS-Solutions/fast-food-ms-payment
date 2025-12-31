import { handler } from './update_payment_status'
import { UpdatePaymentStatusContainerFactory } from '@di/update_payment_status'
import { HTTPPreconditionFailed, HTTPStatus } from '@utils/http'

jest.mock('@di/update_payment_status', () => ({
  UpdatePaymentStatusContainerFactory: jest.fn(),
}))

describe('UpdatePaymentStatus Lambda', () => {
  const mockExecute = jest.fn()
  const containerMock = { usecase: { execute: mockExecute } }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(UpdatePaymentStatusContainerFactory as jest.Mock).mockImplementation(() => containerMock)
  })

  it('should return 400 if external_id is missing', async () => {
    const event = { body: JSON.stringify({ payment_id: 'pay-123' }) } as any
    const response = await handler(event)
    expect(response.statusCode).toBe(HTTPStatus.BadRequest)
    expect(JSON.parse(response.body)).toEqual({ message: 'missing external_id in path parameters' })
  })

  it('should return 400 if payment_id is missing', async () => {
    const event = { body: JSON.stringify({ external_id: 'ext-123' }) } as any
    const response = await handler(event)
    expect(response.statusCode).toBe(HTTPStatus.BadRequest)
    expect(JSON.parse(response.body)).toEqual({ message: 'missing payment_id in path parameters' })
  })

  it('should call usecase.execute and return 200 on success', async () => {
    const body = { external_id: 'ext-123', payment_id: 'pay-123' }
    const event = { body: JSON.stringify(body) } as any

    mockExecute.mockResolvedValue({ status: 'paid' })

    const response = await handler(event)
    expect(mockExecute).toHaveBeenCalledWith('pay-123', 'ext-123')
    expect(response.statusCode).toBe(HTTPStatus.OK)
    expect(JSON.parse(response.body)).toEqual({ data: { status: 'paid' } })
  })

  it('should return 500 on unexpected error', async () => {
    const body = { external_id: 'ext-123', payment_id: 'pay-123' }
    const event = { body: JSON.stringify(body) } as any

    mockExecute.mockRejectedValue(new Error('unexpected'))

    const response = await handler(event)
    expect(response.statusCode).toBe(500)
    expect(JSON.parse(response.body)).toEqual({ message: 'Internal Server Error' })
  })

  it('should return HTTPError response if usecase throws HTTPError', async () => {
    const body = { external_id: 'ext-123', payment_id: 'pay-123' }
    const event = { body: JSON.stringify(body) } as any

    const error = new HTTPPreconditionFailed('precondition failed')
    mockExecute.mockRejectedValue(error)

    const response = await handler(event)
    expect(response.statusCode).toBe(HTTPStatus.PreconditionFailed)
    expect(JSON.parse(response.body)).toEqual({ message: 'precondition failed' })
  })
})
