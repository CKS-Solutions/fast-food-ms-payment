import axios from 'axios'
import { HTTPPreconditionFailed, HTTPStatus } from '@utils/http'

jest.mock('@aws-sdk/client-secrets-manager', () => ({
  GetSecretValueCommand: jest.fn().mockImplementation((params) => params),
}))

jest.mock('axios')

jest.mock('@aws/sm_client', () => ({
  SMClientWrapper: jest.fn(),
}))

import { MercadoPagoGenerateQRCode } from './index'

const mockedAxios = axios as jest.Mocked<typeof axios>

describe('MercadoPagoGenerateQRCode', () => {
  let smClient: any
  let generator: MercadoPagoGenerateQRCode

  beforeEach(() => {
    smClient = { send: jest.fn() }
    generator = new MercadoPagoGenerateQRCode(smClient)
    jest.clearAllMocks()
  })

  it('should throw if secrets are missing', async () => {
    smClient.send.mockResolvedValue({ SecretString: null })
    await expect(generator['getQRCodeInfo']()).rejects.toBeInstanceOf(HTTPPreconditionFailed)
  })

  it('should return qr_data on success', async () => {
    const secret = { userId: 'user-1', posId: 'pos-1' }
    smClient.send.mockResolvedValue({ SecretString: JSON.stringify(secret) })
    mockedAxios.post.mockResolvedValue({ status: HTTPStatus.OK, data: { qr_data: 'QR123' } })

    const qr = await generator.generateQRCode('pay-1', 100, 'desc', 'token')
    expect(qr).toBe('QR123')
    expect(mockedAxios.post).toHaveBeenCalled()
  })

  it('should return null if response status is not 200/201', async () => {
    const secret = { userId: 'user-1', posId: 'pos-1' }
    smClient.send.mockResolvedValue({ SecretString: JSON.stringify(secret) })
    mockedAxios.post.mockResolvedValue({ status: 500, data: {} })

    const qr = await generator.generateQRCode('pay-1', 100, 'desc', 'token')
    expect(qr).toBeNull()
  })

  it('should return null if qr_data is missing', async () => {
    const secret = { userId: 'user-1', posId: 'pos-1' }
    smClient.send.mockResolvedValue({ SecretString: JSON.stringify(secret) })
    mockedAxios.post.mockResolvedValue({ status: HTTPStatus.OK, data: {} })

    const qr = await generator.generateQRCode('pay-1', 100, 'desc', 'token')
    expect(qr).toBeNull()
  })
})
