import { err, ok } from "neverthrow";
import Stripe from "stripe";
import { describe, expect, it, vi } from "vitest";

import { mockedAppConfigRepo } from "@/__tests__/mocks/app-config-repo";
import { mockedSaleorAppId } from "@/__tests__/mocks/constants";
import { mockedStripePaymentIntentsApi } from "@/__tests__/mocks/mocked-stripe-payment-intents-api";
import { MockedTransactionRecorder } from "@/__tests__/mocks/mocked-transaction-recorder";
import { mockedSaleorApiUrl } from "@/__tests__/mocks/saleor-api-url";
import { getMockedTransactionInitializeSessionEvent } from "@/__tests__/mocks/transaction-initialize-session-event";
import {
  AppIsNotConfiguredResponse,
  BrokenAppResponse,
  MalformedRequestResponse,
} from "@/modules/saleor/saleor-webhook-responses";
import { StripeAPIError } from "@/modules/stripe/stripe-api-error";
import { StripeMoney } from "@/modules/stripe/stripe-money";
import { IStripePaymentIntentsApiFactory } from "@/modules/stripe/types";
import {
  AuthorizationActionRequiredResult,
  ChargeActionRequiredResult,
} from "@/modules/transaction-result/action-required-result";
import { TransactionRecorderError } from "@/modules/transactions-recording/repositories/transaction-recorder-repo";

import {
  TransactionInitializeAuthorizationFailureResult,
  TransactionInitializeChargeFailureResult,
} from "./failure-result";
import { TransactionInitializeSessionUseCase } from "./use-case";
import { TransactionInitializeSessionUseCaseResponses } from "./use-case-response";

