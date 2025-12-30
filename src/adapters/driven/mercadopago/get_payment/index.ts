import axios from "axios";

import { HTTPPreconditionFailed, HTTPStatus } from "@utils/http";
import { IMercadoPagoGetPayment } from "@ports/get_payment_mp";
import { GetPaymentResponse } from "./get_payment.types";
import { BASE_URL } from "../utils";

const STATUS_MOCK = "approved";

export class MercadoPagoGetPayment implements IMercadoPagoGetPayment {
  async getPaymentStatus(paymentId: string, token: string): Promise<string> {
    const response = await axios.get<GetPaymentResponse>(`${BASE_URL}/v1/payments/${paymentId}`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (response.status !== HTTPStatus.OK || !response.data.status) {
      console.error("Failed to get MercadoPago payment status", response.data);
      throw new HTTPPreconditionFailed("Failed to get payment status");
    }
    
    return response.data.status;
  }

  async getPaymentStatusMock(paymentId: string, _: string): Promise<string> {
    console.info("Mocking getPaymentStatus for MercadoPago", paymentId);
    return STATUS_MOCK;
  }
}