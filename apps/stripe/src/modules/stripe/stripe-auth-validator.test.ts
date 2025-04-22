import Stripe from "stripe";
import { describe, expect, it, vi } from "vitest";

import { mockedStripeRestrictedKeyTest } from "@/__tests__/mocks/mocked-stripe-restricted-key";
import { StripeAuthValidator } from "@/modules/stripe/stripe-auth-validator";
import { StripeClient } from "@/modules/stripe/stripe-client";

describe("StripeAuthValidator", () => {
  describe("validateStripeAuth", () => {
    /**
     * This is not perfect - for example WRITE to intents may be not possible.
     * However, this is UX-check only. It's documented which permissions should be provided to app.
     * If they are invalid, payments will not work.
     */
    it("Return ok if provided Stripe instance has access to paymentIntents (READ)", async () => {
      const stripe = StripeClient.createFromRestrictedKey(mockedStripeRestrictedKeyTest);

      vi.spyOn(stripe.nativeClient.paymentIntents, "list").mockImplementationOnce(() => {
        return Promise.resolve() as unknown as Stripe.ApiListPromise<Stripe.PaymentIntent>;
      });

      const instance = StripeAuthValidator.createFromClient(stripe);

      const result = await instance.validateStripeAuth();

      expect(result.isOk()).toBe(true);
    });

    it("Return AuthError if Payment Intents (READ) permission is missing", async () => {
      const stripe = StripeClient.createFromRestrictedKey(mockedStripeRestrictedKeyTest);

      vi.spyOn(stripe.nativeClient.paymentIntents, "list").mockImplementationOnce(() => {
        return Promise.reject(
          new Error("Test Error"),
        ) as unknown as Stripe.ApiListPromise<Stripe.PaymentIntent>;
      });

      const instance = StripeAuthValidator.createFromClient(stripe);

      const result = await instance.validateStripeAuth();

      expect(result._unsafeUnwrapErr()).toMatchInlineSnapshot(`
        [StripeAuthValidator.AuthError: Test Error
        Failed to authorize with Stripe]
      `);
    });
  });
});
