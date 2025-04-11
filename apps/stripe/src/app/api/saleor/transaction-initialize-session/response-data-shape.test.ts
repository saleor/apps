import { describe, expect, it } from "vitest";

import { TransactionInitalizeSessionResponseDataShape } from "./response-data-shape";

describe("TransactionInitalizeSessionResponseDataShape", () => {
  it("Constructs with valid stripeClientSecret value", () => {
    expect(() =>
      TransactionInitalizeSessionResponseDataShape.parse({
        stripeClientSecret: "pi_123_secret_123",
      }),
    ).not.throw();
  });
  it("Fails with error with invalid value", () => {
    expect(() =>
      TransactionInitalizeSessionResponseDataShape.parse({
        stripeClientSecret: null,
      }),
    ).to.throw();

    expect(() =>
      TransactionInitalizeSessionResponseDataShape.parse({
        stripeClientSecret: 1,
      }),
    ).to.throw();
  });
});
