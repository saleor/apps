import { Result, ResultAsync } from "neverthrow";
import Stripe from "stripe";

import { StripeClient } from "./stripe-client";
import { StripeMoney } from "./stripe-money";
import { StripePaymentIntentId } from "./stripe-payment-intent-id";
import { StripeRestrictedKey } from "./stripe-restricted-key";
import { IStripeRefundsApi } from "./types";

export class StripeRefundsApi implements IStripeRefundsApi {
  private stripeApiWrapper: Pick<Stripe, "refunds">;

  private constructor(stripeApiWrapper: Pick<Stripe, "refunds">) {
    this.stripeApiWrapper = stripeApiWrapper;
  }

  static createFromKey(args: { key: StripeRestrictedKey }) {
    const stripeApiWrapper = StripeClient.createFromRestrictedKey(args.key);

    return new StripeRefundsApi(stripeApiWrapper.nativeClient);
  }

  async createRefund(args: {
    paymentIntentId: StripePaymentIntentId;
    stripeMoney: StripeMoney;
    metadata?: Stripe.MetadataParam;
  }): Promise<Result<Stripe.Refund, unknown>> {
    return ResultAsync.fromPromise(
      this.stripeApiWrapper.refunds.create({
        payment_intent: args.paymentIntentId,
        amount: args.stripeMoney.amount,
        metadata: args.metadata,
      }),
      (error) => error,
    );
  }
}
