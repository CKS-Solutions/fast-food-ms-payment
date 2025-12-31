import { GeneratePaymentUseCase } from './generate_payment'
import { PaymentStatus } from '@entities/payment.types'
import { Payment } from '@entities/payment'
import { GeneratePaymentInputDTO } from '@dto/generate_payment'

describe('GeneratePaymentUseCase', () => {
  let paymentRepository: any
  let generateTokenMP: any
  let generateQRCodeMP: any
  let paymentTopic: any
  let useCase: GeneratePaymentUseCase
  const now = 1_700_000_000_000

  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(now)
    paymentRepository = {
      getByExternalId: jest.fn(),
      delete: jest.fn(),
      create: jest.fn(),
    }
    generateTokenMP = {
      generateToken: jest.fn(),
    }
    generateQRCodeMP = {
      generateQRCode: jest.fn(),
    }
    paymentTopic = {
      publishPaymentCreationFailure: jest.fn(),
      publishPaymentCreationSuccess: jest.fn(),
    }
    useCase = new GeneratePaymentUseCase(
      paymentRepository,
      generateTokenMP,
      generateQRCodeMP,
      paymentTopic
    )
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  const baseParams: GeneratePaymentInputDTO = {
    external_id: 'ext-123',
    amount: 1000,
    description: 'Teste',
  }

  it('should fail if external_id is missing', async () => {
    await useCase.execute({ ...baseParams, external_id: '' })
    expect(paymentTopic.publishPaymentCreationFailure).toHaveBeenCalledWith('', 'missing external ID')
  })

  it('should fail if amount <= 0', async () => {
    await useCase.execute({ ...baseParams, amount: 0 })
    expect(paymentTopic.publishPaymentCreationFailure).toHaveBeenCalledWith('ext-123', 'missing amount')
  })

  it('should fail if description is missing', async () => {
    await useCase.execute({ ...baseParams, description: '' })
    expect(paymentTopic.publishPaymentCreationFailure).toHaveBeenCalledWith('ext-123', 'missing description')
  })

  it('should fail if payment already paid', async () => {
    paymentRepository.getByExternalId.mockResolvedValue({ status: PaymentStatus.Paid })
    await useCase.execute(baseParams)
    expect(paymentTopic.publishPaymentCreationFailure).toHaveBeenCalledWith('ext-123', 'payment already paid')
  })

  it('should succeed if existing payment is not expired', async () => {
    paymentRepository.getByExternalId.mockResolvedValue({
      status: PaymentStatus.Pending,
      expires_at: now + 1000,
      code: 'EXISTINGCODE',
    })
    await useCase.execute(baseParams)
    expect(paymentTopic.publishPaymentCreationSuccess).toHaveBeenCalledWith('ext-123', 'EXISTINGCODE')
  })

  it('should delete expired existing payment', async () => {
    paymentRepository.getByExternalId.mockResolvedValue({
      status: PaymentStatus.Pending,
      expires_at: now - 1000,
      code: 'OLD',
    })
    generateTokenMP.generateToken.mockResolvedValue('TOKEN123')
    generateQRCodeMP.generateQRCode.mockResolvedValue('QRCODE123')

    await useCase.execute(baseParams)
    expect(paymentRepository.delete).toHaveBeenCalledWith('ext-123')
  })

  it('should fail if token generation fails', async () => {
    paymentRepository.getByExternalId.mockResolvedValue(null)
    generateTokenMP.generateToken.mockResolvedValue(null)

    await useCase.execute(baseParams)
    expect(paymentTopic.publishPaymentCreationFailure).toHaveBeenCalledWith('ext-123', 'failed to generate MercadoPago token')
  })

  it('should fail if QR code generation fails', async () => {
    paymentRepository.getByExternalId.mockResolvedValue(null)
    generateTokenMP.generateToken.mockResolvedValue('TOKEN123')
    generateQRCodeMP.generateQRCode.mockResolvedValue(null)

    await useCase.execute(baseParams)
    expect(paymentTopic.publishPaymentCreationFailure).toHaveBeenCalledWith('ext-123', 'failed to generate MercadoPago QR Code')
  })

  it('should create payment and publish success', async () => {
    paymentRepository.getByExternalId.mockResolvedValue(null)
    generateTokenMP.generateToken.mockResolvedValue('TOKEN123')
    generateQRCodeMP.generateQRCode.mockResolvedValue('QRCODE123')

    await useCase.execute(baseParams)

    expect(paymentRepository.create).toHaveBeenCalled()
    const createdPayment = paymentRepository.create.mock.calls[0][0] as Payment
    expect(createdPayment.external_id).toBe('ext-123')
    expect(createdPayment.code).toBe('QRCODE123')
    expect(paymentTopic.publishPaymentCreationSuccess).toHaveBeenCalledWith('ext-123', 'QRCODE123')
  })
})
