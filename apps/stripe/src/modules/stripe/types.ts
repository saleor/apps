import { Result } from "neverthrow";
import Stripe from "stripe";

import { BaseError } from "@/lib/errors";
import { SaleorTransationId } from "@/modules/saleor/saleor-transaction-id";
import { StripeWebhookSecret } from "@/modules/stripe/stripe-webhook-secret";

import { StripeMoney } from "./stripe-money";
import { StripePaymentIntentId } from "./stripe-payment-intent-id";
import { StripeRestrictedKey } from "./stripe-restricted-key";

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
    metadata?: AllowedStripeIntentMetadata;
  }): Promise<Result<Stripe.Refund, unknown>>;
}

export type AllowedStripeIntentMetadata = {
  saleor_transaction_id?: SaleorTransationId;
  saleor_source_id?: string;
  saleor_source_type?: "Checkout" | "Order";
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
  metadata?: AllowedStripeIntentMetadata;
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
