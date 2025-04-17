import { describe, expect, it } from "vitest";

import { mockedRestrictedKey } from "@/__tests__/mocks/restricted-key";
import {
  createStripeWebhookSecret,
  StripeWebhookSecret,
} from "@/modules/stripe/stripe-webhook-secret";

import {
  createStripeRestrictedKey,
  StripeRestrictedKey,
  StripeRestrictedKeyValidationError,
} from "./stripe-restricted-key";

describe("StripeRestrictedKey", () => {
  describe("createFromUserInput", () => {
    it("should create instance for valid test key", () => {
      const result = createStripeRestrictedKey("rk_test_valid123");

      expect(result.isOk()).toBe(true);
      expect(result._unsafeUnwrap()).toBe("rk_test_valid123");
    });

    it("should create instance for valid live key", () => {
      const result = createStripeRestrictedKey("rk_live_valid456");

      expect(result.isOk()).toBe(true);
      expect(result._unsafeUnwrap()).toBe("rk_live_valid456");
    });

    it("should return error for invalid key format", () => {
      const result = createStripeRestrictedKey("invalid_key");

      expect(result.isErr()).toBe(true);
      expect(result._unsafeUnwrapErr()).toBeInstanceOf(StripeRestrictedKeyValidationError);
      expect(result._unsafeUnwrapErr().message).toMatchInlineSnapshot(`
        "ZodError: [
          {
            "code": "custom",
            "message": "Must start with 'rk_test_' or 'rk_live_",
            "path": []
          }
        ]"
      `);
    });

    it("should return error if key is empty", () => {
      const result = createStripeRestrictedKey("");

      expect(result.isErr()).toBe(true);
      expect(result._unsafeUnwrapErr()).toBeInstanceOf(StripeRestrictedKeyValidationError);
      expect(result._unsafeUnwrapErr().message).toMatchInlineSnapshot(`
        "ZodError: [
          {
            "code": "too_small",
            "minimum": 1,
            "type": "string",
            "inclusive": true,
            "exact": false,
            "message": "String must contain at least 1 character(s)",
            "path": []
          },
          {
            "code": "custom",
            "message": "Must start with 'rk_test_' or 'rk_live_",
            "path": []
          }
        ]"
      `);
    });

    it("Nominal typing works", () => {
      const fn = (v: StripeRestrictedKey) => v;

      // @ts-expect-error - should be error, only string must be accepted
      fn("rk_test_XXX");

      expect(() => fn(createStripeRestrictedKey("rk_test_XXX")._unsafeUnwrap())).not.toThrow();
    });
  });
});
