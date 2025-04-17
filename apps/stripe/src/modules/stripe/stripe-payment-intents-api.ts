import { Result, ResultAsync } from "neverthrow";
import Stripe from "stripe";

import { BaseError } from "@/lib/errors";
import { StripeClient } from "@/modules/stripe/stripe-client";

import { StripeRestrictedKey } from "./stripe-restricted-key";
import { IStripePaymentIntentsApi, StripePaymentIntentAPIError } from "./types";

export class StripePaymentIntentsApi implements IStripePaymentIntentsApi {
  private stripeApiWrapper: Pick<Stripe, "paymentIntents">;

  static UnknownError = BaseError.subclass("UnknownError", {
    props: {
      _internalName: "StripePaymentIntentsApi.UnknownError" as const,
      publicCode: "StripePaymentIntentError" as const,
      publicMessage: "Stripe API returned error",
    },
  });

  static StripeCardError = BaseError.subclass("StripeCardError", {
    props: {
      _internalName: "StripePaymentIntentsApi.StripeCardError" as const,
      publicCode: "StripeCardError" as const,
      publicMessage: "",
    },
  });

  static StripeInvalidRequestError = BaseError.subclass("StripeInvalidRequestError", {
    props: {
      _internalName: "StripePaymentIntentsApi.StripeInvalidRequestError" as const,
      publicCode: "StripeInvalidRequestError" as const,
      publicMessage: "",
    },
  });

  static StripeRateLimitError = BaseError.subclass("StripeRateLimitError", {
    props: {
      _internalName: "StripePaymentIntentsApi.StripeRateLimitError" as const,
      publicCode: "StripeRateLimitError" as const,
      publicMessage: "",
    },
  });

  static StripeConnectionError = BaseError.subclass("StripeConnectionError", {
    props: {
      _internalName: "StripePaymentIntentsApi.StripeConnectionError" as const,
      publicCode: "StripeConnectionError" as const,
      publicMessage: "",
    },
  });

  static StripeAPIError = BaseError.subclass("StripeAPIError", {
    props: {
      _internalName: "StripePaymentIntentsApi.StripeAPIError" as const,
      publicCode: "StripeAPIError" as const,
      publicMessage: "",
    },
  });

  static StripeAuthenticationError = BaseError.subclass("StripeAuthenticationError", {
    props: {
      _internalName: "StripePaymentIntentsApi.StripeAuthenticationError" as const,
      publicCode: "StripeAuthenticationError" as const,
      publicMessage: "",
    },
  });

  static StripePermissionError = BaseError.subclass("StripePermissionError", {
    props: {
      _internalName: "StripePaymentIntentsApi.StripePermissionError" as const,
      publicCode: "StripePermissionError" as const,
      publicMessage: "",
    },
  });

  static StripeIdempotencyError = BaseError.subclass("StripeIdempotencyError", {
    props: {
      _internalName: "StripePaymentIntentsApi.StripeIdempotencyError" as const,
      publicCode: "StripeIdempotencyError" as const,
      publicMessage: "",
    },
  });

  private constructor(stripeApiWrapper: Pick<Stripe, "paymentIntents">) {
    this.stripeApiWrapper = stripeApiWrapper;
  }

  static createFromKey(args: { key: StripeRestrictedKey }) {
    const stripeApiWrapper = StripeClient.createFromRestrictedKey(args.key);

    return new StripePaymentIntentsApi(stripeApiWrapper.nativeClient);
  }

  async createPaymentIntent(args: {
    params: Stripe.PaymentIntentCreateParams;
  }): Promise<Result<Stripe.PaymentIntent, StripePaymentIntentAPIError>> {
    return ResultAsync.fromPromise(
      this.stripeApiWrapper.paymentIntents.create(args.params),
      (error) => {
        switch (true) {
          case error instanceof Stripe.errors.StripeCardError:
            return new StripePaymentIntentsApi.StripeCardError("Payment error", {
              props: {
                // Stripe recommends to show card error message to the storefront user
                publicMessage: error.message,
              },
            });
          case error instanceof Stripe.errors.StripeInvalidRequestError:
            return new StripePaymentIntentsApi.StripeInvalidRequestError(
              "Invalid parameters provided to Stripe API",
              {
                props: {
                  publicMessage: `${error.code}: ${error.param} is invalid. See ${error.doc_url} for more details.`,
                },
              },
            );
          case error instanceof Stripe.errors.StripeRateLimitError:
            return new StripePaymentIntentsApi.StripeRateLimitError(
              "Too many requests made to the API too quickly",
              {
                props: {
                  publicMessage:
                    "Stripe API rate limit exceeded. For more info see https://docs.stripe.com/rate-limits",
                },
              },
            );
          case error instanceof Stripe.errors.StripeConnectionError:
            return new StripePaymentIntentsApi.StripeConnectionError(
              "There was a network problem between app and Stripe",
              {
                props: {
                  publicMessage: "Network error while connecting to Stripe API",
                },
              },
            );
          case error instanceof Stripe.errors.StripeAPIError:
            return new StripePaymentIntentsApi.StripeAPIError(
              "Something went wrong on Stripe end",
              {
                props: {
                  publicMessage: "App received an error from Stripe API",
                },
              },
            );
          case error instanceof Stripe.errors.StripeAuthenticationError:
            return new StripePaymentIntentsApi.StripeAuthenticationError(
              "App can’t authenticate with Stripe",
              {
                props: {
                  publicMessage: "Stripe API authentication error. Check your restricted API key",
                },
              },
            );
          case error instanceof Stripe.errors.StripePermissionError:
            return new StripePaymentIntentsApi.StripePermissionError(
              "API key doesn’t have permission to perform this action",
              {
                props: {
                  publicMessage:
                    "Stripe API permission error. Check your restricted API key permissions",
                },
              },
            );
          case error instanceof Stripe.errors.StripeIdempotencyError:
            return new StripePaymentIntentsApi.StripeIdempotencyError("Idempotency key error", {
              props: {
                publicMessage: "Idempotency key error. Check your idempotency key",
              },
            });
          default:
            return new StripePaymentIntentsApi.UnknownError("Failed to create payment intent", {
              cause: error,
            });
        }
      },
    );
  }
}
