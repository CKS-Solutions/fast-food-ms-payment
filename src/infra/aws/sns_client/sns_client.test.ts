
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

jest.mock('@aws-sdk/client-sns', () => ({
  SNSClient: jest.fn(),
}))

import { SNSClientWrapper } from './sns_client'
import { AwsRegion, AwsStage, newAwsConfig } from '../utils'
import { SNSClient } from '@aws-sdk/client-sns'

describe('SNSClientWrapper', () => {
  const region = AwsRegion.USEast1
  const stage = AwsStage.Local

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should create SNSClient with aws config based on region and stage', () => {
    new SNSClientWrapper(region, stage)

    expect(newAwsConfig).toHaveBeenCalledWith(region, stage)
    expect(SNSClient).toHaveBeenCalledWith(mockConfig)
  })
})