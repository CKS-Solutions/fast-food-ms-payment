import { CheckPaymentStatusContainerFactory } from '@di/check_payment_status'
import { handler } from './check_payment_status'
import { HTTPNotFound, HTTPStatus } from '@utils/http'

jest.mock('@di/check_payment_status', () => ({
  CheckPaymentStatusContainerFactory: jest.fn(),
}))

describe('CheckPaymentStatus Lambda', () => {
  const mockExecute = jest.fn()
  const containerMock = { usecase: { execute: mockExecute } }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(CheckPaymentStatusContainerFactory as jest.Mock).mockImplementation(() => containerMock)
  })

  it('should return 400 if external_id is missing', async () => {
    const event = { pathParameters: {} } as any

    const response = await handler(event)
    expect(response.statusCode).toBe(HTTPStatus.BadRequest)
    expect(JSON.parse(response.body)).toEqual({ message: 'missing external_id in path parameters' })
  })

  it('should call usecase.execute and return 200 on success', async () => {
    const event = { pathParameters: { external_id: 'ext-123' } } as any
    mockExecute.mockResolvedValue({ status: 'paid' })

    const response = await handler(event)
    expect(mockExecute).toHaveBeenCalledWith('ext-123')
    expect(response.statusCode).toBe(HTTPStatus.OK)
    expect(JSON.parse(response.body)).toEqual({ data: { status: 'paid' } })
  })

  it('should return error response if usecase throws HTTPError', async () => {
    const event = { pathParameters: { external_id: 'ext-123' } } as any
    const error = new HTTPNotFound('not found')
    mockExecute.mockRejectedValue(error)

    const response = await handler(event)
    expect(response.statusCode).toBe(HTTPStatus.NotFound)
    expect(JSON.parse(response.body)).toEqual({ message: 'not found' })
  })

  it('should return 500 if unknown error occurs', async () => {
    const event = { pathParameters: { external_id: 'ext-123' } } as any
    mockExecute.mockRejectedValue(new Error('unexpected'))

    const response = await handler(event)
    expect(response.statusCode).toBe(500)
    expect(JSON.parse(response.body)).toEqual({ message: 'Internal Server Error' })
  })
})
