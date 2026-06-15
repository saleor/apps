import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { type PayloadCmsProviderConfig } from "@/modules/configuration/schemas/payloadcms-provider.schema";

import { type WebhookProductVariantFragment } from "../../../../generated/graphql";
import { PayloadCMSClient } from "./payloadcms-client";

const getMockPayloadConfiguration = (): PayloadCmsProviderConfig.FullShape => ({
  type: "payloadcms",
  id: "test-id",
  configName: "test-config-name",
  collectionName: "products",
  authToken: "",
  authenticatedUserSlug: "",
  payloadApiUrl: "https://payload.example.com/api",
  productVariantFieldsMapping: {
    channels: "channels",
    productId: "product-id",
    productName: "product-name",
    productSlug: "product-slug",
    variantId: "variant-id",
    variantName: "variant-name",
    sku: "sku",
  },
});

const getMockWebhookProductVariant = (): WebhookProductVariantFragment => ({
  id: "test-variant-id",
  name: "test-name",
  sku: "test-sku",
  product: {
    id: "test-product-id",
    name: "test-product-name",
    slug: "test-product-slug",
  },
  channelListings: [
    {
      channel: {
        id: "test-channel-id",
        slug: "test-channel-slug",
      },
      price: {
        amount: 100,
        currency: "USD",
      },
    },
  ],
});

describe("PayloadCMSClient", () => {
  let client: PayloadCMSClient;
  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    client = new PayloadCMSClient();

    fetchSpy = vi.fn().mockResolvedValue({
      status: 200,
      statusText: "OK",
      json: () => Promise.resolve({ docs: [] }),
    });

    vi.stubGlobal("fetch", fetchSpy);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  describe("where query string (URLSearchParams)", () => {
    it("builds a Payload bracket where-query matching the variant by its mapped id field", async () => {
      await client.getItemsBySaleorVariantId({
        configuration: getMockPayloadConfiguration(),
        variant: getMockWebhookProductVariant(),
      });

      const calledUrl = fetchSpy.mock.calls[0][0] as string;

      // Bracket keys must be percent-encoded the same way `qs` produced them
      expect(calledUrl).toBe(
        "https://payload.example.com/api/products?where%5Bvariant-id%5D%5Bequals%5D=test-variant-id",
      );

      // Decoded form is the human-readable Payload REST query
      expect(decodeURIComponent(calledUrl)).toBe(
        "https://payload.example.com/api/products?where[variant-id][equals]=test-variant-id",
      );
    });

    it("uses the configured variantId field name as the query key", async () => {
      const configuration = getMockPayloadConfiguration();

      configuration.productVariantFieldsMapping.variantId = "customVariantField";

      await client.getItemsBySaleorVariantId({
        configuration,
        variant: getMockWebhookProductVariant(),
      });

      const calledUrl = fetchSpy.mock.calls[0][0] as string;

      expect(decodeURIComponent(calledUrl)).toContain(
        "?where[customVariantField][equals]=test-variant-id",
      );
    });

    it("percent-encodes special characters in the variant id value", async () => {
      const variant = getMockWebhookProductVariant();

      variant.id = "VmFyaWFudDox/2?&";

      await client.getItemsBySaleorVariantId({
        configuration: getMockPayloadConfiguration(),
        variant,
      });

      const calledUrl = fetchSpy.mock.calls[0][0] as string;

      expect(calledUrl).toContain("=VmFyaWFudDox%2F2%3F%26");
      expect(decodeURIComponent(calledUrl)).toContain("=VmFyaWFudDox/2?&");
    });
  });

  describe("getItemsBySaleorVariantId", () => {
    it("performs a GET request and returns the parsed JSON body", async () => {
      const result = await client.getItemsBySaleorVariantId({
        configuration: getMockPayloadConfiguration(),
        variant: getMockWebhookProductVariant(),
      });

      expect(result).toStrictEqual({ docs: [] });
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe("deleteProductVariant", () => {
    it("performs a DELETE request against the where-query URL", async () => {
      await client.deleteProductVariant({
        configuration: getMockPayloadConfiguration(),
        variant: getMockWebhookProductVariant(),
      });

      const [calledUrl, init] = fetchSpy.mock.calls[0];

      expect(init.method).toBe("DELETE");
      expect(decodeURIComponent(calledUrl as string)).toBe(
        "https://payload.example.com/api/products?where[variant-id][equals]=test-variant-id",
      );
    });

    it("throws when the response status indicates an error", async () => {
      fetchSpy.mockResolvedValueOnce({ status: 500, statusText: "Server Error" });

      await expect(
        client.deleteProductVariant({
          configuration: getMockPayloadConfiguration(),
          variant: getMockWebhookProductVariant(),
        }),
      ).rejects.toThrow("Error while deleting product variant");
    });
  });

  describe("updateProductVariant", () => {
    it("performs a PATCH request against the where-query URL", async () => {
      await client.updateProductVariant({
        configuration: getMockPayloadConfiguration(),
        variant: getMockWebhookProductVariant(),
      });

      const [calledUrl, init] = fetchSpy.mock.calls[0];

      expect(init.method).toBe("PATCH");
      expect(decodeURIComponent(calledUrl as string)).toBe(
        "https://payload.example.com/api/products?where[variant-id][equals]=test-variant-id",
      );
    });

    it("throws when the response status indicates an error", async () => {
      fetchSpy.mockResolvedValueOnce({ status: 400, statusText: "Bad Request" });

      await expect(
        client.updateProductVariant({
          configuration: getMockPayloadConfiguration(),
          variant: getMockWebhookProductVariant(),
        }),
      ).rejects.toThrow("Error while updating product variant");
    });
  });

  describe("uploadProductVariant", () => {
    it("performs a POST request to the collection URL without a where-query", async () => {
      await client.uploadProductVariant({
        configuration: getMockPayloadConfiguration(),
        variant: getMockWebhookProductVariant(),
      });

      const [calledUrl, init] = fetchSpy.mock.calls[0];

      expect(init.method).toBe("POST");
      expect(calledUrl).toBe("https://payload.example.com/api/products");
    });
  });
});
