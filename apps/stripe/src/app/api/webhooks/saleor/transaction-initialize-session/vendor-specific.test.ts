import { err, ok } from "neverthrow";
import Stripe from "stripe";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { mockedAppConfigRepo } from "@/__tests__/mocks/app-config-repo";
import { mockedSaleorAppId } from "@/__tests__/mocks/constants";
import { mockedStripePaymentIntentId } from "@/__tests__/mocks/mocked-stripe-payment-intent-id";
import { mockedStripePaymentIntentsApi } from "@/__tests__/mocks/mocked-stripe-payment-intents-api";
import { mockedSaleorApiUrl } from "@/__tests__/mocks/saleor-api-url";
import { mockedTransactionRecorderRepo } from "@/__tests__/mocks/transaction-recorder-repo";
import { getMockedTransactionInitializeSessionEvent } from "@/__tests__/mocks/saleor-events/transaction-initialize-session-event";
import { VendorResolver } from "@/modules/saleor/vendor-resolver";
import { IStripePaymentIntentsApiFactory } from "@/modules/stripe/types";

import { TransactionInitializeSessionUseCase } from "./use-case";
import { TransactionInitializeSessionUseCaseResponses } from "./use-case-response";

describe("Vendor-specific Stripe account functionality", () => {
  const stripePaymentIntentsApiFactory = {
    create: () => mockedStripePaymentIntentsApi,
  } satisfies IStripePaymentIntentsApiFactory;

  let mockVendorResolver: VendorResolver;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Create a mock vendor resolver
    mockVendorResolver = {
      resolveVendorForPayment: vi.fn(),
      getAvailableVendors: vi.fn(),
    } as any;
  });

  describe("When vendor has Stripe account configured", () => {
    it("should pass vendor's Stripe account ID to payment intent creation", async () => {
      const vendorStripeAccountId = "acct_vendor123";
      
      // Mock vendor resolver to return vendor with Stripe account
      vi.mocked(mockVendorResolver.resolveVendorForPayment).mockResolvedValue(
        ok({
          vendor: {
            id: "UGFnZTox",
            title: "Test Vendor",
            slug: "test-vendor",
            stripeAccountId: vendorStripeAccountId,
            metadata: [],
          },
          stripeAccountId: vendorStripeAccountId,
          resolutionMethod: "vendor-specific",
        }),
      );

      // Mock Stripe API to track the call
      const createPaymentIntentSpy = vi
        .spyOn(mockedStripePaymentIntentsApi, "createPaymentIntent")
        .mockImplementationOnce(async () =>
          ok({
            id: mockedStripePaymentIntentId.toString(),
            amount: 100,
            currency: "usd",
            status: "requires_payment_method",
            client_secret: "test_secret",
          } as Stripe.PaymentIntent),
        );

      const uc = new TransactionInitializeSessionUseCase({
        appConfigRepo: mockedAppConfigRepo,
        stripePaymentIntentsApiFactory,
        transactionRecorder: mockedTransactionRecorderRepo,
        vendorResolver: mockVendorResolver,
      });

      const event = getMockedTransactionInitializeSessionEvent({
        sourceObject: {
          __typename: "Checkout",
          id: "checkout-id",
          channel: { id: "channel-id", slug: "channel-slug" },
          metadata: [{ key: "vendor_id", value: "UGFnZTox" }],
        },
      });

      const result = await uc.execute({
        saleorApiUrl: mockedSaleorApiUrl,
        appId: mockedSaleorAppId,
        event,
      });

      expect(result._unsafeUnwrap()).toBeInstanceOf(
        TransactionInitializeSessionUseCaseResponses.Success,
      );

      // Verify Stripe API was called with vendor's account
      expect(createPaymentIntentSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          stripeAccount: vendorStripeAccountId,
        }),
      );
    });

    it("should record transaction with vendor's Stripe account ID", async () => {
      const vendorStripeAccountId = "acct_vendor456";
      
      // Mock vendor resolver
      vi.mocked(mockVendorResolver.resolveVendorForPayment).mockResolvedValue(
        ok({
          vendor: {
            id: "UGFnZToy",
            title: "Another Vendor",
            slug: "another-vendor",
            stripeAccountId: vendorStripeAccountId,
            metadata: [],
          },
          stripeAccountId: vendorStripeAccountId,
          resolutionMethod: "vendor-specific",
        }),
      );

      // Mock transaction recorder to track the call
      const recordTransactionSpy = vi
        .spyOn(mockedTransactionRecorderRepo, "recordTransaction")
        .mockResolvedValue(ok(undefined));

      const uc = new TransactionInitializeSessionUseCase({
        appConfigRepo: mockedAppConfigRepo,
        stripePaymentIntentsApiFactory,
        transactionRecorder: mockedTransactionRecorderRepo,
        vendorResolver: mockVendorResolver,
      });

      const event = getMockedTransactionInitializeSessionEvent({
        sourceObject: {
          __typename: "Order",
          id: "order-id",
          channel: { id: "channel-id", slug: "channel-slug" },
          metadata: [{ key: "vendor_id", value: "UGFnZToy" }],
        },
      });

      await uc.execute({
        saleorApiUrl: mockedSaleorApiUrl,
        appId: mockedSaleorAppId,
        event,
      });

      // Verify transaction was recorded with vendor's account
      expect(recordTransactionSpy).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          stripeAccountId: vendorStripeAccountId,
        }),
      );
    });
  });

  describe("When vendor is not found or has no Stripe account", () => {
    it("should use main account when vendor is not found", async () => {
      // Mock vendor resolver to return null (vendor not found)
      vi.mocked(mockVendorResolver.resolveVendorForPayment).mockResolvedValue(ok(null));

      const createPaymentIntentSpy = vi
        .spyOn(mockedStripePaymentIntentsApi, "createPaymentIntent")
        .mockImplementationOnce(async () =>
          ok({
            id: mockedStripePaymentIntentId.toString(),
            amount: 100,
            currency: "usd",
            status: "requires_payment_method",
            client_secret: "test_secret",
          } as Stripe.PaymentIntent),
        );

      const uc = new TransactionInitializeSessionUseCase({
        appConfigRepo: mockedAppConfigRepo,
        stripePaymentIntentsApiFactory,
        transactionRecorder: mockedTransactionRecorderRepo,
        vendorResolver: mockVendorResolver,
      });

      const event = getMockedTransactionInitializeSessionEvent({
        sourceObject: {
          __typename: "Checkout",
          id: "checkout-id",
          channel: { id: "channel-id", slug: "channel-slug" },
          metadata: [{ key: "vendor_id", value: "invalid-vendor" }],
        },
      });

      const result = await uc.execute({
        saleorApiUrl: mockedSaleorApiUrl,
        appId: mockedSaleorAppId,
        event,
      });

      expect(result._unsafeUnwrap()).toBeInstanceOf(
        TransactionInitializeSessionUseCaseResponses.Success,
      );

      // Verify Stripe API was called WITHOUT vendor account (undefined)
      expect(createPaymentIntentSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          stripeAccount: undefined,
        }),
      );
    });

    it("should use main account when no vendor_id in metadata", async () => {
      const createPaymentIntentSpy = vi
        .spyOn(mockedStripePaymentIntentsApi, "createPaymentIntent")
        .mockImplementationOnce(async () =>
          ok({
            id: mockedStripePaymentIntentId.toString(),
            amount: 100,
            currency: "usd",
            status: "requires_payment_method",
            client_secret: "test_secret",
          } as Stripe.PaymentIntent),
        );

      const uc = new TransactionInitializeSessionUseCase({
        appConfigRepo: mockedAppConfigRepo,
        stripePaymentIntentsApiFactory,
        transactionRecorder: mockedTransactionRecorderRepo,
        vendorResolver: mockVendorResolver,
      });

      const event = getMockedTransactionInitializeSessionEvent({
        sourceObject: {
          __typename: "Checkout",
          id: "checkout-id",
          channel: { id: "channel-id", slug: "channel-slug" },
          metadata: [], // No vendor_id
        },
      });

      await uc.execute({
        saleorApiUrl: mockedSaleorApiUrl,
        appId: mockedSaleorAppId,
        event,
      });

      // Verify vendor resolver was called
      expect(mockVendorResolver.resolveVendorForPayment).toHaveBeenCalledWith({
        orderMetadata: [],
        channelId: "channel-id",
      });

      // Verify Stripe API was called without vendor account
      expect(createPaymentIntentSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          stripeAccount: undefined,
        }),
      );
    });

    it("should use main account when vendor has no stripe_account_id configured", async () => {
      // Mock vendor resolver to return vendor without Stripe account
      vi.mocked(mockVendorResolver.resolveVendorForPayment).mockResolvedValue(ok(null));

      const recordTransactionSpy = vi
        .spyOn(mockedTransactionRecorderRepo, "recordTransaction")
        .mockResolvedValue(ok(undefined));

      const uc = new TransactionInitializeSessionUseCase({
        appConfigRepo: mockedAppConfigRepo,
        stripePaymentIntentsApiFactory,
        transactionRecorder: mockedTransactionRecorderRepo,
        vendorResolver: mockVendorResolver,
      });

      const event = getMockedTransactionInitializeSessionEvent();

      await uc.execute({
        saleorApiUrl: mockedSaleorApiUrl,
        appId: mockedSaleorAppId,
        event,
      });

      // Verify transaction was recorded WITHOUT vendor's account
      expect(recordTransactionSpy).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          stripeAccountId: undefined,
        }),
      );
    });
  });

  describe("Error handling", () => {
    it("should handle vendor resolution errors gracefully", async () => {
      // Mock vendor resolver to return an error
      vi.mocked(mockVendorResolver.resolveVendorForPayment).mockResolvedValue(
        err({
          name: "ResolutionError",
          message: "Failed to fetch vendor",
        } as any),
      );

      const createPaymentIntentSpy = vi
        .spyOn(mockedStripePaymentIntentsApi, "createPaymentIntent")
        .mockImplementationOnce(async () =>
          ok({
            id: mockedStripePaymentIntentId.toString(),
            amount: 100,
            currency: "usd",
            status: "requires_payment_method",
            client_secret: "test_secret",
          } as Stripe.PaymentIntent),
        );

      const uc = new TransactionInitializeSessionUseCase({
        appConfigRepo: mockedAppConfigRepo,
        stripePaymentIntentsApiFactory,
        transactionRecorder: mockedTransactionRecorderRepo,
        vendorResolver: mockVendorResolver,
      });

      const event = getMockedTransactionInitializeSessionEvent({
        sourceObject: {
          __typename: "Checkout",
          id: "checkout-id",
          channel: { id: "channel-id", slug: "channel-slug" },
          metadata: [{ key: "vendor_id", value: "UGFnZTox" }],
        },
      });

      const result = await uc.execute({
        saleorApiUrl: mockedSaleorApiUrl,
        appId: mockedSaleorAppId,
        event,
      });

      // Should still succeed but use main account
      expect(result._unsafeUnwrap()).toBeInstanceOf(
        TransactionInitializeSessionUseCaseResponses.Success,
      );

      // Verify fallback to main account
      expect(createPaymentIntentSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          stripeAccount: undefined,
        }),
      );
    });
  });
});