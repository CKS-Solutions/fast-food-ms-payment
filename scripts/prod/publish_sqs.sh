#!/bin/bash

set -e

REGION="us-east-1"
QUEUE_NAME="CKSPaymentQueue-api"

echo "🔐 Enviando mensagem de teste para a fila SQS: $QUEUE_NAME"

QUEUE_URL=$(aws sqs get-queue-url \
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
  --region $REGION \
  --output json

echo "✔ Mensagem enviada para a fila SQS: $QUEUE_NAME"
