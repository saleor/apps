import { describe, expect, it } from "vitest";

import { mockedStripePublishableKey } from "@/__tests__/mocks/mocked-stripe-publishable-key";
import { mockedStripeRestrictedKey } from "@/__tests__/mocks/mocked-stripe-restricted-key";
import { newConfigInputSchema } from "@/modules/app-config/trpc-handlers/new-config-input-schema";

describe("newStripeConfigInputSchema", () => {
  it("Properly parses valid input", () => {
    expect(
      newConfigInputSchema.parse({
        name: "test",
        restrictedKey: mockedStripeRestrictedKey,
        publishableKey: mockedStripePublishableKey,
      }),
    ).toStrictEqual({
      name: "test",
      restrictedKey: mockedStripeRestrictedKey,
      publishableKey: mockedStripePublishableKey,
    });
  });

  it("Returns list of errors for invalid input", () => {
    expect(() =>
      newConfigInputSchema.parse({
        name: "",
        restrictedKey: "test",
        publishableKey: "",
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [ZodError: [
        {
          "code": "too_small",
          "minimum": 1,
          "type": "string",
          "inclusive": true,
          "exact": false,
          "message": "String must contain at least 1 character(s)",
          "path": [
            "name"
          ]
        },
        {
          "message": "Invalid Publishable Key format. Must start with 'pk_test_' or 'pk_live_'.",
          "code": "custom",
          "fatal": true,
          "path": [
            "publishableKey"
          ]
        },
        {
          "message": "Invalid Restricted Key format. Must start with 'pk_test_' or 'pk_live_'.",
          "code": "custom",
          "fatal": true,
          "path": [
            "restrictedKey"
          ]
        }
      ]]
    `);
  });

  it("Returns custom error if TEST and LIVE keys are mixed", () => {
    expect(() =>
      newConfigInputSchema.parse({
        name: "test",
        restrictedKey: "rk_live_asd",
        publishableKey: "pk_test_asd",
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [ZodError: [
        {
          "code": "custom",
          "message": "Both Publishable and Restricted Keys must be live or test",
          "path": []
        }
      ]]
    `);
  });
});
