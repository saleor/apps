import { describe, expect, it } from "vitest";

import { mockedConfigurationId } from "@/__tests__/mocks/constants";
import {
  mockedStripePublishableKey,
  mockedStripePublishableKeyTest,
} from "@/__tests__/mocks/mocked-stripe-publishable-key";
import {
  mockedStripeRestrictedKey,
  mockedStripeRestrictedKeyTest,
} from "@/__tests__/mocks/mocked-stripe-restricted-key";
import { updateStripeConfigInputSchema } from "@/modules/app-config/trpc-handlers/update-stripe-config-input-schema";

describe("updateStripeConfigInputSchema", () => {
  it("Accepts a full key pair from the same environment", () => {
    expect(
      updateStripeConfigInputSchema.parse({
        configId: mockedConfigurationId,
        name: "Renamed",
        publishableKey: mockedStripePublishableKey,
        restrictedKey: mockedStripeRestrictedKey,
      }),
    ).toStrictEqual({
      configId: mockedConfigurationId,
      name: "Renamed",
      publishableKey: mockedStripePublishableKey,
      restrictedKey: mockedStripeRestrictedKey,
    });
  });

  it("Accepts a full test key pair", () => {
    expect(
      updateStripeConfigInputSchema.parse({
        configId: mockedConfigurationId,
        name: "Sandbox",
        publishableKey: mockedStripePublishableKeyTest,
        restrictedKey: mockedStripeRestrictedKeyTest,
      }),
    ).toMatchObject({
      publishableKey: mockedStripePublishableKeyTest,
      restrictedKey: mockedStripeRestrictedKeyTest,
    });
  });

  it("Accepts null restrictedKey so the stored key is kept", () => {
    expect(
      updateStripeConfigInputSchema.parse({
        configId: mockedConfigurationId,
        name: "Renamed",
        publishableKey: mockedStripePublishableKey,
        restrictedKey: null,
      }),
    ).toMatchObject({
      restrictedKey: null,
    });
  });

  it("Rejects an empty name", () => {
    expect(() =>
      updateStripeConfigInputSchema.parse({
        configId: mockedConfigurationId,
        name: "",
        publishableKey: mockedStripePublishableKey,
        restrictedKey: null,
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
        }
      ]]
    `);
  });

  it("Rejects mixing live and test keys when a new restricted key is provided", () => {
    expect(() =>
      updateStripeConfigInputSchema.parse({
        configId: mockedConfigurationId,
        name: "Renamed",
        publishableKey: mockedStripePublishableKeyTest,
        restrictedKey: mockedStripeRestrictedKey,
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

  it("Does not require environment matching when the restricted key is kept", () => {
    /**
     * Env matching against the *stored* key is enforced in the handler, not here — null means
     * "keep", so the schema only validates the publishable key format.
     */
    expect(
      updateStripeConfigInputSchema.parse({
        configId: mockedConfigurationId,
        name: "Renamed",
        publishableKey: mockedStripePublishableKeyTest,
        restrictedKey: null,
      }),
    ).toMatchObject({
      publishableKey: mockedStripePublishableKeyTest,
      restrictedKey: null,
    });
  });
});
