import { Result } from "neverthrow";
import Stripe from "stripe";

import { BaseError } from "@/lib/errors";
import { StripePaymentIntentsApi } from "@/modules/stripe/stripe-payment-intents-api";
import { StripeWebhookSecret } from "@/modules/stripe/stripe-webhook-secret";

import { StripeRestrictedKey } from "./stripe-restricted-key";

export interface IStripePaymentIntentsApiFactory {
  create(args: { key: StripeRestrictedKey }): IStripePaymentIntentsApi;
}

export type StripePaymentIntentAPIError =
  | InstanceType<typeof StripePaymentIntentsApi.StripeCardError>
  | InstanceType<typeof StripePaymentIntentsApi.StripeInvalidRequestError>
  | InstanceType<typeof StripePaymentIntentsApi.StripeRateLimitError>
  | InstanceType<typeof StripePaymentIntentsApi.StripeConnectionError>
  | InstanceType<typeof StripePaymentIntentsApi.StripeAPIError>
  | InstanceType<typeof StripePaymentIntentsApi.StripeAuthenticationError>
  | InstanceType<typeof StripePaymentIntentsApi.StripePermissionError>
  | InstanceType<typeof StripePaymentIntentsApi.StripeIdempotencyError>
  | InstanceType<typeof StripePaymentIntentsApi.UnknownError>;

export interface IStripePaymentIntentsApi {
  createPaymentIntent(args: {
    params: Stripe.PaymentIntentCreateParams;
  }): Promise<Result<Stripe.PaymentIntent, StripePaymentIntentAPIError>>;
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
