import { Result, ResultAsync } from "neverthrow";
import Stripe from "stripe";

import { StripeClient } from "@/modules/stripe/stripe-client";

import {
  InvalidRequestError,
  PaymentMethodDelayedCaptureNotSupportedError,
  StripePaymentIntentsApiErrorTypes,
  UnknownPaymentIntentError,
} from "./stripe-payment-intents-api-error";
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

  private mapInvalidRequestError(error: Stripe.errors.StripeInvalidRequestError) {
    if (
      error.message.includes(
        "can only be used with PaymentIntents that have capture_method=automatic",
      )
    ) {
      return new PaymentMethodDelayedCaptureNotSupportedError(
        "Payment method does not supported delayed capture.",
        {
          cause: error,
        },
      );
    }

    return new InvalidRequestError("Invalid request error", {
      cause: error,
    });
  }

  async createPaymentIntent(args: {
    params: Stripe.PaymentIntentCreateParams;
  }): Promise<Result<Stripe.PaymentIntent, StripePaymentIntentsApiErrorTypes>> {
    return ResultAsync.fromPromise(
      this.stripeApiWrapper.paymentIntents.create(args.params),
      (error) => {
        if (error instanceof Stripe.errors.StripeInvalidRequestError) {
          return this.mapInvalidRequestError(error);
        }

        return new UnknownPaymentIntentError("Failed to create payment intent", {
          cause: error,
        });
      },
    );
  }
}
