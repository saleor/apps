import { describe, expect, it } from "vitest";

import { StripeRestrictedKey } from "./stripe-restricted-key";

describe("StripeRestrictedKey", () => {
  describe("createFromUserInput", () => {
    it("should create instance for valid test key", () => {
      const result = StripeRestrictedKey.createFromUserInput({
        restrictedKey: "rk_test_valid123",
      });

      expect(result.isOk()).toBe(true);
      expect(result._unsafeUnwrap()).toBeInstanceOf(StripeRestrictedKey);
      expect(result._unsafeUnwrap().getKeyValue()).toBe("rk_test_valid123");
    });

    it("should create instance for valid live key", () => {
      const result = StripeRestrictedKey.createFromUserInput({
        restrictedKey: "rk_live_valid456",
      });

      expect(result.isOk()).toBe(true);
      expect(result._unsafeUnwrap()).toBeInstanceOf(StripeRestrictedKey);
      expect(result._unsafeUnwrap().getKeyValue()).toBe("rk_live_valid456");
    });

    it("should return error for invalid key format", () => {
      const result = StripeRestrictedKey.createFromUserInput({
        restrictedKey: "invalid_key",
      });

      expect(result.isErr()).toBe(true);
      expect(result._unsafeUnwrapErr()).toBeInstanceOf(StripeRestrictedKey.WrongKeyFormatError);
    });
  });
});
