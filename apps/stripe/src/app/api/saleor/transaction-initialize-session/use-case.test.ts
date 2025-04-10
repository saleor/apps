import { err, ok } from "neverthrow";
import Stripe from "stripe";
import { describe, expect, it, vi } from "vitest";

import { mockedAppConfigRepo } from "@/__tests__/mocks/app-config-repo";
import { mockedSaleorAppId, mockedSaleorChannelId } from "@/__tests__/mocks/constants";
import { mockedSaleorApiUrl } from "@/__tests__/mocks/saleor-api-url";
import { getMockedTransactionInitializeSessionEvent } from "@/__tests__/mocks/transaction-initalize-session-event";
import { TransactionInitializeSessionUseCase } from "@/app/api/saleor/transaction-initialize-session/use-case";
import { UseCaseMissingConfigError } from "@/lib/errors";
import { StripePaymentIntentsApi } from "@/modules/stripe/stripe-payment-intents-api";
import { IStripePaymentIntentsApiFactory } from "@/modules/stripe/types";

describe("TransactionInitializeSessionUseCase", () => {
  it("Calls Stripe PaymentIntentsAPI to create payment intent", async () => {
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
      },
    });
  });

  it("Returns MissingConfigError if config not found for specified channel", async () => {
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

    expect(err).toBeInstanceOf(UseCaseMissingConfigError);
  });

  it("Returns UseCaseError if Stripe Payment API throws error", async () => {
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

    expect(responsePayload._unsafeUnwrapErr()).toBeInstanceOf(
      TransactionInitializeSessionUseCase.UseCaseError,
    );
  });

  it("Throws error when currency coming from Saleor is not supported", async () => {
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
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [InitializeStripeTransactionUseCaseError: ValidationError: Currency code is not supported
      Failed to create Stripe money]
    `);
  });

  it("Throws error when currency coming from Stripe is not supported", async () => {
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
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [InitializeStripeTransactionUseCaseError: ValidationError: Currency code is not supported
      Failed to create Saleor money]
    `);
  });

  it("Throws error when Stripe PaymentIntentsAPI didn't returned required client_secret field", async () => {
    const saleorEvent = getMockedTransactionInitializeSessionEvent();
    const createPaymentIntent = vi.fn(async () =>
      ok({
        amount: 100,
        currency: "usd",
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
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InitializeStripeTransactionUseCaseError: Stripe payment intent response does not contain client_secret. It means that the payment intent was not created properly.]`,
    );
  });
});
