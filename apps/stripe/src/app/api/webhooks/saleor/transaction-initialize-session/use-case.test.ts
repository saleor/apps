import { err, ok } from "neverthrow";
import Stripe from "stripe";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { mockedAppConfigRepo } from "@/__tests__/mocks/app-config-repo";
import { mockedSaleorAppId } from "@/__tests__/mocks/constants";
import { mockedStripeConfig } from "@/__tests__/mocks/mock-stripe-config";
import { mockedStripePaymentIntentsApi } from "@/__tests__/mocks/mocked-stripe-payment-intents-api";
import { MockedTransactionRecorder } from "@/__tests__/mocks/mocked-transaction-recorder";
import { mockedSaleorApiUrl } from "@/__tests__/mocks/saleor-api-url";
import { getMockedTransactionInitializeSessionEvent } from "@/__tests__/mocks/saleor-events/transaction-initialize-session-event";
import {
  AppIsNotConfiguredResponse,
  BrokenAppResponse,
  MalformedRequestResponse,
} from "@/app/api/webhooks/saleor/saleor-webhook-responses";
import { VendorResolver } from "@/modules/saleor/vendor-resolver";
import { StripeAPIError } from "@/modules/stripe/stripe-api-error";
import { StripeMoney } from "@/modules/stripe/stripe-money";
import { IStripePaymentIntentsApiFactory } from "@/modules/stripe/types";
import {
  AuthorizationActionRequiredResult,
  ChargeActionRequiredResult,
} from "@/modules/transaction-result/action-required-result";
import {
  AuthorizationFailureResult,
  ChargeFailureResult,
} from "@/modules/transaction-result/failure-result";
import { TransactionRecorderError } from "@/modules/transactions-recording/repositories/transaction-recorder-repo";

import { parseTransactionInitializeSessionEventData } from "./event-data-parser";
import { TransactionInitializeSessionUseCase } from "./use-case";
import { TransactionInitializeSessionUseCaseResponses } from "./use-case-response";

