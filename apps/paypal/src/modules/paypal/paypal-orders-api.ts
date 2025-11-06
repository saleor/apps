import { Result, ResultAsync } from "neverthrow";

import { PayPalClient } from "./paypal-client";
import { PayPalClientId } from "./paypal-client-id";
import { PayPalClientSecret } from "./paypal-client-secret";
import { PayPalMerchantId } from "./paypal-merchant-id";
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
    partnerMerchantId?: string | null;
    merchantId?: PayPalMerchantId | null;
    merchantEmail?: string | null;
    bnCode?: string | null;
    env: PayPalEnv;
  }): PayPalOrdersApi {
    const client = PayPalClient.create(args);
    return new PayPalOrdersApi(client);
  }

  async createOrder(args: {
    amount: PayPalMoney;
    intent: "CAPTURE" | "AUTHORIZE";
    payeeMerchantId?: string;
    metadata?: Record<string, string>;
    platformFees?: Array<{
      amount: PayPalMoney;
      payee?: {
        merchant_id: string;
      };
    }>;
  }): Promise<Result<PayPalOrder, unknown>> {
    // Build purchase unit with optional platform fees
    const purchaseUnit: any = {
      amount: args.amount,
      ...(args.metadata && {
        custom_id: JSON.stringify(args.metadata),
      }),
    };

    // Add merchant payee if provided (required for platform fees)
    if (args.payeeMerchantId) {
      purchaseUnit.payee = {
        merchant_id: args.payeeMerchantId,
      };
    }

    // Add platform fees if provided
    // Platform fees are used by PayPal partners to collect partner fees from merchant transactions
    // The payee in purchase_units specifies who receives the payment (the merchant)
    // The payee in platform_fees can optionally specify who receives the fee (defaults to the partner)
    if (args.platformFees && args.platformFees.length > 0) {
      purchaseUnit.payment_instruction = {
        disbursement_mode: "INSTANT",
        platform_fees: args.platformFees,
      };
    }

    return ResultAsync.fromPromise(
      this.client.makeRequest<PayPalOrder>({
        method: "POST",
        path: "/v2/checkout/orders",
        body: {
          intent: args.intent,
          purchase_units: [purchaseUnit],
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
