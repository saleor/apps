import { ResultAsync } from "neverthrow";
import Stripe from "stripe";

import { env } from "@/lib/env";
import { BaseError } from "@/lib/errors";
import { StripeRestrictedKey } from "@/modules/stripe/stripe-restricted-key";
import pkg from "@/package.json";

export class StripePaymentIntentsApi {
  static CreatePaymentIntentError = BaseError.subclass("CreatePaymentIntentError");

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

  createPaymentIntent(args: { params: Stripe.PaymentIntentCreateParams }) {
    return ResultAsync.fromPromise(
      this.stripeApiWrapper.paymentIntents.create(args.params),
      (error) =>
        new StripePaymentIntentsApi.CreatePaymentIntentError("Failed to create payment intent", {
          cause: error,
        }),
    );
  }
}
