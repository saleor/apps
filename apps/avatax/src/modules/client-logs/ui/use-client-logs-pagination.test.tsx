import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useClientLogsPagination } from "./use-client-logs-pagination";

describe("useClientLogsPagination", () => {
  it("should allow to go to the next evaluated key", () => {
    const { result } = renderHook(() => useClientLogsPagination());

    act(() => {
      result.current.goToNextEvaluatedKey({ key: "value" });
    });

    expect(result.current.currentEvaluatedKey).toStrictEqual({ key: "value" });
  });

  it("should allow to go to the previous evaluated key", () => {
    const { result } = renderHook(() => useClientLogsPagination());

    act(() => {
      result.current.goToNextEvaluatedKey({ key: "value1" });

      result.current.goToNextEvaluatedKey({ key: "value2" });

      result.current.goToPreviousEvaluatedKey();
    });

    expect(result.current.currentEvaluatedKey).toStrictEqual({ key: "value1" });
  });

  it("should disable previous button when there are no previous keys", () => {
    const { result } = renderHook(() => useClientLogsPagination());

    expect(result.current.isPreviousButtonDisabled()).toBe(true);

    act(() => {
      result.current.goToNextEvaluatedKey({ key: "value" });
    });

    expect(result.current.isPreviousButtonDisabled()).toBe(false);
  });

  it("should disable next button when next key is undefined", () => {
    const { result } = renderHook(() => useClientLogsPagination());

    expect(result.current.isNextButtonDisabled(undefined)).toBe(true);

    act(() => {
      result.current.goToNextEvaluatedKey({ key: "value" });
    });

    expect(result.current.isNextButtonDisabled(undefined)).toBe(true);
  });
});
