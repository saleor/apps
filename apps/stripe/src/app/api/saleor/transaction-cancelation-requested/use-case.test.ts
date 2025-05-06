import { err, ok } from "neverthrow";
import Stripe from "stripe";
import { describe, expect, it, vi } from "vitest";

import { mockedAppConfigRepo } from "@/__tests__/mocks/app-config-repo";
import { mockedSaleorAppId } from "@/__tests__/mocks/constants";
import { mockedStripePaymentIntentId } from "@/__tests__/mocks/mocked-stripe-payment-intent-id";
import { mockedStripePaymentIntentsApi } from "@/__tests__/mocks/mocked-stripe-payment-intents-api";
import { mockedSaleorApiUrl } from "@/__tests__/mocks/saleor-api-url";
import { getMockedTransactionCancelationRequestedEvent } from "@/__tests__/mocks/transaction-cancelation-request-event";
import {
  AppIsNotConfiguredResponse,
  BrokenAppResponse,
  MalformedRequestResponse,
} from "@/modules/saleor/saleor-webhook-responses";
import { StripeAPIError } from "@/modules/stripe/stripe-payment-intent-api-error";
import { IStripePaymentIntentsApiFactory } from "@/modules/stripe/types";

import { TransactionCancelationRequestedUseCase } from "./use-case";
import { TransactionCancelationRequestedUseCaseResponses } from "./use-case-response";

describe("TransactionCancelationRequestedUseCase", () => {
  const stripePaymentIntentsApiFactory = {
    create: () => mockedStripePaymentIntentsApi,
  } satisfies IStripePaymentIntentsApiFactory;

  it("Calls Stripe PaymentIntent API to cancel payment intent and returns CancelSuccess when payment intent is canceled successfully", async () => {
    const spy = vi
      .spyOn(mockedStripePaymentIntentsApi, "cancelPaymentIntent")
      .mockImplementationOnce(async () =>
        ok({
          amount: 100,
          currency: "usd",
          id: mockedStripePaymentIntentId.toString(), // stripe doesn't expect to get branded type here
          status: "canceled",
        } as Stripe.PaymentIntent),
      );

    const uc = new TransactionCancelationRequestedUseCase({
      appConfigRepo: mockedAppConfigRepo,
      stripePaymentIntentsApiFactory,
    });

    const result = await uc.execute({
      saleorApiUrl: mockedSaleorApiUrl,
      appId: mockedSaleorAppId,
      event: getMockedTransactionCancelationRequestedEvent(),
    });

    expect(result._unsafeUnwrap()).toBeInstanceOf(
      TransactionCancelationRequestedUseCaseResponses.CancelSuccess,
    );

    expect(spy).toHaveBeenCalledWith({
      id: mockedStripePaymentIntentId,
    });
  });

  it("Calls Stripe PaymentIntent API to cancel payment intent and returns CancelFailure when payment intent cancel fails", async () => {
    const spy = vi
      .spyOn(mockedStripePaymentIntentsApi, "cancelPaymentIntent")
      .mockImplementationOnce(async () => err(new StripeAPIError("Error from Stripe API")));

    const uc = new TransactionCancelationRequestedUseCase({
      appConfigRepo: mockedAppConfigRepo,
      stripePaymentIntentsApiFactory,
    });

    const result = await uc.execute({
      saleorApiUrl: mockedSaleorApiUrl,
      appId: mockedSaleorAppId,
      event: getMockedTransactionCancelationRequestedEvent(),
    });

    expect(result._unsafeUnwrap()).toBeInstanceOf(
      TransactionCancelationRequestedUseCaseResponses.CancelFailure,
    );

    expect(spy).toHaveBeenCalledWith({
      id: mockedStripePaymentIntentId,
    });
  });

  it("Returns 'MissingConfigErrorResponse' if config not found for specified channel", async () => {
    const spy = vi
      .spyOn(mockedAppConfigRepo, "getStripeConfig")
      .mockImplementationOnce(async () => ok(null));

    const uc = new TransactionCancelationRequestedUseCase({
      appConfigRepo: mockedAppConfigRepo,
      stripePaymentIntentsApiFactory,
    });

    const responsePayload = await uc.execute({
      saleorApiUrl: mockedSaleorApiUrl,
      appId: mockedSaleorAppId,
      event: getMockedTransactionCancelationRequestedEvent(),
    });

    const err = responsePayload._unsafeUnwrapErr();

    expect(spy).toHaveBeenCalledOnce();

    expect(err).toBeInstanceOf(AppIsNotConfiguredResponse);
  });

  it("Returns 'BrokenAppResponse' when currency coming from Stripe is not supported", async () => {
    vi.spyOn(mockedStripePaymentIntentsApi, "cancelPaymentIntent").mockImplementation(async () =>
      ok({
        amount: 100,
        currency: "abc",
      } as Stripe.PaymentIntent),
    );
    const uc = new TransactionCancelationRequestedUseCase({
      appConfigRepo: mockedAppConfigRepo,
      stripePaymentIntentsApiFactory,
    });

    const response = await uc.execute({
      saleorApiUrl: mockedSaleorApiUrl,
      appId: mockedSaleorAppId,
      event: getMockedTransactionCancelationRequestedEvent(),
    });

    expect(response._unsafeUnwrapErr()).toBeInstanceOf(BrokenAppResponse);
  });

  it("Returns 'MalformedRequestResponse' when Saleor event has no transaction", async () => {
    const saleorEvent = { ...getMockedTransactionCancelationRequestedEvent(), transaction: null };

    const uc = new TransactionCancelationRequestedUseCase({
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
      ...getMockedTransactionCancelationRequestedEvent(),
      transaction: {
        checkout: null,
        order: null,
        pspReference: mockedStripePaymentIntentId,
      },
    };

    const uc = new TransactionCancelationRequestedUseCase({
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
