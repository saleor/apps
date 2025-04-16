import { err, ok } from "neverthrow";
import Stripe from "stripe";
import { describe, expect, it, vi } from "vitest";

import { mockedAppConfigRepo } from "@/__tests__/mocks/app-config-repo";
import { mockedSaleorAppId, mockedSaleorChannelId } from "@/__tests__/mocks/constants";
import { mockedSaleorApiUrl } from "@/__tests__/mocks/saleor-api-url";
import { getMockedTransactionInitializeSessionEvent } from "@/__tests__/mocks/transaction-initalize-session-event";
import {
  AppIsNotConfiguredResponse,
  BrokenAppResponse,
  MalformedRequestResponse,
} from "@/modules/saleor/saleor-webhook-responses";
import { StripePaymentIntentsApi } from "@/modules/stripe/stripe-payment-intents-api";
import { IStripePaymentIntentsApiFactory } from "@/modules/stripe/types";

import { TransactionInitializeSessionUseCase } from "./use-case";
import { TransactionInitalizeSessionUseCaseResponses } from "./use-case-response";

describe("TransactionInitializeSessionUseCase", () => {
  it("Calls Stripe PaymentIntentsAPI to create payment intent", async () => {
    const saleorEvent = getMockedTransactionInitializeSessionEvent();
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
      }),
    };

    const uc = new TransactionInitializeSessionUseCase({
      appConfigRepo: mockedAppConfigRepo,
      stripePaymentIntentsApiFactory: testStripePaymentsIntentsApiFactory,
    });

    await uc.execute({
      channelId: mockedSaleorChannelId,
      saleorApiUrl: mockedSaleorApiUrl,
      appId: mockedSaleorAppId,
      event: saleorEvent,
    });

    expect(createPaymentIntent).toHaveBeenCalledWith({
      params: {
        // Saleor API sends amount in floats - Stripe wants amount in ints
        amount: saleorEvent.action.amount * 100,
        currency: "usd",
        payment_method_types: ["card"],
      },
    });
  });

  it("Returns MissingConfigErrorResponse if config not found for specified channel", async () => {
    const spy = vi
      .spyOn(mockedAppConfigRepo, "getStripeConfig")
      .mockImplementationOnce(async () => ok(null));

    const testStripePaymentsIntentsApiFactory: IStripePaymentIntentsApiFactory = {
      create: () => ({
        createPaymentIntent: vi.fn(async () => ok({} as Stripe.PaymentIntent)),
      }),
    };

    const uc = new TransactionInitializeSessionUseCase({
      appConfigRepo: mockedAppConfigRepo,
      stripePaymentIntentsApiFactory: testStripePaymentsIntentsApiFactory,
    });

    const responsePayload = await uc.execute({
      channelId: mockedSaleorChannelId,
      saleorApiUrl: mockedSaleorApiUrl,
      appId: mockedSaleorAppId,
      event: getMockedTransactionInitializeSessionEvent(),
    });

    const err = responsePayload._unsafeUnwrapErr();

    expect(spy).toHaveBeenCalledOnce();

    expect(err).toBeInstanceOf(AppIsNotConfiguredResponse);
  });

  it("Returns ChargeFailure response if Stripe Payment API throws error", async () => {
    const createPaymentIntent = vi.fn(async () =>
      err(new StripePaymentIntentsApi.CreatePaymentIntentError("Error from Stripe API")),
    );
    const testStripePaymentsIntentsApiFactory: IStripePaymentIntentsApiFactory = {
      create: () => ({
        createPaymentIntent,
      }),
    };

    const uc = new TransactionInitializeSessionUseCase({
      appConfigRepo: mockedAppConfigRepo,
      stripePaymentIntentsApiFactory: testStripePaymentsIntentsApiFactory,
    });

    const responsePayload = await uc.execute({
      channelId: mockedSaleorChannelId,
      saleorApiUrl: mockedSaleorApiUrl,
      appId: mockedSaleorAppId,
      event: getMockedTransactionInitializeSessionEvent(),
    });

    expect(responsePayload._unsafeUnwrap()).toBeInstanceOf(
      TransactionInitalizeSessionUseCaseResponses.ChargeFailure,
    );
  });

  it("Returns ChargeFailure response when receives not supported payment method in data", async () => {
    const testStripePaymentsIntentsApiFactory: IStripePaymentIntentsApiFactory = {
      create: () => ({
        createPaymentIntent: vi.fn(async () => ok({} as Stripe.PaymentIntent)),
      }),
    };

    const eventWithNotSupportedPaymentMethod = {
      ...getMockedTransactionInitializeSessionEvent(),
      data: {
        paymentIntent: {
          paymentMethod: "not-supported-payment-method",
        },
      },
    };

    const uc = new TransactionInitializeSessionUseCase({
      appConfigRepo: mockedAppConfigRepo,
      stripePaymentIntentsApiFactory: testStripePaymentsIntentsApiFactory,
    });

    const responsePayload = await uc.execute({
      channelId: mockedSaleorChannelId,
      saleorApiUrl: mockedSaleorApiUrl,
      appId: mockedSaleorAppId,
      event: eventWithNotSupportedPaymentMethod,
    });

    expect(responsePayload._unsafeUnwrap()).toBeInstanceOf(
      TransactionInitalizeSessionUseCaseResponses.ChargeFailure,
    );
  });

  it("Returns ChargeFailure response when receives addtional field in data", async () => {
    const testStripePaymentsIntentsApiFactory: IStripePaymentIntentsApiFactory = {
      create: () => ({
        createPaymentIntent: vi.fn(async () => ok({} as Stripe.PaymentIntent)),
      }),
    };

    const eventWithAdditionalFieldinData = {
      ...getMockedTransactionInitializeSessionEvent(),
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
    });

    const responsePayload = await uc.execute({
      channelId: mockedSaleorChannelId,
      saleorApiUrl: mockedSaleorApiUrl,
      appId: mockedSaleorAppId,
      event: eventWithAdditionalFieldinData,
    });

    expect(responsePayload._unsafeUnwrap()).toBeInstanceOf(
      TransactionInitalizeSessionUseCaseResponses.ChargeFailure,
    );
  });

  it("Returns MalformedRequestResponse when currency coming from Saleor is not supported", async () => {
    const saleorEvent = {
      ...getMockedTransactionInitializeSessionEvent(),
      action: {
        amount: 100,
        currency: "ABC",
      },
    };
    const createPaymentIntent = vi.fn(async () => ok({} as Stripe.PaymentIntent));
    const testStripePaymentsIntentsApiFactory: IStripePaymentIntentsApiFactory = {
      create: () => ({
        createPaymentIntent,
      }),
    };

    const uc = new TransactionInitializeSessionUseCase({
      appConfigRepo: mockedAppConfigRepo,
      stripePaymentIntentsApiFactory: testStripePaymentsIntentsApiFactory,
    });

    await expect(
      uc.execute({
        channelId: mockedSaleorChannelId,
        saleorApiUrl: mockedSaleorApiUrl,
        appId: mockedSaleorAppId,
        event: saleorEvent,
      }),
    ).resolves.toStrictEqual(err(new MalformedRequestResponse()));
  });

  it("Returns BrokenAppRespone when currency coming from Stripe is not supported", async () => {
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
      }),
    };

    const uc = new TransactionInitializeSessionUseCase({
      appConfigRepo: mockedAppConfigRepo,
      stripePaymentIntentsApiFactory: testStripePaymentsIntentsApiFactory,
    });

    await expect(
      uc.execute({
        channelId: mockedSaleorChannelId,
        saleorApiUrl: mockedSaleorApiUrl,
        appId: mockedSaleorAppId,
        event: saleorEvent,
      }),
    ).resolves.toStrictEqual(err(new BrokenAppResponse()));
  });

  it("Returns BrokenAppResponse when Stripe PaymentIntentsAPI didn't returned required client_secret field", async () => {
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
      }),
    };

    const uc = new TransactionInitializeSessionUseCase({
      appConfigRepo: mockedAppConfigRepo,
      stripePaymentIntentsApiFactory: testStripePaymentsIntentsApiFactory,
    });

    await expect(
      uc.execute({
        channelId: mockedSaleorChannelId,
        saleorApiUrl: mockedSaleorApiUrl,
        appId: mockedSaleorAppId,
        event: saleorEvent,
      }),
    ).resolves.toStrictEqual(err(new BrokenAppResponse()));
  });

  it("Returns BrokenAppResponse when Stripe PaymentIntentsAPI didn't returned required payment id", async () => {
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
      }),
    };

    const uc = new TransactionInitializeSessionUseCase({
      appConfigRepo: mockedAppConfigRepo,
      stripePaymentIntentsApiFactory: testStripePaymentsIntentsApiFactory,
    });

    await expect(
      uc.execute({
        channelId: mockedSaleorChannelId,
        saleorApiUrl: mockedSaleorApiUrl,
        appId: mockedSaleorAppId,
        event: saleorEvent,
      }),
    ).resolves.toStrictEqual(err(new BrokenAppResponse()));
  });
});
