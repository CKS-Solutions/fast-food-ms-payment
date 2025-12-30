import { GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import axios from "axios";

import { GenerateTokenCredentials, GenerateTokenResponse } from "./generate_token.types";
import { IMercadoPagoGenerateToken } from "@ports/generate_token_mp";
import { HTTPPreconditionFailed, HTTPStatus } from "@utils/http";
import { BASE_URL, CREDENTIALS_SECRET_ID } from "../utils";
import { SMClientWrapper } from "@aws/sm_client";

export class MercadoPagoGenerateToken implements IMercadoPagoGenerateToken {
  private readonly smClient: SMClientWrapper;

  constructor(smClient: SMClientWrapper) {
    this.smClient = smClient;
  }

  async generateToken(): Promise<string | null> {
    const credentials = await this.getCredentials();

    const formData = new URLSearchParams();
    formData.append("grant_type", "client_credentials");
    formData.append("client_id", credentials.clientId);
    formData.append("client_secret", credentials.clientSecret);

    const response = await axios.post<GenerateTokenResponse>(`${BASE_URL}/oauth/token`, formData.toString(), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    if (response.status !== HTTPStatus.OK || !response.data.access_token) {
      console.error("Failed to generate MercadoPago token", response.data);
      return null;
    }

    return response.data.access_token;
  }

  private async getCredentials(): Promise<GenerateTokenCredentials> {
    const command = new GetSecretValueCommand({
      SecretId: CREDENTIALS_SECRET_ID,
    })

    const { SecretString } = await this.smClient.send(command);

    if (!SecretString) {
      throw new HTTPPreconditionFailed("Failed to retrieve MercadoPago credentials from Secrets Manager");
    }

    return JSON.parse(SecretString) as GenerateTokenCredentials;
  }
}