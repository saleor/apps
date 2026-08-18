import { act, renderHook } from "@testing-library/react";
import { useRouter } from "next/router";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useUnsavedChangesGuard } from "./use-unsaved-changes-guard";

vi.mock("next/router", () => ({
  useRouter: vi.fn(),
}));

type RouteChangeStartHandler = (url: string) => void;

const createRouterMock = () => {
  const handlers = new Set<RouteChangeStartHandler>();

  return {
    asPath: "/config/config-1",
    push: vi.fn(() => Promise.resolve(true)),
    events: {
      on: vi.fn((event: string, handler: RouteChangeStartHandler) => {
        if (event === "routeChangeStart") {
          handlers.add(handler);
        }
      }),
      off: vi.fn((_event: string, handler: RouteChangeStartHandler) => handlers.delete(handler)),
      emit: vi.fn(),
    },
    /** Simulates what the router does when something calls `push`. */
    startRouteChange(url: string) {
      handlers.forEach((handler) => handler(url));
    },
  };
};

describe("useUnsavedChangesGuard", () => {
  let router: ReturnType<typeof createRouterMock>;

  beforeEach(() => {
    router = createRouterMock();
    vi.mocked(useRouter).mockReturnValue(router as unknown as ReturnType<typeof useRouter>);
  });

  it("lets navigation through when there are no changes", () => {
    const { result } = renderHook(() => useUnsavedChangesGuard({ enabled: false }));

    expect(() => router.startRouteChange("/config")).not.toThrow();
    expect(result.current.isBlocked).toBe(false);
  });

  it("aborts navigation and blocks when there are unsaved changes", () => {
    const { result } = renderHook(() => useUnsavedChangesGuard({ enabled: true }));

    act(() => {
      expect(() => router.startRouteChange("/config")).toThrow();
    });

    expect(router.events.emit).toHaveBeenCalledWith(
      "routeChangeError",
      expect.stringContaining("Abort route change"),
      "/config",
      { shallow: false },
    );
    expect(result.current.isBlocked).toBe(true);
  });

  it("does not block a transition to the current page", () => {
    const { result } = renderHook(() => useUnsavedChangesGuard({ enabled: true }));

    expect(() => router.startRouteChange("/config/config-1")).not.toThrow();
    expect(result.current.isBlocked).toBe(false);
  });

  it("continues to the blocked destination when changes are discarded", async () => {
    const { result } = renderHook(() => useUnsavedChangesGuard({ enabled: true }));

    act(() => {
      expect(() => router.startRouteChange("/config")).toThrow();
    });

    await act(async () => {
      result.current.leave();
    });

    expect(router.push).toHaveBeenCalledWith("/config");
    expect(result.current.isBlocked).toBe(false);
  });

  it("forgets the destination when the user keeps editing", () => {
    const { result } = renderHook(() => useUnsavedChangesGuard({ enabled: true }));

    act(() => {
      expect(() => router.startRouteChange("/config")).toThrow();
    });

    act(() => {
      result.current.keepEditing();
    });

    expect(result.current.isBlocked).toBe(false);
    expect(router.push).not.toHaveBeenCalled();
  });

  it("skips the guard for navigation triggered after saving", async () => {
    const { result } = renderHook(() => useUnsavedChangesGuard({ enabled: true }));

    await act(async () => {
      result.current.navigateWithoutGuard("/config");
    });

    expect(router.push).toHaveBeenCalledWith("/config");
    expect(result.current.isBlocked).toBe(false);
  });
});
