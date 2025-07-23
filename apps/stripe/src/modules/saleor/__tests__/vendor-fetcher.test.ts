import { Client } from "urql";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { VendorFetcher } from "../vendor-fetcher";

// Mock the generated GraphQL types
vi.mock("../../../generated/graphql", () => ({
  FetchVendorByIdDocument: "FetchVendorByIdDocument",
  FetchVendorsDocument: "FetchVendorsDocument",
}));

describe("VendorFetcher", () => {
  let mockClient: Pick<Client, "query">;
  let vendorFetcher: VendorFetcher;

  beforeEach(() => {
    mockClient = {
      query: vi.fn().mockReturnValue({
        toPromise: vi.fn(),
      }),
    };
    vendorFetcher = new VendorFetcher(mockClient);
  });

  describe("fetchVendorById", () => {
    it("should successfully fetch a vendor by ID", async () => {
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
            pageType: {
              id: "page-type-123",
              name: "Vendor",
            },
          },
        },
      };

      mockClient.query = vi.fn().mockReturnValue({
        toPromise: vi.fn().mockResolvedValue({
          data: mockVendorData.data,
          error: null,
        }),
      });

      const result = await vendorFetcher.fetchVendorById("vendor-123");

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        const vendor = result.value;

        expect(vendor).toStrictEqual({
          id: "vendor-123",
          title: "Test Vendor",
          slug: "test-vendor",
          stripeAccountId: "acct_123456789",
          metadata: [
            { key: "stripe_account_id", value: "acct_123456789" },
            { key: "vendor_code", value: "VENDOR001" },
          ],
        });
      }

      expect(mockClient.query).toHaveBeenCalledWith(undefined, {
        vendorId: "vendor-123",
      });
    });

    it("should return null when vendor is not found", async () => {
      mockClient.query = vi.fn().mockReturnValue({
        toPromise: vi.fn().mockResolvedValue({
          data: { page: null },
          error: null,
        }),
      });

      const result = await vendorFetcher.fetchVendorById("non-existent-vendor");

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBeNull();
      }
    });

    it("should handle vendor without stripe_account_id", async () => {
      const mockVendorData = {
        data: {
          page: {
            id: "vendor-123",
            title: "Test Vendor",
            slug: "test-vendor",
            metadata: [{ key: "vendor_code", value: "VENDOR001" }],
            pageType: {
              id: "page-type-123",
              name: "Vendor",
            },
          },
        },
      };

      mockClient.query = vi.fn().mockReturnValue({
        toPromise: vi.fn().mockResolvedValue({
          data: mockVendorData.data,
          error: null,
        }),
      });

      const result = await vendorFetcher.fetchVendorById("vendor-123");

      expect(result.isOk()).toBe(true);
      if (result.isOk() && result.value) {
        expect(result.value.stripeAccountId).toBeUndefined();
      }
    });

    it("should return error when GraphQL query fails", async () => {
      const mockError = new Error("GraphQL error");

      mockClient.query = vi.fn().mockReturnValue({
        toPromise: vi.fn().mockResolvedValue({
          data: null,
          error: mockError,
        }),
      });

      const result = await vendorFetcher.fetchVendorById("vendor-123");

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.message).toContain("Failed to fetch vendor");
      }
    });
  });

  describe("fetchVendors", () => {
    it("should successfully fetch all vendors for a page type", async () => {
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
                  pageType: {
                    id: "page-type-123",
                    name: "Vendor",
                  },
                },
              },
              {
                node: {
                  id: "vendor-2",
                  title: "Vendor 2",
                  slug: "vendor-2",
                  metadata: [{ key: "stripe_account_id", value: "acct_222" }],
                  pageType: {
                    id: "page-type-123",
                    name: "Vendor",
                  },
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

      const result = await vendorFetcher.fetchVendors("page-type-123");

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        const vendors = result.value;

        expect(vendors).toHaveLength(2);
        expect(vendors[0]).toStrictEqual({
          id: "vendor-1",
          title: "Vendor 1",
          slug: "vendor-1",
          stripeAccountId: "acct_111",
          metadata: [{ key: "stripe_account_id", value: "acct_111" }],
        });
        expect(vendors[1]).toStrictEqual({
          id: "vendor-2",
          title: "Vendor 2",
          slug: "vendor-2",
          stripeAccountId: "acct_222",
          metadata: [{ key: "stripe_account_id", value: "acct_222" }],
        });
      }

      expect(mockClient.query).toHaveBeenCalledWith(undefined, {
        pageTypeId: "page-type-123",
      });
    });

    it("should return empty array when no vendors found", async () => {
      mockClient.query = vi.fn().mockReturnValue({
        toPromise: vi.fn().mockResolvedValue({
          data: { pages: { edges: [] } },
          error: null,
        }),
      });

      const result = await vendorFetcher.fetchVendors("page-type-123");

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toStrictEqual([]);
      }
    });

    it("should return error when GraphQL query fails", async () => {
      const mockError = new Error("GraphQL error");

      mockClient.query = vi.fn().mockReturnValue({
        toPromise: vi.fn().mockResolvedValue({
          data: null,
          error: mockError,
        }),
      });

      const result = await vendorFetcher.fetchVendors("page-type-123");

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.message).toContain("Failed to fetch vendors");
      }
    });

    it("should return error when vendors data is missing", async () => {
      mockClient.query = vi.fn().mockReturnValue({
        toPromise: vi.fn().mockResolvedValue({
          data: { pages: null },
          error: null,
        }),
      });

      const result = await vendorFetcher.fetchVendors("page-type-123");

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.message).toContain("vendors data missing");
      }
    });
  });
});
