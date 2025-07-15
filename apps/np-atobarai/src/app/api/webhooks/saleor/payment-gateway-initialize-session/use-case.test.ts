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

  it("Returns Failure response with error in data when source object has no billing address", async () => {
    vi.spyOn(mockedAppConfigRepo, "getChannelConfig").mockImplementationOnce(() =>
      ok(mockedAppChannelConfig),
    );
    const eventWithNoBillingAddress = {
      ...mockedPaymentGatewayInitializeSessionEvent,
      sourceObject: {
        ...mockedPaymentGatewayInitializeSessionEvent.sourceObject,
        billingAddress: null, // No billing address
      },
    };

    const uc = new PaymentGatewayInitializeSessionUseCase({
      appConfigRepo: mockedAppConfigRepo,
    });

    const responsePayload = await uc.execute({
      saleorApiUrl: mockedSaleorApiUrl,
      appId: mockedSaleorAppId,
      event: eventWithNoBillingAddress,
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
              "code": "MissingBillingAddressError",
              "message": "Billing address is required",
            },
          ],
        },
      }
    `);
  });

  it("Returns Failure response with error in data when source object has no billing phone number", async () => {
    vi.spyOn(mockedAppConfigRepo, "getChannelConfig").mockImplementationOnce(() =>
      ok(mockedAppChannelConfig),
    );

    const eventWithNoBillingPhoneNumber = {
      ...mockedPaymentGatewayInitializeSessionEvent,
      sourceObject: {
        ...mockedPaymentGatewayInitializeSessionEvent.sourceObject,
        billingAddress: {
          ...mockedPaymentGatewayInitializeSessionEvent.sourceObject.billingAddress,
          phone: null, // No billing phone number
        },
      },
    };

    const uc = new PaymentGatewayInitializeSessionUseCase({
      appConfigRepo: mockedAppConfigRepo,
    });

    const responsePayload = await uc.execute({
      saleorApiUrl: mockedSaleorApiUrl,
      appId: mockedSaleorAppId,
      event: eventWithNoBillingPhoneNumber,
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
              "code": "MissingBillingPhoneNumberError",
              "message": "Billing phone number is required",
            },
          ],
        },
      }
    `);
  });

  it("Returns Failure response with error in data when source object has wrong phone number format", async () => {
    vi.spyOn(mockedAppConfigRepo, "getChannelConfig").mockImplementationOnce(() =>
      ok(mockedAppChannelConfig),
    );
    const eventWithWrongPhoneNumberFormat = {
      ...mockedPaymentGatewayInitializeSessionEvent,
      sourceObject: {
        ...mockedPaymentGatewayInitializeSessionEvent.sourceObject,
        billingAddress: {
          ...mockedPaymentGatewayInitializeSessionEvent.sourceObject.billingAddress,
          phone: "1234567890", // Wrong format, should start with +81
        },
      },
    };
    const uc = new PaymentGatewayInitializeSessionUseCase({
      appConfigRepo: mockedAppConfigRepo,
    });
    const responsePayload = await uc.execute({
      saleorApiUrl: mockedSaleorApiUrl,
      appId: mockedSaleorAppId,
      event: eventWithWrongPhoneNumberFormat,
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
              "code": "WrongPhoneNumberFormatError",
              "message": "Phone number format is incorrect - it should start with +81",
            },
          ],
        },
      }
    `);
  });

  it("Returns Failure response with error in data when source object has no email", async () => {
    vi.spyOn(mockedAppConfigRepo, "getChannelConfig").mockImplementationOnce(() =>
      ok(mockedAppChannelConfig),
    );
    const eventWithNoEmail = {
      ...mockedPaymentGatewayInitializeSessionEvent,
      sourceObject: {
        ...mockedPaymentGatewayInitializeSessionEvent.sourceObject,
        email: null, // No email
      },
    };
    const uc = new PaymentGatewayInitializeSessionUseCase({
      appConfigRepo: mockedAppConfigRepo,
    });
    const responsePayload = await uc.execute({
      saleorApiUrl: mockedSaleorApiUrl,
      appId: mockedSaleorAppId,
      event: eventWithNoEmail,
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
              "code": "MissingEmailError",
              "message": "Email is required",
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
