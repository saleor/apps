import { err, ok } from "neverthrow";
import Stripe from "stripe";
import { describe, expect, it, vi } from "vitest";

import { mockedAppConfigRepo } from "@/__tests__/mocks/app-config-repo";
import { mockedSaleorAppId } from "@/__tests__/mocks/constants";
import { getMockedRecordedTransaction } from "@/__tests__/mocks/mocked-recorded-transaction";
import { mockedStripePaymentIntentId } from "@/__tests__/mocks/mocked-stripe-payment-intent-id";
import { MockedTransactionRecorder } from "@/__tests__/mocks/mocked-transaction-recorder";
import { mockedSaleorApiUrl } from "@/__tests__/mocks/saleor-api-url";
import { getMockedTransactionProcessSessionEvent } from "@/__tests__/mocks/transaction-process-session-event";
import { BaseError } from "@/lib/errors";
import {
  AppIsNotConfiguredResponse,
  BrokenAppResponse,
  MalformedRequestResponse,
} from "@/modules/saleor/saleor-webhook-responses";
import { StripeAPIError } from "@/modules/stripe/stripe-payment-intent-api-error";
import { IStripePaymentIntentsApiFactory } from "@/modules/stripe/types";

import { TransactionProcessSessionUseCase } from "./use-case";
import { TransactionProcessSessionUseCaseResponses } from "./use-case-response";

