import { AuthData } from "@saleor/app-sdk/APL";
import { Result, err, ok } from "neverthrow";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BaseError } from "../../../error";
import { AppConfig } from "../../../lib/app-config";
import { AppConfigExtractor, IAppConfigExtractor } from "../../../lib/app-config-extractor";
import { PublicLog } from "../../public-log-drain/public-events";
import { PublicLogDrainService } from "../../public-log-drain/public-log-drain.service";
import { AvataxWebhookServiceFactory } from "../../taxes/avatax-webhook-service-factory";
import { CalculateTaxesPayload } from "../../webhooks/payloads/calculate-taxes-payload";
import { CalculateTaxesUseCase } from "./calculate-taxes.use-case";

const mockGetAppConfig = vi.fn<never, Result<AppConfig, (typeof BaseError)["prototype"]>>();

const MockConfigExtractor: IAppConfigExtractor = {
  extractAppConfigFromPrivateMetadata: mockGetAppConfig,
};

const getMockAuthData = (): AuthData => ({
  appId: "avatax",
  saleorApiUrl: "https://test.saleor.cloud/graphql/",
  token: "test-token",
});

const channelSlug = "default-channel";

const getBasePayload = (): CalculateTaxesPayload => {
  return {
    __typename: "CalculateTaxes",
    recipient: {
      privateMetadata: [],
    },
    taxBase: {
      channel: {
        slug: channelSlug,
      },
      currency: "PLN",
      pricesEnteredWithTax: false,
      shippingPrice: { amount: 0 },
      address: {
        city: "",
        country: {
          code: "PL",
        },
        countryArea: "",
        postalCode: "",
        streetAddress1: "",
        streetAddress2: "",
      },
      lines: [
        {
          quantity: 1,
          totalPrice: { amount: 100 },
          unitPrice: {
            amount: 100,
          },
          sourceLine: {
            __typename: "OrderLine",
            orderProductVariant: {
              __typename: "ProductVariant",
              id: "123",
              product: {
                taxClass: {
                  id: "321",
                  name: "fooo",
                },
              },
            },
            id: "1",
          },
        },
      ],
      sourceObject: {
        id: "123",
        avataxEntityCode: "",
        __typename: "Checkout",
        user: { __typename: "User", email: "", avataxCustomerCode: "", id: "" },
      },
    },
  };
};

const getMockedAppConfig = (): AppConfig => {
  const connId = "pci-1";

  return AppConfig.createFromParsedConfig({
    channels: [
      {
        id: "1",
        config: {
          slug: channelSlug,
          providerConnectionId: connId,
        },
      },
    ],
    providerConnections: [
      {
        provider: "avatax",
        id: connId,
        config: {
          companyCode: "test",
          credentials: {
            password: "test",
            username: "test",
          },
          address: {
            city: "test",
            country: "test",
            zip: "10111",
            state: "NY",
            street: "test",
          },
          isSandbox: false,
          name: "config",
          isAutocommit: false,
          isDocumentRecordingEnabled: false,
          shippingTaxCode: "123",
          logsSettings: {
            otel: {
              url: "https://otel.example.com",
              headers: "Authorization",
            },
            json: {
              url: "https://http.example.com",
              headers: "Authorization",
            },
          },
        },
      },
    ],
  });
};

describe("CalculateTaxesUseCase", () => {
  let instance: CalculateTaxesUseCase;

  beforeEach(() => {
    vi.resetAllMocks();

    instance = new CalculateTaxesUseCase({
      configExtractor: MockConfigExtractor,
      publicLogDrain: new PublicLogDrainService([
        {
          async emit(log: PublicLog): Promise<void> {},
        },
      ]),
    });
  });

  it("Creates instance", () => {
    expect(instance).toBeDefined();
  });

  it("Returns ConfigBrokenError when config was not found", async () => {
    mockGetAppConfig.mockImplementationOnce(() =>
      err(new AppConfigExtractor.MissingMetadataError("Missing metadata")),
    );

    const result = await instance.calculateTaxes(getBasePayload(), getMockAuthData());

    const error = result._unsafeUnwrapErr();

    expect(error).toBeInstanceOf(CalculateTaxesUseCase.ConfigBrokenError);
    expect(error.errors![0]).toBeInstanceOf(AppConfigExtractor.MissingMetadataError);
  });

  it("Returns ConfigBrokenError when config was found, but config for selected channel was missing", async () => {
    mockGetAppConfig.mockImplementationOnce(() => ok(getMockedAppConfig()));

    const payload = getBasePayload();

    payload.taxBase.channel.slug = "NON_EXISTING_CHANNEL";

    const result = await instance.calculateTaxes(payload, getMockAuthData());

    const error = result._unsafeUnwrapErr();

    expect(error).toBeInstanceOf(CalculateTaxesUseCase.ConfigBrokenError);
    expect(error.errors![0]).toBeInstanceOf(AvataxWebhookServiceFactory.BrokenConfigurationError);
  });

  it("Returns XXX error if taxes calculation fails", async () => {
    mockGetAppConfig.mockImplementationOnce(() => ok(getMockedAppConfig()));

    const payload = getBasePayload();

    const result = await instance.calculateTaxes(payload, getMockAuthData());

    const error = result._unsafeUnwrapErr();

    expect(error).toBeInstanceOf(CalculateTaxesUseCase.FailedCalculatingTaxesError);
    // Expect any error to be attached. We dont yet specify errors so these tests will be added later
    expect(error.errors![0]).toBeInstanceOf(Error);
  });
});
