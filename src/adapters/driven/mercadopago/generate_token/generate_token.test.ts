import axios from 'axios'
import { HTTPPreconditionFailed, HTTPStatus } from '@utils/http'

jest.mock('@aws-sdk/client-secrets-manager', () => ({
  GetSecretValueCommand: jest.fn().mockImplementation((params) => params),
}))

jest.mock('axios')

jest.mock('@aws/sm_client', () => ({
  SMClientWrapper: jest.fn(),
}))

import { MercadoPagoGenerateToken } from './index'

const mockedAxios = axios as jest.Mocked<typeof axios>

describe('MercadoPagoGenerateToken', () => {
  let smClient: any
  let generator: MercadoPagoGenerateToken

  beforeEach(() => {
    smClient = { send: jest.fn() }
    generator = new MercadoPagoGenerateToken(smClient)
    jest.clearAllMocks()
  })

  it('should throw if credentials are missing', async () => {
    smClient.send.mockResolvedValue({ SecretString: null })
    await expect(generator['getCredentials']()).rejects.toBeInstanceOf(HTTPPreconditionFailed)
  })

  it('should return access_token on success', async () => {
    const secret = { clientId: 'id', clientSecret: 'secret' }
    smClient.send.mockResolvedValue({ SecretString: JSON.stringify(secret) })
    mockedAxios.post.mockResolvedValue({ status: HTTPStatus.OK, data: { access_token: 'token123' } })

    const token = await generator.generateToken()
    expect(token).toBe('token123')
    expect(mockedAxios.post).toHaveBeenCalled()
  })

  it('should return null if HTTP status is not 200', async () => {
    const secret = { clientId: 'id', clientSecret: 'secret' }
    smClient.send.mockResolvedValue({ SecretString: JSON.stringify(secret) })
    mockedAxios.post.mockResolvedValue({ status: 500, data: {} })

    const token = await generator.generateToken()
    expect(token).toBeNull()
  })

  it('should return null if access_token is missing', async () => {
    const secret = { clientId: 'id', clientSecret: 'secret' }
    smClient.send.mockResolvedValue({ SecretString: JSON.stringify(secret) })
    mockedAxios.post.mockResolvedValue({ status: HTTPStatus.OK, data: {} })

    const token = await generator.generateToken()
    expect(token).toBeNull()
  })
})
