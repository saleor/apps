import Stripe from "stripe";
import { describe, expect, it } from "vitest";

import { StripeRestrictedKey } from "@/modules/stripe/stripe-restricted-key";

import { StripePaymentIntentsApi } from "./stripe-payment-intents-api";
import {
  InvalidRequestError,
  PaymentMethodDelayedCaptureNotSupportedError,
} from "./stripe-payment-intents-api-error";

describe("StripePaymentIntentsApi", () => {
  const mockStripeKeyValue = "rk_test_key";

  describe("createFromKey", () => {
    it("creates instance of StripePaymentIntentsApi", () => {
      const key = StripeRestrictedKey.create({
        restrictedKey: mockStripeKeyValue,
      });
      const api = StripePaymentIntentsApi.createFromKey({ key: key._unsafeUnwrap() });

      expect(api).toBeInstanceOf(StripePaymentIntentsApi);
    });
  });

  describe("mapInvalidRequestError", () => {
    it("returns PaymentMethodDelayedCaptureNotSupportedError for delayed capture error", () => {
      const key = StripeRestrictedKey.create({
        restrictedKey: mockStripeKeyValue,
      });
      const api = StripePaymentIntentsApi.createFromKey({ key: key._unsafeUnwrap() });

      const stripeError: Stripe.errors.StripeInvalidRequestError = {
        message:
          'The following payment method types ["ideal"] can only be used with PaymentIntents that have capture_method=automatic. Please retry by creating a PaymentIntent with capture_method=automatic.',
        type: "StripeInvalidRequestError",
        rawType: "invalid_request_error",
        raw: {},
        headers: {},
        requestId: "req_123",
        name: "error",
      };

      // @ts-expect-error accessing private method for testing
      const result = api.mapInvalidRequestError(stripeError);

      expect(result).toBeInstanceOf(PaymentMethodDelayedCaptureNotSupportedError);
    });

    it("returns InvalidRequestError for other invalid request errors", () => {
      const key = StripeRestrictedKey.create({
        restrictedKey: mockStripeKeyValue,
      });
      const api = StripePaymentIntentsApi.createFromKey({ key: key._unsafeUnwrap() });

      const stripeError: Stripe.errors.StripeInvalidRequestError = {
        message: "No such PaymentMethod: 'test'",
        type: "StripeInvalidRequestError",
        rawType: "invalid_request_error",
        raw: {},
        headers: {},
        requestId: "req_123",
        name: "error",
      };

      // @ts-expect-error accessing private method for testing
      const result = api.mapInvalidRequestError(stripeError);

      expect(result).toBeInstanceOf(InvalidRequestError);
    });
  });
});
