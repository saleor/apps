import { describe, expect, it } from "vitest";

import { mockRestrictedKey } from "@/__tests__/mocks/restricted-key";

import { StripeRestrictedKey } from "./stripe-restricted-key";

describe("StripeRestrictedKey", () => {
  describe("createFromUserInput", () => {
    it("should create instance for valid test key", () => {
      const result = StripeRestrictedKey.create({
        restrictedKey: "rk_test_valid123",
      });

      expect(result.isOk()).toBe(true);
      expect(result._unsafeUnwrap()).toBeInstanceOf(StripeRestrictedKey);
      expect(result._unsafeUnwrap().keyValue).toBe("rk_test_valid123");
    });

    it("should create instance for valid live key", () => {
      const result = StripeRestrictedKey.create({
        restrictedKey: "rk_live_valid456",
      });

      expect(result.isOk()).toBe(true);
      expect(result._unsafeUnwrap()).toBeInstanceOf(StripeRestrictedKey);
      expect(result._unsafeUnwrap().keyValue).toBe("rk_live_valid456");
    });

    it("should return error for invalid key format", () => {
      const result = StripeRestrictedKey.create({
        restrictedKey: "invalid_key",
      });

      expect(result.isErr()).toBe(true);
      expect(result._unsafeUnwrapErr()).toBeInstanceOf(StripeRestrictedKey.ValidationError);
    });

    it("should return error if key is empty", () => {
      const result = StripeRestrictedKey.create({
        restrictedKey: "",
      });

      expect(result.isErr()).toBe(true);
      expect(result._unsafeUnwrapErr()).toBeInstanceOf(StripeRestrictedKey.ValidationError);
      expect(result._unsafeUnwrapErr().message).toBe("Restricted key cannot be empty");
    });
  });

  it("Can be retrieved with masked value", () => {
    expect(mockRestrictedKey.getMaskedValue()).toMatchInlineSnapshot(`"...GGGG"`);
  });
});
