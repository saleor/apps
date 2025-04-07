import { ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import { InitializeStripeSessionUseCase } from "@/app/api/saleor/gateway-initialize/use-case";
import { AppConfigPersistor } from "@/modules/app-config/app-config-persistor";
import { StripeConfig } from "@/modules/app-config/stripe-config";
import { StripePublishableKey } from "@/modules/stripe/stripe-publishable-key";
import { StripeRestrictedKey } from "@/modules/stripe/stripe-restricted-key";

const saleorApiUrlMock = "https://foo.bar.saleor.cloud/graphql/";
const channelIdMock = "test-id";
const mockAppId = "test-id";

describe("InitializeStripeSessionUseCase", () => {
  const testConfig: AppConfigPersistor = {
    getStripeConfig: vi.fn(),
    saveStripeConfig: vi.fn(),
  };

  it('Returns publishable key within "data" object if found in configuration', async () => {
    vi.mocked(testConfig.getStripeConfig).mockImplementationOnce(async () =>
      StripeConfig.create({
        configId: "abc",
        configName: "ABC",
        publishableKey: StripePublishableKey.create({
          publishableKey: "pk_live_1",
        })._unsafeUnwrap(),
        restrictedKey: StripeRestrictedKey.create({ restrictedKey: "rk_live_1" })._unsafeUnwrap(),
      }),
    );

    const uc = new InitializeStripeSessionUseCase({
      configPersistor: testConfig,
    });

    const responsePayload = await uc.execute({
      channelId: channelIdMock,
      saleorApiUrl: saleorApiUrlMock,
      appId: mockAppId,
    });

    expect(responsePayload._unsafeUnwrap()).toStrictEqual({
      data: {
        stripePublishableKey: "pk_live_1",
      },
    });
  });

  it("Returns AppNotConfiguredError if config not found for specified channel", async () => {
    vi.mocked(testConfig.getStripeConfig).mockImplementationOnce(async () => ok(null));

    const uc = new InitializeStripeSessionUseCase({
      configPersistor: testConfig,
    });

    const responsePayload = await uc.execute({
      channelId: channelIdMock,
      saleorApiUrl: saleorApiUrlMock,
      appId: mockAppId,
    });

    const err = responsePayload._unsafeUnwrapErr();

    expect(err).toBeInstanceOf(InitializeStripeSessionUseCase.MissingConfigError);
  });
});
