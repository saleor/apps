import { err, ok } from "neverthrow";
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { mockedStripeConfig } from "@/__tests__/mocks/mock-stripe-config";
import { getMockedRecordedTransaction } from "@/__tests__/mocks/mocked-recorded-transaction";
import { appConfigRepoImpl } from "@/modules/app-config/repositories/app-config-repo-impl";
import { StripePaymentIntentsApiFactory } from "@/modules/stripe/stripe-payment-intents-api-factory";
import { transactionRecorder } from "@/modules/transactions-recording/repositories/transaction-recorder-impl";
import { TransactionRecorderError } from "@/modules/transactions-recording/repositories/transaction-recorder-repo";

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

describe("Stripe return endpoint - Security Tests", () => {
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

  describe("Parameter tampering protection", () => {
    it("should reject requests with tampered app_id", async () => {
      const url = new URL("http://localhost:3000/api/stripe/return");

      url.searchParams.set("payment_intent", "pi_test");
      url.searchParams.set("payment_intent_client_secret", "pi_test_secret");
      url.searchParams.set("app_id", "malicious_app_id"); // Tampered
      url.searchParams.set("saleor_api_url", "https://example.saleor.cloud/graphql/");
      url.searchParams.set("channel_id", "channel_123");

      const request = new NextRequest(url);

      // Transaction recorder won't find the transaction with wrong app_id
      vi.mocked(transactionRecorder.getTransactionByStripePaymentIntentId).mockResolvedValueOnce(
        err(new TransactionRecorderError.TransactionMissingError("Transaction not found")),
      );

      const response = await GET(request);

      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toContain(
        "/payment-error?error=transaction_not_found",
      );
    });

    it("should reject requests with tampered saleor_api_url", async () => {
      const url = new URL("http://localhost:3000/api/stripe/return");

      url.searchParams.set("payment_intent", "pi_test");
      url.searchParams.set("payment_intent_client_secret", "pi_test_secret");
      url.searchParams.set("app_id", "app_123");
      url.searchParams.set("saleor_api_url", "https://malicious.saleor.cloud/graphql/"); // Tampered
      url.searchParams.set("channel_id", "channel_123");

      const request = new NextRequest(url);

      // Transaction won't be found with wrong saleor URL
      vi.mocked(transactionRecorder.getTransactionByStripePaymentIntentId).mockResolvedValueOnce(
        err(new TransactionRecorderError.TransactionMissingError("Transaction not found")),
      );

      const response = await GET(request);

      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toContain(
        "/payment-error?error=transaction_not_found",
      );
    });

    it("should reject requests with mismatched channel_id", async () => {
      const url = new URL("http://localhost:3000/api/stripe/return");

      url.searchParams.set("payment_intent", "pi_test");
      url.searchParams.set("payment_intent_client_secret", "pi_test_secret");
      url.searchParams.set("app_id", "app_123");
      url.searchParams.set("saleor_api_url", "https://example.saleor.cloud/graphql/");
      url.searchParams.set("channel_id", "wrong_channel"); // Tampered

      const request = new NextRequest(url);

      vi.mocked(transactionRecorder.getTransactionByStripePaymentIntentId).mockResolvedValueOnce(
        ok(getMockedRecordedTransaction()),
      );

      // Config won't be found for wrong channel
      vi.mocked(appConfigRepoImpl.getStripeConfig).mockResolvedValueOnce(ok(null));

      const response = await GET(request);

      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toContain(
        "/payment-error?error=configuration_error",
      );
    });
  });

  describe("Cross-site request protection", () => {
    it("should handle requests without proper referrer", async () => {
      const url = new URL("http://localhost:3000/api/stripe/return");

      url.searchParams.set("payment_intent", "pi_test");
      url.searchParams.set("payment_intent_client_secret", "pi_test_secret");
      url.searchParams.set("app_id", "app_123");
      url.searchParams.set("saleor_api_url", "https://example.saleor.cloud/graphql/");
      url.searchParams.set("channel_id", "channel_123");

      const request = new NextRequest(url, {
        headers: {
          // No referrer header
        },
      });

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

      // Should still work - we rely on payment intent verification
      expect(response.status).toBe(307);
      // Generic success page doesn't have payment_status param
      expect(response.headers.get("location")).toContain("/payment-success");
    });
  });

  describe("Injection attack prevention", () => {
    it("should handle XSS attempts in checkout_url", async () => {
      const maliciousUrl = "javascript:alert('XSS')";
      const url = new URL("http://localhost:3000/api/stripe/return");

      url.searchParams.set("payment_intent", "pi_test");
      url.searchParams.set("payment_intent_client_secret", "pi_test_secret");
      url.searchParams.set("app_id", "app_123");
      url.searchParams.set("saleor_api_url", "https://example.saleor.cloud/graphql/");
      url.searchParams.set("channel_id", "channel_123");
      url.searchParams.set("checkout_url", maliciousUrl);

      const request = new NextRequest(url);

      const response = await GET(request);

      // Should reject due to invalid URL format (javascript: protocol is not valid)
      expect(response.status).toBe(307);
      // Invalid URL causes a general processing error
      expect(response.headers.get("location")).toContain("/payment-error?error=processing_failed");
    });

    it("should handle SQL injection attempts in parameters", async () => {
      const url = new URL("http://localhost:3000/api/stripe/return");

      url.searchParams.set("payment_intent", "pi_test' OR '1'='1");
      url.searchParams.set("payment_intent_client_secret", "pi_test_secret");
      url.searchParams.set("app_id", "app_123");
      url.searchParams.set("saleor_api_url", "https://example.saleor.cloud/graphql/");
      url.searchParams.set("channel_id", "channel_123");

      const request = new NextRequest(url);

      vi.mocked(transactionRecorder.getTransactionByStripePaymentIntentId).mockResolvedValueOnce(
        err(new TransactionRecorderError.TransactionMissingError("Invalid payment intent ID")),
      );

      const response = await GET(request);

      // Should fail safely
      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toContain("/payment-error");
    });

    it("should sanitize order_id parameter", async () => {
      const url = new URL("http://localhost:3000/api/stripe/return");

      url.searchParams.set("payment_intent", "pi_test");
      url.searchParams.set("payment_intent_client_secret", "pi_test_secret");
      url.searchParams.set("app_id", "app_123");
      url.searchParams.set("saleor_api_url", "https://example.saleor.cloud/graphql/");
      url.searchParams.set("channel_id", "channel_123");
      url.searchParams.set("order_id", "<script>alert('XSS')</script>");

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

      // The order_id should be URL encoded
      expect(location).toContain("order/%3Cscript%3Ealert");
    });
  });

  describe("Replay attack prevention", () => {
    it("should handle repeated requests with same payment_intent", async () => {
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

      // First time - payment succeeded
      mockGetPaymentIntent.mockResolvedValueOnce(
        ok({
          id: "pi_test",
          status: "succeeded",
          metadata: {},
        }),
      );

      const request1 = new NextRequest(url);
      const response1 = await GET(request1);

      expect(response1.status).toBe(307);
      // Generic success page doesn't have payment_status param
      expect(response1.headers.get("location")).toContain("/payment-success");

      // Second time - payment already succeeded (replay)
      mockGetPaymentIntent.mockResolvedValueOnce(
        ok({
          id: "pi_test",
          status: "succeeded",
          metadata: {},
        }),
      );

      const request2 = new NextRequest(url);
      const response2 = await GET(request2);

      // Should still redirect to success (idempotent)
      expect(response2.status).toBe(307);
      // Generic success page doesn't have payment_status param
      expect(response2.headers.get("location")).toContain("/payment-success");
    });
  });

  describe("Authorization checks", () => {
    it("should verify payment intent belongs to the app", async () => {
      const url = new URL("http://localhost:3000/api/stripe/return");

      url.searchParams.set("payment_intent", "pi_from_different_app");
      url.searchParams.set("payment_intent_client_secret", "pi_test_secret");
      url.searchParams.set("app_id", "app_123");
      url.searchParams.set("saleor_api_url", "https://example.saleor.cloud/graphql/");
      url.searchParams.set("channel_id", "channel_123");

      const request = new NextRequest(url);

      // Transaction not found for this app
      vi.mocked(transactionRecorder.getTransactionByStripePaymentIntentId).mockResolvedValueOnce(
        err(new TransactionRecorderError.TransactionMissingError("Transaction not found")),
      );

      const response = await GET(request);

      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toContain(
        "/payment-error?error=transaction_not_found",
      );
    });

    it("should prevent access to payment intents from other Stripe accounts", async () => {
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

      // Stripe API returns error - payment intent not found in this account
      mockGetPaymentIntent.mockResolvedValueOnce(
        err(new Error("No such payment_intent: 'pi_test'")),
      );

      const response = await GET(request);

      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toContain(
        "/payment-error?error=payment_intent_not_found",
      );
    });
  });

  describe("Data leakage prevention", () => {
    it("should not expose internal error details", async () => {
      const url = new URL("http://localhost:3000/api/stripe/return");

      url.searchParams.set("payment_intent", "pi_test");
      url.searchParams.set("payment_intent_client_secret", "pi_test_secret");
      url.searchParams.set("app_id", "app_123");
      url.searchParams.set("saleor_api_url", "https://example.saleor.cloud/graphql/");
      url.searchParams.set("channel_id", "channel_123");

      const request = new NextRequest(url);

      // Simulate internal error with sensitive information
      vi.mocked(transactionRecorder.getTransactionByStripePaymentIntentId).mockRejectedValueOnce(
        new Error("Database connection failed: postgres://user:password@host:5432/db"),
      );

      const response = await GET(request);

      expect(response.status).toBe(307);
      const location = response.headers.get("location");

      // Should use generic error message
      expect(location).toContain("/payment-error?error=processing_failed");
      // Should not contain database details
      expect(location).not.toContain("postgres");
      expect(location).not.toContain("password");
    });
  });
});
