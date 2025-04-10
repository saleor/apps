import { ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import { mockedAppConfigRepo } from "@/__tests__/mocks/app-config-repo";
import { mockedSaleorAppId, mockedSaleorChannelId } from "@/__tests__/mocks/constants";
import { mockedSaleorApiUrl } from "@/__tests__/mocks/saleor-api-url";
import { InitializeStripeSessionUseCase } from "@/app/api/saleor/payment-gateway-initialize-session/use-case";
import { UseCaseMissingConfigError } from "@/lib/errors";

describe("InitializeStripeSessionUseCase", () => {
  it('Returns publishable key within "data" object if found in configuration', async () => {
    const uc = new InitializeStripeSessionUseCase({
      appConfigRepo: mockedAppConfigRepo,
    });

    const responsePayload = await uc.execute({
      channelId: mockedSaleorChannelId,
      saleorApiUrl: mockedSaleorApiUrl,
      appId: mockedSaleorAppId,
    });

    expect(responsePayload._unsafeUnwrap()).toStrictEqual({
      data: {
        stripePublishableKey: "pk_live_1",
      },
    });
  });

  it("Returns AppNotConfiguredError if config not found for specified channel", async () => {
    const spy = vi
      .spyOn(mockedAppConfigRepo, "getStripeConfig")
      .mockImplementationOnce(async () => ok(null));

    const uc = new InitializeStripeSessionUseCase({
      appConfigRepo: mockedAppConfigRepo,
    });

    const responsePayload = await uc.execute({
      channelId: mockedSaleorChannelId,
      saleorApiUrl: mockedSaleorApiUrl,
      appId: mockedSaleorAppId,
    });

    const err = responsePayload._unsafeUnwrapErr();

    expect(err).toBeInstanceOf(UseCaseMissingConfigError);
    expect(spy).toHaveBeenCalledOnce();
  });
});
