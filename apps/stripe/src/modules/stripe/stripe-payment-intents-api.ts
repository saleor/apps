import { ResultAsync } from "neverthrow";
import Stripe from "stripe";

import { env } from "@/lib/env";
import { BaseError } from "@/lib/errors";
import pkg from "@/package.json";

import { StripeRestrictedKey } from "./stripe-restricted-key";
import { IStripePaymentIntentsApi } from "./types";

export class StripePaymentIntentsApi implements IStripePaymentIntentsApi {
  static CreatePaymentIntentError = BaseError.subclass("CreatePaymentIntentError");

  private stripeApiWrapper: Pick<Stripe, "paymentIntents">;

  private constructor(stripeApiWrapper: Pick<Stripe, "paymentIntents">) {
    this.stripeApiWrapper = stripeApiWrapper;
  }

  static create(key: StripeRestrictedKey) {
    const stripeApiWrapper = new Stripe(key.keyValue, {
      typescript: true,
      httpClient: Stripe.createFetchHttpClient(fetch), // this allows us to mock the fetch
      appInfo: {
        name: "Saleor App Payment Stripe",
        version: pkg.version,
        url: "https://apps.saleor.io/apps/stripe",
        partner_id: env.STRIPE_PARTNER_ID,
      },
    });

    return new StripePaymentIntentsApi(stripeApiWrapper);
  }

  async createPaymentIntent(params: Stripe.PaymentIntentCreateParams) {
    return ResultAsync.fromPromise(
      this.stripeApiWrapper.paymentIntents.create(params),
      (error) =>
        new StripePaymentIntentsApi.CreatePaymentIntentError("Failed to create payment intent", {
          cause: error,
        }),
    );
  }
}
