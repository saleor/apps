import { Result, ResultAsync } from "neverthrow";
import Stripe from "stripe";

import { StripeClient } from "@/modules/stripe/stripe-client";

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

  async createPaymentIntent(args: {
    params: Stripe.PaymentIntentCreateParams;
  }): Promise<Result<Stripe.PaymentIntent, unknown>> {
    return ResultAsync.fromPromise(
      this.stripeApiWrapper.paymentIntents.create(args.params),
      (error) => error,
    );
  }
}
