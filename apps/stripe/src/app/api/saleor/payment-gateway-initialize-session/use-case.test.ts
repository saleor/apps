import { ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import { mockedAppConfigRepo } from "@/__tests__/mocks/app-config-repo";
import { mockedSaleorAppId, mockedSaleorChannelId } from "@/__tests__/mocks/constants";
import { mockedSaleorApiUrl } from "@/__tests__/mocks/saleor-api-url";
import { PaymentGatewayInitializeSessionUseCaseResponses } from "@/app/api/saleor/payment-gateway-initialize-session/use-case-response";
import { MissingConfigErrorResponse } from "@/modules/saleor/saleor-webhook-responses";

import { PaymentGatewayInitializeSessionUseCase } from "./use-case";

describe("PaymentGatewayInitializeSessionUseCase", () => {
  it('Returns publishable key within "data" object if found in configuration', async () => {
    const uc = new PaymentGatewayInitializeSessionUseCase({
      appConfigRepo: mockedAppConfigRepo,
    });

    const responsePayload = await uc.execute({
      channelId: mockedSaleorChannelId,
      saleorApiUrl: mockedSaleorApiUrl,
      appId: mockedSaleorAppId,
    });

    expect(responsePayload._unsafeUnwrap()).toBeInstanceOf(
      PaymentGatewayInitializeSessionUseCaseResponses.Success,
    );
    expect(responsePayload._unsafeUnwrap().responseData).toStrictEqual({
      stripePublishableKey: "pk_live_1",
    });
  });

  it("Returns MissingConfigErrorResponse if config not found for specified channel", async () => {
    const spy = vi
      .spyOn(mockedAppConfigRepo, "getStripeConfig")
      .mockImplementationOnce(async () => ok(null));

    const uc = new PaymentGatewayInitializeSessionUseCase({
      appConfigRepo: mockedAppConfigRepo,
    });

    const responsePayload = await uc.execute({
      channelId: mockedSaleorChannelId,
      saleorApiUrl: mockedSaleorApiUrl,
      appId: mockedSaleorAppId,
    });

    const err = responsePayload._unsafeUnwrapErr();

    expect(err).toBeInstanceOf(MissingConfigErrorResponse);
    expect(spy).toHaveBeenCalledOnce();
  });
});
