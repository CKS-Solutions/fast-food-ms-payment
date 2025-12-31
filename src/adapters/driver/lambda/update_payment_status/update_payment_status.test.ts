import { handler } from './update_payment_status'
import { UpdatePaymentStatusContainerFactory } from '@di/update_payment_status'
import { HTTPPreconditionFailed, HTTPStatus } from '@utils/http'

jest.mock('@di/update_payment_status', () => ({
  UpdatePaymentStatusContainerFactory: jest.fn(),
}))

describe('UpdatePaymentStatus Lambda', () => {
  let mockExecute: jest.Mock
  let containerMock: any

  beforeEach(() => {
    jest.clearAllMocks()
    mockExecute = jest.fn()
    containerMock = { usecase: { execute: mockExecute } }
    ;(UpdatePaymentStatusContainerFactory as jest.Mock).mockImplementation(() => containerMock)
  })

  describe('when body is missing or invalid', () => {
    test.each([
      { description: 'body is empty string', body: '' },
      { description: 'body is undefined', body: undefined },
      { description: 'body is invalid JSON', body: '{invalidJson}' },
    ])('should return 400 $description', async ({ body }) => {
      const event = { body } as any
      const response = await handler(event)
      expect(response.statusCode).toBe(HTTPStatus.BadRequest)
      expect(JSON.parse(response.body)).toEqual({ message: 'request body is required' })
    })
  })

  describe('when external_id is missing', () => {
    it('should return 400 BadRequest', async () => {
      const event = { body: JSON.stringify({ payment_id: 'pay-123' }) } as any
      const response = await handler(event)
      expect(response.statusCode).toBe(HTTPStatus.BadRequest)
      expect(JSON.parse(response.body)).toEqual({ message: 'missing external_id in path parameters' })
    })
  })

  describe('when payment_id is missing', () => {
    it('should return 400 BadRequest', async () => {
      const event = { body: JSON.stringify({ external_id: 'ext-123' }) } as any
      const response = await handler(event)
      expect(response.statusCode).toBe(HTTPStatus.BadRequest)
      expect(JSON.parse(response.body)).toEqual({ message: 'missing payment_id in path parameters' })
    })
  })

  describe('when body is valid', () => {
    const body = { external_id: 'ext-123', payment_id: 'pay-123' }

    describe('and body is object', () => {
      it('should call usecase.execute and return 200 OK', async () => {
        const event = { body } as any
        mockExecute.mockResolvedValue({ status: 'paid' })

        const response = await handler(event)

        expect(mockExecute).toHaveBeenCalledWith('pay-123', 'ext-123')
        expect(response.statusCode).toBe(HTTPStatus.OK)
        expect(JSON.parse(response.body)).toEqual({ data: { status: 'paid' } })
      })
    })

    describe('and body is JSON string', () => {
      it('should call usecase.execute and return 200 OK', async () => {
        const event = { body: JSON.stringify(body) } as any
        mockExecute.mockResolvedValue({ status: 'paid' })

        const response = await handler(event)

        expect(mockExecute).toHaveBeenCalledWith('pay-123', 'ext-123')
        expect(response.statusCode).toBe(HTTPStatus.OK)
      })
    })
  })

  describe('when usecase throws an error', () => {
    const body = { external_id: 'ext-123', payment_id: 'pay-123' }
    const event = { body: JSON.stringify(body) } as any

    describe('and error is HTTPError', () => {
      it('should return HTTPError response', async () => {
        const error = new HTTPPreconditionFailed('precondition failed')
        mockExecute.mockRejectedValue(error)

        const response = await handler(event)
        expect(response.statusCode).toBe(HTTPStatus.PreconditionFailed)
        expect(JSON.parse(response.body)).toEqual({ message: 'precondition failed' })
      })
    })

    describe('and error is unexpected', () => {
      it('should return 500 Internal Server Error', async () => {
        mockExecute.mockRejectedValue(new Error('unexpected'))

        const response = await handler(event)
        expect(response.statusCode).toBe(500)
        expect(JSON.parse(response.body)).toEqual({ message: 'Internal Server Error' })
      })
    })
  })
})
