import { err, ok } from "neverthrow";
import Stripe from "stripe";
import { describe, expect, it, vi } from "vitest";

import { mockedAppConfigRepo } from "@/__tests__/mocks/app-config-repo";
import { mockedSaleorAppId } from "@/__tests__/mocks/constants";
import { mockedStripePaymentIntentId } from "@/__tests__/mocks/mocked-stripe-payment-intent-id";
import { mockedStripePaymentIntentsApi } from "@/__tests__/mocks/mocked-stripe-payment-intents-api";
import { mockedSaleorApiUrl } from "@/__tests__/mocks/saleor-api-url";
import { getMockedTransactionChargeRequestedEvent } from "@/__tests__/mocks/transaction-charge-requested-event";
import {
  AppIsNotConfiguredResponse,
  BrokenAppResponse,
  MalformedRequestResponse,
} from "@/modules/saleor/saleor-webhook-responses";
import { StripeAPIError } from "@/modules/stripe/stripe-api-error";
import { IStripePaymentIntentsApiFactory } from "@/modules/stripe/types";
import { ChargeFailureResult } from "@/modules/transaction-result/failure-result";
import { ChargeSuccessResult } from "@/modules/transaction-result/success-result";

import { TransactionChargeRequestedUseCase } from "./use-case";
import { TransactionChargeRequestedUseCaseResponses } from "./use-case-response";

