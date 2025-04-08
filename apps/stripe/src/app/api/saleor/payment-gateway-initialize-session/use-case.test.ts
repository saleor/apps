import { ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import { InitializeStripeSessionUseCase } from "@/app/api/saleor/payment-gateway-initialize-session/use-case";
import { AppConfigRepo } from "@/modules/app-config/app-config-repo";
import { StripeConfig } from "@/modules/app-config/stripe-config";
import { SaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import { StripePublishableKey } from "@/modules/stripe/stripe-publishable-key";
import { StripeRestrictedKey } from "@/modules/stripe/stripe-restricted-key";

const saleorApiUrlMock = SaleorApiUrl.create({
  url: "https://foo.bar.saleor.cloud/graphql/",
})._unsafeUnwrap();
const channelIdMock = "test-id";
const mockAppId = "test-id";

describe("InitializeStripeSessionUseCase", () => {
  const testConfig: AppConfigRepo = {
    getStripeConfig: vi.fn(),
    saveStripeConfig: vi.fn(),
  };

  it('Returns publishable key within "data" object if found in configuration', async () => {
    vi.mocked(testConfig.getStripeConfig).mockImplementationOnce(async () =>
      StripeConfig.create({
        id: "abc",
        name: "ABC",
        publishableKey: StripePublishableKey.create({
          publishableKey: "pk_live_1",
        })._unsafeUnwrap(),
        restrictedKey: StripeRestrictedKey.create({ restrictedKey: "rk_live_1" })._unsafeUnwrap(),
      }),
    );

    const uc = new InitializeStripeSessionUseCase({
      appConfigRepo: testConfig,
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
      appConfigRepo: testConfig,
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
