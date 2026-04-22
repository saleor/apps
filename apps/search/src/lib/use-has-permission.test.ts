import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useHasPermission } from "./use-has-permission";

vi.mock("@saleor/app-sdk/app-bridge");

describe("useHasPermission", () => {
  it("returns true when app has the permission", () => {
    vi.mocked(useAppBridge).mockReturnValue({
      appBridgeState: {
        appPermissions: ["MANAGE_PAGES", "MANAGE_PRODUCTS"],
      },
    } as any);

    const { result } = renderHook(() => useHasPermission("MANAGE_PAGES"));

    expect(result.current).toBe(true);
  });

  it("returns false when app does not have the permission", () => {
    vi.mocked(useAppBridge).mockReturnValue({
      appBridgeState: {
        appPermissions: ["MANAGE_PRODUCTS"],
      },
    } as any);

    const { result } = renderHook(() => useHasPermission("MANAGE_PAGES"));

    expect(result.current).toBe(false);
  });

  it("returns false when appBridgeState is null", () => {
    vi.mocked(useAppBridge).mockReturnValue({
      appBridgeState: null,
    } as any);

    const { result } = renderHook(() => useHasPermission("MANAGE_PAGES"));

    expect(result.current).toBe(false);
  });

  it("returns false when appPermissions is undefined", () => {
    vi.mocked(useAppBridge).mockReturnValue({
      appBridgeState: {
        appPermissions: undefined,
      },
    } as any);

    const { result } = renderHook(() => useHasPermission("MANAGE_PAGES"));

    expect(result.current).toBe(false);
  });
});
