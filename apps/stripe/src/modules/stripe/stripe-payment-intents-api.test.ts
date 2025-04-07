import { describe, expect, it } from "vitest";

import { StripeRestrictedKey } from "@/modules/stripe/stripe-restricted-key";

import { StripePaymentIntentsApi } from "./stripe-payment-intents-api";

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
});
