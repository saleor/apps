import { Client } from "urql";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { VendorFetcher } from "../vendor-fetcher";
import { VendorResolver } from "../vendor-resolver";

// Mock the generated GraphQL types
const mockFetchVendorByIdDocument = {};
const mockFetchVendorsDocument = {};

vi.mock("../../../generated/graphql", () => ({
  FetchVendorByIdDocument: mockFetchVendorByIdDocument,
  FetchVendorsDocument: mockFetchVendorsDocument,
}));

describe("Vendor Integration Tests", () => {
  let mockClient: Pick<Client, "query">;
  let vendorResolver: VendorResolver;
  let _vendorFetcher: VendorFetcher;

  beforeEach(() => {
    mockClient = {
      query: vi.fn(),
    };
    vendorResolver = new VendorResolver(mockClient);
    _vendorFetcher = new VendorFetcher(mockClient);
  });

  describe("End-to-End Vendor Resolution", () => {
    it("should resolve vendor payment through complete flow", async () => {
      // Mock successful vendor fetch
      const mockVendorData = {
        data: {
          page: {
            id: "vendor-123",
            title: "Test Vendor",
            slug: "test-vendor",
            metadata: [
              { key: "stripe_account_id", value: "acct_123456789" },
              { key: "vendor_code", value: "VENDOR001" },
            ],
          },
        },
      };

      mockClient.query = vi.fn().mockReturnValue({
        toPromise: vi.fn().mockResolvedValue({
          data: mockVendorData.data,
          error: null,
        }),
      });

      const result = await vendorResolver.resolveVendorForPayment({
        orderMetadata: [
          { key: "vendor_id", value: "vendor-123" },
          { key: "order_id", value: "order-456" },
        ],
        channelId: "channel-123",
        defaultStripeConfigId: "config-123",
      });

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        const resolution = result.value;

        expect(resolution).toStrictEqual({
          vendor: {
            id: "vendor-123",
            title: "Test Vendor",
            slug: "test-vendor",
            stripeAccountId: "acct_123456789",
            metadata: [
              { key: "stripe_account_id", value: "acct_123456789" },
              { key: "vendor_code", value: "VENDOR001" },
            ],
          },
          stripeAccountId: "acct_123456789",
          resolutionMethod: "vendor-specific",
        });
      }

      // Verify the GraphQL query was called
      expect(mockClient.query).toHaveBeenCalledTimes(1);
    });

    it("should handle vendor fetch failure gracefully", async () => {
      const mockError = new Error("Network error");

      mockClient.query = vi.fn().mockReturnValue({
        toPromise: vi.fn().mockResolvedValue({
          data: null,
          error: mockError,
        }),
      });

      const result = await vendorResolver.resolveVendorForPayment({
        orderMetadata: [{ key: "vendor_id", value: "vendor-123" }],
        channelId: "channel-123",
      });

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBeNull();
      }
    });

    it("should handle vendor without stripe configuration", async () => {
      const mockVendorData = {
        data: {
          page: {
            id: "vendor-123",
            title: "Test Vendor",
            slug: "test-vendor",
            metadata: [
              { key: "vendor_code", value: "VENDOR001" },
              // No stripe_account_id
            ],
          },
        },
      };

      mockClient.query = vi.fn().mockReturnValue({
        toPromise: vi.fn().mockResolvedValue({
          data: mockVendorData.data,
          error: null,
        }),
      });

      const result = await vendorResolver.resolveVendorForPayment({
        orderMetadata: [{ key: "vendor_id", value: "vendor-123" }],
        channelId: "channel-123",
      });

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBeNull();
      }
    });
  });

  describe("Vendor Listing Integration", () => {
    it("should fetch and list all vendors for a page type", async () => {
      const mockVendorsData = {
        data: {
          pages: {
            edges: [
              {
                node: {
                  id: "vendor-1",
                  title: "Vendor 1",
                  slug: "vendor-1",
                  metadata: [{ key: "stripe_account_id", value: "acct_111" }],
                },
              },
              {
                node: {
                  id: "vendor-2",
                  title: "Vendor 2",
                  slug: "vendor-2",
                  metadata: [{ key: "stripe_account_id", value: "acct_222" }],
                },
              },
            ],
          },
        },
      };

      mockClient.query = vi.fn().mockReturnValue({
        toPromise: vi.fn().mockResolvedValue({
          data: mockVendorsData.data,
          error: null,
        }),
      });

      const result = await vendorResolver.getAvailableVendors("page-type-123");

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        const vendors = result.value;

        expect(vendors).toHaveLength(2);
        expect(vendors[0].id).toBe("vendor-1");
        expect(vendors[0].stripeAccountId).toBe("acct_111");
        expect(vendors[1].id).toBe("vendor-2");
        expect(vendors[1].stripeAccountId).toBe("acct_222");
      }

      expect(mockClient.query).toHaveBeenCalledTimes(1);
    });

    it("should handle empty vendor list", async () => {
      mockClient.query = vi.fn().mockReturnValue({
        toPromise: vi.fn().mockResolvedValue({
          data: { pages: { edges: [] } },
          error: null,
        }),
      });

      const result = await vendorResolver.getAvailableVendors("page-type-123");

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toStrictEqual([]);
      }
    });
  });

  describe("Error Handling Integration", () => {
    it("should propagate GraphQL errors correctly", async () => {
      const mockError = new Error("GraphQL error");

      mockClient.query = vi.fn().mockReturnValue({
        toPromise: vi.fn().mockResolvedValue({
          data: null,
          error: mockError,
        }),
      });

      const result = await vendorResolver.getAvailableVendors("page-type-123");

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.message).toContain("Failed to fetch vendors");
      }
    });

    it("should handle missing data gracefully", async () => {
      mockClient.query = vi.fn().mockReturnValue({
        toPromise: vi.fn().mockResolvedValue({
          data: { pages: null },
          error: null,
        }),
      });

      const result = await vendorResolver.getAvailableVendors("page-type-123");

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.message).toContain("vendors data missing");
      }
    });
  });
});
