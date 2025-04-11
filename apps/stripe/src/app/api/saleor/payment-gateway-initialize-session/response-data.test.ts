import { describe, expect, it } from "vitest";

import { responseData } from "./response-data";

describe("PaymentGatewayInitializeResponseDataShape", () => {
  it("Constructs with valid pk value", () => {
    expect(() =>
      responseData.parse({
        stripePublishableKey: "pk_live_asd",
      }),
    ).not.throw();
  });
  it("Fails with error with invalid value", () => {
    expect(() =>
      responseData.parse({
        stripePublishableKey: null,
      }),
    ).to.throw();

    expect(() =>
      responseData.parse({
        stripePublishableKey: 1,
      }),
    ).to.throw();
  });
});
