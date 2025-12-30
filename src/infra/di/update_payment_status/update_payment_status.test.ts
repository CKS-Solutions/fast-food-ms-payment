import { UpdatePaymentStatusContainerFactory } from './update_payment_status'
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

jest.mock('@driven_mercadopago/get_payment', () => ({
  MercadoPagoGetPayment: jest.fn(),
}))

jest.mock('@driven_sns/payment', () => ({
  PaymentSNS: jest.fn(),
}))

jest.mock('@usecases/update_payment_status', () => ({
  UpdatePaymentStatusUseCase: jest.fn(),
}))

import { DynamoDBClientWrapper } from '@aws/dynamodb_client'
import { SMClientWrapper } from '@aws/sm_client'
import { SNSClientWrapper } from '@aws/sns_client'
import { PaymentRepository } from '@driven_dynamodb/payment_repository'
import { MercadoPagoGenerateToken } from '@driven_mercadopago/generate_token'
import { MercadoPagoGetPayment } from '@driven_mercadopago/get_payment'
import { UpdatePaymentStatusUseCase } from '@usecases/update_payment_status'
import { PaymentSNS } from '@driven_sns/payment'

describe('UpdatePaymentStatusContainerFactory', () => {
  const region = AwsRegion.USEast1
  const stage = AwsStage.Local

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should correctly wire all dependencies and expose usecase', () => {
    const factory = new UpdatePaymentStatusContainerFactory(region, stage)

    expect(DynamoDBClientWrapper).toHaveBeenCalledWith(region, stage)
    expect(SMClientWrapper).toHaveBeenCalledWith(region, stage)
    expect(SNSClientWrapper).toHaveBeenCalledWith(region, stage)

    const dynamoClient = (DynamoDBClientWrapper as jest.Mock).mock.instances[0]
    const smClient = (SMClientWrapper as jest.Mock).mock.instances[0]
    const snsClient = (SNSClientWrapper as jest.Mock).mock.instances[0]

    expect(PaymentRepository).toHaveBeenCalledWith(dynamoClient)
    expect(MercadoPagoGenerateToken).toHaveBeenCalledWith(smClient)
    expect(MercadoPagoGetPayment).toHaveBeenCalled()
    expect(PaymentSNS).toHaveBeenCalledWith(snsClient)

    const paymentRepo = (PaymentRepository as jest.Mock).mock.instances[0]
    const tokenMP = (MercadoPagoGenerateToken as jest.Mock).mock.instances[0]
    const getPaymentMP = (MercadoPagoGetPayment as jest.Mock).mock.instances[0]
    const paymentSNS = (PaymentSNS as jest.Mock).mock.instances[0]

    expect(UpdatePaymentStatusUseCase).toHaveBeenCalledWith(
      paymentRepo,
      tokenMP,
      getPaymentMP,
      paymentSNS
    )

    expect(factory.usecase).toBe(
      (UpdatePaymentStatusUseCase as jest.Mock).mock.instances[0]
    )
  })
})
