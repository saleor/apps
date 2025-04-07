import { describe, expect, it } from "vitest";

import { PaymentGatewayInitializeResponseShape } from "@/app/api/gateway-initialize/response-shape";

describe("PaymentGatewayInitializeResponseShape", () => {
  it("Constructs with valid pk value", () => {
    expect(() =>
      PaymentGatewayInitializeResponseShape.parse({
        stripePublishableKey: "pk_live_asd",
      }),
    ).not.throw();
  });
  it("Fails with error with invalid value", () => {
    expect(() =>
      PaymentGatewayInitializeResponseShape.parse({
        stripePublishableKey: null,
      }),
    ).to.throw();

    expect(() =>
      PaymentGatewayInitializeResponseShape.parse({
        stripePublishableKey: 1,
      }),
    ).to.throw();
  });
});
