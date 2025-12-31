import { Payment } from '@entities/payment'
import { PaymentMethod, PaymentStatus } from '@entities/payment.types'

jest.mock('@aws-sdk/lib-dynamodb', () => ({
  GetCommand: jest.fn(),
  PutCommand: jest.fn(),
  DeleteCommand: jest.fn(),
  UpdateCommand: jest.fn(),
}))

jest.mock('@aws/dynamodb_client', () => ({
  DynamoDBClientWrapper: jest.fn(),
}))

import { PaymentRepository } from './payment_repository'
import { GetCommand, PutCommand, DeleteCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'

describe('PaymentRepository', () => {
  let client: any
  let repo: PaymentRepository

  beforeEach(() => {
    client = {
      send: jest.fn(),
    }
    repo = new PaymentRepository(client)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('getByExternalId', () => {
    it('should return payment if exists', async () => {
      const payment: Payment = {
        id: '1',
        external_id: 'ext-1',
        status: PaymentStatus.Pending,
        method: PaymentMethod.Pix,
        description: 'desc',
        code: 'code',
        value: 100,
        expires_at: 0,
        created_at: 0,
        updated_at: 0,
      }

      client.send.mockResolvedValue({ Item: payment })

      const result = await repo.getByExternalId('ext-1')
      expect(result).toEqual(payment)
      expect(client.send).toHaveBeenCalledWith(expect.any(GetCommand))
    })

    it('should return null if payment does not exist', async () => {
      client.send.mockResolvedValue({ Item: undefined })

      const result = await repo.getByExternalId('ext-1')
      expect(result).toBeNull()
    })
  })

  describe('create', () => {
    it('should send PutCommand', async () => {
      const payment = {} as Payment
      client.send.mockResolvedValue({})

      await repo.create(payment)
      expect(client.send).toHaveBeenCalledWith(expect.any(PutCommand))
    })
  })

  describe('delete', () => {
    it('should send DeleteCommand', async () => {
      client.send.mockResolvedValue({})

      await repo.delete('ext-1')
      expect(client.send).toHaveBeenCalledWith(expect.any(DeleteCommand))
    })
  })

  describe('updateStatusByExternalId', () => {
    it('should send UpdateCommand with correct status', async () => {
      client.send.mockResolvedValue({})

      await repo.updateStatusByExternalId('ext-1', 'paid')
      expect(client.send).toHaveBeenCalledWith(expect.any(UpdateCommand))
    })
  })
})
