import { Result, ResultAsync } from "neverthrow";
import Stripe from "stripe";

import { StripeClient } from "@/modules/stripe/stripe-client";

import { StripePaymentIntentId } from "./stripe-payment-intent-id";
import { StripeRestrictedKey } from "./stripe-restricted-key";
import { CreatePaymentIntentArgs, IStripePaymentIntentsApi } from "./types";

export class StripePaymentIntentsApi implements IStripePaymentIntentsApi {
  private stripeApiWrapper: Pick<Stripe, "paymentIntents">;

  private constructor(stripeApiWrapper: Pick<Stripe, "paymentIntents">) {
    this.stripeApiWrapper = stripeApiWrapper;
  }

  static createFromKey(args: { key: StripeRestrictedKey }) {
    const stripeApiWrapper = StripeClient.createFromRestrictedKey(args.key);

    return new StripePaymentIntentsApi(stripeApiWrapper.nativeClient);
  }

  static createFromClient(client: StripeClient) {
    return new StripePaymentIntentsApi(client.nativeClient);
  }

  async createPaymentIntent(
    args: CreatePaymentIntentArgs,
  ): Promise<Result<Stripe.PaymentIntent, unknown>> {
    return ResultAsync.fromPromise(
      this.stripeApiWrapper.paymentIntents.create(
        {
          ...args.intentParams,
          amount: args.stripeMoney.amount,
          currency: args.stripeMoney.currency,
          ...(args.metadata && { metadata: args.metadata }),
        },
        {
          idempotencyKey: args.idempotencyKey,
          stripeAccount: args.stripeAccount, // Pass vendor-specific account ID
        },
      ),
      (error) => error,
    );
  }

  async getPaymentIntent(args: {
    id: StripePaymentIntentId;
    stripeAccount?: string;
  }): Promise<Result<Stripe.PaymentIntent, unknown>> {
    return ResultAsync.fromPromise(
      this.stripeApiWrapper.paymentIntents.retrieve(args.id, {
        expand: ["payment_method"],
        ...(args.stripeAccount && { stripeAccount: args.stripeAccount }),
      }),
      (error) => error,
    );
  }

  async capturePaymentIntent(args: {
    id: StripePaymentIntentId;
    stripeAccount?: string;
  }): Promise<Result<Stripe.PaymentIntent, unknown>> {
    return ResultAsync.fromPromise(
      this.stripeApiWrapper.paymentIntents.capture(
        args.id,
        undefined,
        args.stripeAccount ? { stripeAccount: args.stripeAccount } : undefined,
      ),
      (error) => error,
    );
  }

  async cancelPaymentIntent(args: {
    id: StripePaymentIntentId;
    stripeAccount?: string;
  }): Promise<Result<Stripe.PaymentIntent, unknown>> {
    return ResultAsync.fromPromise(
      this.stripeApiWrapper.paymentIntents.cancel(
        args.id,
        undefined,
        args.stripeAccount ? { stripeAccount: args.stripeAccount } : undefined,
      ),
      (error) => error,
    );
  }
}
