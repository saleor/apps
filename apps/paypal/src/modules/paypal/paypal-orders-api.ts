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
    // New parameters for PayPal certification compliance
    softDescriptor?: string;
    payer?: {
      email_address?: string;
      phone?: {
        phone_type?: "FAX" | "HOME" | "MOBILE" | "OTHER" | "PAGER";
        phone_number?: {
          national_number: string;
        };
      };
      name?: {
        given_name?: string;
        surname?: string;
      };
    };
    shipping?: {
      name?: {
        full_name?: string;
      };
      address?: {
        address_line_1?: string;
        address_line_2?: string;
        admin_area_2?: string; // City
        admin_area_1?: string; // State/Province
        postal_code?: string;
        country_code?: string;
      };
      email_address?: string;
      phone_number?: {
        national_number?: string;
      };
    };
    experienceContext?: {
      brand_name?: string;
      locale?: string;
      landing_page?: "LOGIN" | "BILLING" | "NO_PREFERENCE";
      shipping_preference?: "GET_FROM_FILE" | "NO_SHIPPING" | "SET_PROVIDED_ADDRESS";
      user_action?: "CONTINUE" | "PAY_NOW";
      return_url?: string;
      cancel_url?: string;
    };
    paymentSource?: {
      paypal?: {
        experience_context?: {
          payment_method_preference?: "IMMEDIATE_PAYMENT_REQUIRED" | "UNRESTRICTED";
          brand_name?: string;
          locale?: string;
          landing_page?: "LOGIN" | "BILLING" | "NO_PREFERENCE";
          shipping_preference?: "GET_FROM_FILE" | "NO_SHIPPING" | "SET_PROVIDED_ADDRESS";
          user_action?: "CONTINUE" | "PAY_NOW";
          return_url?: string;
          cancel_url?: string;
          app_switch_preference?: boolean;
          callback_configuration?: {
            callback_url: string;
            callback_events?: Array<
              | "SHIPPING_CHANGE"
              | "SHIPPING_OPTIONS_CHANGE"
              | "BILLING_ADDRESS_CHANGE"
              | "PHONE_NUMBER_CHANGE"
            >;
          };
        };
        vault_id?: string;
      };
      card?: {
        vault_id?: string;
      };
      venmo?: {
        experience_context?: {
          brand_name?: string;
          shipping_preference?: "GET_FROM_FILE" | "NO_SHIPPING" | "SET_PROVIDED_ADDRESS";
        };
        vault_id?: string;
      };
    };
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
      ...(args.softDescriptor && {
        soft_descriptor: args.softDescriptor,
      }),
      ...(args.shipping && {
        shipping: args.shipping,
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

    // Build request body with new certification-required parameters
    const requestBody: any = {
      intent: args.intent,
      purchase_units: [purchaseUnit],
    };

    // Add payer information if provided (for buyer login prefill)
    if (args.payer) {
      requestBody.payer = args.payer;
    }

    // Add application_context if experienceContext provided
    if (args.experienceContext) {
      requestBody.application_context = args.experienceContext;
    }

    // Add payment_source if provided (includes callback_configuration for shipping callbacks)
    if (args.paymentSource) {
      requestBody.payment_source = args.paymentSource;
    }

    return ResultAsync.fromPromise(
      this.client.makeRequest<PayPalOrder>({
        method: "POST",
        path: "/v2/checkout/orders",
        body: requestBody,
        includeBnCode: true, // Per PDF Page 4: BN code required in "create order" requests
      }),
      (error) => error,
    );
  }

  async captureOrder(args: { orderId: PayPalOrderId }): Promise<Result<PayPalOrder, unknown>> {
    return ResultAsync.fromPromise(
      this.client.makeRequest<PayPalOrder>({
        method: "POST",
        path: `/v2/checkout/orders/${args.orderId}/capture`,
        includeBnCode: true, // Per PDF Page 4: BN code required in order transactions
      }),
      (error) => error,
    );
  }

  async authorizeOrder(args: { orderId: PayPalOrderId }): Promise<Result<PayPalOrder, unknown>> {
    return ResultAsync.fromPromise(
      this.client.makeRequest<PayPalOrder>({
        method: "POST",
        path: `/v2/checkout/orders/${args.orderId}/authorize`,
        includeBnCode: true, // Per PDF Page 4: BN code required in order transactions
      }),
      (error) => error,
    );
  }

  async getOrder(args: { orderId: PayPalOrderId }): Promise<Result<PayPalOrder, unknown>> {
    return ResultAsync.fromPromise(
      this.client.makeRequest<PayPalOrder>({
        method: "GET",
        path: `/v2/checkout/orders/${args.orderId}`,
        includeBnCode: true, // Per PDF Page 4: BN code required in order transactions
      }),
      (error) => error,
    );
  }

  async patchOrder(args: {
    orderId: PayPalOrderId;
    operations: Array<{
      op: "add" | "replace" | "remove";
      path: string;
      value?: any;
      from?: string;
    }>;
  }): Promise<Result<void, unknown>> {
    return ResultAsync.fromPromise(
      this.client.makeRequest<void>({
        method: "PATCH",
        path: `/v2/checkout/orders/${args.orderId}`,
        body: args.operations,
        includeBnCode: true, // Per PDF Page 4: BN code required in order transactions
      }),
      (error) => error,
    );
  }
}
