import { err, ok } from "neverthrow";
import Stripe from "stripe";
import { describe, expect, it, vi } from "vitest";

import { mockedAppConfigRepo } from "@/__tests__/mocks/app-config-repo";
import { mockedSaleorAppId } from "@/__tests__/mocks/constants";
import { MockedTransactionRecorder } from "@/__tests__/mocks/mocked-transaction-recorder";
import { mockedSaleorApiUrl } from "@/__tests__/mocks/saleor-api-url";
import { getMockedTransactionInitializeSessionEvent } from "@/__tests__/mocks/transaction-initialize-session-event";
import {
  AppIsNotConfiguredResponse,
  BrokenAppResponse,
  MalformedRequestResponse,
} from "@/modules/saleor/saleor-webhook-responses";
import { StripeAPIError } from "@/modules/stripe/stripe-payment-intent-api-error";
import { IStripePaymentIntentsApiFactory } from "@/modules/stripe/types";
import { TransactionRecorderError } from "@/modules/transactions-recording/repositories/transaction-recorder-repo";

import { TransactionInitializeSessionUseCase } from "./use-case";
import { TransactionInitalizeSessionUseCaseResponses } from "./use-case-response";

describe("TransactionInitializeSessionUseCase", () => {
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
      const createPaymentIntent = vi.fn(async () =>
        ok({
          amount: 100,
          currency: "usd",
          client_secret: "secret-value",
          id: "pi_test",
        } as Stripe.PaymentIntent),
      );
      const testStripePaymentsIntentsApiFactory: IStripePaymentIntentsApiFactory = {
        create: () => ({
          createPaymentIntent,
          getPaymentIntent: vi.fn(),
        }),
      };

      const uc = new TransactionInitializeSessionUseCase({
        appConfigRepo: mockedAppConfigRepo,
        stripePaymentIntentsApiFactory: testStripePaymentsIntentsApiFactory,
        transactionRecorder: new MockedTransactionRecorder(),
      });

      await uc.execute({
        saleorApiUrl: mockedSaleorApiUrl,
        appId: mockedSaleorAppId,
        event: saleorEvent,
      });

      expect(createPaymentIntent).toHaveBeenCalledWith({
        params: {
          // Saleor API sends amount in floats - Stripe wants amount in ints
          amount: saleorEvent.action.amount * 100,
          currency: "usd",
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
      expectedSuccessResponse: TransactionInitalizeSessionUseCaseResponses.ChargeActionRequired,
    },
    {
      actionType: "AUTHORIZATION" as const,
      expectedSuccessResponse:
        TransactionInitalizeSessionUseCaseResponses.AuthorizationActionRequired,
    },
  ])(
    "Returns $expectedSuccessResponse.name response if Stripe PaymentIntentsAPI successfully responds and actionType is $actionType",
    async ({ actionType, expectedSuccessResponse }) => {
      const saleorEvent = getMockedTransactionInitializeSessionEvent({ actionType });
      const createPaymentIntent = vi.fn(async () =>
        ok({
          amount: 100,
          currency: "usd",
          client_secret: "secret-value",
          id: "pi_test",
        } as Stripe.PaymentIntent),
      );
      const testStripePaymentsIntentsApiFactory: IStripePaymentIntentsApiFactory = {
        create: () => ({
          createPaymentIntent,
          getPaymentIntent: vi.fn(),
        }),
      };

      const uc = new TransactionInitializeSessionUseCase({
        appConfigRepo: mockedAppConfigRepo,
        stripePaymentIntentsApiFactory: testStripePaymentsIntentsApiFactory,
        transactionRecorder: new MockedTransactionRecorder(),
      });

      const responsePayload = await uc.execute({
        saleorApiUrl: mockedSaleorApiUrl,
        appId: mockedSaleorAppId,
        event: saleorEvent,
      });

      expect(responsePayload._unsafeUnwrap()).toBeInstanceOf(expectedSuccessResponse);
    },
  );

  it("Returns 'MissingConfigErrorResponse' if config not found for specified channel", async () => {
    const spy = vi
      .spyOn(mockedAppConfigRepo, "getStripeConfig")
      .mockImplementationOnce(async () => ok(null));

    const testStripePaymentsIntentsApiFactory: IStripePaymentIntentsApiFactory = {
      create: () => ({
        createPaymentIntent: vi.fn(async () => ok({} as Stripe.PaymentIntent)),
        getPaymentIntent: vi.fn(),
      }),
    };

    const uc = new TransactionInitializeSessionUseCase({
      appConfigRepo: mockedAppConfigRepo,
      stripePaymentIntentsApiFactory: testStripePaymentsIntentsApiFactory,
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
      expectedFailureResponse: TransactionInitalizeSessionUseCaseResponses.ChargeFailure,
    },
    {
      actionType: "AUTHORIZATION" as const,
      expectedFailureResponse: TransactionInitalizeSessionUseCaseResponses.AuthorizationFailure,
    },
  ])(
    "Returns $expectedFailureResponse.name response if StripePaymentIntentsAPI throws error and actionType is $actionType",
    async ({ actionType, expectedFailureResponse }) => {
      const createPaymentIntent = vi.fn(async () =>
        err(new StripeAPIError("Error from Stripe API")),
      );
      const testStripePaymentsIntentsApiFactory: IStripePaymentIntentsApiFactory = {
        create: () => ({
          createPaymentIntent,
          getPaymentIntent: vi.fn(),
        }),
      };

      const uc = new TransactionInitializeSessionUseCase({
        appConfigRepo: mockedAppConfigRepo,
        stripePaymentIntentsApiFactory: testStripePaymentsIntentsApiFactory,
        transactionRecorder: new MockedTransactionRecorder(),
      });

      const saleorEvent = getMockedTransactionInitializeSessionEvent({ actionType });

      const responsePayload = await uc.execute({
        saleorApiUrl: mockedSaleorApiUrl,
        appId: mockedSaleorAppId,
        event: saleorEvent,
      });

      expect(responsePayload._unsafeUnwrap()).toBeInstanceOf(expectedFailureResponse);
    },
  );

  it.each([
    {
      actionType: "CHARGE" as const,
      expectedFailureResponse: TransactionInitalizeSessionUseCaseResponses.ChargeFailure,
    },
    {
      actionType: "AUTHORIZATION" as const,
      expectedFailureResponse: TransactionInitalizeSessionUseCaseResponses.AuthorizationFailure,
    },
  ])(
    "Returns $expectedFailureResponse.name response when receives not supported payment method in data and actionType is $actionType",
    async ({ actionType, expectedFailureResponse }) => {
      const testStripePaymentsIntentsApiFactory: IStripePaymentIntentsApiFactory = {
        create: () => ({
          createPaymentIntent: vi.fn(async () => ok({} as Stripe.PaymentIntent)),
          getPaymentIntent: vi.fn(),
        }),
      };

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
        stripePaymentIntentsApiFactory: testStripePaymentsIntentsApiFactory,
        transactionRecorder: new MockedTransactionRecorder(),
      });

      const responsePayload = await uc.execute({
        saleorApiUrl: mockedSaleorApiUrl,
        appId: mockedSaleorAppId,
        event: eventWithNotSupportedPaymentMethod,
      });

      expect(responsePayload._unsafeUnwrap()).toBeInstanceOf(expectedFailureResponse);
    },
  );

  it.each([
    {
      actionType: "CHARGE" as const,
      expectedFailureResponse: TransactionInitalizeSessionUseCaseResponses.ChargeFailure,
    },
    {
      actionType: "AUTHORIZATION" as const,
      expectedFailureResponse: TransactionInitalizeSessionUseCaseResponses.AuthorizationFailure,
    },
  ])(
    "Returns $expectedFailureResponse.name response when receives additional field in data and actionType is $actionType",
    async ({ actionType, expectedFailureResponse }) => {
      const testStripePaymentsIntentsApiFactory: IStripePaymentIntentsApiFactory = {
        create: () => ({
          createPaymentIntent: vi.fn(async () => ok({} as Stripe.PaymentIntent)),
          getPaymentIntent: vi.fn(),
        }),
      };

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
        stripePaymentIntentsApiFactory: testStripePaymentsIntentsApiFactory,
        transactionRecorder: new MockedTransactionRecorder(),
      });

      const responsePayload = await uc.execute({
        saleorApiUrl: mockedSaleorApiUrl,
        appId: mockedSaleorAppId,
        event: eventWithAdditionalFieldinData,
      });

      expect(responsePayload._unsafeUnwrap()).toBeInstanceOf(expectedFailureResponse);
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
    const createPaymentIntent = vi.fn(async () => ok({} as Stripe.PaymentIntent));
    const testStripePaymentsIntentsApiFactory: IStripePaymentIntentsApiFactory = {
      create: () => ({
        createPaymentIntent,
        getPaymentIntent: vi.fn(),
      }),
    };

    const uc = new TransactionInitializeSessionUseCase({
      appConfigRepo: mockedAppConfigRepo,
      stripePaymentIntentsApiFactory: testStripePaymentsIntentsApiFactory,
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
    const createPaymentIntent = vi.fn(async () =>
      ok({
        amount: 100,
        currency: "abc",
      } as Stripe.PaymentIntent),
    );
    const testStripePaymentsIntentsApiFactory: IStripePaymentIntentsApiFactory = {
      create: () => ({
        createPaymentIntent,
        getPaymentIntent: vi.fn(),
      }),
    };

    const uc = new TransactionInitializeSessionUseCase({
      appConfigRepo: mockedAppConfigRepo,
      stripePaymentIntentsApiFactory: testStripePaymentsIntentsApiFactory,
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
    const createPaymentIntent = vi.fn(async () =>
      ok({
        amount: 100,
        currency: "usd",
        id: "pi_test",
      } as Stripe.PaymentIntent),
    );
    const testStripePaymentsIntentsApiFactory: IStripePaymentIntentsApiFactory = {
      create: () => ({
        createPaymentIntent,
        getPaymentIntent: vi.fn(),
      }),
    };

    const uc = new TransactionInitializeSessionUseCase({
      appConfigRepo: mockedAppConfigRepo,
      stripePaymentIntentsApiFactory: testStripePaymentsIntentsApiFactory,
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
    const createPaymentIntent = vi.fn(async () =>
      ok({
        amount: 100,
        currency: "usd",
        client_secret: "secret-value",
      } as Stripe.PaymentIntent),
    );
    const testStripePaymentsIntentsApiFactory: IStripePaymentIntentsApiFactory = {
      create: () => ({
        createPaymentIntent,
        getPaymentIntent: vi.fn(),
      }),
    };

    const uc = new TransactionInitializeSessionUseCase({
      appConfigRepo: mockedAppConfigRepo,
      stripePaymentIntentsApiFactory: testStripePaymentsIntentsApiFactory,
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

    const createPaymentIntent = vi.fn(async () =>
      ok({
        amount: 100,
        currency: "usd",
        client_secret: "secret-value",
      } as Stripe.PaymentIntent),
    );
    const testStripePaymentsIntentsApiFactory: IStripePaymentIntentsApiFactory = {
      create: () => ({
        createPaymentIntent,
        getPaymentIntent: vi.fn(),
      }),
    };

    const uc = new TransactionInitializeSessionUseCase({
      appConfigRepo: mockedAppConfigRepo,
      stripePaymentIntentsApiFactory: testStripePaymentsIntentsApiFactory,
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

      const createPaymentIntent = vi.fn(async () =>
        ok({
          amount: 100,
          currency: "usd",
          client_secret: "secret-value",
          id: "pi_test",
        } as Stripe.PaymentIntent),
      );
      const testStripePaymentsIntentsApiFactory: IStripePaymentIntentsApiFactory = {
        create: () => ({
          createPaymentIntent,
          getPaymentIntent: vi.fn(),
        }),
      };

      const uc = new TransactionInitializeSessionUseCase({
        appConfigRepo: mockedAppConfigRepo,
        stripePaymentIntentsApiFactory: testStripePaymentsIntentsApiFactory,
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
