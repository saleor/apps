import { ok } from "neverthrow";
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { mockedStripeConfig } from "@/__tests__/mocks/mock-stripe-config";
import { getMockedRecordedTransaction } from "@/__tests__/mocks/mocked-recorded-transaction";
import { appConfigRepoImpl } from "@/modules/app-config/repositories/app-config-repo-impl";
import { StripePaymentIntentsApiFactory } from "@/modules/stripe/stripe-payment-intents-api-factory";
import { transactionRecorder } from "@/modules/transactions-recording/repositories/transaction-recorder-impl";

import { GET } from "./route";

vi.mock("@/modules/app-config/repositories/app-config-repo-impl", () => ({
  appConfigRepoImpl: {
    getStripeConfig: vi.fn(),
  },
}));

vi.mock("@/modules/transactions-recording/repositories/transaction-recorder-impl", () => ({
  transactionRecorder: {
    getTransactionByStripePaymentIntentId: vi.fn(),
  },
}));

vi.mock("@/modules/stripe/stripe-payment-intents-api-factory", () => ({
  StripePaymentIntentsApiFactory: vi.fn(),
}));

describe("Stripe return endpoint - Edge Cases", () => {
  const mockGetPaymentIntent = vi.fn();
  const mockStripeApiCreate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    mockStripeApiCreate.mockReturnValue({
      getPaymentIntent: mockGetPaymentIntent,
    });

    vi.mocked(StripePaymentIntentsApiFactory).mockImplementation(() => ({
      create: mockStripeApiCreate,
    }));
  });

  describe("URL encoding edge cases", () => {
    it("should handle URLs with special characters in checkout_url", async () => {
      const specialCheckoutUrl = "https://example.com/checkout?order=123&ref=abc#section";
      const url = new URL("http://localhost:3000/api/stripe/return");

      url.searchParams.set("payment_intent", "pi_test");
      url.searchParams.set("payment_intent_client_secret", "pi_test_secret");
      url.searchParams.set("app_id", "app_123");
      url.searchParams.set("saleor_api_url", "https://example.saleor.cloud/graphql/");
      url.searchParams.set("channel_id", "channel_123");
      url.searchParams.set("checkout_url", specialCheckoutUrl);

      const request = new NextRequest(url);

      vi.mocked(transactionRecorder.getTransactionByStripePaymentIntentId).mockResolvedValueOnce(
        ok(getMockedRecordedTransaction()),
      );

      vi.mocked(appConfigRepoImpl.getStripeConfig).mockResolvedValueOnce(ok(mockedStripeConfig));

      mockGetPaymentIntent.mockResolvedValueOnce(
        ok({
          id: "pi_test",
          status: "succeeded",
          metadata: {},
        }),
      );

      const response = await GET(request);

      expect(response.status).toBe(307);
      const location = response.headers.get("location");

      // The checkout URL should be preserved (URL object adds params)
      expect(location).toContain("https://example.com/checkout");
      expect(location).toContain("order=123");
      expect(location).toContain("ref=abc");
      expect(location).toContain("payment_status=success");
    });

    it("should handle malformed URLs gracefully", async () => {
      const url = new URL("http://localhost:3000/api/stripe/return");

      // Use URL-encoded values that might break parsing
      url.searchParams.set("payment_intent", "pi_%20test%00");
      url.searchParams.set("payment_intent_client_secret", "secret");
      url.searchParams.set("app_id", "app_123");
      url.searchParams.set("saleor_api_url", "https://example.saleor.cloud/graphql/");
      url.searchParams.set("channel_id", "channel_123");

      const request = new NextRequest(url);

      const response = await GET(request);

      // Should still process normally
      expect(response.status).toBe(307);
    });
  });

  describe("Payment intent status edge cases", () => {
    it("should handle requires_capture status", async () => {
      const url = new URL("http://localhost:3000/api/stripe/return");

      url.searchParams.set("payment_intent", "pi_test");
      url.searchParams.set("payment_intent_client_secret", "pi_test_secret");
      url.searchParams.set("app_id", "app_123");
      url.searchParams.set("saleor_api_url", "https://example.saleor.cloud/graphql/");
      url.searchParams.set("channel_id", "channel_123");

      const request = new NextRequest(url);

      vi.mocked(transactionRecorder.getTransactionByStripePaymentIntentId).mockResolvedValueOnce(
        ok(getMockedRecordedTransaction()),
      );

      vi.mocked(appConfigRepoImpl.getStripeConfig).mockResolvedValueOnce(ok(mockedStripeConfig));

      mockGetPaymentIntent.mockResolvedValueOnce(
        ok({
          id: "pi_test",
          status: "requires_capture",
          metadata: {},
        }),
      );

      const response = await GET(request);

      expect(response.status).toBe(307);
      // requires_capture is not handled as success or failure, should go to error
      expect(response.headers.get("location")).toContain("/payment-error?error=unexpected_status");
    });

    it("should handle partially_funded status", async () => {
      const url = new URL("http://localhost:3000/api/stripe/return");

      url.searchParams.set("payment_intent", "pi_test");
      url.searchParams.set("payment_intent_client_secret", "pi_test_secret");
      url.searchParams.set("app_id", "app_123");
      url.searchParams.set("saleor_api_url", "https://example.saleor.cloud/graphql/");
      url.searchParams.set("channel_id", "channel_123");

      const request = new NextRequest(url);

      vi.mocked(transactionRecorder.getTransactionByStripePaymentIntentId).mockResolvedValueOnce(
        ok(getMockedRecordedTransaction()),
      );

      vi.mocked(appConfigRepoImpl.getStripeConfig).mockResolvedValueOnce(ok(mockedStripeConfig));

      mockGetPaymentIntent.mockResolvedValueOnce(
        ok({
          id: "pi_test",
          status: "partially_funded",
          metadata: {},
        }),
      );

      const response = await GET(request);

      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toContain("/payment-error?error=unexpected_status");
    });
  });

  describe("Concurrent request handling", () => {
    it("should handle multiple simultaneous requests for the same payment intent", async () => {
      const url = new URL("http://localhost:3000/api/stripe/return");

      url.searchParams.set("payment_intent", "pi_test");
      url.searchParams.set("payment_intent_client_secret", "pi_test_secret");
      url.searchParams.set("app_id", "app_123");
      url.searchParams.set("saleor_api_url", "https://example.saleor.cloud/graphql/");
      url.searchParams.set("channel_id", "channel_123");

      vi.mocked(transactionRecorder.getTransactionByStripePaymentIntentId).mockResolvedValue(
        ok(getMockedRecordedTransaction()),
      );

      vi.mocked(appConfigRepoImpl.getStripeConfig).mockResolvedValue(ok(mockedStripeConfig));

      mockGetPaymentIntent.mockResolvedValue(
        ok({
          id: "pi_test",
          status: "succeeded",
          metadata: {},
        }),
      );

      // Simulate multiple concurrent requests
      const requests = Array(5)
        .fill(null)
        .map(() => new NextRequest(url));
      const responses = await Promise.all(requests.map((req) => GET(req)));

      // All should succeed
      expect(responses).toHaveLength(5);
      responses.forEach((response) => {
        expect(response.status).toBe(307);
        // Generic success page doesn't have payment_status param
        expect(response.headers.get("location")).toContain("/payment-success");
      });
    });
  });

  describe("Missing or invalid parameters", () => {
    it("should handle missing optional parameters gracefully", async () => {
      const url = new URL("http://localhost:3000/api/stripe/return");

      // Only required params
      url.searchParams.set("payment_intent", "pi_test");
      url.searchParams.set("payment_intent_client_secret", "pi_test_secret");
      url.searchParams.set("app_id", "app_123");
      url.searchParams.set("saleor_api_url", "https://example.saleor.cloud/graphql/");
      url.searchParams.set("channel_id", "channel_123");
      // No checkout_url, order_id, or redirect_status

      const request = new NextRequest(url);

      vi.mocked(transactionRecorder.getTransactionByStripePaymentIntentId).mockResolvedValueOnce(
        ok(getMockedRecordedTransaction()),
      );

      vi.mocked(appConfigRepoImpl.getStripeConfig).mockResolvedValueOnce(ok(mockedStripeConfig));

      mockGetPaymentIntent.mockResolvedValueOnce(
        ok({
          id: "pi_test",
          status: "succeeded",
          metadata: {},
        }),
      );

      const response = await GET(request);

      expect(response.status).toBe(307);
      // Should fallback to generic success page
      expect(response.headers.get("location")).toContain("/payment-success");
    });

    it("should handle empty string parameters", async () => {
      const url = new URL("http://localhost:3000/api/stripe/return");

      url.searchParams.set("payment_intent", "pi_test");
      url.searchParams.set("payment_intent_client_secret", "pi_test_secret");
      url.searchParams.set("app_id", "app_123");
      url.searchParams.set("saleor_api_url", "https://example.saleor.cloud/graphql/");
      url.searchParams.set("channel_id", "channel_123");
      url.searchParams.set("checkout_url", ""); // Empty string - invalid URL
      url.searchParams.set("order_id", ""); // Empty string

      const request = new NextRequest(url);

      vi.mocked(transactionRecorder.getTransactionByStripePaymentIntentId).mockResolvedValueOnce(
        ok(getMockedRecordedTransaction()),
      );

      vi.mocked(appConfigRepoImpl.getStripeConfig).mockResolvedValueOnce(ok(mockedStripeConfig));

      mockGetPaymentIntent.mockResolvedValueOnce(
        ok({
          id: "pi_test",
          status: "succeeded",
          metadata: {},
        }),
      );

      const response = await GET(request);

      expect(response.status).toBe(307);
      // Empty strings in URL params cause validation error
      expect(response.headers.get("location")).toContain("/payment-error?error=invalid_parameters");
    });
  });

  describe("Error recovery scenarios", () => {
    it("should handle network timeouts gracefully", async () => {
      const url = new URL("http://localhost:3000/api/stripe/return");

      url.searchParams.set("payment_intent", "pi_test");
      url.searchParams.set("payment_intent_client_secret", "pi_test_secret");
      url.searchParams.set("app_id", "app_123");
      url.searchParams.set("saleor_api_url", "https://example.saleor.cloud/graphql/");
      url.searchParams.set("channel_id", "channel_123");

      const request = new NextRequest(url);

      vi.mocked(transactionRecorder.getTransactionByStripePaymentIntentId).mockResolvedValueOnce(
        ok(getMockedRecordedTransaction()),
      );

      vi.mocked(appConfigRepoImpl.getStripeConfig).mockResolvedValueOnce(ok(mockedStripeConfig));

      // Simulate timeout
      mockGetPaymentIntent.mockRejectedValueOnce(new Error("Network timeout"));

      const response = await GET(request);

      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toContain("/payment-error?error=processing_failed");
    });

    it("should handle invalid payment intent data from Stripe", async () => {
      const url = new URL("http://localhost:3000/api/stripe/return");

      url.searchParams.set("payment_intent", "pi_test");
      url.searchParams.set("payment_intent_client_secret", "pi_test_secret");
      url.searchParams.set("app_id", "app_123");
      url.searchParams.set("saleor_api_url", "https://example.saleor.cloud/graphql/");
      url.searchParams.set("channel_id", "channel_123");

      const request = new NextRequest(url);

      vi.mocked(transactionRecorder.getTransactionByStripePaymentIntentId).mockResolvedValueOnce(
        ok(getMockedRecordedTransaction()),
      );

      vi.mocked(appConfigRepoImpl.getStripeConfig).mockResolvedValueOnce(ok(mockedStripeConfig));

      // Return invalid data structure
      mockGetPaymentIntent.mockResolvedValueOnce(
        ok({
          // Missing required fields
          id: "pi_test",
          // No status field - will be undefined
        }),
      );

      const response = await GET(request);

      expect(response.status).toBe(307);
      // When status is missing/undefined, it falls into the "unexpected_status" case
      expect(response.headers.get("location")).toContain("/payment-error?error=unexpected_status");
    });
  });
});
