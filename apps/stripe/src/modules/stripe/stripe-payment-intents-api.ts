import { ResultAsync } from "neverthrow";
import Stripe from "stripe";

import { StripeClient } from "@/modules/stripe/stripe-client";

import { CreatePaymentIntentError } from "./errors";
import { StripeRestrictedKey } from "./stripe-restricted-key";
import { IStripePaymentIntentsApi } from "./types";

export class StripePaymentIntentsApi implements IStripePaymentIntentsApi {
  private stripeApiWrapper: Pick<Stripe, "paymentIntents">;

  private constructor(stripeApiWrapper: Pick<Stripe, "paymentIntents">) {
    this.stripeApiWrapper = stripeApiWrapper;
  }

  static createFromKey(args: { key: StripeRestrictedKey }) {
    const stripeApiWrapper = StripeClient.createFromRestrictedKey(args.key);

    return new StripePaymentIntentsApi(stripeApiWrapper.nativeClient);
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
