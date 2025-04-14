import { describe, expect, it } from "vitest";

import {
  createStripeClientSecret,
  StripeClientSecretValidationError,
} from "./stripe-client-secret";

describe("createStripeClientSecret", () => {
  it("should successfully create client secret when valid", () => {
    const result = createStripeClientSecret("pi_valid_secret_123_secret_456");

    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap()).toBe("pi_valid_secret_123_secret_456");
  });

  it("should return error when client secret is null", () => {
    const result = createStripeClientSecret(null);

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr()).toBeInstanceOf(StripeClientSecretValidationError);
  });

  it("should return error when client secret is empty", () => {
    const result = createStripeClientSecret("");

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr()).toBeInstanceOf(StripeClientSecretValidationError);
  });
});
