import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useAppRedirect } from "./use-app-redirect";

const dispatch = vi.fn();

vi.mock("@saleor/app-sdk/app-bridge", () => ({
  actions: {
    Redirect: (payload: { to: string }) => ({ type: "redirect", payload }),
    RedirectToApp: (payload: { appIdentifier: string; path?: string }) => ({
      type: "redirectToApp",
      payload,
    }),
  },
  useAppBridge: () => ({ appBridge: { dispatch } }),
}));

const appTarget = {
  kind: "app",
  appIdentifier: "saleor.app.smtp",
  path: "/templates",
  fallbackTo: "/extensions/installed",
} as const;

describe("useAppRedirect", () => {
  beforeEach(() => {
    dispatch.mockReset();
    dispatch.mockResolvedValue(undefined);
  });

  it("dispatches Redirect for a Dashboard path string", () => {
    const { result } = renderHook(() => useAppRedirect());

    result.current("/orders/");

    expect(dispatch).toHaveBeenCalledWith({ type: "redirect", payload: { to: "/orders/" } });
  });

  it("dispatches Redirect for a dashboard target", () => {
    const { result } = renderHook(() => useAppRedirect());

    result.current({ kind: "dashboard", to: "/extensions/installed" });

    expect(dispatch).toHaveBeenCalledWith({
      type: "redirect",
      payload: { to: "/extensions/installed" },
    });
  });

  it("dispatches RedirectToApp for an installed app identifier", async () => {
    const { result } = renderHook(() => useAppRedirect());

    result.current(appTarget);
    await vi.waitFor(() => expect(dispatch).toHaveBeenCalledTimes(1));

    expect(dispatch).toHaveBeenCalledWith({
      type: "redirectToApp",
      payload: { appIdentifier: "saleor.app.smtp", path: "/templates" },
    });
  });

  it("falls back to a Dashboard path when the Dashboard does not handle RedirectToApp", async () => {
    dispatch.mockRejectedValueOnce(new Error("Action response timed out."));

    const { result } = renderHook(() => useAppRedirect());

    result.current(appTarget);
    await vi.waitFor(() => expect(dispatch).toHaveBeenCalledTimes(2));

    expect(dispatch).toHaveBeenLastCalledWith({
      type: "redirect",
      payload: { to: "/extensions/installed" },
    });
  });
});
