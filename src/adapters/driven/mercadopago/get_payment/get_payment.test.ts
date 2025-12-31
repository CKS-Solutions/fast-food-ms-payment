import axios from 'axios'
import { HTTPPreconditionFailed, HTTPStatus } from '@utils/http'

jest.mock('axios')

import { MercadoPagoGetPayment } from './index'

const mockedAxios = axios as jest.Mocked<typeof axios>

describe('MercadoPagoGetPayment', () => {
  let getPayment: MercadoPagoGetPayment

  beforeEach(() => {
    getPayment = new MercadoPagoGetPayment()
    jest.clearAllMocks()
  })

  it('should return status on success', async () => {
    mockedAxios.get.mockResolvedValue({
      status: HTTPStatus.OK,
      data: { status: 'approved' },
    })

    const status = await getPayment.getPaymentStatus('pay-1', 'token')
    expect(status).toBe('approved')
    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.stringContaining('/v1/payments/pay-1'),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer token',
        }),
      })
    )
  })

  it('should throw if status is missing', async () => {
    mockedAxios.get.mockResolvedValue({ status: HTTPStatus.OK, data: {} })
    await expect(getPayment.getPaymentStatus('pay-1', 'token')).rejects.toBeInstanceOf(HTTPPreconditionFailed)
  })

  it('should throw if HTTP status is not 200', async () => {
    mockedAxios.get.mockResolvedValue({ status: 500, data: {} })
    await expect(getPayment.getPaymentStatus('pay-1', 'token')).rejects.toBeInstanceOf(HTTPPreconditionFailed)
  })

  it('getPaymentStatusMock should return mocked status', async () => {
    const status = await getPayment.getPaymentStatusMock('pay-1', 'token')
    expect(status).toBe('approved')
  })
})
