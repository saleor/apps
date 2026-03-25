import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { createGraphQLClient } from "@saleor/apps-shared/create-graphql-client";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type AlgoliaSearchProvider } from "../../lib/algolia/algoliaSearchProvider";
import { useCategoriesBatchUpload } from "./useCategoriesBatchUpload";
import { usePagesBatchUpload } from "./usePagesBatchUpload";
import { useProductsBatchUpload } from "./useProductsBatchUpload";

vi.mock("@saleor/app-sdk/app-bridge");
vi.mock("@saleor/apps-shared/create-graphql-client");

describe("useProductsBatchUpload", () => {
  const mockSearchProvider = {
    updatedBatchProducts: vi.fn().mockResolvedValue(undefined),
  } as unknown as AlgoliaSearchProvider;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAppBridge).mockReturnValue({
      appBridgeState: { saleorApiUrl: "https://example.com/graphql/", token: "mock-token" },
    } as any);
    vi.mocked(createGraphQLClient).mockReturnValue({
      query: vi.fn().mockReturnValue({
        toPromise: vi.fn().mockResolvedValue({
          data: {
            channels: [{ slug: "default-channel" }],
            products: {
              edges: [{ node: { id: "product1" } }, { node: { id: "product2" } }],
              pageInfo: { hasNextPage: false, endCursor: null },
            },
          },
        }),
      }),
    } as any);
  });

  it("should start import and update upload state", async () => {
    const { result } = renderHook(() => useProductsBatchUpload(mockSearchProvider));

    act(() => {
      result.current.startUpload();
    });

    await waitFor(() => {
      expect(result.current.uploadState.type).toBe("uploading");
    });

    await waitFor(
      () => {
        expect(result.current.uploadState.type).toBe("success");
        expect(mockSearchProvider.updatedBatchProducts).toHaveBeenCalledTimes(1);
        expect(mockSearchProvider.updatedBatchProducts).toHaveBeenCalledWith([
          { id: "product1" },
          { id: "product2" },
        ]);
      },
      {
        timeout: 2_000,
      },
    );
  });

  it("should not start import if searchProvider is null", async () => {
    const { result } = renderHook(() => useProductsBatchUpload(null));

    act(() => {
      result.current.startUpload();
    });

    expect(result.current.uploadState.type).toBe("idle");
  });

  it("should handle multiple channels", async () => {
    vi.mocked(createGraphQLClient).mockReturnValue({
      query: vi.fn().mockReturnValue({
        toPromise: vi
          .fn()
          .mockResolvedValueOnce({
            data: {
              channels: [{ slug: "channel1" }, { slug: "channel2" }],
            },
          })
          .mockResolvedValueOnce({
            data: {
              products: {
                edges: [{ node: { id: "product1" } }],
                pageInfo: { hasNextPage: false, endCursor: null },
              },
            },
          })
          .mockResolvedValueOnce({
            data: {
              products: {
                edges: [{ node: { id: "product2" } }],
                pageInfo: { hasNextPage: false, endCursor: null },
              },
            },
          }),
      }),
    } as any);

    const { result } = renderHook(() => useProductsBatchUpload(mockSearchProvider));

    act(() => {
      result.current.startUpload();
    });

    await waitFor(() => {
      expect(result.current.uploadState.type).toBe("uploading");
    });

    await waitFor(
      () => {
        expect(result.current.uploadState.type).toBe("success");
        expect(mockSearchProvider.updatedBatchProducts).toHaveBeenCalledTimes(2);
        expect(mockSearchProvider.updatedBatchProducts).toHaveBeenCalledWith([{ id: "product1" }]);
        expect(mockSearchProvider.updatedBatchProducts).toHaveBeenCalledWith([{ id: "product2" }]);
      },
      {
        timeout: 2_000,
      },
    );
  });
});

describe("useCategoriesBatchUpload", () => {
  const mockSearchProvider = {
    updatedBatchCategories: vi.fn().mockResolvedValue(undefined),
  } as unknown as AlgoliaSearchProvider;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAppBridge).mockReturnValue({
      appBridgeState: { saleorApiUrl: "https://example.com/graphql/", token: "mock-token" },
    } as any);
    vi.mocked(createGraphQLClient).mockReturnValue({
      query: vi.fn().mockReturnValue({
        toPromise: vi.fn().mockResolvedValue({
          data: {
            categories: {
              edges: [{ node: { id: "category1" } }, { node: { id: "category2" } }],
              pageInfo: { hasNextPage: false, endCursor: null },
            },
          },
        }),
      }),
    } as any);
  });

  it("should start import and update upload state", async () => {
    const { result } = renderHook(() => useCategoriesBatchUpload(mockSearchProvider));

    act(() => {
      result.current.startUpload();
    });

    await waitFor(() => {
      expect(result.current.uploadState.type).toBe("uploading");
    });

    await waitFor(
      () => {
        expect(result.current.uploadState.type).toBe("success");
        expect(mockSearchProvider.updatedBatchCategories).toHaveBeenCalledTimes(1);
        expect(mockSearchProvider.updatedBatchCategories).toHaveBeenCalledWith([
          { id: "category1" },
          { id: "category2" },
        ]);
      },
      {
        timeout: 2_000,
      },
    );
  });

  it("should not start import if searchProvider is null", async () => {
    const { result } = renderHook(() => useCategoriesBatchUpload(null));

    act(() => {
      result.current.startUpload();
    });

    expect(result.current.uploadState.type).toBe("idle");
  });
});

describe("usePagesBatchUpload", () => {
  const mockSearchProvider = {
    updatedBatchPages: vi.fn().mockResolvedValue(undefined),
  } as unknown as AlgoliaSearchProvider;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAppBridge).mockReturnValue({
      appBridgeState: { saleorApiUrl: "https://example.com/graphql/", token: "mock-token" },
    } as any);
    vi.mocked(createGraphQLClient).mockReturnValue({
      query: vi.fn().mockReturnValue({
        toPromise: vi.fn().mockResolvedValue({
          data: {
            pages: {
              edges: [{ node: { id: "page1" } }, { node: { id: "page2" } }],
              pageInfo: { hasNextPage: false, endCursor: null },
            },
          },
        }),
      }),
    } as any);
  });

  it("should start import and update upload state", async () => {
    const { result } = renderHook(() => usePagesBatchUpload(mockSearchProvider));

    act(() => {
      result.current.startUpload(["page-type-1"]);
    });

    await waitFor(() => {
      expect(result.current.uploadState.type).toBe("uploading");
    });

    await waitFor(
      () => {
        expect(result.current.uploadState.type).toBe("success");
        expect(mockSearchProvider.updatedBatchPages).toHaveBeenCalledTimes(1);
        expect(mockSearchProvider.updatedBatchPages).toHaveBeenCalledWith([
          { id: "page1" },
          { id: "page2" },
        ]);
      },
      {
        timeout: 2_000,
      },
    );
  });

  it("should not start import if searchProvider is null", async () => {
    const { result } = renderHook(() => usePagesBatchUpload(null));

    act(() => {
      result.current.startUpload(["page-type-1"]);
    });

    expect(result.current.uploadState.type).toBe("idle");
  });

  it("should not fetch pages if pageTypeIds is empty", async () => {
    const { result } = renderHook(() => usePagesBatchUpload(mockSearchProvider));

    act(() => {
      result.current.startUpload([]);
    });

    await waitFor(
      () => {
        expect(result.current.uploadState.type).toBe("success");
        expect(mockSearchProvider.updatedBatchPages).not.toHaveBeenCalled();
      },
      {
        timeout: 2_000,
      },
    );
  });
});
