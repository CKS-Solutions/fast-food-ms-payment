import { handler } from './generate_payment_processor'
import { GeneratePaymentProcessorContainerFactory } from '@di/generate_payment_processor'
import { HTTPBadRequest, HTTPStatus } from '@utils/http'
import { APIGatewayProxyEvent } from 'aws-lambda'

jest.mock('@di/generate_payment_processor', () => ({
  GeneratePaymentProcessorContainerFactory: jest.fn(),
}))

describe('GeneratePaymentProcessor Lambda', () => {
  const mockExecute = jest.fn()
  const containerMock = { usecase: { execute: mockExecute } }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(GeneratePaymentProcessorContainerFactory as jest.Mock).mockImplementation(() => containerMock)
  })

  it('should return 400 if request body is missing', async () => {
    const event = { body: null } as APIGatewayProxyEvent
    const response = await handler(event)
    expect(response.statusCode).toBe(HTTPStatus.BadRequest)
    expect(JSON.parse(response.body)).toEqual({ message: 'request body is required' })
  })

  it('should return 400 if request body is invalid', async () => {
    const event = { body: "invalid-json" } as APIGatewayProxyEvent
    const response = await handler(event)
    expect(response.statusCode).toBe(HTTPStatus.BadRequest)
    expect(JSON.parse(response.body)).toEqual({ message: 'request body is required' })
  })

  it('should return 400 if amount is missing or invalid', async () => {
    const body = { description: 'Test', external_id: 'ext-123' }
    const event = { body: JSON.stringify(body) } as APIGatewayProxyEvent
    const error = new HTTPBadRequest("Amount must be greater than zero")
    mockExecute.mockRejectedValue(error)

    const response = await handler(event)
    expect(response.statusCode).toBe(HTTPStatus.BadRequest)
    expect(JSON.parse(response.body)).toEqual({ message: 'Amount must be greater than zero' })
  })

  it('should return 400 if description is missing', async () => {
    const body = { amount: 100, external_id: 'ext-123' }
    const event = { body: JSON.stringify(body) } as APIGatewayProxyEvent
    const error = new HTTPBadRequest("Description is required")
    mockExecute.mockRejectedValue(error)

    const response = await handler(event)
    expect(response.statusCode).toBe(HTTPStatus.BadRequest)
    expect(JSON.parse(response.body)).toEqual({ message: 'Description is required' })
  })

  it('should return 400 if external_id is missing', async () => {
    const body = { amount: 100, description: 'Test' }
    const event = { body: JSON.stringify(body) } as APIGatewayProxyEvent
    const error = new HTTPBadRequest("External ID is required")
    mockExecute.mockRejectedValue(error)

    const response = await handler(event)
    expect(response.statusCode).toBe(HTTPStatus.BadRequest)
    expect(JSON.parse(response.body)).toEqual({ message: 'External ID is required' })
  })

  it('should process valid request and return 200 on success', async () => {
    const body = { amount: 100, description: 'Test', external_id: 'ext-123' }
    const event = { body: JSON.stringify(body) } as APIGatewayProxyEvent
    mockExecute.mockResolvedValue({ foo: 'bar' })

    const response = await handler(event)
    expect(mockExecute).toHaveBeenCalledWith(body)
    expect(response.statusCode).toBe(HTTPStatus.OK)
    expect(JSON.parse(response.body)).toEqual({ data: { foo: 'bar' } })
  })

  it('should process valid request with body as object and return 200 on success', async () => {
    const body = { amount: 100, description: 'Test', external_id: 'ext-123' }
    const event = { body: body } as unknown as APIGatewayProxyEvent
    mockExecute.mockResolvedValue({ foo: 'bar' })
    const response = await handler(event)
    expect(mockExecute).toHaveBeenCalledWith(body)
    expect(response.statusCode).toBe(HTTPStatus.OK)
    expect(JSON.parse(response.body)).toEqual({ data: { foo: 'bar' } })
  })

  it('should return 500 on unexpected error', async () => {
    const recordBody = { external_id: 'ext-123', amount: 100, description: 'Test' }
    const event = { body: JSON.stringify(recordBody) } as APIGatewayProxyEvent

    mockExecute.mockRejectedValue(new Error('unexpected'))

    const response = await handler(event)
    expect(response.statusCode).toBe(500)
    expect(JSON.parse(response.body)).toEqual({ message: 'Internal Server Error' })
  })
})
