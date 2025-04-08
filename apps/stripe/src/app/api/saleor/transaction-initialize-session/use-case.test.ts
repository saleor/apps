import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import { mockedStripeConfig } from "@/__tests__/mocks/stripe-config";
import { MockedStripePaymentIntentsApi } from "@/__tests__/mocks/stripe-payment-intents-api";
import { mockedTransactionInitializeSessionEvent } from "@/__tests__/mocks/transaction-initalize-session-event";
import { InitializeStripeSessionUseCase } from "@/app/api/saleor/payment-gateway-initialize/use-case";
import { InitializeStripeTransactionUseCase } from "@/app/api/saleor/transaction-initialize-session/use-case";
import { BaseError } from "@/lib/errors";
import { AppConfigPersister } from "@/modules/app-config/app-config-persister";
import { SaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import { IStripePaymentIntentsApiFactory } from "@/modules/stripe/types";

const saleorApiUrlMock = SaleorApiUrl.create({
  url: "https://foo.bar.saleor.cloud/graphql/",
})._unsafeUnwrap();
const channelIdMock = "test-id";
const mockAppId = "test-id";

describe("InitializeStripeTransactionUseCase", () => {
  const testConfig: AppConfigPersister = {
    getStripeConfig: vi.fn(),
    saveStripeConfig: vi.fn(),
  };
  const testStripeApiFactory: IStripePaymentIntentsApiFactory = {
    create: vi.fn(),
  };

  it("Calls Stripe PaymentIntentsAPI to create payment intent", async () => {
    vi.mocked(testConfig.getStripeConfig).mockImplementationOnce(async () => mockedStripeConfig);
    vi.mocked(testStripeApiFactory.create).mockImplementationOnce(
      () => new MockedStripePaymentIntentsApi(),
    );

    const spy = vi.spyOn(MockedStripePaymentIntentsApi.prototype, "createPaymentIntent");

    const uc = new InitializeStripeTransactionUseCase({
      configPersister: testConfig,
      stripePaymentIntentsApiFactory: testStripeApiFactory,
    });

    const responsePayload = await uc.execute({
      channelId: channelIdMock,
      saleorApiUrl: saleorApiUrlMock,
      appId: mockAppId,
      event: mockedTransactionInitializeSessionEvent,
    });

    expect(spy).toHaveBeenCalled();

    expect(responsePayload._unsafeUnwrap()).toStrictEqual({
      amount: 100,
      result: "CHARGE_SUCCESS",
    });
  });

  it("Returns AppNotConfiguredError if config not found for specified channel", async () => {
    vi.mocked(testConfig.getStripeConfig).mockImplementationOnce(async () => ok(null));

    const uc = new InitializeStripeSessionUseCase({
      configPersister: testConfig,
    });

    const responsePayload = await uc.execute({
      channelId: channelIdMock,
      saleorApiUrl: saleorApiUrlMock,
      appId: mockAppId,
    });

    const err = responsePayload._unsafeUnwrapErr();

    expect(err).toBeInstanceOf(InitializeStripeSessionUseCase.MissingConfigError);
  });

  it("Returns UseCaseError if Stripe Payment API throws error", async () => {
    vi.mocked(testConfig.getStripeConfig).mockImplementationOnce(async () => mockedStripeConfig);
    vi.mocked(testStripeApiFactory.create).mockImplementationOnce(
      () => new MockedStripePaymentIntentsApi(),
    );

    vi.spyOn(MockedStripePaymentIntentsApi.prototype, "createPaymentIntent").mockImplementationOnce(
      async () => err(new BaseError("Error from Stripe API")),
    );

    const uc = new InitializeStripeTransactionUseCase({
      configPersister: testConfig,
      stripePaymentIntentsApiFactory: testStripeApiFactory,
    });
    const responsePayload = await uc.execute({
      channelId: channelIdMock,
      saleorApiUrl: saleorApiUrlMock,
      appId: mockAppId,
      event: mockedTransactionInitializeSessionEvent,
    });

    expect(responsePayload._unsafeUnwrapErr()).toBeInstanceOf(
      InitializeStripeTransactionUseCase.UseCaseError,
    );
  });
});
