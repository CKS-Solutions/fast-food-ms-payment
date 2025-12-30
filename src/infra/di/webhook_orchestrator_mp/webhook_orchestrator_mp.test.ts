import { WebhookOrchestratorMPContainerFactory } from './webhook_orchestrator_mp'
import { AwsRegion, AwsStage } from '@aws/utils'

jest.mock('@aws/lambda_client', () => ({
  LambdaClientWrapper: jest.fn(),
}))

jest.mock('@driven_lambda/lambda', () => ({
  LambdaAdapter: jest.fn(),
}))

import { LambdaClientWrapper } from '@aws/lambda_client'
import { LambdaAdapter } from '@driven_lambda/lambda'

describe('WebhookOrchestratorMPContainerFactory', () => {
  const region = AwsRegion.USEast1
  const stage = AwsStage.Local

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should correctly wire dependencies and expose usecase', () => {
    const factory = new WebhookOrchestratorMPContainerFactory(region, stage)

    expect(LambdaClientWrapper).toHaveBeenCalledTimes(1)
    expect(LambdaClientWrapper).toHaveBeenCalledWith(region, stage)

    const lambdaInstance = (LambdaClientWrapper as jest.Mock).mock.instances[0]

    expect(LambdaAdapter).toHaveBeenCalledTimes(1)
    expect(LambdaAdapter).toHaveBeenCalledWith(lambdaInstance)

    expect(factory.lambdaAdapter).toBe(
      (LambdaAdapter as jest.Mock).mock.instances[0]
    )
  })
})