describe("TransactionChargeRequestedUseCase", () => {
  const stripePaymentIntentsApiFactory = {
    create: () => mockedStripePaymentIntentsApi,
  } satisfies IStripePaymentIntentsApiFactory;

  it("Calls Stripe PaymentIntent API to capture payment intent and returns ChargeSuccess when payment intent is captured successfully", async () => {
    const spy = vi
      .spyOn(mockedStripePaymentIntentsApi, "capturePaymentIntent")
      .mockImplementationOnce(async () =>
        ok({
          amount: 100,
          currency: "usd",
          id: mockedStripePaymentIntentId.toString(), // stripe doesn't expect to get branded type here
          status: "succeeded",
        } as Stripe.PaymentIntent),
      );

    const uc = new TransactionChargeRequestedUseCase({
      appConfigRepo: mockedAppConfigRepo,
      stripePaymentIntentsApiFactory,
    });

    const result = await uc.execute({
      saleorApiUrl: mockedSaleorApiUrl,
      appId: mockedSaleorAppId,
      event: getMockedTransactionChargeRequestedEvent(),
    });

    expect(result._unsafeUnwrap()).toBeInstanceOf(
      TransactionChargeRequestedUseCaseResponses.Success,
    );

    expect(result._unsafeUnwrap().transactionResult).toBeInstanceOf(ChargeSuccessResult);

    expect(spy).toHaveBeenCalledWith({
      id: mockedStripePaymentIntentId,
    });
  });

  it("Calls Stripe PaymentIntent API to capture payment intent and returns ChargeFailureResult when payment intent capture fails", async () => {
    const spy = vi
      .spyOn(mockedStripePaymentIntentsApi, "capturePaymentIntent")
      .mockImplementationOnce(async () => err(new StripeAPIError("Error from Stripe API")));

    const uc = new TransactionChargeRequestedUseCase({
      appConfigRepo: mockedAppConfigRepo,
      stripePaymentIntentsApiFactory,
    });

    const result = await uc.execute({
      saleorApiUrl: mockedSaleorApiUrl,
      appId: mockedSaleorAppId,
      event: getMockedTransactionChargeRequestedEvent(),
    });

    expect(result._unsafeUnwrap()).toBeInstanceOf(
      TransactionChargeRequestedUseCaseResponses.Failure,
    );
    expect(result._unsafeUnwrap().transactionResult).toBeInstanceOf(ChargeFailureResult);

    expect(spy).toHaveBeenCalledWith({
      id: mockedStripePaymentIntentId,
    });
  });

  it("Returns 'MissingConfigErrorResponse' if config not found for specified channel", async () => {
    const spy = vi
      .spyOn(mockedAppConfigRepo, "getStripeConfig")
      .mockImplementationOnce(async () => ok(null));

    const uc = new TransactionChargeRequestedUseCase({
      appConfigRepo: mockedAppConfigRepo,
      stripePaymentIntentsApiFactory,
    });

    const responsePayload = await uc.execute({
      saleorApiUrl: mockedSaleorApiUrl,
      appId: mockedSaleorAppId,
      event: getMockedTransactionChargeRequestedEvent(),
    });

    const err = responsePayload._unsafeUnwrapErr();

    expect(spy).toHaveBeenCalledOnce();

    expect(err).toBeInstanceOf(AppIsNotConfiguredResponse);
  });

  it("Returns 'BrokenAppResponse' when currency coming from Stripe is not supported", async () => {
    vi.spyOn(mockedStripePaymentIntentsApi, "capturePaymentIntent").mockImplementation(async () =>
      ok({
        amount: 100,
        currency: "abc",
      } as Stripe.PaymentIntent),
    );
    const uc = new TransactionChargeRequestedUseCase({
      appConfigRepo: mockedAppConfigRepo,
      stripePaymentIntentsApiFactory,
    });

    const response = await uc.execute({
      saleorApiUrl: mockedSaleorApiUrl,
      appId: mockedSaleorAppId,
      event: getMockedTransactionChargeRequestedEvent(),
    });

    expect(response._unsafeUnwrapErr()).toBeInstanceOf(BrokenAppResponse);
  });

  it("Returns 'MalformedRequestResponse' when Saleor event has no transaction", async () => {
    const saleorEvent = { ...getMockedTransactionChargeRequestedEvent(), transaction: null };

    const uc = new TransactionChargeRequestedUseCase({
      appConfigRepo: mockedAppConfigRepo,
      stripePaymentIntentsApiFactory,
    });

    const response = await uc.execute({
      saleorApiUrl: mockedSaleorApiUrl,
      appId: mockedSaleorAppId,
      event: saleorEvent,
    });

    expect(response._unsafeUnwrapErr()).toBeInstanceOf(MalformedRequestResponse);
  });

  it("Returns 'MalformedRequestResponse' when Saleor event has no channel for Saleor Checkout or Order", async () => {
    const saleorEvent = {
      ...getMockedTransactionChargeRequestedEvent(),
      transaction: {
        checkout: null,
        order: null,
        pspReference: mockedStripePaymentIntentId,
      },
    };

    const uc = new TransactionChargeRequestedUseCase({
      appConfigRepo: mockedAppConfigRepo,
      stripePaymentIntentsApiFactory,
    });

    const response = await uc.execute({
      saleorApiUrl: mockedSaleorApiUrl,
      appId: mockedSaleorAppId,
      event: saleorEvent,
    });

    expect(response._unsafeUnwrapErr()).toBeInstanceOf(MalformedRequestResponse);
  });

  it("Returns 'MalformedRequestResponse' when Saleor event has no amount for action and payment intent capture fails", async () => {
    const saleorEvent = {
      ...getMockedTransactionChargeRequestedEvent(),
      action: {
        amount: null,
      },
    };

    vi.spyOn(mockedStripePaymentIntentsApi, "capturePaymentIntent").mockImplementation(async () =>
      err(new StripeAPIError("Error from Stripe API")),
    );

    const uc = new TransactionChargeRequestedUseCase({
      appConfigRepo: mockedAppConfigRepo,
      stripePaymentIntentsApiFactory,
    });

    const response = await uc.execute({
      saleorApiUrl: mockedSaleorApiUrl,
      appId: mockedSaleorAppId,
      event: saleorEvent,
    });

    expect(response._unsafeUnwrapErr()).toBeInstanceOf(MalformedRequestResponse);
  });
});
