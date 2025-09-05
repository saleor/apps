import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { trpcClient } from "@/modules/trpc/trpc-client";

import { useTaxClassesWithMatches } from "./use-tax-classes-with-matches";

vi.mock("@/modules/trpc/trpc-client", () => ({
  trpcClient: {
    taxClasses: {
      getAll: {
        useQuery: vi.fn(),
      },
    },
    avataxMatches: {
      getAll: {
        useQuery: vi.fn(),
      },
    },
  },
}));

const mockTaxClassesQuery = vi.fn();
const mockTaxMatchesQuery = vi.fn();

describe("useTaxClassesWithMatches", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(trpcClient.taxClasses.getAll.useQuery).mockImplementation(mockTaxClassesQuery);
    vi.mocked(trpcClient.avataxMatches.getAll.useQuery).mockImplementation(mockTaxMatchesQuery);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should handle loading states correctly", () => {
    // When tax classes are loading
    mockTaxClassesQuery.mockReturnValue({
      data: [],
      isLoading: true,
    });
    mockTaxMatchesQuery.mockReturnValue({
      data: [],
      isLoading: false,
    });

    const { result, rerender } = renderHook(() => useTaxClassesWithMatches());

    expect(result.current.isLoading).toBe(true);

    // When tax matches are loading
    mockTaxClassesQuery.mockReturnValue({
      data: [],
      isLoading: false,
    });
    mockTaxMatchesQuery.mockReturnValue({
      data: [],
      isLoading: true,
    });

    rerender();
    expect(result.current.isLoading).toBe(true);

    // When both queries are loading
    mockTaxClassesQuery.mockReturnValue({
      data: [],
      isLoading: true,
    });
    mockTaxMatchesQuery.mockReturnValue({
      data: [],
      isLoading: true,
    });

    rerender();
    expect(result.current.isLoading).toBe(true);

    // When both queries are complete
    mockTaxClassesQuery.mockReturnValue({
      data: [],
      isLoading: false,
    });
    mockTaxMatchesQuery.mockReturnValue({
      data: [],
      isLoading: false,
    });

    rerender();
    expect(result.current.isLoading).toBe(false);
  });

  it("should handle tax classes data correctly", () => {
    const mockTaxClasses = [
      { id: "tax-class-1", name: "Standard Rate" },
      { id: "tax-class-2", name: "Reduced Rate" },
    ];

    // When tax classes data exists
    mockTaxClassesQuery.mockReturnValue({
      data: mockTaxClasses,
      isLoading: false,
    });
    mockTaxMatchesQuery.mockReturnValue({
      data: [],
      isLoading: false,
    });

    const { result, rerender } = renderHook(() => useTaxClassesWithMatches());

    expect(result.current.taxClasses).toStrictEqual(mockTaxClasses);

    // When tax classes data is undefined
    mockTaxClassesQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
    });

    rerender();
    expect(result.current.taxClasses).toStrictEqual([]);
  });

  describe("findOptionMatchForTaxClass", () => {
    const mockTaxMatches = [
      {
        data: {
          saleorTaxClassId: "tax-class-1",
          avataxTaxCode: "TX001",
        },
      },
      {
        data: {
          saleorTaxClassId: "tax-class-2",
          avataxTaxCode: "TX002",
        },
      },
    ];

    beforeEach(() => {
      mockTaxClassesQuery.mockReturnValue({
        data: [],
        isLoading: false,
      });

      mockTaxMatchesQuery.mockReturnValue({
        data: mockTaxMatches,
        isLoading: false,
      });
    });

    it("should return correct matches for different tax classes", () => {
      const { result } = renderHook(() => useTaxClassesWithMatches());

      // Should return matching option for tax-class-1
      const match1 = result.current.findOptionMatchForTaxClass("tax-class-1");

      expect(match1).toStrictEqual({
        label: "TX001",
        value: "TX001",
      });

      // Should return different match for tax-class-2
      const match2 = result.current.findOptionMatchForTaxClass("tax-class-2");

      expect(match2).toStrictEqual({
        label: "TX002",
        value: "TX002",
      });

      // Should return null when tax class has no match
      const match3 = result.current.findOptionMatchForTaxClass("tax-class-3");

      expect(match3).toBe(null);
    });

    it("should return null when no matches are available", () => {
      // When tax matches data is undefined
      mockTaxMatchesQuery.mockReturnValue({
        data: undefined,
        isLoading: false,
      });

      const { result, rerender } = renderHook(() => useTaxClassesWithMatches());
      let match = result.current.findOptionMatchForTaxClass("tax-class-1");

      expect(match).toBe(null);

      // When tax matches array is empty
      mockTaxMatchesQuery.mockReturnValue({
        data: [],
        isLoading: false,
      });

      rerender();
      match = result.current.findOptionMatchForTaxClass("tax-class-1");
      expect(match).toBe(null);
    });
  });

  it("should return all expected properties with correct structure", () => {
    mockTaxClassesQuery.mockReturnValue({
      data: [],
      isLoading: false,
    });

    mockTaxMatchesQuery.mockReturnValue({
      data: [],
      isLoading: false,
    });

    const { result } = renderHook(() => useTaxClassesWithMatches());

    expect(result.current).toStrictEqual({
      taxClasses: [],
      isLoading: false,
      findOptionMatchForTaxClass: expect.any(Function),
    });
  });
});
