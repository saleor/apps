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

describe("Stripe return endpoint", () => {
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

  it("should validate required parameters", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/stripe/return?payment_intent=pi_test",
    );

    const response = await GET(request);

    expect(response.status).toBe(307); // Redirect
    expect(response.headers.get("location")).toContain("/payment-error?error=invalid_parameters");
  });

  it("should handle invalid Saleor API URL", async () => {
    const url = new URL("http://localhost:3000/api/stripe/return");

    url.searchParams.set("payment_intent", "pi_test");
    url.searchParams.set("payment_intent_client_secret", "pi_test_secret");
    url.searchParams.set("app_id", "app_123");
    url.searchParams.set("saleor_api_url", "https://invalid-saleor-url.com/"); // Invalid Saleor URL (missing /graphql/)
    url.searchParams.set("channel_id", "channel_123");

    const request = new NextRequest(url);

    const response = await GET(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/payment-error?error=invalid_api_url");
  });

  it("should handle transaction not found", async () => {
    const url = new URL("http://localhost:3000/api/stripe/return");

    url.searchParams.set("payment_intent", "pi_test");
    url.searchParams.set("payment_intent_client_secret", "pi_test_secret");
    url.searchParams.set("app_id", "app_123");
    url.searchParams.set("saleor_api_url", "https://example.saleor.cloud/graphql/");
    url.searchParams.set("channel_id", "channel_123");

    const request = new NextRequest(url);

    vi.mocked(transactionRecorder.getTransactionByStripePaymentIntentId).mockResolvedValueOnce(
      err(new TransactionRecorderError.TransactionMissingError("Transaction not found")),
    );

    const response = await GET(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain(
      "/payment-error?error=transaction_not_found",
    );
  });

  it("should handle missing Stripe configuration", async () => {
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

    vi.mocked(appConfigRepoImpl.getStripeConfig).mockResolvedValueOnce(ok(null));

    const response = await GET(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/payment-error?error=configuration_error");
  });

  it("should handle payment intent retrieval failure", async () => {
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

    mockGetPaymentIntent.mockResolvedValueOnce(err(new Error("Payment intent not found")));

    const response = await GET(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain(
      "/payment-error?error=payment_intent_not_found",
    );
  });

  describe("successful payment processing", () => {
    it("should redirect to checkout URL on successful payment", async () => {
      const url = new URL("http://localhost:3000/api/stripe/return");

      url.searchParams.set("payment_intent", "pi_test");
      url.searchParams.set("payment_intent_client_secret", "pi_test_secret");
      url.searchParams.set("app_id", "app_123");
      url.searchParams.set("saleor_api_url", "https://example.saleor.cloud/graphql/");
      url.searchParams.set("channel_id", "channel_123");
      url.searchParams.set("checkout_url", "https://example.com/checkout");

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

      expect(location).toContain("https://example.com/checkout");
      expect(location).toContain("payment_status=success");
    });

    it("should redirect to order page when no checkout URL provided", async () => {
      const url = new URL("http://localhost:3000/api/stripe/return");

      url.searchParams.set("payment_intent", "pi_test");
      url.searchParams.set("payment_intent_client_secret", "pi_test_secret");
      url.searchParams.set("app_id", "app_123");
      url.searchParams.set("saleor_api_url", "https://example.saleor.cloud/graphql/");
      url.searchParams.set("channel_id", "channel_123");
      url.searchParams.set("order_id", "order_123");

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

      expect(location).toContain("/order/order_123");
      expect(location).toContain("payment_status=success");
    });

    it("should handle processing status", async () => {
      const url = new URL("http://localhost:3000/api/stripe/return");

      url.searchParams.set("payment_intent", "pi_test");
      url.searchParams.set("payment_intent_client_secret", "pi_test_secret");
      url.searchParams.set("app_id", "app_123");
      url.searchParams.set("saleor_api_url", "https://example.saleor.cloud/graphql/");
      url.searchParams.set("channel_id", "channel_123");
      url.searchParams.set("checkout_url", "https://example.com/checkout");

      const request = new NextRequest(url);

      vi.mocked(transactionRecorder.getTransactionByStripePaymentIntentId).mockResolvedValueOnce(
        ok(getMockedRecordedTransaction()),
      );

      vi.mocked(appConfigRepoImpl.getStripeConfig).mockResolvedValueOnce(ok(mockedStripeConfig));

      mockGetPaymentIntent.mockResolvedValueOnce(
        ok({
          id: "pi_test",
          status: "processing",
          metadata: {},
        }),
      );

      const response = await GET(request);

      expect(response.status).toBe(307);
      const location = response.headers.get("location");

      expect(location).toContain("payment_status=success");
    });
  });

  describe("failed payment processing", () => {
    it("should redirect with error on failed payment", async () => {
      const url = new URL("http://localhost:3000/api/stripe/return");

      url.searchParams.set("payment_intent", "pi_test");
      url.searchParams.set("payment_intent_client_secret", "pi_test_secret");
      url.searchParams.set("app_id", "app_123");
      url.searchParams.set("saleor_api_url", "https://example.saleor.cloud/graphql/");
      url.searchParams.set("channel_id", "channel_123");
      url.searchParams.set("checkout_url", "https://example.com/checkout");

      const request = new NextRequest(url);

      vi.mocked(transactionRecorder.getTransactionByStripePaymentIntentId).mockResolvedValueOnce(
        ok(getMockedRecordedTransaction()),
      );

      vi.mocked(appConfigRepoImpl.getStripeConfig).mockResolvedValueOnce(ok(mockedStripeConfig));

      mockGetPaymentIntent.mockResolvedValueOnce(
        ok({
          id: "pi_test",
          status: "requires_payment_method",
          metadata: {},
        }),
      );

      const response = await GET(request);

      expect(response.status).toBe(307);
      const location = response.headers.get("location");

      expect(location).toContain("payment_status=failed");
      expect(location).toContain("error=payment_failed");
    });

    it("should handle canceled payment", async () => {
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
          status: "canceled",
          metadata: {},
        }),
      );

      const response = await GET(request);

      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toContain("/payment-error?error=payment_failed");
    });
  });

  it("should handle unexpected errors", async () => {
    const url = new URL("http://localhost:3000/api/stripe/return");

    url.searchParams.set("payment_intent", "pi_test");
    url.searchParams.set("payment_intent_client_secret", "pi_test_secret");
    url.searchParams.set("app_id", "app_123");
    url.searchParams.set("saleor_api_url", "https://example.saleor.cloud/graphql/");
    url.searchParams.set("channel_id", "channel_123");

    const request = new NextRequest(url);

    vi.mocked(transactionRecorder.getTransactionByStripePaymentIntentId).mockRejectedValueOnce(
      new Error("Unexpected error"),
    );

    const response = await GET(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/payment-error?error=processing_failed");
  });
});
