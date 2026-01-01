import { GeneratePaymentProcessorUseCase } from './generate_payment_processor'
import { IPaymentQueue } from '@ports/payment_queue'
import { HTTPBadRequest } from '@utils/http'
import { GeneratePaymentInputDTO } from '@dto/generate_payment'

describe('GeneratePaymentProcessorUseCase', () => {
  let paymentQueue: jest.Mocked<IPaymentQueue>
  let usecase: GeneratePaymentProcessorUseCase

  beforeEach(() => {
    paymentQueue = {
      sendPaymentProcessingRequest: jest.fn(),
    }

    usecase = new GeneratePaymentProcessorUseCase(paymentQueue)
  })

  describe('when amount is invalid', () => {
    test.each([
      { amount: 0 },
      { amount: -10 },
      { amount: undefined },
    ])('should throw BadRequest for amount: $amount', async ({ amount }) => {
      const params = {
        amount,
        description: 'Payment description',
        external_id: 'ext-123',
      } as GeneratePaymentInputDTO

      await expect(usecase.execute(params)).rejects.toBeInstanceOf(HTTPBadRequest)
      await expect(usecase.execute(params)).rejects.toThrow('Amount must be greater than zero')
    })
  })

  describe('when description is invalid', () => {
    test.each([
      { description: '' },
      { description: '   ' },
      { description: undefined },
    ])('should throw BadRequest for description: "$description"', async ({ description }) => {
      const params = {
        amount: 100,
        description,
        external_id: 'ext-123',
      } as GeneratePaymentInputDTO

      await expect(usecase.execute(params)).rejects.toBeInstanceOf(HTTPBadRequest)
      await expect(usecase.execute(params)).rejects.toThrow('Description is required')
    })
  })

  describe('when external_id is invalid', () => {
    test.each([
      { external_id: '' },
      { external_id: '   ' },
      { external_id: undefined },
    ])('should throw BadRequest for external_id: "$external_id"', async ({ external_id }) => {
      const params = {
        amount: 100,
        description: 'Payment description',
        external_id,
      } as GeneratePaymentInputDTO

      await expect(usecase.execute(params)).rejects.toBeInstanceOf(HTTPBadRequest)
      await expect(usecase.execute(params)).rejects.toThrow('External ID is required')
    })
  })

  describe('when input is valid', () => {
    it('should send payment processing request to queue', async () => {
      const params: GeneratePaymentInputDTO = {
        amount: 100,
        description: 'Payment description',
        external_id: 'ext-123',
      }

      await usecase.execute(params)

      expect(paymentQueue.sendPaymentProcessingRequest).toHaveBeenCalledTimes(1)
      expect(paymentQueue.sendPaymentProcessingRequest).toHaveBeenCalledWith(params)
    })
  })
})