describe("TransactionProcessSessionUseCase", () => {
  it.each([
    {
      actionType: "CHARGE" as const,
      expectedResponse: TransactionProcessSessionUseCaseResponses.OK,
      paymentIntentStatus: "succeeded",
    },
    {
      actionType: "AUTHORIZATION" as const,
      expectedResponse: TransactionProcessSessionUseCaseResponses.OK,
      paymentIntentStatus: "succeeded",
    },
    {
      actionType: "CHARGE" as const,
      expectedResponse: TransactionProcessSessionUseCaseResponses.OK,
      paymentIntentStatus: "requires_payment_method",
    },
    {
      actionType: "AUTHORIZATION" as const,
      expectedResponse: TransactionProcessSessionUseCaseResponses.OK,
      paymentIntentStatus: "requires_payment_method",
    },
    {
      actionType: "AUTHORIZATION" as const,
      expectedResponse: TransactionProcessSessionUseCaseResponses.OK,
      paymentIntentStatus: "requires_confirmation",
    },
    {
      actionType: "CHARGE" as const,
      expectedResponse: TransactionProcessSessionUseCaseResponses.OK,
      paymentIntentStatus: "requires_confirmation",
    },
    {
      actionType: "AUTHORIZATION" as const,
      expectedResponse: TransactionProcessSessionUseCaseResponses.OK,
      paymentIntentStatus: "requires_action",
    },
    {
      actionType: "CHARGE" as const,
      expectedResponse: TransactionProcessSessionUseCaseResponses.OK,
      paymentIntentStatus: "requires_action",
    },
    {
      actionType: "AUTHORIZATION" as const,
      expectedResponse: TransactionProcessSessionUseCaseResponses.OK,
      paymentIntentStatus: "processing",
    },
    {
      actionType: "CHARGE" as const,
      expectedResponse: TransactionProcessSessionUseCaseResponses.OK,
      paymentIntentStatus: "processing",
    },
    {
      actionType: "AUTHORIZATION" as const,
      expectedResponse: TransactionProcessSessionUseCaseResponses.OK,
      paymentIntentStatus: "canceled",
    },
    {
      actionType: "CHARGE" as const,
      expectedResponse: TransactionProcessSessionUseCaseResponses.OK,
      paymentIntentStatus: "canceled",
    },
    {
      actionType: "AUTHORIZATION" as const,
      expectedResponse: TransactionProcessSessionUseCaseResponses.OK,
      paymentIntentStatus: "requires_capture",
    },
  ])(
    "Calls Stripe PaymentIntentsAPI to get payment intent and returns $expectedResponse.name for actionType: $actionType and Stripe Payment Intent with status: $paymentIntentStatus",
    async ({ actionType, expectedResponse, paymentIntentStatus }) => {
      const saleorEvent = getMockedTransactionProcessSessionEvent({ actionType });
      const mockedTransationRecorder = new MockedTransactionRecorder();

      mockedTransationRecorder.recordTransaction(getMockedRecordedTransaction());
      const getPaymentIntent = vi.fn(async () =>
        ok({
          amount: 100,
          currency: "usd",
          client_secret: "secret-value",
          id: mockedStripePaymentIntentId.toString(), // stripe doesn't expect to get branded type here
          status: paymentIntentStatus,
        } as Stripe.PaymentIntent),
      );

      const testStripePaymentsIntentsApiFactory: IStripePaymentIntentsApiFactory = {
        create: () => ({
          createPaymentIntent: vi.fn(),
          getPaymentIntent,
        }),
      };

      vi.spyOn(mockedTransationRecorder, "getTransactionByStripePaymentIntentId");

      const uc = new TransactionProcessSessionUseCase({
        appConfigRepo: mockedAppConfigRepo,
        stripePaymentIntentsApiFactory: testStripePaymentsIntentsApiFactory,
        transactionRecorder: mockedTransationRecorder,
      });

      const result = await uc.execute({
        saleorApiUrl: mockedSaleorApiUrl,
        appId: mockedSaleorAppId,
        event: saleorEvent,
      });

      expect(result._unsafeUnwrap()).toBeInstanceOf(expectedResponse);

      expect(getPaymentIntent).toHaveBeenCalledWith({
        id: mockedStripePaymentIntentId,
      });

      expect(mockedTransationRecorder.getTransactionByStripePaymentIntentId).toHaveBeenCalledWith(
        mockedStripePaymentIntentId,
      );
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

    const uc = new TransactionProcessSessionUseCase({
      appConfigRepo: mockedAppConfigRepo,
      stripePaymentIntentsApiFactory: testStripePaymentsIntentsApiFactory,
      transactionRecorder: new MockedTransactionRecorder(),
    });

    const responsePayload = await uc.execute({
      saleorApiUrl: mockedSaleorApiUrl,
      appId: mockedSaleorAppId,
      event: getMockedTransactionProcessSessionEvent(),
    });

    const err = responsePayload._unsafeUnwrapErr();

    expect(spy).toHaveBeenCalledOnce();

    expect(err).toBeInstanceOf(AppIsNotConfiguredResponse);
  });

  it.each([
    {
      actionType: "CHARGE" as const,
      expectedFailureResponse: TransactionProcessSessionUseCaseResponses.Error,
    },
    {
      actionType: "AUTHORIZATION" as const,
      expectedFailureResponse: TransactionProcessSessionUseCaseResponses.Error,
    },
  ])(
    "Returns $expectedFailureResponse.name response if StripePaymentIntentsAPI throws error and actionType is $actionType",
    async ({ actionType, expectedFailureResponse }) => {
      const getPaymentIntent = vi.fn(async () => err(new StripeAPIError("Error from Stripe API")));
      const mockedTransationRecorder = new MockedTransactionRecorder();

      mockedTransationRecorder.recordTransaction(getMockedRecordedTransaction());
      const testStripePaymentsIntentsApiFactory: IStripePaymentIntentsApiFactory = {
        create: () => ({
          createPaymentIntent: vi.fn(),
          getPaymentIntent,
        }),
      };

      const uc = new TransactionProcessSessionUseCase({
        appConfigRepo: mockedAppConfigRepo,
        stripePaymentIntentsApiFactory: testStripePaymentsIntentsApiFactory,
        transactionRecorder: mockedTransationRecorder,
      });

      const saleorEvent = getMockedTransactionProcessSessionEvent({ actionType });

      const responsePayload = await uc.execute({
        saleorApiUrl: mockedSaleorApiUrl,
        appId: mockedSaleorAppId,
        event: saleorEvent,
      });

      expect(responsePayload._unsafeUnwrap()).toBeInstanceOf(expectedFailureResponse);
    },
  );

  it("Returns 'BrokenAppResponse' when currency coming from Stripe is not supported", async () => {
    const saleorEvent = getMockedTransactionProcessSessionEvent();
    const mockedTransationRecorder = new MockedTransactionRecorder();

    mockedTransationRecorder.recordTransaction(getMockedRecordedTransaction());
    const getPaymentIntent = vi.fn(async () =>
      ok({
        amount: 100,
        currency: "abc",
      } as Stripe.PaymentIntent),
    );
    const testStripePaymentsIntentsApiFactory: IStripePaymentIntentsApiFactory = {
      create: () => ({
        createPaymentIntent: vi.fn(),
        getPaymentIntent,
      }),
    };

    const uc = new TransactionProcessSessionUseCase({
      appConfigRepo: mockedAppConfigRepo,
      stripePaymentIntentsApiFactory: testStripePaymentsIntentsApiFactory,
      transactionRecorder: mockedTransationRecorder,
    });

    await expect(
      uc.execute({
        saleorApiUrl: mockedSaleorApiUrl,
        appId: mockedSaleorAppId,
        event: saleorEvent,
      }),
    ).resolves.toStrictEqual(err(new BrokenAppResponse()));
  });

  it("Returns 'BrokenAppResponse' when Stripe Payment Intent status is not supported", async () => {
    const saleorEvent = getMockedTransactionProcessSessionEvent();
    const mockedTransationRecorder = new MockedTransactionRecorder();

    mockedTransationRecorder.recordTransaction(getMockedRecordedTransaction());

    const getPaymentIntent = vi.fn(async () =>
      ok({
        amount: 100,
        currency: "usd",
        client_secret: "secret-value",
        id: mockedStripePaymentIntentId.toString(), // stripe doesn't expect to get branded type here
        status: "broken_status",
      } as unknown as Stripe.PaymentIntent),
    );
    const testStripePaymentsIntentsApiFactory: IStripePaymentIntentsApiFactory = {
      create: () => ({
        createPaymentIntent: vi.fn(),
        getPaymentIntent,
      }),
    };

    const uc = new TransactionProcessSessionUseCase({
      appConfigRepo: mockedAppConfigRepo,
      stripePaymentIntentsApiFactory: testStripePaymentsIntentsApiFactory,
      transactionRecorder: mockedTransationRecorder,
    });

    await expect(
      uc.execute({
        saleorApiUrl: mockedSaleorApiUrl,
        appId: mockedSaleorAppId,
        event: saleorEvent,
      }),
    ).resolves.toStrictEqual(err(new BrokenAppResponse()));
  });

  it("Returns 'MalformedRequestResponse' when there is an error with getting transactionRecord", async () => {
    const saleorEvent = getMockedTransactionProcessSessionEvent();
    const mockedTransationRecorder = new MockedTransactionRecorder();
    const getPaymentIntent = vi.fn(async () =>
      ok({
        amount: 100,
        currency: "usd",
        client_secret: "secret-value",
        id: mockedStripePaymentIntentId.toString(), // stripe doesn't expect to get branded type here
        status: "succeeded",
      } as Stripe.PaymentIntent),
    );

    const testStripePaymentsIntentsApiFactory: IStripePaymentIntentsApiFactory = {
      create: () => ({
        createPaymentIntent: vi.fn(),
        getPaymentIntent,
      }),
    };

    vi.spyOn(mockedTransationRecorder, "getTransactionByStripePaymentIntentId").mockImplementation(
      async () => err(new BaseError("Error while getting transaction record")),
    );

    const uc = new TransactionProcessSessionUseCase({
      appConfigRepo: mockedAppConfigRepo,
      stripePaymentIntentsApiFactory: testStripePaymentsIntentsApiFactory,
      transactionRecorder: mockedTransationRecorder,
    });

    const result = await uc.execute({
      saleorApiUrl: mockedSaleorApiUrl,
      appId: mockedSaleorAppId,
      event: saleorEvent,
    });

    expect(result._unsafeUnwrapErr()).toBeInstanceOf(MalformedRequestResponse);
  });
});
