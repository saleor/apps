import { describe, expect, it } from "vitest";

import { mockedStripeRestrictedKey } from "@/__tests__/mocks/mocked-stripe-restricted-key";

import { StripePaymentIntentsApi } from "./stripe-payment-intents-api";

describe("StripePaymentIntentsApi", () => {
  describe("createFromKey", () => {
    it("creates instance of StripePaymentIntentsApi", () => {
      const api = StripePaymentIntentsApi.createFromKey({ key: mockedStripeRestrictedKey });

      expect(api).toBeInstanceOf(StripePaymentIntentsApi);
    });
  });
});
