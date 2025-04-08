import { err, ok } from "neverthrow";
import Stripe from "stripe";
import { describe, expect, it, vi } from "vitest";

import { mockedAppConfigRepo } from "@/__tests__/mocks/app-config-repo";
import { mockedSaleorAppId, mockedSaleorChannelId } from "@/__tests__/mocks/constants";
import { mockedSaleorApiUrl } from "@/__tests__/mocks/saleor-api-url";
import { mockedTransactionInitializeSessionEvent } from "@/__tests__/mocks/transaction-initalize-session-event";
import { TransactionInitializeSessionUseCase } from "@/app/api/saleor/transaction-initialize-session/use-case";
import { BaseError } from "@/lib/errors";
import { AppConfigRepo } from "@/modules/app-config/app-config-repo";
import { IStripePaymentIntentsApiFactory } from "@/modules/stripe/types";

describe("TransactionInitializeSessionUseCase", () => {
  it("Calls Stripe PaymentIntentsAPI to create payment intent", async () => {
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

    await uc.execute({
      channelId: mockedSaleorChannelId,
      saleorApiUrl: mockedSaleorApiUrl,
      appId: mockedSaleorAppId,
      event: mockedTransactionInitializeSessionEvent,
    });

    expect(createPaymentIntent).toHaveBeenCalledWith({
      params: {
        amount: 10000,
        currency: "usd",
      },
    });
  });

  it("Returns MissingConfigError if config not found for specified channel", async () => {
    const missingConfigRepo: AppConfigRepo = {
      getStripeConfig: async () => ok(null),
      saveStripeConfig: vi.fn(),
    };

    const testStripePaymentsIntentsApiFactory: IStripePaymentIntentsApiFactory = {
      create: () => ({
        createPaymentIntent: vi.fn(async () => ok({} as Stripe.PaymentIntent)),
      }),
    };

    const uc = new TransactionInitializeSessionUseCase({
      appConfigRepo: missingConfigRepo,
      stripePaymentIntentsApiFactory: testStripePaymentsIntentsApiFactory,
    });

    const responsePayload = await uc.execute({
      channelId: mockedSaleorChannelId,
      saleorApiUrl: mockedSaleorApiUrl,
      appId: mockedSaleorAppId,
      event: mockedTransactionInitializeSessionEvent,
    });

    const err = responsePayload._unsafeUnwrapErr();

    expect(err).toBeInstanceOf(TransactionInitializeSessionUseCase.MissingConfigError);
  });

  it("Returns UseCaseError if Stripe Payment API throws error", async () => {
    const createPaymentIntent = vi.fn(async () => err(new BaseError("Error from Stripe API")));
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
      event: mockedTransactionInitializeSessionEvent,
    });

    expect(responsePayload._unsafeUnwrapErr()).toBeInstanceOf(
      TransactionInitializeSessionUseCase.UseCaseError,
    );
  });
});
