import { describe, expect, it } from "vitest";

import { mockedConfigurationId } from "@/__tests__/mocks/constants";
import { mockedStripeConfig } from "@/__tests__/mocks/mock-stripe-config";
import {
  mockedStripePublishableKey,
  mockedStripePublishableKeyTest,
} from "@/__tests__/mocks/mocked-stripe-publishable-key";
import {
  mockedStripeRestrictedKey,
  mockedStripeRestrictedKeyTest,
} from "@/__tests__/mocks/mocked-stripe-restricted-key";
import { mockStripeWebhookSecret } from "@/__tests__/mocks/stripe-webhook-secret";

import { StripeConfig, StripeFrontendConfig } from "./stripe-config";

describe("StripeConfig", () => {
  it("should create a valid config", () => {
    const result = StripeConfig.create({
      name: "Test Config",
      id: "test-config-1",
      publishableKey: mockedStripePublishableKey,
      restrictedKey: mockedStripeRestrictedKey,
      webhookSecret: mockStripeWebhookSecret,
      webhookId: mockStripeWebhookSecret,
    });

    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap().name).toBe("Test Config");
    expect(result._unsafeUnwrap().id).toBe("test-config-1");
    expect(result._unsafeUnwrap().publishableKey).toBe(mockedStripePublishableKey);
    expect(result._unsafeUnwrap().restrictedKey).toBe(mockedStripeRestrictedKey);
  });

  it("should return error for empty name", () => {
    const result = StripeConfig.create({
      name: "",
      id: "test-config-1",
      publishableKey: mockedStripePublishableKey,
      restrictedKey: mockedStripeRestrictedKey,
      webhookSecret: mockStripeWebhookSecret,
      webhookId: mockStripeWebhookSecret,
    });

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr()).toBeInstanceOf(StripeConfig.ValidationError);
    expect(result._unsafeUnwrapErr().message).toBe("Config name cannot be empty");
  });

  it("should return error for empty id", () => {
    const result = StripeConfig.create({
      name: "Test Config",
      id: "",
      publishableKey: mockedStripePublishableKey,
      restrictedKey: mockedStripeRestrictedKey,
      webhookSecret: mockStripeWebhookSecret,
      webhookId: mockStripeWebhookSecret,
    });

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr()).toBeInstanceOf(StripeConfig.ValidationError);
    expect(result._unsafeUnwrapErr().message).toBe("Config id cannot be empty");
  });

  it("Should return error when PK and RK have mixed live/test prefixes", () => {
    const instance1 = StripeConfig.create({
      name: "Test Config",
      id: "test-config-1",
      publishableKey: mockedStripePublishableKeyTest,
      restrictedKey: mockedStripeRestrictedKey,
      webhookSecret: mockStripeWebhookSecret,
      webhookId: mockStripeWebhookSecret,
    })._unsafeUnwrapErr();

    const instance2 = StripeConfig.create({
      name: "Test Config",
      id: "test-config-1",
      publishableKey: mockedStripePublishableKey,
      restrictedKey: mockedStripeRestrictedKeyTest,
      webhookSecret: mockStripeWebhookSecret,
      webhookId: mockStripeWebhookSecret,
    })._unsafeUnwrapErr();

    expect(instance1).toMatchInlineSnapshot(
      `[ValidationError: Publishable key and restricted key must be of the same environment - TEST or LIVE]`,
    );

    expect(instance2).toMatchInlineSnapshot(
      `[ValidationError: Publishable key and restricted key must be of the same environment - TEST or LIVE]`,
    );
  });
});

describe("StripeFrontendConfig", () => {
  it("Creates from Stripe Config and sets expected data", () => {
    const frontendConfig = StripeFrontendConfig.createFromStripeConfig(mockedStripeConfig);

    expect(frontendConfig.id).toStrictEqual(mockedStripeConfig.id);
    expect(frontendConfig.name).toStrictEqual(mockedStripeConfig.name);
    expect(frontendConfig.publishableKey).toStrictEqual(mockedStripeConfig.publishableKey);

    // Ensure RK is masked
    expect(frontendConfig.restrictedKey).toMatchInlineSnapshot(`"...GGGG"`);
  });

  it("Serializes and deserializes from itself", () => {
    const frontendConfig = StripeFrontendConfig.createFromStripeConfig(mockedStripeConfig);

    const serialized = JSON.stringify(frontendConfig);

    /**
     * Ensure serialized data doesn't have secrets!
     */
    expect(serialized).toMatchInlineSnapshot(
      `"{"name":"config-name","id":"81f323bd-91e2-4838-ab6e-5affd81ffc3b","restrictedKey":"...GGGG","publishableKey":"pk_live_1"}"`,
    );

    //@ts-expect-error - JSON is arbitrary
    const parsedBack = StripeFrontendConfig.createFromSerializedFields(JSON.parse(serialized));

    expect(parsedBack.id).toStrictEqual(mockedStripeConfig.id);
    expect(parsedBack.name).toStrictEqual(mockedStripeConfig.name);
    expect(parsedBack.publishableKey).toStrictEqual(mockedStripeConfig.publishableKey);

    // Ensure RK is masked
    expect(parsedBack.restrictedKey).toMatchInlineSnapshot(`"...GGGG"`);
  });

  it("Returns TEST and LIVE information about the config", () => {
    const testConfig = StripeFrontendConfig.createFromSerializedFields({
      name: "Test",
      id: mockedConfigurationId,
      publishableKey: mockedStripePublishableKeyTest,
      restrictedKey: mockedStripeRestrictedKeyTest,
    });

    const liveConfig = StripeFrontendConfig.createFromSerializedFields({
      name: "Test",
      id: mockedConfigurationId,
      publishableKey: mockedStripePublishableKey,
      restrictedKey: mockedStripeRestrictedKey,
    });

    expect(testConfig.getStripeEnvValue()).toBe("TEST");
    expect(liveConfig.getStripeEnvValue()).toBe("LIVE");
  });
});
