import { type Result } from "neverthrow";
import type Stripe from "stripe";

import { BaseError } from "@/lib/errors";
import { type SaleorTransationId } from "@/modules/saleor/saleor-transaction-id";
import { type StripeWebhookSecret } from "@/modules/stripe/stripe-webhook-secret";

import { type StripeMoney } from "./stripe-money";
import { type StripePaymentIntentId } from "./stripe-payment-intent-id";
import { type StripeRestrictedKey } from "./stripe-restricted-key";

export interface IStripePaymentIntentsApiFactory {
  create(args: { key: StripeRestrictedKey }): IStripePaymentIntentsApi;
}

export interface IStripeRefundsApiFactory {
  create(args: { key: StripeRestrictedKey }): IStripeRefundsApi;
}

export interface IStripeRefundsApi {
  createRefund(args: {
    paymentIntentId: StripePaymentIntentId;
    stripeMoney: StripeMoney;
    metadata?: AllowedStripeObjectMetadata;
  }): Promise<Result<Stripe.Refund, unknown>>;
}

/**
 * Fixed metadata keys that are allowed on Stripe objects - intent and refund.
 */
export type AllowedStripeObjectMetadata = {
  saleor_transaction_id?: SaleorTransationId;
  saleor_source_id?: string;
  saleor_source_type?: "Checkout" | "Order";
  saleor_api_url?: string;
  saleor_app_id?: string;
};

export interface CreatePaymentIntentArgs {
  stripeMoney: StripeMoney;
  intentParams: Pick<
    Stripe.PaymentIntentCreateParams,
    | "automatic_payment_methods"
    | "payment_method_options"
    | "confirm"
    | "payment_method"
    | "return_url"
  >;
  idempotencyKey: string;
  metadata?: AllowedStripeObjectMetadata;
}

export interface IStripePaymentIntentsApi {
  createPaymentIntent(
    args: CreatePaymentIntentArgs,
  ): Promise<Result<Stripe.PaymentIntent, unknown>>;
  getPaymentIntent(args: {
    id: StripePaymentIntentId;
  }): Promise<Result<Stripe.PaymentIntent, unknown>>;
  capturePaymentIntent(args: {
    id: StripePaymentIntentId;
  }): Promise<Result<Stripe.PaymentIntent, unknown>>;
  cancelPaymentIntent(args: {
    id: StripePaymentIntentId;
  }): Promise<Result<Stripe.PaymentIntent, unknown>>;
}

export interface IStripeEventVerify {
  verifyEvent({
    signatureHeader,
    webhookSecret,
    rawBody,
  }: {
    rawBody: string;
    signatureHeader: string;
    webhookSecret: StripeWebhookSecret;
  }): Result<Stripe.Event, InstanceType<typeof StripeEventParsingError>>;
}

export const StripeEventParsingError = BaseError.subclass("StripeEventParsingError", {
  props: {
    internalName: "StripeEventParsingError" as const,
  },
});
