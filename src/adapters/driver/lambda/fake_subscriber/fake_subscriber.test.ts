import { handler } from './fake_subscriber'
import { HTTPStatus } from '@utils/http'

describe('FakeSubscriber Lambda', () => {
  let consoleLogSpy: jest.SpyInstance
  let consoleErrorSpy: jest.SpyInstance

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should process valid SNS message', async () => {
    const event = {
      Records: [
        {
          Sns: {
            MessageId: 'msg-1',
            TopicArn: 'arn:aws:sns:us-east-1:123456789012:TestTopic',
            Message: JSON.stringify({ foo: 'bar' }),
          },
        },
      ],
    } as any

    const response = await handler(event)
    expect(response.statusCode).toBe(HTTPStatus.OK)
    expect(JSON.parse(response.body)).toEqual({ data: { message: 'Processed SNS messages' } })

    expect(consoleLogSpy).toHaveBeenCalledWith('MessageId:', 'msg-1')
    expect(consoleLogSpy).toHaveBeenCalledWith('TopicArn:', 'arn:aws:sns:us-east-1:123456789012:TestTopic')
    expect(consoleLogSpy).toHaveBeenCalledWith('Message:', '{"foo":"bar"}')
    expect(consoleLogSpy).toHaveBeenCalledWith('Payload parseado:', { foo: 'bar' })
  })

  it('should log error if SNS message is not valid JSON', async () => {
    const event = {
      Records: [
        {
          Sns: {
            MessageId: 'msg-2',
            TopicArn: 'arn:aws:sns:us-east-1:123456789012:TestTopic',
            Message: 'not-json',
          },
        },
      ],
    } as any

    const response = await handler(event)
    expect(response.statusCode).toBe(HTTPStatus.OK)
    expect(consoleErrorSpy).toHaveBeenCalledWith('Erro ao parsear a mensagem SNS como JSON')
  })
})
