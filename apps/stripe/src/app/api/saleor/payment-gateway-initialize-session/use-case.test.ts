import { ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import { mockedAppConfigRepo } from "@/__tests__/mocks/app-config-repo";
import { mockedSaleorAppId, mockedSaleorChannelId } from "@/__tests__/mocks/constants";
import { mockedSaleorApiUrl } from "@/__tests__/mocks/saleor-api-url";
import { stripePublishableKey } from "@/__tests__/mocks/stripe-publishable-key";
import { PaymentGatewayInitializeSessionUseCaseResponses } from "@/app/api/saleor/payment-gateway-initialize-session/use-case-response";
import { AppIsNotConfiguredResponse } from "@/modules/saleor/saleor-webhook-responses";

import { PaymentGatewayInitializeSessionUseCase } from "./use-case";

describe("PaymentGatewayInitializeSessionUseCase", () => {
  it('Returns Success response with publishable key within "data" object if found in configuration', async () => {
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

    const jsonResponse = await responsePayload._unsafeUnwrap().getResponse().json();

    expect(jsonResponse).toStrictEqual({
      data: {
        stripePublishableKey: stripePublishableKey.keyValue,
      },
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

    expect(err).toBeInstanceOf(AppIsNotConfiguredResponse);
    expect(spy).toHaveBeenCalledOnce();
  });
});
