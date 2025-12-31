import { UpdatePaymentStatusUseCase } from './update_payment_status'
import { PaymentStatus } from '@entities/payment.types'
import { HTTPNotFound, HTTPPreconditionFailed } from '@utils/http'

describe('UpdatePaymentStatusUseCase', () => {
  let paymentRepository: any
  let generateTokenMP: any
  let getPaymentMP: any
  let paymentTopic: any
  let useCase: UpdatePaymentStatusUseCase

  const paymentId = 'pay-123'
  const externalId = 'ext-123'

  beforeEach(() => {
    paymentRepository = {
      getByExternalId: jest.fn(),
      updateStatusByExternalId: jest.fn(),
    }
    generateTokenMP = {
      generateToken: jest.fn(),
    }
    getPaymentMP = {
      getPaymentStatusMock: jest.fn(),
    }
    paymentTopic = {
      publishPaymentStatus: jest.fn(),
    }

    useCase = new UpdatePaymentStatusUseCase(
      paymentRepository,
      generateTokenMP,
      getPaymentMP,
      paymentTopic
    )
  })

  it('should throw HTTPNotFound if payment not found', async () => {
    paymentRepository.getByExternalId.mockResolvedValue(null)
    await expect(useCase.execute(paymentId, externalId)).rejects.toBeInstanceOf(HTTPNotFound)
  })

  it('should throw HTTPPreconditionFailed if token generation fails', async () => {
    paymentRepository.getByExternalId.mockResolvedValue({ status: PaymentStatus.Pending })
    generateTokenMP.generateToken.mockResolvedValue(null)

    await expect(useCase.execute(paymentId, externalId)).rejects.toBeInstanceOf(HTTPPreconditionFailed)
  })

  it('should throw HTTPPreconditionFailed if payment status fetch fails', async () => {
    paymentRepository.getByExternalId.mockResolvedValue({ status: PaymentStatus.Pending })
    generateTokenMP.generateToken.mockResolvedValue('TOKEN123')
    getPaymentMP.getPaymentStatusMock.mockResolvedValue(null)

    await expect(useCase.execute(paymentId, externalId)).rejects.toBeInstanceOf(HTTPPreconditionFailed)
  })

  it('should do nothing if payment status already up to date', async () => {
    paymentRepository.getByExternalId.mockResolvedValue({ status: PaymentStatus.Pending })
    generateTokenMP.generateToken.mockResolvedValue('TOKEN123')
    getPaymentMP.getPaymentStatusMock.mockResolvedValue('pending')

    await useCase.execute(paymentId, externalId)

    expect(paymentRepository.updateStatusByExternalId).not.toHaveBeenCalled()
    expect(paymentTopic.publishPaymentStatus).not.toHaveBeenCalled()
  })

  it('should update status and publish if payment status differs', async () => {
    paymentRepository.getByExternalId.mockResolvedValue({ status: PaymentStatus.Pending })
    generateTokenMP.generateToken.mockResolvedValue('TOKEN123')
    getPaymentMP.getPaymentStatusMock.mockResolvedValue('approved')

    await useCase.execute(paymentId, externalId)

    expect(paymentRepository.updateStatusByExternalId).toHaveBeenCalledWith(externalId, PaymentStatus.Paid)
    expect(paymentTopic.publishPaymentStatus).toHaveBeenCalledWith(externalId, PaymentStatus.Paid)
  })

  describe('mapStatus', () => {
    const mapCases: [string, PaymentStatus][] = [
      ['pending', PaymentStatus.Pending],
      ['authorized', PaymentStatus.Pending],
      ['in_process', PaymentStatus.Pending],
      ['approved', PaymentStatus.Paid],
      ['in_mediation', PaymentStatus.Paid],
      ['cancelled', PaymentStatus.Canceled],
      ['refunded', PaymentStatus.Canceled],
      ['charged_back', PaymentStatus.Canceled],
      ['other', PaymentStatus.Rejected],
    ]

    it.each(mapCases)('should map %s to %s', (input, expected) => {
      expect(useCase['mapStatus'](input)).toBe(expected)
    })
  })
})
