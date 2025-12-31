import { GeneratePaymentContainerFactory } from './generate_payment'
import { AwsRegion, AwsStage } from '@aws/utils'

jest.mock('@aws/dynamodb_client', () => ({
  DynamoDBClientWrapper: jest.fn(),
}))

jest.mock('@aws/sm_client', () => ({
  SMClientWrapper: jest.fn(),
}))

jest.mock('@aws/sns_client', () => ({
  SNSClientWrapper: jest.fn(),
}))

jest.mock('@driven_dynamodb/payment_repository', () => ({
  PaymentRepository: jest.fn(),
}))

jest.mock('@driven_mercadopago/generate_token', () => ({
  MercadoPagoGenerateToken: jest.fn(),
}))

jest.mock('@driven_mercadopago/generate_qrcode', () => ({
  MercadoPagoGenerateQRCode: jest.fn(),
}))

jest.mock('@driven_sns/payment', () => ({
  PaymentSNS: jest.fn(),
}))

jest.mock('@usecases/generate_payment', () => ({
  GeneratePaymentUseCase: jest.fn(),
}))

import { DynamoDBClientWrapper } from '@aws/dynamodb_client'
import { SMClientWrapper } from '@aws/sm_client'
import { SNSClientWrapper } from '@aws/sns_client'
import { PaymentRepository } from '@driven_dynamodb/payment_repository'
import { MercadoPagoGenerateToken } from '@driven_mercadopago/generate_token'
import { MercadoPagoGenerateQRCode } from '@driven_mercadopago/generate_qrcode'
import { PaymentSNS } from '@driven_sns/payment'
import { GeneratePaymentUseCase } from '@usecases/generate_payment/generate_payment'

describe('GeneratePaymentContainerFactory', () => {
  const region = AwsRegion.USEast1
  const stage = AwsStage.Local

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should correctly wire all dependencies and expose usecase', () => {
    const factory = new GeneratePaymentContainerFactory(region, stage)

    expect(DynamoDBClientWrapper).toHaveBeenCalledWith(region, stage)
    expect(SMClientWrapper).toHaveBeenCalledWith(region, stage)
    expect(SNSClientWrapper).toHaveBeenCalledWith(region, stage)

    const dynamoClient = (DynamoDBClientWrapper as jest.Mock).mock.instances[0]
    const smClient = (SMClientWrapper as jest.Mock).mock.instances[0]
    const snsClient = (SNSClientWrapper as jest.Mock).mock.instances[0]

    expect(PaymentRepository).toHaveBeenCalledWith(dynamoClient)
    expect(MercadoPagoGenerateToken).toHaveBeenCalledWith(smClient)
    expect(MercadoPagoGenerateQRCode).toHaveBeenCalledWith(smClient)
    expect(PaymentSNS).toHaveBeenCalledWith(snsClient)

    const paymentRepo = (PaymentRepository as jest.Mock).mock.instances[0]
    const tokenMP = (MercadoPagoGenerateToken as jest.Mock).mock.instances[0]
    const qrCodeMP = (MercadoPagoGenerateQRCode as jest.Mock).mock.instances[0]
    const paymentSNS = (PaymentSNS as jest.Mock).mock.instances[0]

    expect(GeneratePaymentUseCase).toHaveBeenCalledWith(
      paymentRepo,
      tokenMP,
      qrCodeMP,
      paymentSNS
    )

    expect(factory.usecase).toBe(
      (GeneratePaymentUseCase as jest.Mock).mock.instances[0]
    )
  })
})

