import { Option } from "@saleor/macaw-ui";
import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { trpcClient } from "@/modules/trpc/trpc-client";

import { useTaxCodeCombobox } from "./use-tax-code-combobox";

vi.mock("@/modules/trpc/trpc-client", () => ({
  trpcClient: {
    providersConfiguration: {
      getAll: {
        useQuery: vi.fn(),
      },
    },
    avataxTaxCodes: {
      getAllForId: {
        useQuery: vi.fn(),
      },
    },
    avataxMatches: {
      upsert: {
        useMutation: vi.fn(),
      },
    },
  },
}));

vi.mock("@saleor/apps-shared/use-dashboard-notification", () => ({
  useDashboardNotification: vi.fn(() => ({
    notifySuccess: vi.fn(),
    notifyError: vi.fn(),
  })),
}));

const mockGetAllProvidersQuery = vi.fn();
const mockGetTaxCodesQuery = vi.fn();
const mockUpsertMutation = vi.fn();

describe("useTaxCodeCombobox", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(trpcClient.providersConfiguration.getAll.useQuery).mockImplementation(
      mockGetAllProvidersQuery,
    );

    vi.mocked(trpcClient.avataxTaxCodes.getAllForId.useQuery).mockImplementation(
      mockGetTaxCodesQuery,
    );

    vi.mocked(trpcClient.avataxMatches.upsert.useMutation).mockImplementation(mockUpsertMutation);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  const defaultProps = {
    taxClassId: "tax-class-1",
    initialValue: null,
  };

  it("should handle error states and loading correctly", () => {
    // When no tax providers are found
    mockGetAllProvidersQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
    });
    mockGetTaxCodesQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });
    mockUpsertMutation.mockReturnValue({
      mutate: vi.fn(),
      isLoading: false,
    });

    const { result, rerender } = renderHook(() => useTaxCodeCombobox(defaultProps));

    expect(result.current).toStrictEqual({
      options: [],
      loading: false,
      value: null,
      onChange: expect.any(Function),
      onInputValueChange: expect.any(Function),
      errorMessage: null,
    });

    // When providers query is loading
    mockGetAllProvidersQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
    });
    mockGetTaxCodesQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });
    mockUpsertMutation.mockReturnValue({
      mutate: vi.fn(),
      isLoading: false,
    });

    rerender();
    expect(result.current.loading).toBe(true);
  });

  describe("when tax providers exist", () => {
    const mockProviders = [{ id: "provider-1" }, { id: "provider-2" }];

    beforeEach(() => {
      mockGetAllProvidersQuery.mockReturnValue({
        data: mockProviders,
        isLoading: false,
      });
    });

    it("uses first provider connection ID for tax codes query", () => {
      mockGetTaxCodesQuery.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      });

      mockUpsertMutation.mockReturnValue({
        mutate: vi.fn(),
        isLoading: false,
      });

      renderHook(() => useTaxCodeCombobox(defaultProps));

      expect(mockGetTaxCodesQuery).toHaveBeenCalledWith(
        {
          connectionId: "provider-1",
          filter: "",
          uniqueKey: "tax-class-1",
        },
        {
          enabled: true,
          retry: false,
        },
      );
    });

    describe("when tax codes query fails", () => {
      it("returns error message when query fails", () => {
        mockGetTaxCodesQuery.mockReturnValue({
          data: [],
          isLoading: false,
          error: new Error("API Error"),
        });
        mockUpsertMutation.mockReturnValue({
          mutate: vi.fn(),
          isLoading: false,
        });

        const { result } = renderHook(() => useTaxCodeCombobox(defaultProps));

        expect(result.current).toStrictEqual({
          options: [],
          loading: false,
          value: null,
          onChange: expect.any(Function),
          onInputValueChange: expect.any(Function),
          errorMessage: "API Error",
        });
      });
    });

    it("should handle various loading states", () => {
      // When tax codes are loading
      mockGetTaxCodesQuery.mockReturnValue({
        data: [],
        isLoading: true,
        error: null,
      });
      mockUpsertMutation.mockReturnValue({
        mutate: vi.fn(),
        isLoading: false,
      });

      const { result, rerender } = renderHook(() => useTaxCodeCombobox(defaultProps));

      expect(result.current.loading).toBe(true);

      // When upsert mutation is loading
      mockGetTaxCodesQuery.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      });
      mockUpsertMutation.mockReturnValue({
        mutate: vi.fn(),
        isLoading: true,
      });

      rerender();
      expect(result.current.loading).toBe(true);
    });

    describe("when tax codes are successfully loaded", () => {
      const mockTaxCodes = [
        { code: "TX001", description: "Taxable Goods" },
        { code: "TX002", description: "Non-Taxable Services" },
      ];

      beforeEach(() => {
        mockGetTaxCodesQuery.mockReturnValue({
          data: mockTaxCodes,
          isLoading: false,
          error: null,
        });

        mockUpsertMutation.mockReturnValue({
          mutate: vi.fn(),
          isLoading: false,
        });
      });

      it("should handle successful data loading correctly", () => {
        const { result } = renderHook(() => useTaxCodeCombobox(defaultProps));

        // Should transform tax codes to options format
        expect(result.current.options).toStrictEqual([
          { label: "TX001 - Taxable Goods", value: "TX001" },
          { label: "TX002 - Non-Taxable Services", value: "TX002" },
        ]);

        // Should not have error message when data is available
        expect(result.current.errorMessage).toBe(null);

        // Should use null as default value
        expect(result.current.value).toBe(null);
      });

      it("should use initial value when provided", () => {
        const initialValue: Option = { label: "Initial", value: "initial" };

        const { result } = renderHook(() => useTaxCodeCombobox({ ...defaultProps, initialValue }));

        expect(result.current.value).toStrictEqual(initialValue);
      });

      it("should format initial value with description when tax codes are loaded", () => {
        // Initially pass an unformatted initial value (just the code)
        const initialValue: Option = { label: "TX001", value: "TX001" };

        const { result } = renderHook(() => useTaxCodeCombobox({ ...defaultProps, initialValue }));

        // Should immediately format the value with description since tax codes are available
        expect(result.current.value).toStrictEqual({
          label: "TX001 - Taxable Goods",
          value: "TX001",
        });
      });
    });

    describe("onChange handler", () => {
      const mockMutate = vi.fn();

      beforeEach(() => {
        mockGetTaxCodesQuery.mockReturnValue({
          data: [{ code: "TX001", description: "Taxable Goods" }],
          isLoading: false,
          error: null,
        });

        mockUpsertMutation.mockReturnValue({
          mutate: mockMutate,
          isLoading: false,
        });
      });

      it("should handle value changes correctly", async () => {
        const { result } = renderHook(() => useTaxCodeCombobox(defaultProps));

        // Should update value and call mutation when new value is selected
        const newValue: Option = { label: "TX001 - Taxable Goods", value: "TX001" };

        result.current.onChange(newValue);

        await waitFor(() => {
          expect(result.current.value).toStrictEqual({
            label: "TX001 - Taxable Goods",
            value: "TX001",
          });
        });

        expect(mockMutate).toHaveBeenCalledWith({
          saleorTaxClassId: "tax-class-1",
          avataxTaxCode: "TX001",
        });

        // Should do nothing when null value is selected
        vi.clearAllMocks();
        result.current.onChange(null);
        expect(mockMutate).not.toHaveBeenCalled();
      });
    });

    it("should handle input filtering correctly", () => {
      mockGetTaxCodesQuery.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      });
      mockUpsertMutation.mockReturnValue({
        mutate: vi.fn(),
        isLoading: false,
      });

      const { result, rerender } = renderHook(() => useTaxCodeCombobox(defaultProps));

      result.current.onInputValueChange("new filter");
      rerender();

      expect(mockGetTaxCodesQuery).toHaveBeenLastCalledWith(
        {
          connectionId: "provider-1",
          filter: "new filter",
          uniqueKey: "tax-class-1",
        },
        {
          enabled: true,
          retry: false,
        },
      );
    });
  });
});
