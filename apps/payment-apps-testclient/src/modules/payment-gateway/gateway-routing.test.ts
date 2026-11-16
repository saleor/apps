import { describe, expect, it } from "vitest";

import { getPaymentGatewayPath } from "./gateway-routing";

const context = { envUrl: "https://test.saleor.cloud/graphql/", checkoutId: "checkout-1" };
const root =
  "/env/https%3A%2F%2Ftest.saleor.cloud%2Fgraphql%2F/checkout/checkout-1/payment-gateway";

describe("payment provider dispatch", () => {
  it.each([
    ["app.saleor.adyen", "app.saleor.adyen"],
    ["app.saleor.adyen_staging", "app.saleor.adyen_staging"],
    ["app.saleor.adyen_preview", "app.saleor.adyen_preview"],
    ["app.saleor.stripe", "stripe/app.saleor.stripe"],
    ["saleor.app.payment.stripe", "stripe/saleor.app.payment.stripe"],
    ["saleor.app.square", "square/saleor.app.square"],
    ["saleor.app.square.dev", "square/saleor.app.square.dev"],
    ["saleor.app.square.terminal", "square/terminal"],
  ])("routes %s without changing its gateway identity", (paymentGatewayId, suffix) => {
    expect(getPaymentGatewayPath({ ...context, paymentGatewayId })).toBe(`${root}/${suffix}`);
  });
  it("does not send unknown gateways to a different provider", () => {
    expect(getPaymentGatewayPath({ ...context, paymentGatewayId: "unknown" })).toBeNull();
  });
});
