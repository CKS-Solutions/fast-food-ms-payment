import { CheckPaymentStatusUseCase } from './check_payment_status'
import { PaymentStatus } from '@entities/payment.types'
import { HTTPNotFound } from '@utils/http'
import { IPaymentRepository } from '@ports/payment_repository'

describe('CheckPaymentStatusUseCase', () => {
  let paymentRepository: jest.Mocked<IPaymentRepository>
  let useCase: CheckPaymentStatusUseCase

  beforeEach(() => {
    paymentRepository = {
      getByExternalId: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      updateStatusByExternalId: jest.fn(),
    } as jest.Mocked<IPaymentRepository>

    useCase = new CheckPaymentStatusUseCase(paymentRepository)
  })

  it('should return payment status when payment exists', async () => {
    paymentRepository.getByExternalId.mockResolvedValue({
      status: PaymentStatus.Pending,
    } as any)

    const result = await useCase.execute('external-123')

    expect(paymentRepository.getByExternalId).toHaveBeenCalledWith('external-123')
    expect(result).toEqual({
      status: PaymentStatus.Pending,
    })
  })

  it('should throw HTTPNotFound when payment does not exist', async () => {
    paymentRepository.getByExternalId.mockResolvedValue(null)

    await expect(
      useCase.execute('external-123')
    ).rejects.toBeInstanceOf(HTTPNotFound)

    await expect(
      useCase.execute('external-123')
    ).rejects.toThrow('Payment not found')
  })
})
