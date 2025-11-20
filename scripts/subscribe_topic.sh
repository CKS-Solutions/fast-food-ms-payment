#!/bin/bash

set -e

ENDPOINT="http://localhost:4566"
REGION="us-east-1"

TOPIC=$(aws --endpoint-url=$ENDPOINT sns list-topics \
  --region $REGION \
  --query 'Topics[?ends_with(TopicArn, `:PaymentTopic`)].TopicArn' \
  --output text)

if [ -z "$TOPIC" ]; then
  echo "⚠ Topic 'PaymentTopic' não encontrado. Certifique-se de que oa topic foi criado antes de executar este script."
  exit 1
fi

echo "🔐 Criando subscription no PaymentTopic..."

EXISTING_SUBSCRIPTIONS=$(aws --endpoint-url=$ENDPOINT sns list-subscriptions-by-topic \
  --region $REGION \
  --topic-arn arn:aws:sns:us-east-1:000000000000:PaymentTopic \
  --query 'Subscriptions[].Endpoint' \
  --output text)

if echo "$EXISTING_SUBSCRIPTIONS" | grep -q "http://host.docker.internal:4000/sns"; then
  echo "⚠ Subscription para o endpoint http://host.docker.internal:4000/sns já existe. Abortando."
  exit 1
fi

aws --endpoint-url=$ENDPOINT sns subscribe \
  --region $REGION \
  --topic-arn arn:aws:sns:us-east-1:000000000000:PaymentTopic \
  --protocol http \
  --notification-endpoint http://host.docker.internal:4000/sns

echo "✔ Subscription criada para o endpoint http://host.docker.internal:4000/sns"