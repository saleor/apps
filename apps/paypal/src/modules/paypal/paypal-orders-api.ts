import { Result, ResultAsync } from "neverthrow";

import { PayPalClient } from "./paypal-client";
import { PayPalClientId } from "./paypal-client-id";
import { PayPalClientSecret } from "./paypal-client-secret";
import { PayPalEnv } from "./paypal-env";
import { PayPalMoney } from "./paypal-money";
import { PayPalOrderId } from "./paypal-order-id";
import { IPayPalOrdersApi, PayPalOrder } from "./types";

export class PayPalOrdersApi implements IPayPalOrdersApi {
  private client: PayPalClient;

  private constructor(client: PayPalClient) {
    this.client = client;
  }

  static create(args: {
    clientId: PayPalClientId;
    clientSecret: PayPalClientSecret;
    env: PayPalEnv;
  }): PayPalOrdersApi {
    const client = PayPalClient.create(args);
    return new PayPalOrdersApi(client);
  }

  async createOrder(args: {
    amount: PayPalMoney;
    intent: "CAPTURE" | "AUTHORIZE";
    metadata?: Record<string, string>;
  }): Promise<Result<PayPalOrder, unknown>> {
    return ResultAsync.fromPromise(
      this.client.makeRequest<PayPalOrder>({
        method: "POST",
        path: "/v2/checkout/orders",
        body: {
          intent: args.intent,
          purchase_units: [
            {
              amount: args.amount,
              ...(args.metadata && {
                custom_id: JSON.stringify(args.metadata),
              }),
            },
          ],
        },
      }),
      (error) => error,
    );
  }

  async captureOrder(args: { orderId: PayPalOrderId }): Promise<Result<PayPalOrder, unknown>> {
    return ResultAsync.fromPromise(
      this.client.makeRequest<PayPalOrder>({
        method: "POST",
        path: `/v2/checkout/orders/${args.orderId}/capture`,
      }),
      (error) => error,
    );
  }

  async authorizeOrder(args: { orderId: PayPalOrderId }): Promise<Result<PayPalOrder, unknown>> {
    return ResultAsync.fromPromise(
      this.client.makeRequest<PayPalOrder>({
        method: "POST",
        path: `/v2/checkout/orders/${args.orderId}/authorize`,
      }),
      (error) => error,
    );
  }

  async getOrder(args: { orderId: PayPalOrderId }): Promise<Result<PayPalOrder, unknown>> {
    return ResultAsync.fromPromise(
      this.client.makeRequest<PayPalOrder>({
        method: "GET",
        path: `/v2/checkout/orders/${args.orderId}`,
      }),
      (error) => error,
    );
  }
}
