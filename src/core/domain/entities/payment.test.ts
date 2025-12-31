import { Payment, DEFAULT_PAYMENT_EXPIRES_IN_SECONDS } from './payment'
import { PaymentMethod, PaymentStatus } from './payment.types'

jest.mock('node:crypto', () => ({
  randomUUID: jest.fn(() => 'uuid-123'),
}))

describe('Payment', () => {
  const NOW = 1_700_000_000_000

  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(NOW)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('create', () => {
    it('should create a payment with default values', () => {
      const payment = Payment.create(
        'external-123',
        1000,
        'Pagamento de teste',
        'PIX-CODE-123'
      )

      expect(payment).toBeInstanceOf(Payment)

      expect(payment.id).toBe('uuid-123')
      expect(payment.external_id).toBe('external-123')
      expect(payment.status).toBe(PaymentStatus.Pending)
      expect(payment.method).toBe(PaymentMethod.Pix)
      expect(payment.description).toBe('Pagamento de teste')
      expect(payment.value).toBe(1000)
      expect(payment.code).toBe('PIX-CODE-123')
    })

    it('should set created_at and updated_at to now', () => {
      const payment = Payment.create(
        'external-123',
        1000,
        'Pagamento',
        'PIX'
      )

      expect(payment.created_at).toBe(NOW)
      expect(payment.updated_at).toBe(NOW)
    })

    it('should calculate expires_at correctly', () => {
      const payment = Payment.create(
        'external-123',
        1000,
        'Pagamento',
        'PIX'
      )

      expect(payment.expires_at).toBe(
        NOW + DEFAULT_PAYMENT_EXPIRES_IN_SECONDS
      )
    })
  })
})
