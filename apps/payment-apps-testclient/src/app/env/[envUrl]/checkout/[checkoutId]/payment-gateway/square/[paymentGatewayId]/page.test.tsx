import { beforeEach, describe, expect, it, vi } from "vitest";

import type * as GraphqlModule from "@/graphql/gql";

import PaymentGatewayPage from "./page";

const { initialize, checkout, form } = vi.hoisted(() => ({
  initialize: vi.fn(),
  checkout: vi.fn(),
  form: vi.fn(),
}));

vi.mock("@/modules/square/actions/initialize-payment-gateway", () => ({
  initializePaymentGateway: initialize,
}));
vi.mock("@/modules/square/actions/get-checkout-total-price", () => ({
  getCheckoutTotalPrice: checkout,
}));
vi.mock("@/modules/square/components/square-checkout", () => ({
  SquareCheckout: form,
}));
vi.mock("@/graphql/gql", async (importOriginal) => ({
  ...(await importOriginal<typeof GraphqlModule>()),
  readFragment: (_fragment: unknown, data: unknown) => data,
}));

beforeEach(() => {
  vi.clearAllMocks();
  checkout.mockResolvedValue({
    data: {
      checkout: {
        totalPrice: { gross: { amount: 12, currency: "USD" } },
        channel: { slug: "default-channel" },
      },
    },
  });
  initialize.mockResolvedValue({
    data: { status: "success", squareConfig: {} },
  });
});

function params(id: string) {
  return Promise.resolve({
    envUrl: encodeURIComponent("https://example.saleor.cloud/graphql/"),
    checkoutId: "checkout-1",
    paymentGatewayId: encodeURIComponent(id),
  });
}

describe("Square payment page", () => {
  it.each(["saleor.app.square", "saleor.app.square.dev"])(
    "uses the discovered %s ID for initialization and payment",
    async (id) => {
      const element = await PaymentGatewayPage({ params: params(id) });

      expect(initialize).toHaveBeenCalledWith({
        envUrl: "https://example.saleor.cloud/graphql/",
        checkoutId: "checkout-1",
        paymentGatewayId: id,
      });
      expect(element.type).toBe(form);
      expect(element.props.paymentGatewayId).toBe(id);
    },
  );

  it("rejects an unsupported gateway before initialization", async () => {
    await expect(PaymentGatewayPage({ params: params("another.gateway") })).rejects.toThrow(
      "Unsupported payment gateway",
    );
    expect(initialize).not.toHaveBeenCalled();
    expect(checkout).not.toHaveBeenCalled();
  });
});
