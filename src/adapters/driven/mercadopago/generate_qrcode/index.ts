import { GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import axios from "axios";

import { GenerateQRCodeBody, GenerateQRCodeInfo, GenerateQRCodeResponse } from "./generate_qrcode.types";
import { IMercadoPagoGenerateQRCode } from "@ports/generate_qrcode_mp";
import { HTTPPreconditionFailed, HTTPStatus } from "@utils/http";
import { BASE_URL, QRCODE_INFO_SECRET_ID } from "../utils";
import { SMClientWrapper } from "@aws/sm_client";

const THIRTY_MINUTES_IN_MS = 30 * 60 * 1000;

export class MercadoPagoGenerateQRCode implements IMercadoPagoGenerateQRCode {
  private smClient: SMClientWrapper;

  constructor(smClient: SMClientWrapper) {
    this.smClient = smClient;
  }

  async generateQRCode(paymentId: string, amount: number, description: string, token: string): Promise<string | null> {
    const { userId, posId } = await this.getQRCodeInfo();

    const expirationDate = Date.now() + THIRTY_MINUTES_IN_MS;
    const body: GenerateQRCodeBody = {
      external_reference: paymentId,
      title: "Payment QR Code",
      description: description,
      total_amount: amount,
      expiration_date: new Date(expirationDate).toISOString(),
      items: [
        {
          title: "Payment",
          description: description,
          unit_price: amount,
          quantity: 1,
          total_amount: amount,
          unit_measure: "unit",
        },
      ],
    }

    const response = await axios.post<GenerateQRCodeResponse>(`${BASE_URL}/instore/orders/qr/seller/collectors/${userId}/pos/${posId}/qrs`, body, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if ((response.status !== HTTPStatus.OK && response.status !== HTTPStatus.Created) || !response.data.qr_data) {
      console.error("Failed to generate MercadoPago QR code", response.data);
      return null;
    }

    return response.data.qr_data;
  }

  private async getQRCodeInfo(): Promise<GenerateQRCodeInfo> {
    const command = new GetSecretValueCommand({
      SecretId: QRCODE_INFO_SECRET_ID,
    })

    const { SecretString } = await this.smClient.send(command);

    if (!SecretString) {
      throw new HTTPPreconditionFailed("Failed to retrieve MercadoPago credentials from Secrets Manager");
    }

    return JSON.parse(SecretString) as GenerateQRCodeInfo;
  }
}