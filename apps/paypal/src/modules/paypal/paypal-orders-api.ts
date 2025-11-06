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
    items?: Array<{
      name: string;
      quantity: string;
      unit_amount: PayPalMoney;
      description?: string;
      sku?: string;
      category?: "DIGITAL_GOODS" | "PHYSICAL_GOODS" | "DONATION";
      image_url?: string;
    }>;
    amountBreakdown?: {
      itemTotal?: number;
      shipping?: number;
      taxTotal?: number;
    };
    platformFees?: Array<{
      amount: PayPalMoney;
      payee?: {
        merchant_id: string;
      };
    }>;
  }): Promise<Result<PayPalOrder, unknown>> {
    // Build amount object with breakdown if items are provided
    // PayPal requires: amount.value = breakdown.item_total + breakdown.shipping + breakdown.tax_total
    const amountObject: any = args.items && args.items.length > 0 && args.amountBreakdown
      ? {
          currency_code: args.amount.currency_code,
          value: args.amount.value,
          breakdown: {
            ...(args.amountBreakdown.itemTotal !== undefined && {
              item_total: {
                currency_code: args.amount.currency_code,
                value: args.amountBreakdown.itemTotal.toFixed(2),
              },
            }),
            ...(args.amountBreakdown.shipping !== undefined && args.amountBreakdown.shipping > 0 && {
              shipping: {
                currency_code: args.amount.currency_code,
                value: args.amountBreakdown.shipping.toFixed(2),
              },
            }),
            ...(args.amountBreakdown.taxTotal !== undefined && args.amountBreakdown.taxTotal > 0 && {
              tax_total: {
                currency_code: args.amount.currency_code,
                value: args.amountBreakdown.taxTotal.toFixed(2),
              },
            }),
          },
        }
      : args.amount;

    // Build purchase unit with optional platform fees and items
    const purchaseUnit: any = {
      amount: amountObject,
      ...(args.metadata && {
        custom_id: JSON.stringify(args.metadata),
      }),
      ...(args.items && args.items.length > 0 && {
        items: args.items,
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
