import { CheckPaymentStatusContainerFactory } from './check_payment_status'
import { AwsRegion, AwsStage } from '@aws/utils'

jest.mock('@aws/dynamodb_client', () => ({
  DynamoDBClientWrapper: jest.fn(),
}))

jest.mock('@driven_dynamodb/payment_repository', () => ({
  PaymentRepository: jest.fn(),
}))

jest.mock('@usecases/check_payment_status', () => ({
  CheckPaymentStatusUseCase: jest.fn(),
}))

import { DynamoDBClientWrapper } from '@aws/dynamodb_client'
import { PaymentRepository } from '@driven_dynamodb/payment_repository'
import { CheckPaymentStatusUseCase } from '@usecases/check_payment_status'

describe('CheckPaymentStatusContainerFactory', () => {
  const region = AwsRegion.USEast1
  const stage = AwsStage.Local

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should correctly wire dependencies and expose usecase', () => {
    const factory = new CheckPaymentStatusContainerFactory(region, stage)

    expect(DynamoDBClientWrapper).toHaveBeenCalledTimes(1)
    expect(DynamoDBClientWrapper).toHaveBeenCalledWith(region, stage)

    const dynamoInstance = (DynamoDBClientWrapper as jest.Mock).mock.instances[0]

    expect(PaymentRepository).toHaveBeenCalledTimes(1)
    expect(PaymentRepository).toHaveBeenCalledWith(dynamoInstance)

    const repoInstance = (PaymentRepository as jest.Mock).mock.instances[0]

    expect(CheckPaymentStatusUseCase).toHaveBeenCalledTimes(1)
    expect(CheckPaymentStatusUseCase).toHaveBeenCalledWith(repoInstance)

    expect(factory.usecase).toBe(
      (CheckPaymentStatusUseCase as jest.Mock).mock.instances[0]
    )
  })
})
