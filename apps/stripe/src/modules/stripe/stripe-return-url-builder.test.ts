import { describe, expect, it } from "vitest";

import { StripeReturnUrlBuilder } from "./stripe-return-url-builder";

describe("StripeReturnUrlBuilder", () => {
  describe("buildReturnUrl", () => {
    it("should build a basic return URL with required parameters", () => {
      const appUrl = "https://app.example.com";
      const params = {
        appId: "app_123",
        saleorApiUrl: "https://example.saleor.cloud/graphql/",
        channelId: "channel_123",
      };

      const result = StripeReturnUrlBuilder.buildReturnUrl(appUrl, params);

      expect(result).toBe(
        "https://app.example.com/api/stripe/return?app_id=app_123&saleor_api_url=https%3A%2F%2Fexample.saleor.cloud%2Fgraphql%2F&channel_id=channel_123",
      );
    });

    it("should include optional checkout URL when provided", () => {
      const appUrl = "https://app.example.com";
      const params = {
        appId: "app_123",
        saleorApiUrl: "https://example.saleor.cloud/graphql/",
        channelId: "channel_123",
        checkoutUrl: "https://shop.example.com/checkout",
      };

      const result = StripeReturnUrlBuilder.buildReturnUrl(appUrl, params);

      expect(result).toContain("checkout_url=https%3A%2F%2Fshop.example.com%2Fcheckout");
      expect(result).toContain("app_id=app_123");
      expect(result).toContain("saleor_api_url=https%3A%2F%2Fexample.saleor.cloud%2Fgraphql%2F");
      expect(result).toContain("channel_id=channel_123");
    });

    it("should include optional order ID when provided", () => {
      const appUrl = "https://app.example.com";
      const params = {
        appId: "app_123",
        saleorApiUrl: "https://example.saleor.cloud/graphql/",
        channelId: "channel_123",
        orderId: "order_456",
      };

      const result = StripeReturnUrlBuilder.buildReturnUrl(appUrl, params);

      expect(result).toContain("order_id=order_456");
      expect(result).toContain("app_id=app_123");
      expect(result).toContain("saleor_api_url=https%3A%2F%2Fexample.saleor.cloud%2Fgraphql%2F");
      expect(result).toContain("channel_id=channel_123");
    });

    it("should include all parameters when provided", () => {
      const appUrl = "https://app.example.com";
      const params = {
        appId: "app_123",
        saleorApiUrl: "https://example.saleor.cloud/graphql/",
        channelId: "channel_123",
        checkoutUrl: "https://shop.example.com/checkout",
        orderId: "order_456",
      };

      const result = StripeReturnUrlBuilder.buildReturnUrl(appUrl, params);

      expect(result).toContain("/api/stripe/return");
      expect(result).toContain("checkout_url=https%3A%2F%2Fshop.example.com%2Fcheckout");
      expect(result).toContain("order_id=order_456");
      expect(result).toContain("app_id=app_123");
      expect(result).toContain("saleor_api_url=https%3A%2F%2Fexample.saleor.cloud%2Fgraphql%2F");
      expect(result).toContain("channel_id=channel_123");
    });

    it("should handle app URLs without trailing slash", () => {
      const appUrl = "https://app.example.com";
      const params = {
        appId: "app_123",
        saleorApiUrl: "https://example.saleor.cloud/graphql/",
        channelId: "channel_123",
      };

      const result = StripeReturnUrlBuilder.buildReturnUrl(appUrl, params);

      expect(result).toMatch(/^https:\/\/app\.example\.com\/api\/stripe\/return\?/);
    });

    it("should handle app URLs with trailing slash", () => {
      const appUrl = "https://app.example.com/";
      const params = {
        appId: "app_123",
        saleorApiUrl: "https://example.saleor.cloud/graphql/",
        channelId: "channel_123",
      };

      const result = StripeReturnUrlBuilder.buildReturnUrl(appUrl, params);

      expect(result).toMatch(/^https:\/\/app\.example\.com\/api\/stripe\/return\?/);
    });

    it("should properly encode special characters in URLs", () => {
      const appUrl = "https://app.example.com";
      const params = {
        appId: "app_123",
        saleorApiUrl: "https://example.saleor.cloud/graphql/",
        channelId: "channel_123",
        checkoutUrl: "https://shop.example.com/checkout?param=value&other=test",
      };

      const result = StripeReturnUrlBuilder.buildReturnUrl(appUrl, params);

      expect(result).toContain(
        "checkout_url=https%3A%2F%2Fshop.example.com%2Fcheckout%3Fparam%3Dvalue%26other%3Dtest",
      );
    });

    it("should validate params schema", () => {
      const validParams = {
        appId: "app_123",
        saleorApiUrl: "https://example.saleor.cloud/graphql/",
        channelId: "channel_123",
        checkoutUrl: "https://shop.example.com/checkout",
        orderId: "order_456",
      };

      const parseResult = StripeReturnUrlBuilder.ReturnUrlParamsSchema.safeParse(validParams);

      expect(parseResult.success).toBe(true);
    });

    it("should reject invalid params schema", () => {
      const invalidParams = {
        appId: "app_123",
        saleorApiUrl: "not-a-url", // Invalid URL
        channelId: "channel_123",
      };

      const parseResult = StripeReturnUrlBuilder.ReturnUrlParamsSchema.safeParse(invalidParams);

      expect(parseResult.success).toBe(false);
    });

    it("should require all mandatory fields in schema", () => {
      const incompleteParams = {
        appId: "app_123",
        // Missing saleorApiUrl and channelId
      };

      const parseResult = StripeReturnUrlBuilder.ReturnUrlParamsSchema.safeParse(incompleteParams);

      expect(parseResult.success).toBe(false);
    });
  });
});
