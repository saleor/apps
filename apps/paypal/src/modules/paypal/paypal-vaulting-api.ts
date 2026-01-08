import { Result, ResultAsync } from "neverthrow";

import { PayPalClient } from "./paypal-client";
import { PayPalClientId } from "./paypal-client-id";
import { PayPalClientSecret } from "./paypal-client-secret";
import { PayPalMerchantId } from "./paypal-merchant-id";
import { PayPalEnv } from "./paypal-env";

/**
 * PayPal Setup Token
 * Used for vault-without-purchase flows
 */
export interface PayPalSetupToken {
  id: string;
  customer?: {
    id?: string;
  };
  status: "CREATED" | "APPROVED" | "PAYER_ACTION_REQUIRED";
  payment_source?: {
    card?: any;
    paypal?: any;
    venmo?: any;
  };
  links?: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
}

/**
 * PayPal Payment Token
 * Represents a vaulted payment method
 */
export interface PayPalPaymentToken {
  id: string;
  customer: {
    id: string;
  };
  payment_source: {
    card?: {
      brand?: string;
      last_digits?: string;
      expiry?: string;
      billing_address?: any;
    };
    paypal?: {
      email_address?: string;
      account_id?: string;
      name?: any;
      phone?: any;
      address?: any;
    };
    venmo?: {
      email_address?: string;
      account_id?: string;
      user_name?: string;
      name?: any;
      phone?: any;
      address?: any;
    };
  };
  links?: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
}

/**
 * PayPal Vaulting API
 *
 * Handles payment method vaulting (saving payment methods for future use)
 * Supports:
 * - Setup Tokens API (vault without purchase)
 * - Payment Tokens API (manage vaulted payment methods)
 * - PayPal, Venmo, and Card vaulting
 *
 * @see https://developer.paypal.com/docs/checkout/save-payment-methods/
 */
export class PayPalVaultingApi {
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
  }): PayPalVaultingApi {
    const client = PayPalClient.create(args);
    return new PayPalVaultingApi(client);
  }

  /**
   * Create Setup Token
   *
   * Creates a setup token for vault-without-purchase flows.
   * The buyer can save their payment method without making a purchase.
   *
   * @see https://developer.paypal.com/docs/api/payment-tokens/v3/#setup-tokens_create
   */
  async createSetupToken(args: {
    customerId?: string;
    paymentSource: {
      card?: {
        verification_method?: "SCA_WHEN_REQUIRED" | "SCA_ALWAYS";
        experience_context?: {
          brand_name?: string;
          locale?: string;
          return_url?: string;
          cancel_url?: string;
        };
      };
      paypal?: {
        description?: string;
        shipping?: any;
        permit_multiple_payment_tokens?: boolean;
        usage_type?: "MERCHANT" | "PLATFORM";
        customer_type?: "CONSUMER" | "BUSINESS";
        experience_context?: {
          brand_name?: string;
          locale?: string;
          return_url?: string;
          cancel_url?: string;
          shipping_preference?: "GET_FROM_FILE" | "NO_SHIPPING" | "SET_PROVIDED_ADDRESS";
          payment_method_preference?: "IMMEDIATE_PAYMENT_REQUIRED" | "UNRESTRICTED";
        };
      };
      venmo?: {
        description?: string;
        shipping?: any;
        permit_multiple_payment_tokens?: boolean;
        usage_type?: "MERCHANT" | "PLATFORM";
        customer_type?: "CONSUMER";
        experience_context?: {
          brand_name?: string;
          shipping_preference?: "GET_FROM_FILE" | "NO_SHIPPING" | "SET_PROVIDED_ADDRESS";
        };
      };
    };
  }): Promise<Result<PayPalSetupToken, unknown>> {
    const requestBody: any = {
      payment_source: args.paymentSource,
    };

    if (args.customerId) {
      requestBody.customer = {
        id: args.customerId,
      };
    }

    return ResultAsync.fromPromise(
      this.client.makeRequest<PayPalSetupToken>({
        method: "POST",
        path: "/v3/vault/setup-tokens",
        body: requestBody,
      }),
      (error) => error,
    );
  }

  /**
   * Create Payment Token from Setup Token
   *
   * After the buyer approves a setup token, use this to create a payment token
   * that can be used for future transactions.
   *
   * @see https://developer.paypal.com/docs/api/payment-tokens/v3/#payment-tokens_create
   */
  async createPaymentTokenFromSetupToken(args: {
    setupTokenId: string;
  }): Promise<Result<PayPalPaymentToken, unknown>> {
    return ResultAsync.fromPromise(
      this.client.makeRequest<PayPalPaymentToken>({
        method: "POST",
        path: "/v3/vault/payment-tokens",
        body: {
          payment_source: {
            token: {
              id: args.setupTokenId,
              type: "SETUP_TOKEN",
            },
          },
        },
      }),
      (error) => error,
    );
  }

  /**
   * Get Payment Token
   *
   * Retrieves details of a vaulted payment token.
   *
   * @see https://developer.paypal.com/docs/api/payment-tokens/v3/#payment-tokens_get
   */
  async getPaymentToken(args: {
    paymentTokenId: string;
  }): Promise<Result<PayPalPaymentToken, unknown>> {
    return ResultAsync.fromPromise(
      this.client.makeRequest<PayPalPaymentToken>({
        method: "GET",
        path: `/v3/vault/payment-tokens/${args.paymentTokenId}`,
      }),
      (error) => error,
    );
  }

  /**
   * Delete Payment Token
   *
   * Deletes a vaulted payment token.
   *
   * @see https://developer.paypal.com/docs/api/payment-tokens/v3/#payment-tokens_delete
   */
  async deletePaymentToken(args: {
    paymentTokenId: string;
  }): Promise<Result<void, unknown>> {
    return ResultAsync.fromPromise(
      this.client.makeRequest<void>({
        method: "DELETE",
        path: `/v3/vault/payment-tokens/${args.paymentTokenId}`,
      }),
      (error) => error,
    );
  }

  /**
   * List Payment Tokens for Customer
   *
   * Lists all payment tokens for a specific customer.
   *
   * @see https://developer.paypal.com/docs/api/payment-tokens/v3/#payment-tokens_list
   */
  async listPaymentTokens(args: {
    customerId: string;
    pageSize?: number;
    page?: number;
  }): Promise<
    Result<
      {
        payment_tokens: PayPalPaymentToken[];
        total_items?: number;
        total_pages?: number;
        links?: Array<{
          href: string;
          rel: string;
          method: string;
        }>;
      },
      unknown
    >
  > {
    const queryParams = new URLSearchParams({
      customer_id: args.customerId,
      ...(args.pageSize && { page_size: args.pageSize.toString() }),
      ...(args.page && { page: args.page.toString() }),
    });

    return ResultAsync.fromPromise(
      this.client.makeRequest<{
        payment_tokens: PayPalPaymentToken[];
        total_items?: number;
        total_pages?: number;
        links?: Array<{
          href: string;
          rel: string;
          method: string;
        }>;
      }>({
        method: "GET",
        path: `/v3/vault/payment-tokens?${queryParams.toString()}`,
      }),
      (error) => error,
    );
  }
}
