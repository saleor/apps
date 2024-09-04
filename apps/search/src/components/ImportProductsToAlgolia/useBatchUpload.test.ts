import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { createGraphQLClient } from "@saleor/apps-shared";
import { act, renderHook } from "@testing-library/react-hooks";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AlgoliaSearchProvider } from "../../lib/algolia/algoliaSearchProvider";
import { useBatchUpload } from "./useBatchUpload";

vi.mock("@saleor/app-sdk/app-bridge");
vi.mock("@saleor/apps-shared");

describe("useBatchUpload", () => {
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
    const { result, waitForNextUpdate } = renderHook(() => useBatchUpload(mockSearchProvider));

    act(() => {
      result.current.startUpload();
    });

    await waitForNextUpdate();

    expect(result.current.uploadState.type).toBe("uploading");

    await waitForNextUpdate();

    expect(result.current.uploadState.type).toBe("success");
    expect(mockSearchProvider.updatedBatchProducts).toHaveBeenCalledTimes(1);
    expect(mockSearchProvider.updatedBatchProducts).toHaveBeenCalledWith([
      { id: "product1" },
      { id: "product2" },
    ]);
  });

  it("should not start import if searchProvider is null", async () => {
    const { result } = renderHook(() => useBatchUpload(null));

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

    const { result, waitForNextUpdate } = renderHook(() => useBatchUpload(mockSearchProvider));

    act(() => {
      result.current.startUpload();
    });

    await waitForNextUpdate();

    expect(result.current.uploadState.type).toBe("uploading");

    await waitForNextUpdate();

    expect(result.current.uploadState.type).toBe("success");
    expect(mockSearchProvider.updatedBatchProducts).toHaveBeenCalledTimes(2);
    expect(mockSearchProvider.updatedBatchProducts).toHaveBeenCalledWith([{ id: "product1" }]);
    expect(mockSearchProvider.updatedBatchProducts).toHaveBeenCalledWith([{ id: "product2" }]);
  });
});
