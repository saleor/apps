import { ResultAsync } from "neverthrow";
import Stripe from "stripe";

import { env } from "@/lib/env";
import pkg from "@/package.json";

import { CreatePaymentIntentError } from "./errors";
import { StripeRestrictedKey } from "./stripe-restricted-key";
import { IStripePaymentIntentsApi } from "./types";

export class StripePaymentIntentsApi implements IStripePaymentIntentsApi {
  private stripeApiWrapper: Pick<Stripe, "paymentIntents">;

  private constructor(stripeApiWrapper: Pick<Stripe, "paymentIntents">) {
    this.stripeApiWrapper = stripeApiWrapper;
  }

  static createFromKey(args: { key: StripeRestrictedKey }) {
    const stripeApiWrapper = new Stripe(args.key.keyValue, {
      typescript: true,
      httpClient: Stripe.createFetchHttpClient(fetch), // this allow us to mock the fetch
      appInfo: {
        name: "Saleor App Payment Stripe",
        version: pkg.version,
        url: "https://apps.saleor.io/apps/stripe",
        partner_id: env.STRIPE_PARTNER_ID,
      },
    });

    return new StripePaymentIntentsApi(stripeApiWrapper);
  }

  async createPaymentIntent(args: { params: Stripe.PaymentIntentCreateParams }) {
    return ResultAsync.fromPromise(
      this.stripeApiWrapper.paymentIntents.create(args.params),
      (error) =>
        new CreatePaymentIntentError("Failed to create payment intent", {
          cause: error,
        }),
    );
  }
}