describe("TransactionInitializeSessionUseCase", () => {
  const stripePaymentIntentsApiFactory = {
    create: () => mockedStripePaymentIntentsApi,
  } satisfies IStripePaymentIntentsApiFactory;

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

      const uc = new TransactionInitializeSessionUseCase({
        appConfigRepo: mockedAppConfigRepo,
        stripePaymentIntentsApiFactory,
        transactionRecorder: new MockedTransactionRecorder(),
      });

      await uc.execute({
        saleorApiUrl: mockedSaleorApiUrl,
        appId: mockedSaleorAppId,
        event: saleorEvent,
      });

      expect(spy).toHaveBeenCalledWith({
        stripeMoney: expect.any(StripeMoney),
        idempotencyKey: saleorEvent.idempotencyKey,
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
      });
    },
  );

  it.each([
    {
      actionType: "CHARGE" as const,
      expectedSuccessResponse: TransactionInitializeSessionUseCaseResponses.Success,
      extectedResultType: ChargeActionRequiredResult,
    },
    {
      actionType: "AUTHORIZATION" as const,
      expectedSuccessResponse: TransactionInitializeSessionUseCaseResponses.Success,
      extectedResultType: AuthorizationActionRequiredResult,
    },
  ])(
    "Returns $expectedSuccessResponse.name response with $extectedResultType.name result if Stripe PaymentIntentsAPI successfully responds and actionType is $actionType",
    async ({ actionType, expectedSuccessResponse, extectedResultType }) => {
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
      const uc = new TransactionInitializeSessionUseCase({
        appConfigRepo: mockedAppConfigRepo,
        stripePaymentIntentsApiFactory,
        transactionRecorder: new MockedTransactionRecorder(),
      });

      const responsePayload = await uc.execute({
        saleorApiUrl: mockedSaleorApiUrl,
        appId: mockedSaleorAppId,
        event: saleorEvent,
      });

      expect(responsePayload._unsafeUnwrap()).toBeInstanceOf(expectedSuccessResponse);
      expect(responsePayload._unsafeUnwrap().transactionResult).toBeInstanceOf(extectedResultType);
    },
  );

  it("Returns 'MissingConfigErrorResponse' if config not found for specified channel", async () => {
    const spy = vi
      .spyOn(mockedAppConfigRepo, "getStripeConfig")
      .mockImplementationOnce(async () => ok(null));

    const uc = new TransactionInitializeSessionUseCase({
      appConfigRepo: mockedAppConfigRepo,
      stripePaymentIntentsApiFactory,
      transactionRecorder: new MockedTransactionRecorder(),
    });

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
      extectedResultType: TransactionInitializeChargeFailureResult,
    },
    {
      actionType: "AUTHORIZATION" as const,
      expectedFailureResponse: TransactionInitializeSessionUseCaseResponses.Failure,
      extectedResultType: TransactionInitializeAuthorizationFailureResult,
    },
  ])(
    "Returns $expectedFailureResponse.name response with $extectedResultType.name result if StripePaymentIntentsAPI throws error and actionType is $actionType",
    async ({ actionType, expectedFailureResponse, extectedResultType }) => {
      vi.spyOn(mockedStripePaymentIntentsApi, "createPaymentIntent").mockImplementationOnce(
        async () => err(new StripeAPIError("Error from Stripe API")),
      );

      const uc = new TransactionInitializeSessionUseCase({
        appConfigRepo: mockedAppConfigRepo,
        stripePaymentIntentsApiFactory,
        transactionRecorder: new MockedTransactionRecorder(),
      });

      const saleorEvent = getMockedTransactionInitializeSessionEvent({ actionType });

      const responsePayload = await uc.execute({
        saleorApiUrl: mockedSaleorApiUrl,
        appId: mockedSaleorAppId,
        event: saleorEvent,
      });

      expect(responsePayload._unsafeUnwrap()).toBeInstanceOf(expectedFailureResponse);
      expect(responsePayload._unsafeUnwrap().transactionResult).toBeInstanceOf(extectedResultType);
    },
  );

  it.each([
    {
      actionType: "CHARGE" as const,
      expectedFailureResponse: TransactionInitializeSessionUseCaseResponses.Failure,
      extectedResultType: TransactionInitializeChargeFailureResult,
    },
    {
      actionType: "AUTHORIZATION" as const,
      expectedFailureResponse: TransactionInitializeSessionUseCaseResponses.Failure,
      extectedResultType: TransactionInitializeAuthorizationFailureResult,
    },
  ])(
    "Returns $expectedFailureResponse.name response with $extectedResultType.name result when receives not supported payment method in data and actionType is $actionType",
    async ({ actionType, expectedFailureResponse, extectedResultType }) => {
      const eventWithNotSupportedPaymentMethod = {
        ...getMockedTransactionInitializeSessionEvent({ actionType }),
        data: {
          paymentIntent: {
            paymentMethod: "not-supported-payment-method",
          },
        },
      };

      const uc = new TransactionInitializeSessionUseCase({
        appConfigRepo: mockedAppConfigRepo,
        stripePaymentIntentsApiFactory,
        transactionRecorder: new MockedTransactionRecorder(),
      });

      const responsePayload = await uc.execute({
        saleorApiUrl: mockedSaleorApiUrl,
        appId: mockedSaleorAppId,
        event: eventWithNotSupportedPaymentMethod,
      });

      expect(responsePayload._unsafeUnwrap()).toBeInstanceOf(expectedFailureResponse);
      expect(responsePayload._unsafeUnwrap().transactionResult).toBeInstanceOf(extectedResultType);
    },
  );

  it.each([
    {
      actionType: "CHARGE" as const,
      expectedFailureResponse: TransactionInitializeSessionUseCaseResponses.Failure,
      extectedResultType: TransactionInitializeChargeFailureResult,
    },
    {
      actionType: "AUTHORIZATION" as const,
      expectedFailureResponse: TransactionInitializeSessionUseCaseResponses.Failure,
      extectedResultType: TransactionInitializeAuthorizationFailureResult,
    },
  ])(
    "Returns $expectedFailureResponse.name response with $extectedResultType.name result when receives additional field in data and actionType is $actionType",
    async ({ actionType, expectedFailureResponse, extectedResultType }) => {
      const eventWithAdditionalFieldinData = {
        ...getMockedTransactionInitializeSessionEvent({ actionType }),
        data: {
          paymentIntent: {
            paymentMethod: "card",
            addtionalField: "value",
          },
        },
      };

      const uc = new TransactionInitializeSessionUseCase({
        appConfigRepo: mockedAppConfigRepo,
        stripePaymentIntentsApiFactory,
        transactionRecorder: new MockedTransactionRecorder(),
      });

      const responsePayload = await uc.execute({
        saleorApiUrl: mockedSaleorApiUrl,
        appId: mockedSaleorAppId,
        event: eventWithAdditionalFieldinData,
      });

      expect(responsePayload._unsafeUnwrap()).toBeInstanceOf(expectedFailureResponse);
      expect(responsePayload._unsafeUnwrap().transactionResult).toBeInstanceOf(extectedResultType);
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

    const uc = new TransactionInitializeSessionUseCase({
      appConfigRepo: mockedAppConfigRepo,
      stripePaymentIntentsApiFactory,
      transactionRecorder: new MockedTransactionRecorder(),
    });

    await expect(
      uc.execute({
        saleorApiUrl: mockedSaleorApiUrl,
        appId: mockedSaleorAppId,
        event: saleorEvent,
      }),
    ).resolves.toStrictEqual(err(new MalformedRequestResponse()));
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

    const uc = new TransactionInitializeSessionUseCase({
      appConfigRepo: mockedAppConfigRepo,
      stripePaymentIntentsApiFactory,
      transactionRecorder: new MockedTransactionRecorder(),
    });

    await expect(
      uc.execute({
        saleorApiUrl: mockedSaleorApiUrl,
        appId: mockedSaleorAppId,
        event: saleorEvent,
      }),
    ).resolves.toStrictEqual(err(new BrokenAppResponse()));
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

    const uc = new TransactionInitializeSessionUseCase({
      appConfigRepo: mockedAppConfigRepo,
      stripePaymentIntentsApiFactory,
      transactionRecorder: new MockedTransactionRecorder(),
    });

    await expect(
      uc.execute({
        saleorApiUrl: mockedSaleorApiUrl,
        appId: mockedSaleorAppId,
        event: saleorEvent,
      }),
    ).resolves.toStrictEqual(err(new BrokenAppResponse()));
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

    const uc = new TransactionInitializeSessionUseCase({
      appConfigRepo: mockedAppConfigRepo,
      stripePaymentIntentsApiFactory,
      transactionRecorder: new MockedTransactionRecorder(),
    });

    await expect(
      uc.execute({
        saleorApiUrl: mockedSaleorApiUrl,
        appId: mockedSaleorAppId,
        event: saleorEvent,
      }),
    ).resolves.toStrictEqual(err(new BrokenAppResponse()));
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
    });

    await expect(
      uc.execute({
        saleorApiUrl: mockedSaleorApiUrl,
        appId: mockedSaleorAppId,
        event: saleorEvent,
      }),
    ).resolves.toStrictEqual(err(new BrokenAppResponse()));
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
});