describe("TransactionInitializeSessionUseCase", () => {
  const stripePaymentIntentsApiFactory = {
    create: () => mockedStripePaymentIntentsApi,
  } satisfies IStripePaymentIntentsApiFactory;

  const mockedVendorResolver = {
    resolveVendorForPayment: vi.fn().mockResolvedValue(ok(null)),
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

    // Reset the mock to return null (no vendor) for most tests
    vi.mocked(mockedVendorResolver.resolveVendorForPayment).mockResolvedValue(ok(null));

    // Mock app config to return a valid stripe config
    vi.mocked(mockedAppConfigRepo.getStripeConfig).mockResolvedValue(ok(mockedStripeConfig));

    // Set up default createPaymentIntent mock
    vi.mocked(mockedStripePaymentIntentsApi.createPaymentIntent).mockResolvedValue(
      ok({
        id: "pi_test",
        amount: 100,
        currency: "usd",
        client_secret: "secret-value",
        status: "requires_payment_method",
      } as Stripe.PaymentIntent),
    );
  });

  it.each([
    {
      actionType: "CHARGE" as const,
      captureMethod: undefined,
    },
    {
      actionType: "AUTHORIZATION" as const,
      captureMethod: "manual",
    },
  ])(
    "Calls Stripe PaymentIntentsAPI to create payment intent with $captureMethod capture method for card when actionType is $actionType",
    async ({ actionType, captureMethod }) => {
      const saleorEvent = getMockedTransactionInitializeSessionEvent({ actionType });

      const spy = vi
        .spyOn(mockedStripePaymentIntentsApi, "createPaymentIntent")
        .mockImplementationOnce(async () =>
          ok({
            amount: 100,
            currency: "usd",
            client_secret: "secret-value",
            id: "pi_test",
            status: "requires_payment_method",
          } as Stripe.PaymentIntent),
        );

      const uc = createUseCase();

      await uc.execute({
        saleorApiUrl: mockedSaleorApiUrl,
        appId: mockedSaleorAppId,
        event: saleorEvent,
      });

      expect(spy).toHaveBeenCalledWith({
        stripeMoney: expect.any(StripeMoney),
        idempotencyKey: saleorEvent.idempotencyKey,
        stripeAccount: undefined, // No vendor account for channel-based payments
        intentParams: {
          automatic_payment_methods: {
            enabled: true,
          },
          payment_method_options: {
            card: {
              capture_method: captureMethod,
            },
          },
        },
        metadata: {
          saleor_source_id: saleorEvent.sourceObject.id,
          saleor_source_type: saleorEvent.sourceObject.__typename,
          saleor_transaction_id: saleorEvent.transaction.id,
        },
      });

      expect(spy.mock.calls[0][0].stripeMoney.amount).toBe(10000);
      expect(spy.mock.calls[0][0].stripeMoney.currency).toBe("usd");
    },
  );

  it("Passes vendor stripe account ID when vendor is resolved", async () => {
    const saleorEvent = getMockedTransactionInitializeSessionEvent({ actionType: "CHARGE" });
    const vendorStripeAccountId = "acct_vendor123";

    // Mock vendor resolution to return a vendor with Stripe account
    mockedVendorResolver.resolveVendorForPayment = vi.fn().mockResolvedValue(
      ok({
        vendor: {
          id: "vendor-123",
          title: "Test Vendor",
          slug: "test-vendor",
          stripeAccountId: vendorStripeAccountId,
          metadata: [],
        },
        stripeAccountId: vendorStripeAccountId,
        resolutionMethod: "vendor-specific",
      }),
    );

    const spy = vi
      .spyOn(mockedStripePaymentIntentsApi, "createPaymentIntent")
      .mockImplementationOnce(async () =>
        ok({
          amount: 100,
          currency: "usd",
          client_secret: "secret-value",
          id: "pi_test",
          status: "requires_payment_method",
        } as Stripe.PaymentIntent),
      );

    const uc = createUseCase();

    const result = await uc.execute({
      saleorApiUrl: mockedSaleorApiUrl,
      appId: mockedSaleorAppId,
      event: saleorEvent,
    });

    // Verify the response includes the vendor's Stripe account ID
    expect(result._unsafeUnwrap()).toBeInstanceOf(
      TransactionInitializeSessionUseCaseResponses.Success,
    );
    const successResponse = result._unsafeUnwrap() as InstanceType<typeof TransactionInitializeSessionUseCaseResponses.Success>;
    expect(successResponse.stripeAccount).toBe(vendorStripeAccountId);

    expect(spy).toHaveBeenCalledWith({
      stripeMoney: expect.any(StripeMoney),
      idempotencyKey: saleorEvent.idempotencyKey,
      stripeAccount: vendorStripeAccountId, // Vendor account should be passed
      intentParams: {
        automatic_payment_methods: {
          enabled: true,
        },
        payment_method_options: {
          card: {
            capture_method: undefined,
          },
        },
      },
      metadata: {
        saleor_source_id: saleorEvent.sourceObject.id,
        saleor_source_type: saleorEvent.sourceObject.__typename,
        saleor_transaction_id: saleorEvent.transaction.id,
      },
    });
  });

  it("Does not include vendor stripe account ID when no vendor is resolved", async () => {
    const saleorEvent = getMockedTransactionInitializeSessionEvent({ actionType: "CHARGE" });

    // Mock vendor resolution to return null (no vendor)
    mockedVendorResolver.resolveVendorForPayment = vi.fn().mockResolvedValue(ok(null));

    const spy = vi
      .spyOn(mockedStripePaymentIntentsApi, "createPaymentIntent")
      .mockImplementationOnce(async () =>
        ok({
          amount: 100,
          currency: "usd",
          client_secret: "secret-value",
          id: "pi_test",
          status: "requires_payment_method",
        } as Stripe.PaymentIntent),
      );

    const uc = createUseCase();

    const result = await uc.execute({
      saleorApiUrl: mockedSaleorApiUrl,
      appId: mockedSaleorAppId,
      event: saleorEvent,
    });

    // Verify the response does NOT include a Stripe account ID (main account used)
    expect(result._unsafeUnwrap()).toBeInstanceOf(
      TransactionInitializeSessionUseCaseResponses.Success,
    );
    const successResponse = result._unsafeUnwrap() as InstanceType<typeof TransactionInitializeSessionUseCaseResponses.Success>;
    expect(successResponse.stripeAccount).toBeUndefined();

    // Verify Stripe API was called without vendor account
    expect(spy).toHaveBeenCalledWith({
      stripeMoney: expect.any(StripeMoney),
      idempotencyKey: saleorEvent.idempotencyKey,
      stripeAccount: undefined, // No vendor account should be passed
      intentParams: {
        automatic_payment_methods: {
          enabled: true,
        },
        payment_method_options: {
          card: {
            capture_method: undefined,
          },
        },
      },
      metadata: {
        saleor_source_id: saleorEvent.sourceObject.id,
        saleor_source_type: saleorEvent.sourceObject.__typename,
        saleor_transaction_id: saleorEvent.transaction.id,
      },
    });
  });

  it.each([
    {
      actionType: "CHARGE" as const,
      expectedSuccessResponse: TransactionInitializeSessionUseCaseResponses.Success,
      expectedResultType: ChargeActionRequiredResult,
    },
    {
      actionType: "AUTHORIZATION" as const,
      expectedSuccessResponse: TransactionInitializeSessionUseCaseResponses.Success,
      expectedResultType: AuthorizationActionRequiredResult,
    },
  ])(
    "Returns $expectedSuccessResponse.name response with $expectedResultType.name result if Stripe PaymentIntentsAPI successfully responds and actionType is $actionType",
    async ({ actionType, expectedSuccessResponse, expectedResultType }) => {
      const saleorEvent = getMockedTransactionInitializeSessionEvent({ actionType });

      vi.spyOn(mockedStripePaymentIntentsApi, "createPaymentIntent").mockImplementationOnce(
        async () =>
          ok({
            amount: 100,
            currency: "usd",
            client_secret: "secret-value",
            id: "pi_test",
            status: "requires_payment_method",
          } as Stripe.PaymentIntent),
      );
      const uc = createUseCase();

      const responsePayload = await uc.execute({
        saleorApiUrl: mockedSaleorApiUrl,
        appId: mockedSaleorAppId,
        event: saleorEvent,
      });

      expect(responsePayload._unsafeUnwrap()).toBeInstanceOf(expectedSuccessResponse);
      expect(responsePayload._unsafeUnwrap().transactionResult).toBeInstanceOf(expectedResultType);
    },
  );

  it("Returns 'MissingConfigErrorResponse' if config not found for specified channel", async () => {
    const spy = vi
      .spyOn(mockedAppConfigRepo, "getStripeConfig")
      .mockImplementationOnce(async () => ok(null));

    const uc = createUseCase();

    const responsePayload = await uc.execute({
      saleorApiUrl: mockedSaleorApiUrl,
      appId: mockedSaleorAppId,
      event: getMockedTransactionInitializeSessionEvent(),
    });

    const err = responsePayload._unsafeUnwrapErr();

    expect(spy).toHaveBeenCalledOnce();

    expect(err).toBeInstanceOf(AppIsNotConfiguredResponse);
  });

  it.each([
    {
      actionType: "CHARGE" as const,
      expectedFailureResponse: TransactionInitializeSessionUseCaseResponses.Failure,
      expectedResultType: ChargeFailureResult,
    },
    {
      actionType: "AUTHORIZATION" as const,
      expectedFailureResponse: TransactionInitializeSessionUseCaseResponses.Failure,
      expectedResultType: AuthorizationFailureResult,
    },
  ])(
    "Returns $expectedFailureResponse.name response with $expectedResultType.name result if StripePaymentIntentsAPI throws error and actionType is $actionType",
    async ({ actionType, expectedFailureResponse, expectedResultType }) => {
      vi.spyOn(mockedStripePaymentIntentsApi, "createPaymentIntent").mockImplementationOnce(
        async () => err(new StripeAPIError("Error from Stripe API")),
      );

      const uc = createUseCase();

      const saleorEvent = getMockedTransactionInitializeSessionEvent({ actionType });

      const responsePayload = await uc.execute({
        saleorApiUrl: mockedSaleorApiUrl,
        appId: mockedSaleorAppId,
        event: saleorEvent,
      });

      expect(responsePayload._unsafeUnwrap()).toBeInstanceOf(expectedFailureResponse);
      expect(responsePayload._unsafeUnwrap().transactionResult).toBeInstanceOf(expectedResultType);
    },
  );

  it.each([
    {
      actionType: "CHARGE" as const,
      expectedFailureResponse: TransactionInitializeSessionUseCaseResponses.Failure,
      expectedResultType: ChargeFailureResult,
    },
    {
      actionType: "AUTHORIZATION" as const,
      expectedFailureResponse: TransactionInitializeSessionUseCaseResponses.Failure,
      expectedResultType: AuthorizationFailureResult,
    },
  ])(
    "Returns $expectedFailureResponse.name response with $expectedResultType.name result when receives not supported payment method in data and actionType is $actionType",
    async ({ actionType, expectedFailureResponse, expectedResultType }) => {
      const eventWithNotSupportedPaymentMethod = {
        ...getMockedTransactionInitializeSessionEvent({ actionType }),
        data: {
          paymentIntent: {
            paymentMethod: "not-supported-payment-method",
          },
        },
      };

      const uc = createUseCase();

      const responsePayload = await uc.execute({
        saleorApiUrl: mockedSaleorApiUrl,
        appId: mockedSaleorAppId,
        event: eventWithNotSupportedPaymentMethod,
      });

      expect(responsePayload._unsafeUnwrap()).toBeInstanceOf(expectedFailureResponse);
      expect(responsePayload._unsafeUnwrap().transactionResult).toBeInstanceOf(expectedResultType);
    },
  );

  it.each([
    {
      actionType: "CHARGE" as const,
      expectedFailureResponse: TransactionInitializeSessionUseCaseResponses.Failure,
      expectedResultType: ChargeFailureResult,
    },
    {
      actionType: "AUTHORIZATION" as const,
      expectedFailureResponse: TransactionInitializeSessionUseCaseResponses.Failure,
      expectedResultType: AuthorizationFailureResult,
    },
  ])(
    "Returns $expectedFailureResponse.name response with $expectedResultType.name result when receives additional field in data and actionType is $actionType",
    async ({ actionType, expectedFailureResponse, expectedResultType }) => {
      const eventWithAdditionalFieldinData = {
        ...getMockedTransactionInitializeSessionEvent({ actionType }),
        data: {
          paymentIntent: {
            paymentMethod: "card",
            addtionalField: "value",
          },
        },
      };

      const uc = createUseCase();

      const responsePayload = await uc.execute({
        saleorApiUrl: mockedSaleorApiUrl,
        appId: mockedSaleorAppId,
        event: eventWithAdditionalFieldinData,
      });

      expect(responsePayload._unsafeUnwrap()).toBeInstanceOf(expectedFailureResponse);
      expect(responsePayload._unsafeUnwrap().transactionResult).toBeInstanceOf(expectedResultType);
    },
  );

  it("Returns 'MalformedRequestResponse' when currency coming from Saleor is not supported", async () => {
    const saleorEvent = {
      ...getMockedTransactionInitializeSessionEvent(),
      action: {
        amount: 100,
        currency: "ABC",
        actionType: "CHARGE" as const,
      },
    };

    const uc = createUseCase();

    const result = await uc.execute({
      saleorApiUrl: mockedSaleorApiUrl,
      appId: mockedSaleorAppId,
      event: saleorEvent,
    });

    expect(result._unsafeUnwrapErr()).toBeInstanceOf(MalformedRequestResponse);
  });

  it("Returns 'BrokenAppResponse' when currency coming from Stripe is not supported", async () => {
    const saleorEvent = getMockedTransactionInitializeSessionEvent();

    vi.spyOn(mockedStripePaymentIntentsApi, "createPaymentIntent").mockImplementationOnce(
      async () =>
        ok({
          amount: 100,
          currency: "abc",
          status: "requires_payment_method",
        } as Stripe.PaymentIntent),
    );

    const uc = createUseCase();

    const result = await uc.execute({
      saleorApiUrl: mockedSaleorApiUrl,
      appId: mockedSaleorAppId,
      event: saleorEvent,
    });

    expect(result._unsafeUnwrapErr()).toBeInstanceOf(BrokenAppResponse);
  });

  it("Returns 'BrokenAppResponse' when Stripe PaymentIntentsAPI didn't returned required client_secret field", async () => {
    const saleorEvent = getMockedTransactionInitializeSessionEvent();

    vi.spyOn(mockedStripePaymentIntentsApi, "createPaymentIntent").mockImplementationOnce(
      async () =>
        ok({
          amount: 100,
          currency: "usd",
          id: "pi_test",
          status: "requires_payment_method",
        } as Stripe.PaymentIntent),
    );

    const uc = createUseCase();

    const result = await uc.execute({
      saleorApiUrl: mockedSaleorApiUrl,
      appId: mockedSaleorAppId,
      event: saleorEvent,
    });

    expect(result._unsafeUnwrapErr()).toBeInstanceOf(BrokenAppResponse);
  });

  it("Returns 'BrokenAppResponse' when Stripe PaymentIntentsAPI didn't returned required payment id", async () => {
    const saleorEvent = getMockedTransactionInitializeSessionEvent();

    vi.spyOn(mockedStripePaymentIntentsApi, "createPaymentIntent").mockImplementationOnce(
      async () =>
        ok({
          amount: 100,
          currency: "usd",
          client_secret: "secret-value",
          status: "requires_payment_method",
        } as Stripe.PaymentIntent),
    );

    const uc = createUseCase();

    const result = await uc.execute({
      saleorApiUrl: mockedSaleorApiUrl,
      appId: mockedSaleorAppId,
      event: saleorEvent,
    });

    expect(result._unsafeUnwrapErr()).toBeInstanceOf(BrokenAppResponse);
  });

  it("Returns 'BrokenAppResponse' when TransactionRecorderRepo returns error", async () => {
    const saleorEvent = getMockedTransactionInitializeSessionEvent();
    const transactionRecorder = new MockedTransactionRecorder();

    vi.spyOn(transactionRecorder, "recordTransaction").mockImplementationOnce(async () =>
      err(new TransactionRecorderError.TransactionMissingError("Transaction recorder error")),
    );

    vi.spyOn(mockedStripePaymentIntentsApi, "createPaymentIntent").mockImplementationOnce(
      async () =>
        ok({
          amount: 100,
          currency: "usd",
          client_secret: "secret-value",
          status: "requires_payment_method",
        } as Stripe.PaymentIntent),
    );

    const uc = new TransactionInitializeSessionUseCase({
      appConfigRepo: mockedAppConfigRepo,
      stripePaymentIntentsApiFactory,
      transactionRecorder,
      vendorResolver: mockedVendorResolver,
    });

    const result = await uc.execute({
      saleorApiUrl: mockedSaleorApiUrl,
      appId: mockedSaleorAppId,
      event: saleorEvent,
    });

    expect(result._unsafeUnwrapErr()).toBeInstanceOf(BrokenAppResponse);
  });

  it.each([
    {
      actionType: "CHARGE" as const,
    },
    {
      actionType: "AUTHORIZATION" as const,
    },
  ])(
    "Calls TransactionRecorderRepo with resolved data when handling $actionType action",
    async ({ actionType }) => {
      const saleorEvent = getMockedTransactionInitializeSessionEvent({ actionType });
      const transactionRecorder = new MockedTransactionRecorder();

      vi.spyOn(transactionRecorder, "recordTransaction");

      vi.spyOn(mockedStripePaymentIntentsApi, "createPaymentIntent").mockImplementation(async () =>
        ok({
          amount: 100,
          currency: "usd",
          client_secret: "secret-value",
          id: "pi_test",
          status: "requires_payment_method",
        } as Stripe.PaymentIntent),
      );

      const uc = new TransactionInitializeSessionUseCase({
        appConfigRepo: mockedAppConfigRepo,
        stripePaymentIntentsApiFactory,
        transactionRecorder,
        vendorResolver: mockedVendorResolver,
      });

      await uc.execute({
        saleorApiUrl: mockedSaleorApiUrl,
        appId: mockedSaleorAppId,
        event: saleorEvent,
      });

      expect(transactionRecorder.recordTransaction).toHaveBeenCalledWith(
        {
          saleorApiUrl: mockedSaleorApiUrl,
          appId: mockedSaleorAppId,
        },
        {
          resolvedTransactionFlow: actionType,
          saleorTransactionFlow: actionType,
          saleorTransactionId: "mocked-transaction-id",
          selectedPaymentMethod: "card",
          stripePaymentIntentId: "pi_test",
        },
      );
    },
  );

  describe("return_url functionality", () => {
    it("should include returnUrl in response when app URL is provided", async () => {
      const saleorEvent = getMockedTransactionInitializeSessionEvent();
      const appUrl = "https://app.example.com";

      const useCase = createUseCase();
      const result = await useCase.execute({
        appId: mockedSaleorAppId,
        saleorApiUrl: mockedSaleorApiUrl,
        event: saleorEvent,
        appUrl,
      });

      expect(result.isOk()).toBe(true);
      const response = result._unsafeUnwrap();

      expect(response).toBeInstanceOf(TransactionInitializeSessionUseCaseResponses.Success);
      const successResponse = response as InstanceType<
        typeof TransactionInitializeSessionUseCaseResponses.Success
      >;

      expect(successResponse.returnUrl).toBeDefined();
      expect(successResponse.returnUrl).toContain("/api/stripe/return");
      expect(successResponse.returnUrl).toContain("app_id=" + mockedSaleorAppId);
      expect(successResponse.returnUrl).toContain("saleor_api_url=");
      expect(successResponse.returnUrl).toContain(
        "channel_id=" + saleorEvent.sourceObject.channel.id,
      );
    });

    it("should include order ID in returnUrl for Order source objects", async () => {
      const orderId = "order_123";
      const saleorEvent = getMockedTransactionInitializeSessionEvent();

      // Override the source object to be an Order instead of Checkout
      const orderEvent = {
        ...saleorEvent,
        sourceObject: {
          ...saleorEvent.sourceObject,
          id: orderId,
          __typename: "Order" as const,
          metadata: [],
        },
      };
      const appUrl = "https://app.example.com";

      const useCase = createUseCase();
      const result = await useCase.execute({
        appId: mockedSaleorAppId,
        saleorApiUrl: mockedSaleorApiUrl,
        event: orderEvent,
        appUrl,
      });

      expect(result.isOk()).toBe(true);
      const response = result._unsafeUnwrap();

      expect(response).toBeInstanceOf(TransactionInitializeSessionUseCaseResponses.Success);
      const successResponse = response as InstanceType<
        typeof TransactionInitializeSessionUseCaseResponses.Success
      >;

      expect(successResponse.returnUrl).toBeDefined();
      expect(successResponse.returnUrl).toContain("order_id=" + orderId);
    });

    it("should not include returnUrl when app URL is not provided", async () => {
      const saleorEvent = getMockedTransactionInitializeSessionEvent();

      const useCase = createUseCase();
      const result = await useCase.execute({
        appId: mockedSaleorAppId,
        saleorApiUrl: mockedSaleorApiUrl,
        event: saleorEvent,
        // No appUrl provided - explicitly undefined
        appUrl: undefined,
      });

      expect(result.isOk()).toBe(true);
      const response = result._unsafeUnwrap();

      expect(response).toBeInstanceOf(TransactionInitializeSessionUseCaseResponses.Success);
      const successResponse = response as InstanceType<
        typeof TransactionInitializeSessionUseCaseResponses.Success
      >;

      expect(successResponse.returnUrl).toBeUndefined();
    });

    it("should properly encode returnUrl parameters", async () => {
      const saleorEvent = getMockedTransactionInitializeSessionEvent();
      const appUrl = "https://app.example.com";
      const expectedSaleorApiUrl = encodeURIComponent(mockedSaleorApiUrl);

      const useCase = createUseCase();
      const result = await useCase.execute({
        appId: mockedSaleorAppId,
        saleorApiUrl: mockedSaleorApiUrl,
        event: saleorEvent,
        appUrl,
      });

      expect(result.isOk()).toBe(true);
      const response = result._unsafeUnwrap();

      expect(response).toBeInstanceOf(TransactionInitializeSessionUseCaseResponses.Success);
      const successResponse = response as InstanceType<
        typeof TransactionInitializeSessionUseCaseResponses.Success
      >;

      expect(successResponse.returnUrl).toBeDefined();

      const returnUrl = successResponse.returnUrl!;

      expect(returnUrl).toContain(`saleor_api_url=${expectedSaleorApiUrl}`);

      // Parse URL to verify it's valid
      const url = new URL(returnUrl);

      expect(url.pathname).toBe("/api/stripe/return");
      expect(url.searchParams.get("app_id")).toBe(mockedSaleorAppId);
      expect(url.searchParams.get("saleor_api_url")).toBe(mockedSaleorApiUrl);
      expect(url.searchParams.get("channel_id")).toBe(saleorEvent.sourceObject.channel.id);
    });

    it("should include returnUrl for iDEAL payment method", async () => {
      // Create event with ideal payment method - data should be the parsed object
      const idealData = parseTransactionInitializeSessionEventData({
        paymentIntent: {
          paymentMethod: "ideal",
        },
      })._unsafeUnwrap();

      const saleorEvent = getMockedTransactionInitializeSessionEvent({
        data: idealData,
      });
      const appUrl = "https://app.example.com";

      const useCase = createUseCase();
      const result = await useCase.execute({
        appId: mockedSaleorAppId,
        saleorApiUrl: mockedSaleorApiUrl,
        event: saleorEvent,
        appUrl,
      });

      expect(result.isOk()).toBe(true);
      const response = result._unsafeUnwrap();

      expect(response).toBeInstanceOf(TransactionInitializeSessionUseCaseResponses.Success);
      const successResponse = response as InstanceType<
        typeof TransactionInitializeSessionUseCaseResponses.Success
      >;

      expect(successResponse.returnUrl).toBeDefined();
      expect(successResponse.returnUrl).toContain("/api/stripe/return");
    });
  });
});
