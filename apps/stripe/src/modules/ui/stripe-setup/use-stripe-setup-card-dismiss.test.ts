import { type AppBridgeState, useAppBridge } from "@saleor/app-sdk/app-bridge";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useStripeSetupCardDismiss } from "./use-stripe-setup-card-dismiss";

vi.mock("@saleor/app-sdk/app-bridge", () => ({
  useAppBridge: vi.fn(),
}));

const SHOP_URL = "https://example.saleor.cloud/graphql/";
const UNKNOWN_KEY = "saleor.stripe.setupChecklist.dismissed:unknown";
const SHOP_KEY = `saleor.stripe.setupChecklist.dismissed:${SHOP_URL}`;

const createLocalStorage = () => {
  const store = new Map<string, string>();

  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
  };
};

const bridgeState = (saleorApiUrl: string | undefined) => {
  const state: AppBridgeState | null = saleorApiUrl
    ? {
        user: { permissions: [], email: "" },
        id: "",
        ready: true,
        path: "/",
        theme: "light",
        locale: "en",
        saleorApiUrl,
        formContext: {},
      }
    : null;

  return { appBridgeState: state, appBridge: undefined };
};

describe("useStripeSetupCardDismiss", () => {
  beforeEach(() => {
    Object.defineProperty(window, "localStorage", {
      value: createLocalStorage(),
      configurable: true,
    });
    vi.mocked(useAppBridge).mockReturnValue(bridgeState(undefined));
  });

  it("Reads a prior dismissal once AppBridge hydrates the shop URL", () => {
    window.localStorage.setItem(SHOP_KEY, "1");
    vi.mocked(useAppBridge).mockReturnValue(bridgeState(undefined));

    const { result, rerender } = renderHook(() => useStripeSetupCardDismiss());

    expect(result.current.dismissed).toBe(false);
    expect(window.localStorage.getItem(UNKNOWN_KEY)).toBeNull();

    vi.mocked(useAppBridge).mockReturnValue(bridgeState(SHOP_URL));
    rerender();

    expect(result.current.dismissed).toBe(true);
  });

  it("Writes dismissal under the hydrated shop key", () => {
    vi.mocked(useAppBridge).mockReturnValue(bridgeState(SHOP_URL));

    const { result } = renderHook(() => useStripeSetupCardDismiss());

    act(() => {
      result.current.dismiss();
    });

    expect(result.current.dismissed).toBe(true);
    expect(window.localStorage.getItem(SHOP_KEY)).toBe("1");
    expect(window.localStorage.getItem(UNKNOWN_KEY)).toBeNull();
  });

  it("Clears dismissal for the current shop on restore", () => {
    window.localStorage.setItem(SHOP_KEY, "1");
    vi.mocked(useAppBridge).mockReturnValue(bridgeState(SHOP_URL));

    const { result } = renderHook(() => useStripeSetupCardDismiss());

    expect(result.current.dismissed).toBe(true);

    act(() => {
      result.current.restore();
    });

    expect(result.current.dismissed).toBe(false);
    expect(window.localStorage.getItem(SHOP_KEY)).toBeNull();
  });
});
