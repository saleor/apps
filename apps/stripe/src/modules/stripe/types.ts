import { Result } from "neverthrow";
import Stripe from "stripe";

import { CreatePaymentIntentError, StripeEventParsingError } from "./errors";
import { StripeRestrictedKey } from "./stripe-restricted-key";

export interface IStripePaymentIntentsApiFactory {
  create(args: { key: StripeRestrictedKey }): IStripePaymentIntentsApi;
}

export interface IStripePaymentIntentsApi {
  createPaymentIntent(args: {
    params: Stripe.PaymentIntentCreateParams;
  }): Promise<Result<Stripe.PaymentIntent, InstanceType<typeof CreatePaymentIntentError>>>;
}

export interface IStripeSignatureVerify {
  verifySignature({
    signatureHeader,
    webhookSecret,
    rawBody,
  }: {
    rawBody: string;
    signatureHeader: string;
    webhookSecret: string;
  }): Result<Stripe.Event, InstanceType<typeof StripeEventParsingError>>;
}
