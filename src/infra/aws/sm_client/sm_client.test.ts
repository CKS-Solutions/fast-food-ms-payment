import { AwsRegion, AwsStage } from '../utils'

const mockConfig = { region: 'us-east-1' }

jest.mock('../utils', () => ({
  AwsRegion: {
    USEast1: 'us-east-1',
  },
  AwsStage: {
    Local: 'local',
  },
  newAwsConfig: jest.fn(() => mockConfig),
}))

jest.mock('@aws-sdk/client-secrets-manager', () => ({
  SecretsManagerClient: jest.fn(),
}))

import { SMClientWrapper } from './sm_client'
import { newAwsConfig } from '../utils'
import { SecretsManagerClient } from '@aws-sdk/client-secrets-manager'

describe('SMClientWrapper', () => {
  const region = AwsRegion.USEast1
  const stage = AwsStage.Local

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should create SMClient with aws config based on region and stage', () => {
    new SMClientWrapper(region, stage)

    expect(newAwsConfig).toHaveBeenCalledWith(region, stage)
    expect(SecretsManagerClient).toHaveBeenCalledWith(mockConfig)
  })
})