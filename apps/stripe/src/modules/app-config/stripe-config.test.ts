import { describe, expect, it } from "vitest";

import { StripePublishableKey } from "@/modules/stripe/stripe-publishable-key";
import { StripeRestrictedKey } from "@/modules/stripe/stripe-restricted-key";

import { StripeConfig } from "./stripe-config";

describe("StripeConfig", () => {
  const mockedPublishableKey = StripePublishableKey.create({
    publishableKey: "pk_test_123",
  })._unsafeUnwrap();
  const mockedRestrictedKey = StripeRestrictedKey.create({
    restrictedKey: "rk_test_132",
  })._unsafeUnwrap();

  it("should create a valid config", () => {
    const result = StripeConfig.create({
      name: "Test Config",
      id: "test-config-1",
      publishableKey: mockedPublishableKey,
      restrictedKey: mockedRestrictedKey,
      webhookSecret: "TEST_WEBHOOK_SECRET",
    });

    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap().name).toBe("Test Config");
    expect(result._unsafeUnwrap().id).toBe("test-config-1");
    expect(result._unsafeUnwrap().publishableKey).toBe(mockedPublishableKey);
    expect(result._unsafeUnwrap().restrictedKey).toBe(mockedRestrictedKey);
  });

  it("should return error for empty name", () => {
    const result = StripeConfig.create({
      name: "",
      id: "test-config-1",
      publishableKey: mockedPublishableKey,
      restrictedKey: mockedRestrictedKey,
      webhookSecret: "TEST_WEBHOOK_SECRET",
    });

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr()).toBeInstanceOf(StripeConfig.ValidationError);
    expect(result._unsafeUnwrapErr().message).toBe("Config name cannot be empty");
  });

  it("should return error for empty id", () => {
    const result = StripeConfig.create({
      name: "Test Config",
      id: "",
      publishableKey: mockedPublishableKey,
      restrictedKey: mockedRestrictedKey,
      webhookSecret: "TEST_WEBHOOK_SECRET",
    });

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr()).toBeInstanceOf(StripeConfig.ValidationError);
    expect(result._unsafeUnwrapErr().message).toBe("Config id cannot be empty");
  });
});
