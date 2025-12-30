#!/bin/bash

set -e

REGION="us-east-1"

USER_ID=${1}
POS_ID=${2}
CLIENT_ID=${3}
CLIENT_SECRET=${4}

if [ -z "$USER_ID" ] || [ -z "$POS_ID" ] || [ -z "$CLIENT_ID" ] || [ -z "$CLIENT_SECRET" ]; then
  echo "Uso: $0 <USER_ID> <POS_ID> <CLIENT_ID> <CLIENT_SECRET>"
  exit 1
fi

echo "🔐 Criando secrets no LocalStack Secrets Manager..."

EXISTING_SECRETS=$(aws secretsmanager list-secrets --region $REGION --query 'SecretList[].Name' --output text)

if echo "$EXISTING_SECRETS" | grep -q "mercadopago/qrcode_info"; then
  echo "⚠ Secret 'mercadopago/qrcode_info' já existe. Abortando."
  exit 1
fi

aws secretsmanager create-secret \
  --name mercadopago/qrcode_info \
  --region $REGION \
  --secret-string '{"userId":"'"$USER_ID"'","posId":"'"$POS_ID"'"}'

echo "✔ Secret 1 criado: mercadopago/qrcode_info"

if echo "$EXISTING_SECRETS" | grep -q "mercadopago/credentials"; then
  echo "⚠ Secret 'mercadopago/credentials' já existe. Abortando."
  exit 1
fi

aws secretsmanager create-secret \
  --name mercadopago/credentials \
  --region $REGION \
  --secret-string '{"clientId":"'"$CLIENT_ID"'","clientSecret":"'"$CLIENT_SECRET"'"}'

echo "✔ Secret 2 criado: mercadopago/credentials"

echo "🎉 Finalizado!"
