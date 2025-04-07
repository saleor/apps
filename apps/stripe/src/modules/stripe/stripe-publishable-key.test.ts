import { describe, expect, it } from "vitest";

import { StripePublishableKey } from "./stripe-publishable-key";

describe("StripePublishableKey", () => {
  describe("createFromUserInput", () => {
    it("should create instance for valid test key", () => {
      const result = StripePublishableKey.create({
        publishableKey: "pk_test_valid123",
      });

      expect(result.isOk()).toBe(true);
      expect(result._unsafeUnwrap()).toBeInstanceOf(StripePublishableKey);
      expect(result._unsafeUnwrap().keyValue).toBe("pk_test_valid123");
    });

    it("should create instance for valid live key", () => {
      const result = StripePublishableKey.create({
        publishableKey: "pk_live_valid456",
      });

      expect(result.isOk()).toBe(true);
      expect(result._unsafeUnwrap()).toBeInstanceOf(StripePublishableKey);
      expect(result._unsafeUnwrap().keyValue).toBe("pk_live_valid456");
    });

    it("should return error for invalid key format", () => {
      const result = StripePublishableKey.create({
        publishableKey: "invalid_key",
      });

      expect(result.isErr()).toBe(true);
      expect(result._unsafeUnwrapErr()).toBeInstanceOf(StripePublishableKey.ValidationError);
    });
  });
});
