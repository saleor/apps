import { createRoot, type Root } from "react-dom/client";
import { act } from "react-dom/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type * as GraphqlModule from "@/graphql/gql";
import { type SquareGatewayConfig } from "@/modules/square/schemas/square-gateway-config";

import { type SquareCard, type SquareGiftCard } from "../web-payments-sdk";
import { SquarePaymentForm } from "./square-payment-form";

const { initialize, checkout, push, toast } = vi.hoisted(() => ({
  initialize: vi.fn(),
  checkout: vi.fn(),
  push: vi.fn(),
  toast: vi.fn(),
}));

vi.mock("next/navigation", () => {
  const router = { push };

  return { useRouter: () => router };
});
vi.mock("@/components/ui/use-toast", () => ({ toast }));
vi.mock("@/modules/square/actions/initialize-transaction", () => ({
  initializeTransaction: initialize,
}));
vi.mock("@/modules/square/actions/get-checkout-total-price", () => ({
  getCheckoutTotalPrice: checkout,
}));
vi.mock("@/modules/square/stored-payment-methods/actions/delete-stored-payment-method", () => ({
  deleteStoredPaymentMethod: vi.fn(),
}));
vi.mock("@/modules/square/stored-payment-methods/actions/get-stored-payment-methods", () => ({
  getStoredPaymentMethods: vi.fn(),
}));
vi.mock("@/modules/square/stored-payment-methods/actions/initialize-square-tokenization", () => ({
  initializeSquareTokenization: vi.fn(),
}));
vi.mock("@/modules/square/stored-payment-methods/actions/save-square-payment-method", () => ({
  saveSquarePaymentMethod: vi.fn(),
}));
vi.mock("@/graphql/gql", async (importOriginal) => ({
  ...(await importOriginal<typeof GraphqlModule>()),
  readFragment: (_fragment: unknown, data: unknown) => data,
}));

const config: SquareGatewayConfig = {
  captureMode: "CHARGE",
  methods: ["card", "gift-card"],
  square: {
    environment: "sandbox",
    applicationId: "sandbox-app",
    locationId: "location",
  },
};
let root: Root;
let container: HTMLDivElement;
let card: SquareCard;
let giftCard: SquareGiftCard;
let destructions: Promise<boolean>[];

async function render() {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => {
    root.render(
      <SquarePaymentForm
        envUrl="https://example.saleor.cloud/graphql/"
        checkoutId="checkout-1"
        paymentGatewayId="saleor.app.square.dev"
        channelSlug="default-channel"
        checkoutContact={{}}
        totalPrice={{ gross: { amount: 10, currency: "USD" } }}
        squareConfig={config}
      />,
    );
  });
}

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("isSecureContext", true);
  destructions = [];
  localStorage.clear();
  sessionStorage.clear();
  checkout.mockResolvedValue({
    data: {
      checkout: {
        totalPrice: { gross: { amount: 10, currency: "USD" } },
        authorizeStatus: "NONE",
        chargeStatus: "NONE",
      },
    },
  });
  card = {
    attach: vi.fn(async (selector: string) => {
      const input = document.createElement("input");

      input.setAttribute("aria-label", "Square card input");
      document.querySelector(selector)!.appendChild(input);
    }),
    tokenize: vi.fn(async () => ({ status: "OK", token: "card-token" })),
    destroy: vi.fn(() => {
      const destruction = new Promise<boolean>((resolve) => {
        setTimeout(() => {
          document.querySelector("#square-card-container")?.replaceChildren();
          resolve(true);
        }, 1);
      });

      destructions.push(destruction);

      return destruction;
    }),
  };
  giftCard = {
    attach: vi.fn(async (selector: string) => {
      if (document.querySelector(selector)?.closest(".hidden")) {
        throw new Error("Cannot attach a Square gift card to a hidden container");
      }
    }),
    tokenize: vi.fn(async () => ({ status: "OK", token: "gift-token" })),
    destroy: vi.fn(async () => true),
  };
  window.Square = {
    payments: vi.fn(() => ({
      card: async () => card,
      giftCard: async () => giftCard,
    })),
  } as unknown as NonNullable<Window["Square"]>;
});

afterEach(async () => {
  await act(async () => root?.unmount());
  await Promise.all(destructions);
  container?.remove();
  delete window.Square;
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

const button = (text: string) =>
  Array.from(container.querySelectorAll("button")).find((element) => element.textContent === text)!;

describe("Square split-payment card entry", () => {
  it("keeps card entry available after a gift-card authorization and pays the remainder", async () => {
    initialize.mockResolvedValueOnce({
      data: {
        transactionInitialize: {
          errors: [],
          transactionEvent: { type: "AUTHORIZATION_SUCCESS" },
          data: { square: { remainingAmount: 7, cardLast4: "1234" } },
        },
      },
    });
    await render();
    await act(async () => button("Apply gift card").click());
    await vi.waitFor(async () => {
      await act(async () => {
        await Promise.all(destructions);
      });
      expect(button("Pay remaining 7 USD").disabled).toBe(false);
    });

    expect(container.querySelector('[aria-label="Square card input"]')).not.toBeNull();
    expect(button("Pay remaining 7 USD").disabled).toBe(false);
    expect(giftCard.attach).toHaveBeenCalledTimes(1);
    expect(toast).not.toHaveBeenCalledWith(
      expect.objectContaining({ title: "Square could not initialize" }),
    );

    checkout.mockResolvedValue({
      data: {
        checkout: {
          totalPrice: { gross: { amount: 10, currency: "USD" } },
          authorizeStatus: "PARTIAL",
          chargeStatus: "NONE",
        },
      },
    });
    initialize.mockResolvedValueOnce({
      data: {
        transactionInitialize: {
          errors: [],
          transactionEvent: { type: "CHARGE_SUCCESS" },
          data: {},
        },
      },
    });
    await act(async () => button("Pay remaining 7 USD").click());
    expect(card.tokenize).toHaveBeenCalledWith(expect.objectContaining({ amount: "7.00" }));
    expect(initialize).toHaveBeenLastCalledWith(
      expect.objectContaining({
        amount: 7,
        data: expect.objectContaining({
          method: "card",
          giftCardRemainder: true,
        }),
      }),
    );
    expect(push).toHaveBeenCalledWith(expect.stringContaining("/summary"));
  });

  it("restores card entry when refreshing a partially authorized checkout", async () => {
    sessionStorage.setItem(
      "square-gift-card-authorization:https://example.saleor.cloud/graphql/:checkout-1:saleor.app.square.dev",
      JSON.stringify({
        remainingAmount: 7,
        currency: "USD",
        expiresAt: new Date(Date.now() + 60_000).toISOString(),
      }),
    );
    checkout.mockResolvedValue({
      data: {
        checkout: {
          totalPrice: { gross: { amount: 10, currency: "USD" } },
          authorizeStatus: "PARTIAL",
          chargeStatus: "NONE",
        },
      },
    });
    await render();
    await vi.waitFor(async () => {
      await act(async () => {
        await Promise.all(destructions);
      });
      expect(button("Pay remaining 7 USD").disabled).toBe(false);
    });
    expect(container.querySelector('[aria-label="Square card input"]')).not.toBeNull();
    expect(button("Pay remaining 7 USD").disabled).toBe(false);
    expect(toast).not.toHaveBeenCalledWith(
      expect.objectContaining({ title: "Square could not initialize" }),
    );
  });
});
