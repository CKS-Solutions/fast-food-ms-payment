import { defineFeature, loadFeature } from 'jest-cucumber'
import { GeneratePaymentUseCase } from './generate_payment'
import { PaymentStatus } from '@entities/payment.types'
import { Payment } from '@entities/payment'
import { GeneratePaymentInputDTO } from '@dto/generate_payment'

const feature = loadFeature(__dirname + '/generate_payment.feature')

defineFeature(feature, (test) => {
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

  test('Deve falhar quando o pagamento já está pago', ({ given, when, then, and }) => {
    given(/^que existe um pagamento com external_id "(.*)" e status "(.*)"$/, (externalId, status) => {
      paymentRepository.getByExternalId.mockResolvedValue({
        external_id: externalId,
        status: status === 'Paid' ? PaymentStatus.Paid : PaymentStatus.Pending,
      })
    })

    when(/^eu tento gerar um pagamento com external_id "(.*)", amount (\d+) e description "(.*)"$/, async (externalId, amount, description) => {
      const params: GeneratePaymentInputDTO = {
        external_id: externalId,
        amount: parseInt(amount),
        description,
      }
      await useCase.execute(params)
    })

    then(/^o sistema deve publicar uma falha de criação com mensagem "(.*)"$/, (message) => {
      expect(paymentTopic.publishPaymentCreationFailure).toHaveBeenCalledWith('ext-123', message)
    })

    and('o pagamento não deve ser criado', () => {
      expect(paymentRepository.create).not.toHaveBeenCalled()
    })
  })

  test('Deve retornar código existente quando o pagamento não está expirado', ({ given, when, then, and }) => {
    given(/^que existe um pagamento com external_id "(.*)", status "(.*)", código "(.*)" e expires_at no futuro$/, (externalId, status, code) => {
      paymentRepository.getByExternalId.mockResolvedValue({
        external_id: externalId,
        status: status === 'Pending' ? PaymentStatus.Pending : PaymentStatus.Paid,
        code,
        expires_at: now + 1000,
      })
    })

    when(/^eu tento gerar um pagamento com external_id "(.*)", amount (\d+) e description "(.*)"$/, async (externalId, amount, description) => {
      const params: GeneratePaymentInputDTO = {
        external_id: externalId,
        amount: parseInt(amount),
        description,
      }
      await useCase.execute(params)
    })

    then(/^o sistema deve publicar sucesso de criação com external_id "(.*)" e código "(.*)"$/, (externalId, code) => {
      expect(paymentTopic.publishPaymentCreationSuccess).toHaveBeenCalledWith(externalId, code)
    })

    and('nenhum novo pagamento deve ser criado', () => {
      expect(paymentRepository.create).not.toHaveBeenCalled()
    })
  })

  test('Deve deletar e criar novo pagamento quando o existente está expirado', ({ given, and, when, then }) => {
    given(/^que existe um pagamento com external_id "(.*)", status "(.*)" e expires_at no passado$/, (externalId, status) => {
      paymentRepository.getByExternalId.mockResolvedValue({
        external_id: externalId,
        status: status === 'Pending' ? PaymentStatus.Pending : PaymentStatus.Paid,
        expires_at: now - 1000,
      })
    })

    and('o MercadoPago retorna um token válido', () => {
      generateTokenMP.generateToken.mockResolvedValue('TOKEN123')
    })

    and(/^o MercadoPago retorna um QR Code válido "(.*)"$/, (qrCode) => {
      generateQRCodeMP.generateQRCode.mockResolvedValue(qrCode)
    })

    when(/^eu tento gerar um pagamento com external_id "(.*)", amount (\d+) e description "(.*)"$/, async (externalId, amount, description) => {
      const params: GeneratePaymentInputDTO = {
        external_id: externalId,
        amount: parseInt(amount),
        description,
      }
      await useCase.execute(params)
    })

    then('o pagamento expirado deve ser deletado', () => {
      expect(paymentRepository.delete).toHaveBeenCalledWith('ext-123')
    })

    and(/^um novo pagamento deve ser criado com external_id "(.*)" e código "(.*)"$/, (externalId, code) => {
      expect(paymentRepository.create).toHaveBeenCalled()
      const createdPayment = paymentRepository.create.mock.calls[0][0] as Payment
      expect(createdPayment.external_id).toBe(externalId)
      expect(createdPayment.code).toBe(code)
    })

    and(/^o sistema deve publicar sucesso de criação com external_id "(.*)" e código "(.*)"$/, (externalId, code) => {
      expect(paymentTopic.publishPaymentCreationSuccess).toHaveBeenCalledWith(externalId, code)
    })
  })

  test('Deve falhar quando a geração de token do MercadoPago falha', ({ given, and, when, then }) => {
    given(/^que não existe um pagamento com external_id "(.*)"$/, (externalId) => {
      paymentRepository.getByExternalId.mockResolvedValue(null)
    })

    and('o MercadoPago falha ao gerar o token', () => {
      generateTokenMP.generateToken.mockResolvedValue(null)
    })

    when(/^eu tento gerar um pagamento com external_id "(.*)", amount (\d+) e description "(.*)"$/, async (externalId, amount, description) => {
      const params: GeneratePaymentInputDTO = {
        external_id: externalId,
        amount: parseInt(amount),
        description,
      }
      await useCase.execute(params)
    })

    then(/^o sistema deve publicar uma falha de criação com mensagem "(.*)"$/, (message) => {
      expect(paymentTopic.publishPaymentCreationFailure).toHaveBeenCalledWith('ext-123', message)
    })

    and('nenhum pagamento deve ser criado', () => {
      expect(paymentRepository.create).not.toHaveBeenCalled()
    })
  })

  test('Deve falhar quando a geração de QR Code do MercadoPago falha', ({ given, and, when, then }) => {
    given(/^que não existe um pagamento com external_id "(.*)"$/, (externalId) => {
      paymentRepository.getByExternalId.mockResolvedValue(null)
    })

    and('o MercadoPago retorna um token válido', () => {
      generateTokenMP.generateToken.mockResolvedValue('TOKEN123')
    })

    and('o MercadoPago falha ao gerar o QR Code', () => {
      generateQRCodeMP.generateQRCode.mockResolvedValue(null)
    })

    when(/^eu tento gerar um pagamento com external_id "(.*)", amount (\d+) e description "(.*)"$/, async (externalId, amount, description) => {
      const params: GeneratePaymentInputDTO = {
        external_id: externalId,
        amount: parseInt(amount),
        description,
      }
      await useCase.execute(params)
    })

    then(/^o sistema deve publicar uma falha de criação com mensagem "(.*)"$/, (message) => {
      expect(paymentTopic.publishPaymentCreationFailure).toHaveBeenCalledWith('ext-123', message)
    })

    and('nenhum pagamento deve ser criado', () => {
      expect(paymentRepository.create).not.toHaveBeenCalled()
    })
  })

  test('Deve criar pagamento com sucesso quando todos os requisitos são atendidos', ({ given, and, when, then }) => {
    given(/^que não existe um pagamento com external_id "(.*)"$/, (externalId) => {
      paymentRepository.getByExternalId.mockResolvedValue(null)
    })

    and('o MercadoPago retorna um token válido', () => {
      generateTokenMP.generateToken.mockResolvedValue('TOKEN123')
    })

    and(/^o MercadoPago retorna um QR Code válido "(.*)"$/, (qrCode) => {
      generateQRCodeMP.generateQRCode.mockResolvedValue(qrCode)
    })

    when(/^eu tento gerar um pagamento com external_id "(.*)", amount (\d+) e description "(.*)"$/, async (externalId, amount, description) => {
      const params: GeneratePaymentInputDTO = {
        external_id: externalId,
        amount: parseInt(amount),
        description,
      }
      await useCase.execute(params)
    })

    then(/^um novo pagamento deve ser criado com external_id "(.*)", amount (\d+), description "(.*)" e código "(.*)"$/, (externalId, amount, description, code) => {
      expect(paymentRepository.create).toHaveBeenCalled()
      const createdPayment = paymentRepository.create.mock.calls[0][0] as Payment
      expect(createdPayment.external_id).toBe(externalId)
      expect(createdPayment.value).toBe(parseInt(amount))
      expect(createdPayment.description).toBe(description)
      expect(createdPayment.code).toBe(code)
    })

    and(/^o sistema deve publicar sucesso de criação com external_id "(.*)" e código "(.*)"$/, (externalId, code) => {
      expect(paymentTopic.publishPaymentCreationSuccess).toHaveBeenCalledWith(externalId, code)
    })
  })
})
