import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { REQUIRED_CLIENT_PERMISSIONS } from "@/lib/required-client-permissions";

import { useHasAppAccess } from "./use-has-app-access";

vi.mock("@saleor/app-sdk/app-bridge", () => ({
  useAppBridge: vi.fn(),
}));

describe("useHasAppAccess", () => {
  it("returns false when appBridgeState is null", () => {
    vi.mocked(useAppBridge).mockImplementationOnce(() => ({
      appBridgeState: null,
      appBridge: undefined,
    }));

    const { result } = renderHook(() => useHasAppAccess());

    expect(result.current.haveAccessToApp).toBe(false);
  });

  it("returns false when user does not have all required permissions", () => {
    vi.mocked(useAppBridge).mockImplementationOnce(() => ({
      appBridgeState: {
        user: {
          permissions: ["MANAGE_APPS"],
          email: "",
        },
        id: "",
        ready: true,
        path: "/",
        theme: "light",
        locale: "en",
        saleorApiUrl: "",
        formContext: {},
      },
      appBridge: undefined,
    }));

    const { result } = renderHook(() => useHasAppAccess());

    expect(result.current.haveAccessToApp).toBe(false);
  });

  it("returns true when user has all required permissions", () => {
    vi.mocked(useAppBridge).mockImplementationOnce(() => ({
      appBridgeState: {
        user: {
          permissions: REQUIRED_CLIENT_PERMISSIONS,
          email: "",
        },
        id: "",
        ready: true,
        path: "/",
        theme: "light",
        locale: "en",
        saleorApiUrl: "",
        formContext: {},
      },
      appBridge: undefined,
    }));

    const { result } = renderHook(() => useHasAppAccess());

    expect(result.current.haveAccessToApp).toBe(true);
  });

  it("returns true when user has all required permissions with extra permissions", () => {
    vi.mocked(useAppBridge).mockImplementationOnce(() => ({
      appBridgeState: {
        user: {
          permissions: [...REQUIRED_CLIENT_PERMISSIONS, "HANDLE_CHECKOUTS"],
          email: "",
        },
        id: "",
        ready: true,
        path: "/",
        theme: "light",
        locale: "en",
        saleorApiUrl: "",
        formContext: {},
      },
      appBridge: undefined,
    }));

    const { result } = renderHook(() => useHasAppAccess());

    expect(result.current.haveAccessToApp).toBe(true);
  });
});
