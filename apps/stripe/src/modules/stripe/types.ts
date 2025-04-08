import { Result } from "neverthrow";
import Stripe from "stripe";

import { BaseError } from "@/lib/errors";

import { StripeRestrictedKey } from "./stripe-restricted-key";

export interface IStripePaymentIntentsApiFactory {
  create(args: { key: StripeRestrictedKey }): IStripePaymentIntentsApi;
}

export interface IStripePaymentIntentsApi {
  createPaymentIntent(args: {
    params: Stripe.PaymentIntentCreateParams;
  }): Promise<Result<Stripe.PaymentIntent, InstanceType<typeof BaseError>>>;
}
