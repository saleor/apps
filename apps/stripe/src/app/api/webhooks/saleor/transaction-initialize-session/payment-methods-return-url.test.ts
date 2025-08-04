import { ok } from "neverthrow";
import Stripe from "stripe";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { mockedAppConfigRepo } from "@/__tests__/mocks/app-config-repo";
import { mockedSaleorAppId } from "@/__tests__/mocks/constants";
import { mockedStripeConfig } from "@/__tests__/mocks/mock-stripe-config";
import { mockedStripePaymentIntentsApi } from "@/__tests__/mocks/mocked-stripe-payment-intents-api";
import { MockedTransactionRecorder } from "@/__tests__/mocks/mocked-transaction-recorder";
import { mockedSaleorApiUrl } from "@/__tests__/mocks/saleor-api-url";
import { getMockedTransactionInitializeSessionEvent } from "@/__tests__/mocks/saleor-events/transaction-initialize-session-event";
import { VendorResolver } from "@/modules/saleor/vendor-resolver";
import { IStripePaymentIntentsApiFactory } from "@/modules/stripe/types";

import { TransactionInitializeSessionUseCase } from "./use-case";

describe("Payment methods with return_url", () => {
  const stripePaymentIntentsApiFactory = {
    create: () => mockedStripePaymentIntentsApi,
  } satisfies IStripePaymentIntentsApiFactory;

  const mockedVendorResolver = {
    resolveVendorForPayment: vi.fn().mockImplementation(() => Promise.resolve(ok(null))),
  } as unknown as VendorResolver;

  const createUseCase = () =>
    new TransactionInitializeSessionUseCase({
      appConfigRepo: mockedAppConfigRepo,
      stripePaymentIntentsApiFactory,
      transactionRecorder: new MockedTransactionRecorder(),
      vendorResolver: mockedVendorResolver,
    });

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock app config to return a valid stripe config
    vi.mocked(mockedAppConfigRepo.getStripeConfig).mockResolvedValue(ok(mockedStripeConfig));
  });

  const paymentMethods = [
    { method: "ideal", name: "iDEAL", requiresRedirect: true },
    { method: "card", name: "Card", requiresRedirect: false },
    { method: "paypal", name: "PayPal", requiresRedirect: true },
    { method: "klarna", name: "Klarna", requiresRedirect: true },
    { method: "google_pay", name: "Google Pay", requiresRedirect: false },
    { method: "apple_pay", name: "Apple Pay", requiresRedirect: false },
  ];

  describe.each(paymentMethods)("$name payment method", ({ method, name, requiresRedirect }) => {
    it(`should ${
      requiresRedirect ? "include" : "include"
    } return_url when app URL is provided`, async () => {
      const saleorEvent = getMockedTransactionInitializeSessionEvent({
        data: JSON.stringify({ paymentIntent: { paymentMethod: method } }),
      });
      const appUrl = "https://app.example.com";

      vi.spyOn(mockedStripePaymentIntentsApi, "createPaymentIntent").mockImplementationOnce(
        async (args) => {
          /*
           * All payment methods should get return_url since we don't know upfront
           * which ones will require redirect
           */
          expect(args.intentParams.return_url).toBeDefined();
          expect(args.intentParams.return_url).toContain("/api/stripe/return");

          return ok({
            id: "pi_test_123",
            amount: 100,
            currency: "eur",
            client_secret: "secret-value",
            status: requiresRedirect ? "requires_action" : "requires_payment_method",
          } as Stripe.PaymentIntent);
        },
      );

      const useCase = createUseCase();
      const result = await useCase.execute({
        appId: mockedSaleorAppId,
        saleorApiUrl: mockedSaleorApiUrl,
        event: saleorEvent,
        appUrl,
      });

      // Log the error if the result is not OK
      if (!result.isOk()) {
        // eslint-disable-next-line no-console
        console.error("Failed to execute use case:", result._unsafeUnwrapErr());
      }

      expect(result.isOk()).toBe(true);
      expect(mockedStripePaymentIntentsApi.createPaymentIntent).toHaveBeenCalled();
    });

    it(`should handle ${name} payment without app URL`, async () => {
      const saleorEvent = getMockedTransactionInitializeSessionEvent({
        data: JSON.stringify({ paymentIntent: { paymentMethod: method } }),
      });

      vi.spyOn(mockedStripePaymentIntentsApi, "createPaymentIntent").mockImplementationOnce(
        async (args) => {
          // Should not include return_url when app URL is not provided
          expect(args.intentParams.return_url).toBeUndefined();

          return ok({
            id: "pi_test_123",
            amount: 100,
            currency: "eur",
            client_secret: "secret-value",
            status: requiresRedirect ? "requires_action" : "requires_payment_method",
          } as Stripe.PaymentIntent);
        },
      );

      const useCase = createUseCase();
      const result = await useCase.execute({
        appId: mockedSaleorAppId,
        saleorApiUrl: mockedSaleorApiUrl,
        event: saleorEvent,
        // No appUrl
      });

      expect(result.isOk()).toBe(true);
    });
  });

  describe("Payment method specific behaviors", () => {
    it("should include proper metadata for all redirect-based payment methods", async () => {
      const redirectMethods = paymentMethods.filter((m) => m.requiresRedirect);

      for (const { method } of redirectMethods) {
        vi.clearAllMocks();

        const saleorEvent = getMockedTransactionInitializeSessionEvent({
          data: JSON.stringify({ paymentIntent: { paymentMethod: method } }),
        });
        const appUrl = "https://app.example.com";

        vi.spyOn(mockedStripePaymentIntentsApi, "createPaymentIntent").mockImplementationOnce(
          async (args) => {
            const returnUrl = new URL(args.intentParams.return_url!);

            // Verify all required params are present
            expect(returnUrl.searchParams.get("app_id")).toBe(mockedSaleorAppId);
            expect(returnUrl.searchParams.get("saleor_api_url")).toBe(mockedSaleorApiUrl);
            expect(returnUrl.searchParams.get("channel_id")).toBe(
              saleorEvent.sourceObject.channel.id,
            );

            return ok({
              id: `pi_test_${method}`,
              amount: 100,
              currency: "eur",
              client_secret: "secret-value",
              status: "requires_action",
            } as Stripe.PaymentIntent);
          },
        );

        const useCase = createUseCase();

        await useCase.execute({
          appId: mockedSaleorAppId,
          saleorApiUrl: mockedSaleorApiUrl,
          event: saleorEvent,
          appUrl,
        });

        expect(mockedStripePaymentIntentsApi.createPaymentIntent).toHaveBeenCalledTimes(1);
      }
    });

    it("should handle unsupported payment method gracefully", async () => {
      const saleorEvent = getMockedTransactionInitializeSessionEvent({
        data: JSON.stringify({ paymentIntent: { paymentMethod: "unsupported_method" } }),
      });
      const appUrl = "https://app.example.com";

      const useCase = createUseCase();
      const result = await useCase.execute({
        appId: mockedSaleorAppId,
        saleorApiUrl: mockedSaleorApiUrl,
        event: saleorEvent,
        appUrl,
      });

      // Should fail with unsupported payment method error
      expect(result.isOk()).toBe(true);
      const response = result._unsafeUnwrap();

      expect(response.constructor.name).toBe("Failure");
    });
  });

  describe("Return URL consistency", () => {
    it("should generate consistent return URLs for the same input", async () => {
      const saleorEvent = getMockedTransactionInitializeSessionEvent({
        data: JSON.stringify({ paymentIntent: { paymentMethod: "ideal" } }),
      });
      const appUrl = "https://app.example.com";

      const capturedUrls: string[] = [];

      // Mock to capture URLs
      vi.spyOn(mockedStripePaymentIntentsApi, "createPaymentIntent").mockImplementation(
        async (args) => {
          capturedUrls.push(args.intentParams.return_url!);

          return ok({
            id: "pi_test",
            amount: 100,
            currency: "eur",
            client_secret: "secret-value",
            status: "requires_action",
          } as Stripe.PaymentIntent);
        },
      );

      const useCase = createUseCase();

      // Execute multiple times
      for (let i = 0; i < 3; i++) {
        await useCase.execute({
          appId: mockedSaleorAppId,
          saleorApiUrl: mockedSaleorApiUrl,
          event: saleorEvent,
          appUrl,
        });
      }

      // All URLs should be identical
      expect(capturedUrls).toHaveLength(3);
      expect(new Set(capturedUrls).size).toBe(1);
    });

    it("should generate different return URLs for different orders", async () => {
      const appUrl = "https://app.example.com";
      const capturedUrls: string[] = [];

      vi.spyOn(mockedStripePaymentIntentsApi, "createPaymentIntent").mockImplementation(
        async (args) => {
          capturedUrls.push(args.intentParams.return_url!);

          return ok({
            id: "pi_test",
            amount: 100,
            currency: "eur",
            client_secret: "secret-value",
            status: "requires_action",
          } as Stripe.PaymentIntent);
        },
      );

      const useCase = createUseCase();

      // Test with Order
      const orderEvent = getMockedTransactionInitializeSessionEvent({
        data: JSON.stringify({ paymentIntent: { paymentMethod: "ideal" } }),
      });

      orderEvent.sourceObject = {
        ...orderEvent.sourceObject,
        id: "order_123",
        __typename: "Order",
        metadata: [],
      };

      await useCase.execute({
        appId: mockedSaleorAppId,
        saleorApiUrl: mockedSaleorApiUrl,
        event: orderEvent,
        appUrl,
      });

      // Test with Checkout
      const checkoutEvent = getMockedTransactionInitializeSessionEvent({
        data: JSON.stringify({ paymentIntent: { paymentMethod: "ideal" } }),
      });

      await useCase.execute({
        appId: mockedSaleorAppId,
        saleorApiUrl: mockedSaleorApiUrl,
        event: checkoutEvent,
        appUrl,
      });

      // URLs should be different (one has order_id, one doesn't)
      expect(capturedUrls).toHaveLength(2);
      expect(capturedUrls[0]).toContain("order_id=order_123");
      expect(capturedUrls[1]).not.toContain("order_id=");
    });
  });
});
