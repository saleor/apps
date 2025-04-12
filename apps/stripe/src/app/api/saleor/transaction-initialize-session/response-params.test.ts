import { describe, expect, it } from "vitest";

import { responseData, stripePaymentIntentId } from "./response-params";

describe("responseData", () => {
  it("Constructs with valid stripeClientSecret value", () => {
    expect(() =>
      responseData.parse({
        stripeClientSecret: "pi_123_secret_123",
      }),
    ).not.throw();
  });
  it("Fails with error with invalid value", () => {
    expect(() =>
      responseData.parse({
        stripeClientSecret: null,
      }),
    ).to.throw();

    expect(() =>
      responseData.parse({
        stripeClientSecret: 1,
      }),
    ).to.throw();
  });
});

describe("stripePaymentIntentId", () => {
  it("Constructs with valid stripePaymentIntentId value", () => {
    expect(() => stripePaymentIntentId.parse("pi_123")).not.throw();
  });

  it("Fails with error with invalid value", () => {
    expect(() => stripePaymentIntentId.parse(null)).to.throw();

    expect(() => stripePaymentIntentId.parse(1)).to.throw();
  });
});
