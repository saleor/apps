import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import { mockedAppChannelConfig } from "@/__tests__/mocks/app-config/mocked-app-config";
import { mockedAppConfigRepo } from "@/__tests__/mocks/app-config/mocked-app-config-repo";
import { mockedSaleorApiUrl } from "@/__tests__/mocks/saleor/mocked-saleor-api-url";
import { mockedSaleorAppId } from "@/__tests__/mocks/saleor/mocked-saleor-app-id";
import { mockedPaymentGatewayInitializeSessionEvent } from "@/__tests__/mocks/saleor-events/mocked-payment-gateway-initalize-session-event";

import { AppIsNotConfiguredResponse } from "../saleor-webhook-responses";
import { PaymentGatewayInitializeSessionUseCase } from "./use-case";
import { PaymentGatewayInitializeSessionUseCaseResponses } from "./use-case-response";

describe("PaymentGatewayInitializeSessionUseCase", () => {
  it("Returns Success response if config is found and country / currency validation passes", async () => {
    vi.spyOn(mockedAppConfigRepo, "getChannelConfig").mockImplementationOnce(() =>
      ok(mockedAppChannelConfig),
    );

    const uc = new PaymentGatewayInitializeSessionUseCase({
      appConfigRepo: mockedAppConfigRepo,
    });

    const responsePayload = await uc.execute({
      saleorApiUrl: mockedSaleorApiUrl,
      appId: mockedSaleorAppId,
      event: mockedPaymentGatewayInitializeSessionEvent,
    });

    expect(responsePayload._unsafeUnwrap()).toBeInstanceOf(
      PaymentGatewayInitializeSessionUseCaseResponses.Success,
    );

    const jsonResponse = await responsePayload._unsafeUnwrap().getResponse().json();

    expect(jsonResponse).toMatchInlineSnapshot(
      `
      {
        "data": {},
      }
    `,
    );
  });

  it("Returns Failure response with error in data when source object has unsupported currency", async () => {
    vi.spyOn(mockedAppConfigRepo, "getChannelConfig").mockImplementationOnce(() =>
      ok(mockedAppChannelConfig),
    );

    const eventWithUnsupportedCurrency = {
      ...mockedPaymentGatewayInitializeSessionEvent,
      sourceObject: {
        ...mockedPaymentGatewayInitializeSessionEvent.sourceObject,
        channel: {
          ...mockedPaymentGatewayInitializeSessionEvent.sourceObject.channel,
          currencyCode: "USD", // Unsupported currency
        },
      },
    };

    const uc = new PaymentGatewayInitializeSessionUseCase({
      appConfigRepo: mockedAppConfigRepo,
    });

    const responsePayload = await uc.execute({
      saleorApiUrl: mockedSaleorApiUrl,
      appId: mockedSaleorAppId,
      event: eventWithUnsupportedCurrency,
    });

    expect(responsePayload._unsafeUnwrap()).toBeInstanceOf(
      PaymentGatewayInitializeSessionUseCaseResponses.Failure,
    );

    const jsonResponse = await responsePayload._unsafeUnwrap().getResponse().json();

    expect(jsonResponse).toMatchInlineSnapshot(`
      {
        "data": {
          "errors": [
            {
              "code": "UnsupportedCurrencyError",
              "message": "Currency not supported: got USD - needs JPY",
            },
          ],
        },
      }
    `);
  });

  it("Returns Failure response with error in data when source object has unsupported shipping address country", async () => {
    vi.spyOn(mockedAppConfigRepo, "getChannelConfig").mockImplementationOnce(() =>
      ok(mockedAppChannelConfig),
    );

    const eventWithUnsupportedCountry = {
      ...mockedPaymentGatewayInitializeSessionEvent,
      sourceObject: {
        ...mockedPaymentGatewayInitializeSessionEvent.sourceObject,
        shippingAddress: {
          ...mockedPaymentGatewayInitializeSessionEvent.sourceObject.shippingAddress,
          country: {
            code: "US", // Unsupported country
          },
        },
      },
    };

    const uc = new PaymentGatewayInitializeSessionUseCase({
      appConfigRepo: mockedAppConfigRepo,
    });

    const responsePayload = await uc.execute({
      saleorApiUrl: mockedSaleorApiUrl,
      appId: mockedSaleorAppId,
      event: eventWithUnsupportedCountry,
    });

    expect(responsePayload._unsafeUnwrap()).toBeInstanceOf(
      PaymentGatewayInitializeSessionUseCaseResponses.Failure,
    );

    const jsonResponse = await responsePayload._unsafeUnwrap().getResponse().json();

    expect(jsonResponse).toMatchInlineSnapshot(`
      {
        "data": {
          "errors": [
            {
              "code": "UnsupportedCountryError",
              "message": "Shipping address country not supported: got US - needs JP",
            },
          ],
        },
      }
    `);
  });

  it("Returns AppIsNotConfiguredResponse if config not found for specified channel", async () => {
    vi.spyOn(mockedAppConfigRepo, "getChannelConfig").mockImplementationOnce(() => ok(null));

    const uc = new PaymentGatewayInitializeSessionUseCase({
      appConfigRepo: mockedAppConfigRepo,
    });

    const responsePayload = await uc.execute({
      saleorApiUrl: mockedSaleorApiUrl,
      appId: mockedSaleorAppId,
      event: mockedPaymentGatewayInitializeSessionEvent,
    });

    const errorResult = responsePayload._unsafeUnwrapErr();

    expect(errorResult).toBeInstanceOf(AppIsNotConfiguredResponse);
  });

  it("Returns AppIsNotConfiguredResponse if there is an error fetching config", async () => {
    vi.spyOn(mockedAppConfigRepo, "getChannelConfig").mockImplementationOnce(() =>
      err(new Error("Failed to fetch config")),
    );

    const uc = new PaymentGatewayInitializeSessionUseCase({
      appConfigRepo: mockedAppConfigRepo,
    });

    const responsePayload = await uc.execute({
      saleorApiUrl: mockedSaleorApiUrl,
      appId: mockedSaleorAppId,
      event: mockedPaymentGatewayInitializeSessionEvent,
    });

    const errorResult = responsePayload._unsafeUnwrapErr();

    expect(errorResult).toBeInstanceOf(AppIsNotConfiguredResponse);
  });
});
