import { describe, expect, it } from "vitest";

import { ShopifyConnectionConfig } from "./shopify-connection-config";

describe("ShopifyConnectionConfig", () => {
  describe("create", () => {
    it("should create a valid config", () => {
      const result = ShopifyConnectionConfig.create({
        shopDomain: "test-store.myshopify.com",
        accessToken: "shpat_12345",
        apiVersion: "2024-10",
      });

      expect(result.isOk()).toBe(true);

      const config = result._unsafeUnwrap();

      expect(config.shopDomain).toBe("test-store.myshopify.com");
      expect(config.accessToken).toBe("shpat_12345");
      expect(config.apiVersion).toBe("2024-10");
    });

    it("should use default api version when not provided", () => {
      const result = ShopifyConnectionConfig.create({
        shopDomain: "test-store.myshopify.com",
        accessToken: "shpat_12345",
      });

      expect(result.isOk()).toBe(true);

      const config = result._unsafeUnwrap();

      expect(config.apiVersion).toBe("2024-10");
    });

    it("should fail when shop domain is empty", () => {
      const result = ShopifyConnectionConfig.create({
        shopDomain: "",
        accessToken: "shpat_12345",
        apiVersion: "2024-10",
      });

      expect(result.isErr()).toBe(true);
    });

    it("should fail when access token is empty", () => {
      const result = ShopifyConnectionConfig.create({
        shopDomain: "test-store.myshopify.com",
        accessToken: "",
        apiVersion: "2024-10",
      });

      expect(result.isErr()).toBe(true);
    });
  });

  describe("getShopifyGraphQLEndpoint", () => {
    it("should return correct endpoint for plain domain", () => {
      const result = ShopifyConnectionConfig.create({
        shopDomain: "test-store.myshopify.com",
        accessToken: "shpat_12345",
        apiVersion: "2024-10",
      });

      const config = result._unsafeUnwrap();

      expect(config.getShopifyGraphQLEndpoint()).toBe(
        "https://test-store.myshopify.com/admin/api/2024-10/graphql.json",
      );
    });

    it("should normalize domain with https prefix", () => {
      const result = ShopifyConnectionConfig.create({
        shopDomain: "https://test-store.myshopify.com",
        accessToken: "shpat_12345",
        apiVersion: "2024-10",
      });

      const config = result._unsafeUnwrap();

      expect(config.getShopifyGraphQLEndpoint()).toBe(
        "https://test-store.myshopify.com/admin/api/2024-10/graphql.json",
      );
    });

    it("should normalize domain with trailing slash", () => {
      const result = ShopifyConnectionConfig.create({
        shopDomain: "test-store.myshopify.com/",
        accessToken: "shpat_12345",
        apiVersion: "2024-10",
      });

      const config = result._unsafeUnwrap();

      expect(config.getShopifyGraphQLEndpoint()).toBe(
        "https://test-store.myshopify.com/admin/api/2024-10/graphql.json",
      );
    });
  });

  describe("toJSON", () => {
    it("should serialize config to JSON", () => {
      const result = ShopifyConnectionConfig.create({
        shopDomain: "test-store.myshopify.com",
        accessToken: "shpat_12345",
        apiVersion: "2024-10",
      });

      const config = result._unsafeUnwrap();
      const json = config.toJSON();

      expect(json).toStrictEqual({
        shopDomain: "test-store.myshopify.com",
        accessToken: "shpat_12345",
        apiVersion: "2024-10",
      });
    });
  });
});
