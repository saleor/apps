import { err, ok } from "neverthrow";
import type Stripe from "stripe";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { mockedAppConfigRepo } from "@/__tests__/mocks/app-config-repo";
import { mockedSaleorAppId, mockedSaleorChannelId } from "@/__tests__/mocks/constants";
import { mockedStripeConfig } from "@/__tests__/mocks/mock-stripe-config";
import { mockedStripePaymentIntentsApi } from "@/__tests__/mocks/mocked-stripe-payment-intents-api";
import { mockedSaleorApiUrl } from "@/__tests__/mocks/saleor-api-url";
import { type OrderCreatedEventFragment } from "@/generated/graphql";
import { AppConfigRepoError } from "@/modules/app-config/repositories/app-config-repo";
import { StripeAPIError } from "@/modules/stripe/stripe-api-error";
import { type IStripePaymentIntentsApiFactory } from "@/modules/stripe/types";

import { OrderCreatedUseCase, OrderCreatedUseCaseError } from "./use-case";

const getEvent = (
  transactions: NonNullable<OrderCreatedEventFragment["order"]>["transactions"],
): OrderCreatedEventFragment => ({
  version: "3.23.0",
  recipient: { id: mockedSaleorAppId },
  order: {
    id: "order-id",
    number: "123",
    checkoutId: "checkout-id",
    channel: { id: mockedSaleorChannelId, slug: "default-channel" },
    transactions,
  },
});

const ownTransaction = { pspReference: "pi_own", createdBy: { id: mockedSaleorAppId } };

describe("OrderCreatedUseCase", () => {
  const stripePaymentIntentsApiFactory = {
    create: () => mockedStripePaymentIntentsApi,
  } satisfies IStripePaymentIntentsApiFactory;

  const useCase = new OrderCreatedUseCase({
    appConfigRepo: mockedAppConfigRepo,
    stripePaymentIntentsApiFactory,
  });

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(mockedAppConfigRepo.getStripeConfig).mockResolvedValue(ok(mockedStripeConfig));
    vi.mocked(mockedStripePaymentIntentsApi.updatePaymentIntent).mockResolvedValue(
      ok({} as Stripe.PaymentIntent),
    );
  });

  it("Adds order data to payment intents created by this app only", async () => {
    const result = await useCase.execute({
      appId: mockedSaleorAppId,
      saleorApiUrl: mockedSaleorApiUrl,
      event: getEvent([
        ownTransaction,
        { pspReference: "pi_other_app", createdBy: { id: "other-app-id" } },
        { pspReference: "pi_staff", createdBy: {} },
        { pspReference: "", createdBy: { id: mockedSaleorAppId } },
      ]),
    });

    expect(result._unsafeUnwrap().updatedPaymentIntentIds).toStrictEqual(["pi_own"]);
    expect(mockedStripePaymentIntentsApi.updatePaymentIntent).toHaveBeenCalledOnce();
    expect(mockedStripePaymentIntentsApi.updatePaymentIntent).toHaveBeenCalledWith({
      id: "pi_own",
      metadata: {
        saleor_order_id: "order-id",
        saleor_order_number: "123",
        saleor_checkout_id: "checkout-id",
      },
      description: "Saleor Order #123",
    });
  });

  it("Does nothing when order has no payment intents from this app", async () => {
    const result = await useCase.execute({
      appId: mockedSaleorAppId,
      saleorApiUrl: mockedSaleorApiUrl,
      event: getEvent([{ pspReference: "pi_other_app", createdBy: { id: "other-app-id" } }]),
    });

    expect(result._unsafeUnwrap().updatedPaymentIntentIds).toStrictEqual([]);
    expect(mockedAppConfigRepo.getStripeConfig).not.toHaveBeenCalled();
  });

  it("Skips update when channel has no config", async () => {
    vi.mocked(mockedAppConfigRepo.getStripeConfig).mockResolvedValue(ok(null));

    const result = await useCase.execute({
      appId: mockedSaleorAppId,
      saleorApiUrl: mockedSaleorApiUrl,
      event: getEvent([ownTransaction]),
    });

    expect(result._unsafeUnwrap().updatedPaymentIntentIds).toStrictEqual([]);
    expect(mockedStripePaymentIntentsApi.updatePaymentIntent).not.toHaveBeenCalled();
  });

  it("Returns error when config can't be fetched", async () => {
    vi.mocked(mockedAppConfigRepo.getStripeConfig).mockResolvedValue(
      err(new AppConfigRepoError.FailureFetchingConfig("Error")),
    );

    const result = await useCase.execute({
      appId: mockedSaleorAppId,
      saleorApiUrl: mockedSaleorApiUrl,
      event: getEvent([ownTransaction]),
    });

    expect(result._unsafeUnwrapErr()).toBeInstanceOf(OrderCreatedUseCaseError.ConfigFetchError);
  });

  it("Returns error when Stripe update fails, so Saleor retries the webhook", async () => {
    vi.mocked(mockedStripePaymentIntentsApi.updatePaymentIntent).mockResolvedValue(
      err(new StripeAPIError("Error from Stripe API")),
    );

    const result = await useCase.execute({
      appId: mockedSaleorAppId,
      saleorApiUrl: mockedSaleorApiUrl,
      event: getEvent([ownTransaction]),
    });

    expect(result._unsafeUnwrapErr()).toBeInstanceOf(
      OrderCreatedUseCaseError.PaymentIntentUpdateError,
    );
  });
});
