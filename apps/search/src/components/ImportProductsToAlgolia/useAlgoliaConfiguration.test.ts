import { renderHook } from "@testing-library/react-hooks";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { algoliaCredentialsVerifier } from "../../lib/algolia/algolia-credentials-verifier";
import { trpcClient } from "../../modules/trpc/trpc-client";
import { useAlgoliaConfiguration } from "./useAlgoliaConfiguration";
import { useSearchProvider } from "./useSearchProvider";

vi.mock("../../lib/algolia/algolia-credentials-verifier");
vi.mock("../../modules/trpc/trpc-client", () => ({
  trpcClient: {
    configuration: {
      getConfig: {
        useQuery: vi.fn(),
      },
    },
  },
}));

vi.mock("./useSearchProvider");

vi.mock("../../pages/_app", () => ({
  appBridgeInstance: {
    getState: vi.fn(() => ({
      token: "mock-token",
      saleorApiUrl: "https://mock-api-url.com",
    })),
  },
}));

describe("useAlgoliaConfiguration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return loading state initially", async () => {
    vi.mocked(trpcClient.configuration.getConfig.useQuery).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as any);

    const { result } = renderHook(() => useAlgoliaConfiguration());

    expect(result.current).toEqual({ type: "loading" });
  });

  it("should return not-configured state when configuration is missing", async () => {
    vi.mocked(trpcClient.configuration.getConfig.useQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
    } as any);

    const { result } = renderHook(() => useAlgoliaConfiguration());

    expect(result.current).toEqual({ type: "not-configured" });
  });

  it("should return configured state when configuration is valid", async () => {
    const mockSearchProvider = {};
    const mockConfig = {
      appConfig: {
        appId: "test-app-id",
        secretKey: "test-secret-key",
      },
    };

    vi.mocked(trpcClient.configuration.getConfig.useQuery).mockReturnValue({
      data: mockConfig,
      isLoading: false,
    } as any);

    vi.mocked(algoliaCredentialsVerifier.verifyCredentials).mockResolvedValue(undefined);
    vi.mocked(useSearchProvider).mockReturnValue(mockSearchProvider as any);

    const { result, waitForNextUpdate } = renderHook(() => useAlgoliaConfiguration());

    await waitForNextUpdate();

    expect(algoliaCredentialsVerifier.verifyCredentials).toHaveBeenCalled();
    expect(result.current).toEqual({ type: "configured", provider: mockSearchProvider });
  });

  it("should return not-configured state when credentials verification fails", async () => {
    const mockConfig = {
      appConfig: {
        appId: "test-app-id",
        secretKey: "test-secret-key",
      },
    };

    vi.mocked(trpcClient.configuration.getConfig.useQuery).mockReturnValue({
      data: mockConfig,
      isLoading: false,
    } as any);

    vi.mocked(algoliaCredentialsVerifier.verifyCredentials).mockRejectedValue(
      new Error("Invalid credentials"),
    );
    vi.mocked(useSearchProvider).mockReturnValue(null);

    const { result, waitForNextUpdate } = renderHook(() => useAlgoliaConfiguration());

    await waitForNextUpdate();

    expect(algoliaCredentialsVerifier.verifyCredentials).toHaveBeenCalled();
    expect(result.current).toEqual({ type: "not-configured" });
  });
});
