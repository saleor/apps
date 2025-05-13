import { captureException } from "@sentry/nextjs";
import Stripe from "stripe";

import { BaseError } from "@/lib/errors";

export const StripeCardErrorPublicCode = "StripeCardError" as const;
export const StripeApiErrorPublicCode = "StripeApiError" as const;

export type StripeApiError = InstanceType<
  | typeof StripeCardError
  | typeof StripeInvalidRequestError
  | typeof StripeRateLimitError
  | typeof StripeConnectionError
  | typeof StripeAPIError
  | typeof StripeAuthenticationError
  | typeof StripePermissionError
  | typeof StripeIdempotencyError
  | typeof StripeUnknownAPIError
>;

export const StripeCardError = BaseError.subclass("StripeCardError", {
  props: {
    _internalName: "StripePaymentIntentsApi.StripeCardError" as const,
    publicCode: StripeCardErrorPublicCode,
    publicMessage: "", // filed by Stripe - they recommend to show it to the storefront user
    merchantMessage: "There is problem with processing of the card",
  },
});

export const StripeInvalidRequestError = BaseError.subclass("StripeInvalidRequestError", {
  props: {
    _internalName: "StripePaymentIntentsApi.StripeInvalidRequestError" as const,
    publicCode: StripeApiErrorPublicCode,
    publicMessage: "There is a problem with the request to Stripe API",
    merchantMessage: "There is a problem with the request to Stripe API",
    stripeCode: "",
    stripeParam: "",
  },
});

export const StripeRateLimitError = BaseError.subclass("StripeRateLimitError", {
  props: {
    _internalName: "StripePaymentIntentsApi.StripeRateLimitError" as const,
    publicCode: StripeApiErrorPublicCode,
    publicMessage: "There is a problem with the request to Stripe API",
    merchantMessage: "There is a problem with the request to Stripe API",
  },
});

export const StripeConnectionError = BaseError.subclass("StripeConnectionError", {
  props: {
    _internalName: "StripePaymentIntentsApi.StripeConnectionError" as const,
    publicCode: StripeApiErrorPublicCode,
    publicMessage: "There is a problem with the request to Stripe API",
    merchantMessage: "There is a problem with the request to Stripe API",
  },
});

export const StripeAPIError = BaseError.subclass("StripeAPIError", {
  props: {
    _internalName: "StripePaymentIntentsApi.StripeAPIError" as const,
    publicCode: StripeApiErrorPublicCode,
    publicMessage: "There is a problem with the request to Stripe API",
    merchantMessage: "There is a problem with the request to Stripe API",
  },
});

export const StripeAuthenticationError = BaseError.subclass("StripeAuthenticationError", {
  props: {
    _internalName: "StripePaymentIntentsApi.StripeAuthenticationError" as const,
    publicCode: StripeApiErrorPublicCode,
    publicMessage: "There is a problem with the request to Stripe API",
    merchantMessage: "There is a problem with the request to Stripe API",
  },
});

export const StripePermissionError = BaseError.subclass("StripePermissionError", {
  props: {
    _internalName: "StripePaymentIntentsApi.StripePermissionError" as const,
    publicCode: StripeApiErrorPublicCode,
    publicMessage: "There is a problem with the request to Stripe API",
    merchantMessage: "There is a problem with the request to Stripe API",
  },
});

export const StripeIdempotencyError = BaseError.subclass("StripeIdempotencyError", {
  props: {
    _internalName: "StripePaymentIntentsApi.StripeIdempotencyError" as const,
    publicCode: StripeApiErrorPublicCode,
    publicMessage: "There is a problem with the request to Stripe API",
    merchantMessage: "There is a problem with the request to Stripe API",
  },
});

export const StripeUnknownAPIError = BaseError.subclass("StripeUnknownAPIError", {
  props: {
    _internalName: "StripePaymentIntentsApi.StripeUnknownAPIError" as const,
    publicCode: StripeApiErrorPublicCode,
    publicMessage: "There is a problem with the request to Stripe API",
    merchantMessage: "There is a problem with the request to Stripe API",
  },
});

export const mapStripeErrorToApiError = (error: unknown): StripeApiError => {
  switch (true) {
    case error instanceof Stripe.errors.StripeCardError:
      return new StripeCardError("Card payment error", {
        props: {
          publicMessage: error.message,
        },
      });
    case error instanceof Stripe.errors.StripeInvalidRequestError:
      return new StripeInvalidRequestError("Invalid parameters provided to Stripe API", {
        props: {
          stripeCode: error.code ?? "",
          stripeParam: error.param ?? "",
        },
      });
    case error instanceof Stripe.errors.StripeRateLimitError:
      return new StripeRateLimitError("Too many requests made to the API too quickly");
    case error instanceof Stripe.errors.StripeConnectionError:
      return new StripeConnectionError("There was a network problem between app and Stripe");
    case error instanceof Stripe.errors.StripeAPIError:
      return new StripeAPIError("Something went wrong on Stripe end");
    case error instanceof Stripe.errors.StripeAuthenticationError:
      return new StripeAuthenticationError("App can’t authenticate with Stripe");
    case error instanceof Stripe.errors.StripePermissionError:
      return new StripePermissionError("API key doesn’t have permission to perform this action");
    case error instanceof Stripe.errors.StripeIdempotencyError:
      return new StripeIdempotencyError("Idempotency key error");
    default:
      captureException(error);

      return new StripeUnknownAPIError("Unknown error", {
        cause: error,
      });
  }
};
