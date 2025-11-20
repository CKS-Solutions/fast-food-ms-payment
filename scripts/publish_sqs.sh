#!/bin/bash

set -e

ENDPOINT="http://localhost:4566"
REGION="us-east-1"
QUEUE_NAME="PaymentQueue"

echo "🔐 Enviando mensagem de teste para a fila SQS: $QUEUE_NAME"

QUEUE_URL=$(aws --endpoint-url $ENDPOINT sqs get-queue-url \
  --queue-name $QUEUE_NAME \
  --region $REGION \
  --query QueueUrl \
  --output text)

echo "✔ URL da fila obtida: $QUEUE_URL"

MESSAGE=$(cat <<EOF
{
  "external_id": "12345",
  "amount": 149.90,
  "description": "Pagamento de teste"
}
EOF
)

echo "✔ Mensagem preparada: $MESSAGE"

aws sqs send-message \
  --queue-url $QUEUE_URL \
  --message-body "$MESSAGE" \
  --endpoint-url $ENDPOINT \
  --region $REGION \
  --output json

echo "✔ Mensagem enviada para a fila SQS: $QUEUE_NAME"
