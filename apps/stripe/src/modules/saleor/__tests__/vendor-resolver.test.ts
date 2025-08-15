import { Client } from "urql";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { VendorFetcher } from "../vendor-fetcher";
import { VendorResolver } from "../vendor-resolver";

// Define proper types for mock return values
type MockResult<T> = {
  isOk: () => boolean;
  isErr: () => boolean;
  value?: T;
  error?: Error;
};

// Mock the VendorFetcher
vi.mock("../vendor-fetcher");

describe("VendorResolver", () => {
  let mockClient: Pick<Client, "query">;
  let vendorResolver: VendorResolver;
  let mockVendorFetcher: {
    fetchVendorById: ReturnType<typeof vi.fn>;
    fetchVendors: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockClient = {
      query: vi.fn(),
    };

    // Mock the VendorFetcher constructor
    mockVendorFetcher = {
      fetchVendorById: vi.fn(),
      fetchVendors: vi.fn(),
    };

    vi.mocked(VendorFetcher).mockImplementation(
      () => mockVendorFetcher as unknown as VendorFetcher,
    );

    vendorResolver = new VendorResolver(mockClient);
  });

  describe("resolveVendorForPayment", () => {
    it("should resolve vendor-specific payment when vendor has stripe account", async () => {
      const mockVendor = {
        id: "vendor-123",
        title: "Test Vendor",
        slug: "test-vendor",
        stripeAccountId: "acct_123456789",
        metadata: [{ key: "stripe_account_id", value: "acct_123456789" }],
      };

      mockVendorFetcher.fetchVendorById.mockResolvedValue({
        isOk: () => true,
        isErr: () => false,
        value: mockVendor,
      } as MockResult<typeof mockVendor>);

      const result = await vendorResolver.resolveVendorForPayment({
        orderMetadata: [
          { key: "vendor_id", value: "vendor-123" },
          { key: "other_field", value: "other_value" },
        ],
        channelId: "channel-123",
        defaultStripeConfigId: "config-123",
      });

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        const resolution = result.value;

        expect(resolution).toStrictEqual({
          vendor: mockVendor,
          stripeAccountId: "acct_123456789",
          resolutionMethod: "vendor-specific",
        });
      }

      expect(mockVendorFetcher.fetchVendorById).toHaveBeenCalledWith("vendor-123");
    });

    it("should return null when vendor exists but has no stripe account", async () => {
      const mockVendor = {
        id: "vendor-123",
        title: "Test Vendor",
        slug: "test-vendor",
        stripeAccountId: undefined,
        metadata: [{ key: "vendor_code", value: "VENDOR001" }],
      };

      mockVendorFetcher.fetchVendorById.mockResolvedValue({
        isOk: () => true,
        isErr: () => false,
        value: mockVendor,
      } as MockResult<typeof mockVendor>);

      const result = await vendorResolver.resolveVendorForPayment({
        orderMetadata: [{ key: "vendor_id", value: "vendor-123" }],
        channelId: "channel-123",
      });

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBeNull();
      }
    });

    it("should return null when vendor is not found", async () => {
      mockVendorFetcher.fetchVendorById.mockResolvedValue({
        isOk: () => true,
        isErr: () => false,
        value: null,
      } as MockResult<null>);

      const result = await vendorResolver.resolveVendorForPayment({
        orderMetadata: [{ key: "vendor_id", value: "non-existent-vendor" }],
        channelId: "channel-123",
      });

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBeNull();
      }
    });

    it("should return null when vendor_id is not in order metadata", async () => {
      const result = await vendorResolver.resolveVendorForPayment({
        orderMetadata: [{ key: "other_field", value: "other_value" }],
        channelId: "channel-123",
      });

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBeNull();
      }

      expect(mockVendorFetcher.fetchVendorById).not.toHaveBeenCalled();
    });

    it("should return null when vendor fetch fails", async () => {
      mockVendorFetcher.fetchVendorById.mockResolvedValue({
        isOk: () => false,
        isErr: () => true,
        error: new Error("Fetch failed"),
      } as MockResult<never>);

      const result = await vendorResolver.resolveVendorForPayment({
        orderMetadata: [{ key: "vendor_id", value: "vendor-123" }],
        channelId: "channel-123",
      });

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBeNull();
      }
    });

    it("should extract vendor_id correctly from order metadata", async () => {
      const mockVendor = {
        id: "vendor-123",
        title: "Test Vendor",
        slug: "test-vendor",
        stripeAccountId: "acct_123456789",
        metadata: [],
      };

      mockVendorFetcher.fetchVendorById.mockResolvedValue({
        isOk: () => true,
        isErr: () => false,
        value: mockVendor,
      } as MockResult<typeof mockVendor>);

      // Test with vendor_id in different positions
      const orderMetadata = [
        { key: "other_field", value: "other_value" },
        { key: "vendor_id", value: "vendor-123" },
        { key: "another_field", value: "another_value" },
      ];

      await vendorResolver.resolveVendorForPayment({
        orderMetadata,
        channelId: "channel-123",
      });

      expect(mockVendorFetcher.fetchVendorById).toHaveBeenCalledWith("vendor-123");
    });
  });

  describe("getAvailableVendors", () => {
    it("should return vendors from vendor fetcher", async () => {
      const mockVendors = [
        {
          id: "vendor-1",
          title: "Vendor 1",
          slug: "vendor-1",
          stripeAccountId: "acct_111",
          metadata: [],
        },
        {
          id: "vendor-2",
          title: "Vendor 2",
          slug: "vendor-2",
          stripeAccountId: "acct_222",
          metadata: [],
        },
      ];

      mockVendorFetcher.fetchVendors.mockResolvedValue({
        isOk: () => true,
        isErr: () => false,
        value: mockVendors,
      } as MockResult<typeof mockVendors>);

      const result = await vendorResolver.getAvailableVendors("page-type-123");

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toStrictEqual(mockVendors);
      }

      expect(mockVendorFetcher.fetchVendors).toHaveBeenCalledWith("page-type-123");
    });

    it("should propagate errors from vendor fetcher", async () => {
      const mockError = new Error("Fetch failed");

      mockVendorFetcher.fetchVendors.mockResolvedValue({
        isOk: () => false,
        isErr: () => true,
        error: mockError,
      } as MockResult<never>);

      const result = await vendorResolver.getAvailableVendors("page-type-123");

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toBe(mockError);
      }
    });
  });
});
