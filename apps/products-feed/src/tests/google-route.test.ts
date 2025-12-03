import { AuthData } from "@saleor/app-sdk/APL";
import type { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getCursors } from "@/modules/google-feed/fetch-product-data";
import { fetchShopData } from "@/modules/google-feed/fetch-shop-data";
import { GoogleFeedSettingsFetcher } from "@/modules/google-feed/get-google-feed-settings";
import generateFeedHandler from "@/pages/api/feed/[url]/[channel]/google.xml";
import { apl } from "@/saleor-app";

// Mock all the dependencies
vi.mock("../saleor-app", () => ({
  apl: {
    get: vi.fn(),
  },
}));

vi.mock("../modules/google-feed/get-google-feed-settings", () => ({
  GoogleFeedSettingsFetcher: {
    createFromAuthData: vi.fn(),
  },
}));

vi.mock("../modules/google-feed/fetch-shop-data", () => ({
  fetchShopData: vi.fn(),
}));

vi.mock("../modules/google-feed/fetch-product-data", () => ({
  getCursors: vi.fn(),
}));

vi.mock("../lib/create-instrumented-graphql-client", () => ({
  createInstrumentedGraphqlClient: vi.fn(() => ({})),
}));

vi.mock("../modules/file-storage/s3/create-s3-client-from-configuration", () => ({
  createS3ClientFromConfiguration: vi.fn(() => ({})),
}));

vi.mock("../modules/file-storage/s3/get-file-details", () => ({
  getFileDetails: vi.fn(() => Promise.reject(new Error("File not found"))),
}));

/**
 * Create mock logger that we can spy on
 * Using vi.hoisted() to ensure the mocks are created before the vi.mock call
 */
const { mockLoggerError, mockLoggerInfo, mockLoggerDebug, mockLoggerWarn } = vi.hoisted(() => ({
  mockLoggerError: vi.fn(),
  mockLoggerInfo: vi.fn(),
  mockLoggerDebug: vi.fn(),
  mockLoggerWarn: vi.fn(),
}));

vi.mock("../logger", () => ({
  createLogger: vi.fn(() => ({
    info: mockLoggerInfo,
    debug: mockLoggerDebug,
    warn: mockLoggerWarn,
    error: mockLoggerError,
  })),
}));

describe("Google Feed Handler - Error Handling", () => {
  let mockAuthData: AuthData;
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    // Store original fetch to restore later
    originalFetch = global.fetch;

    /**
     * Clear all mock calls before each test
     */
    vi.clearAllMocks();

    // Setup mock auth data
    mockAuthData = {
      saleorApiUrl: "https://example.saleor.cloud/graphql/",
      token: "test-token",
      appId: "test-app-id",
      jwks: "test-jwks",
    };

    // Mock apl.get to return valid auth data
    vi.mocked(apl.get).mockResolvedValue(mockAuthData);

    /**
     * Mock GoogleFeedSettingsFetcher
     */
    const mockSettingsFetcher = {
      fetch: vi.fn().mockResolvedValue({
        storefrontUrl: "https://storefront.example.com",
        productStorefrontUrl: "https://storefront.example.com/products",
        s3BucketConfiguration: {
          bucketName: "test-bucket",
          region: "us-east-1",
        },
        attributeMapping: {},
        titleTemplate: "{{name}}",
        imageSize: 1024,
      }),
    };

    vi.mocked(GoogleFeedSettingsFetcher.createFromAuthData).mockReturnValue(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockSettingsFetcher as any,
    );

    // Mock fetchShopData
    vi.mocked(fetchShopData).mockResolvedValue({
      shopName: "Test Shop",
      shopDescription: "Test Description",
    });

    /**
     * Mock getCursors to return test cursors
     */
    vi.mocked(getCursors).mockResolvedValue(["cursor1", "cursor2"]);

    /**
     * Mock global.fetch for generateDistributedChunk calls (first set of fetches)
     * and for fetchXmlChunk calls (second set of fetches - these will fail)
     */
    let fetchCallCount = 0;

    global.fetch = vi.fn((input: RequestInfo | URL) => {
      fetchCallCount++;
      const url = typeof input === "string" ? input : input.toString();

      /**
       * First 2 calls are for generateDistributedChunk (one per cursor)
       */
      if (url.includes("/generate-chunk")) {
        return Promise.resolve({
          json: () =>
            Promise.resolve({
              downloadUrl: `https://s3.amazonaws.com/chunk-${fetchCallCount}`,
              fileName: `chunk-${fetchCallCount}.xml`,
            }),
        } as Response);
      }

      /**
       * Subsequent calls are for fetchXmlChunk - make these fail
       */
      return Promise.reject(new Error("Network error downloading chunk"));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) as any;
  });

  afterEach(() => {
    // Restore original fetch
    global.fetch = originalFetch;
    vi.clearAllMocks();
  });

  describe("Should properly catch error from execution and return 500 status", () => {
    it("Given function is called, When fetchXmlChunk throws error, Then function should return status 500 and log error", async () => {
      // Arrange
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: {
          url: "https://example.saleor.cloud/graphql/",
          channel: "default-channel",
        },
        headers: {
          host: "localhost:3000",
        },
      });

      /**
       * Create spy on logger.error to verify error logging
       */
      const loggerErrorSpy = mockLoggerError;

      // Act
      await generateFeedHandler(req, res);

      /**
       * Assert - Should return 500 status
       */
      expect(res._getStatusCode()).toBe(500);

      /**
       * Assert - Should return error JSON
       */
      const jsonData = res._getJSONData();

      expect(jsonData).toStrictEqual({ error: "Internal server error" });

      /**
       * Assert - Error should be logged with proper error chain
       */
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        "Unhandled error in feed handler",
        expect.objectContaining({
          error: expect.any(Error),
        }),
      );

      /**
       * Verify the error chain - the logged error should contain
       * "Failed to download chunk from s3" with a cause of "Network error downloading chunk"
       */
      const loggedError = loggerErrorSpy.mock.calls[0][1].error;

      expect(loggedError.message).toContain("Failed to download chunk from s3");
      expect(loggedError.cause).toBeDefined();
      expect(loggedError.cause.message).toBe("Network error downloading chunk");
    });
  });
});
