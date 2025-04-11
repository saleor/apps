import { describe, expect, it } from "vitest";

import { PaymentGatewayInitializeResponseDataShape } from "./response-data-shape";

describe("PaymentGatewayInitializeResponseDataShape", () => {
  it("Constructs with valid pk value", () => {
    expect(() =>
      PaymentGatewayInitializeResponseDataShape.parse({
        stripePublishableKey: "pk_live_asd",
      }),
    ).not.throw();
  });
  it("Fails with error with invalid value", () => {
    expect(() =>
      PaymentGatewayInitializeResponseDataShape.parse({
        stripePublishableKey: null,
      }),
    ).to.throw();

    expect(() =>
      PaymentGatewayInitializeResponseDataShape.parse({
        stripePublishableKey: 1,
      }),
    ).to.throw();
  });
});
