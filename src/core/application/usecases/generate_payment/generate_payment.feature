Feature: Gerar Pagamento
  Como um sistema de pagamento
  Eu quero gerar pagamentos via MercadoPago
  Para que os clientes possam realizar pagamentos PIX

  Scenario: Deve falhar quando o pagamento já está pago
    Given que existe um pagamento com external_id "ext-123" e status "Paid"
    When eu tento gerar um pagamento com external_id "ext-123", amount 1000 e description "Teste"
    Then o sistema deve publicar uma falha de criação com mensagem "payment already paid"
    And o pagamento não deve ser criado

  Scenario: Deve retornar código existente quando o pagamento não está expirado
    Given que existe um pagamento com external_id "ext-123", status "Pending", código "EXISTINGCODE" e expires_at no futuro
    When eu tento gerar um pagamento com external_id "ext-123", amount 1000 e description "Teste"
    Then o sistema deve publicar sucesso de criação com external_id "ext-123" e código "EXISTINGCODE"
    And nenhum novo pagamento deve ser criado

  Scenario: Deve deletar e criar novo pagamento quando o existente está expirado
    Given que existe um pagamento com external_id "ext-123", status "Pending" e expires_at no passado
    And o MercadoPago retorna um token válido
    And o MercadoPago retorna um QR Code válido "QRCODE123"
    When eu tento gerar um pagamento com external_id "ext-123", amount 1000 e description "Teste"
    Then o pagamento expirado deve ser deletado
    And um novo pagamento deve ser criado com external_id "ext-123" e código "QRCODE123"
    And o sistema deve publicar sucesso de criação com external_id "ext-123" e código "QRCODE123"

  Scenario: Deve falhar quando a geração de token do MercadoPago falha
    Given que não existe um pagamento com external_id "ext-123"
    And o MercadoPago falha ao gerar o token
    When eu tento gerar um pagamento com external_id "ext-123", amount 1000 e description "Teste"
    Then o sistema deve publicar uma falha de criação com mensagem "failed to generate MercadoPago token"
    And nenhum pagamento deve ser criado

  Scenario: Deve falhar quando a geração de QR Code do MercadoPago falha
    Given que não existe um pagamento com external_id "ext-123"
    And o MercadoPago retorna um token válido
    And o MercadoPago falha ao gerar o QR Code
    When eu tento gerar um pagamento com external_id "ext-123", amount 1000 e description "Teste"
    Then o sistema deve publicar uma falha de criação com mensagem "failed to generate MercadoPago QR Code"
    And nenhum pagamento deve ser criado

  Scenario: Deve criar pagamento com sucesso quando todos os requisitos são atendidos
    Given que não existe um pagamento com external_id "ext-123"
    And o MercadoPago retorna um token válido
    And o MercadoPago retorna um QR Code válido "QRCODE123"
    When eu tento gerar um pagamento com external_id "ext-123", amount 1000 e description "Teste"
    Then um novo pagamento deve ser criado com external_id "ext-123", amount 1000, description "Teste" e código "QRCODE123"
    And o sistema deve publicar sucesso de criação com external_id "ext-123" e código "QRCODE123"

