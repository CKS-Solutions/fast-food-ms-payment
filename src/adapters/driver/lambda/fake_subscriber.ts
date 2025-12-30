import { HTTPSuccessResponse } from '@utils/http';
import { SNSEvent } from 'aws-lambda';

export async function handler(event: SNSEvent) {
  for (const record of event.Records) {
    const sns = record.Sns;

    console.log('MessageId:', sns.MessageId);
    console.log('TopicArn:', sns.TopicArn);
    console.log('Message:', sns.Message);

    try {
      const payload = JSON.parse(sns.Message);
      console.log('Payload parseado:', payload);
    } catch {
      console.error('Erro ao parsear a mensagem SNS como JSON');
    }
  }

  return new HTTPSuccessResponse({ message: 'Processed SNS messages' }).toLambdaResponse();
};