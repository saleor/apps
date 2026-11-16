import { createRoot, type Root } from "react-dom/client";
import { act } from "react-dom/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { saveCustomerSession } from "@/modules/customer-session/components/storage-helpers";

import { SquareCheckout } from "./square-checkout";

const { attach, login, checkout } = vi.hoisted(() => ({
  attach: vi.fn(),
  login: vi.fn(),
  checkout: vi.fn(),
}));

vi.mock("../actions/get-checkout-total-price", () => ({ getCheckoutTotalPrice: checkout }));
vi.mock("@/modules/customer-session/actions/attach-checkout-customer", () => ({
  attachCheckoutCustomer: attach,
}));
vi.mock("@/modules/customer-session/actions/login-customer", () => ({ loginCustomer: login }));
vi.mock("./square-payment-form", () => ({
  SquarePaymentForm: () => <div data-testid="payment">Payment form</div>,
}));
vi.mock("@/components/ui/use-toast", () => ({ toast: vi.fn() }));

let root: Root;
let container: HTMLDivElement;
const envUrl = "https://square.example/graphql/";
const session = {
  email: "customer@example.com",
  token: "access",
  refreshToken: "refresh",
  userId: "user",
};

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  localStorage.clear();
  vi.clearAllMocks();
  checkout.mockResolvedValue({
    data: {
      checkout: {
        totalPrice: { gross: { amount: 12, currency: "USD" } },
        email: session.email,
        billingAddress: null,
      },
    },
  });
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});

async function render() {
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  await act(async () =>
    root.render(
      <SquareCheckout
        envUrl={envUrl}
        checkoutId="checkout-1"
        paymentGatewayId="saleor.app.square.dev"
        channelSlug="default-channel"
        checkoutContact={{}}
        totalPrice={{ gross: { amount: 10, currency: "USD" } }}
        squareConfig={{
          captureMode: "CHARGE",
          methods: ["card", "saved-card"],
          square: { environment: "sandbox", applicationId: "app", locationId: "location" },
        }}
      />,
    ),
  );
}

async function click(text: string) {
  const button = Array.from(container.querySelectorAll("button")).find(
    (candidate) => candidate.textContent?.includes(text),
  );

  expect(button).toBeDefined();
  await act(async () => button!.click());
}

describe("Square customer step", () => {
  it("lets guests proceed without calling customer APIs", async () => {
    await render();
    expect(container.querySelector('[data-testid="payment"]')).toBeNull();
    await click("Continue to payment");
    expect(container.querySelector('[data-testid="payment"]')).not.toBeNull();
    expect(attach).not.toHaveBeenCalled();
    expect(login).not.toHaveBeenCalled();
  });

  it("attaches a saved customer before mounting the payment form", async () => {
    saveCustomerSession(envUrl, session);
    attach.mockResolvedValue({
      data: { status: "success", customer: { email: session.email }, refreshedSession: null },
    });
    await render();
    await click(`Continue as ${session.email}`);
    expect(checkout).toHaveBeenCalledWith({ envUrl, checkoutId: "checkout-1" });
    expect(attach).toHaveBeenCalledWith({
      envUrl,
      checkoutId: "checkout-1",
      customerSession: session,
    });
    expect(container.querySelector('[data-testid="payment"]')).not.toBeNull();
  });

  it("keeps payment unmounted when customer attachment fails", async () => {
    saveCustomerSession(envUrl, session);
    attach.mockResolvedValue({ data: { status: "error", error: { message: "Session expired" } } });
    await render();
    await click(`Continue as ${session.email}`);
    expect(container.querySelector('[data-testid="payment"]')).toBeNull();
  });
});
