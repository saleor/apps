import { describe, expect, it } from "vitest";

import {
  createStripePublishableKey,
  StripePublishableKeyValidationError,
} from "./stripe-publishable-key";

describe("StripePublishableKey", () => {
  describe("createFromUserInput", () => {
    it("should create instance for valid test key", () => {
      const result = createStripePublishableKey("pk_test_valid123");

      expect(result.isOk()).toBe(true);
      expect(result._unsafeUnwrap()).toBe("pk_test_valid123");
    });

    it("should create instance for valid live key", () => {
      const result = createStripePublishableKey("pk_live_valid456");

      expect(result.isOk()).toBe(true);
      expect(result._unsafeUnwrap()).toBe("pk_live_valid456");
    });

    it("should return error for invalid key format", () => {
      const result = createStripePublishableKey("invalid_key");

      expect(result.isErr()).toBe(true);
      expect(result._unsafeUnwrapErr()).toBeInstanceOf(StripePublishableKeyValidationError);
    });

    it("should return error if key is empty", () => {
      const result = createStripePublishableKey("");

      expect(result.isErr()).toBe(true);
      expect(result._unsafeUnwrapErr()).toBeInstanceOf(StripePublishableKeyValidationError);
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
            "message": "Invalid input",
            "path": []
          }
        ]"
      `);
    });
  });
});
