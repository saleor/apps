import { AuthData } from "@saleor/app-sdk/APL";
import { err, ok, Result } from "neverthrow";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SHIPPING_ITEM_CODE } from "@/modules/avatax/calculate-taxes/avatax-shipping-line";
import { ILogWriter, LogWriterContext, NoopLogWriter } from "@/modules/client-logs/log-writer";

import { BaseError } from "../../../error";
import { AppConfig } from "../../../lib/app-config";
import { AppConfigExtractor, IAppConfigExtractor } from "../../../lib/app-config-extractor";
import { AvataxClient } from "../../avatax/avatax-client";
import { AvataxSdkClientFactory } from "../../avatax/avatax-sdk-client-factory";
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
      discounts: [],
      currency: "PLN",
      pricesEnteredWithTax: false,
      shippingPrice: { amount: 30 },
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

const getPayloadWithDiscounts = (): CalculateTaxesPayload => {
  return {
    ...getBasePayload(),
    taxBase: {
      ...getBasePayload().taxBase,
      discounts: [
        { amount: { amount: 10 }, type: "SUBTOTAL" },
        { amount: { amount: 0.1 }, type: "SHIPPING" },
      ],
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
        },
      },
    ],
  });
};

describe("CalculateTaxesUseCase", () => {
  let instance: CalculateTaxesUseCase;
  let mockedAvataxClient: any;

  vi.mock("../../../modules/avatax/avatax-client", () => {
    const AvataxClient = vi.fn();

    AvataxClient.prototype.createTransaction = vi.fn();

    return {
      AvataxClient,
    };
  });

  beforeEach(() => {
    mockedAvataxClient = new AvataxClient(
      new AvataxSdkClientFactory().createClient({
        isSandbox: true,
        credentials: { username: "mock", password: "mock" },
      }),
    );
  });

  beforeEach(() => {
    vi.resetAllMocks();

    instance = new CalculateTaxesUseCase({
      configExtractor: MockConfigExtractor,
      logWriterFactory: {
        createWriter(context: LogWriterContext): ILogWriter {
          return new NoopLogWriter();
        },
      },
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

  it("Calculates proper discount (extra field with sum of SUBTOTAL-type amountes) and properly reduces price of shipping line", async () => {
    mockGetAppConfig.mockImplementationOnce(() => ok(getMockedAppConfig()));

    mockedAvataxClient.createTransaction.mockResolvedValueOnce({ lines: [] });

    const payload = getPayloadWithDiscounts();

    await instance.calculateTaxes(payload, getMockAuthData());

    expect(mockedAvataxClient.createTransaction).toHaveBeenCalledOnce();

    expect(mockedAvataxClient.createTransaction).toHaveBeenCalledWith({
      model: expect.objectContaining({
        discount: 10,
        lines: expect.arrayContaining([
          expect.objectContaining({
            discounted: true,
            amount: 100,
          }),
          expect.objectContaining({
            discounted: false,
            amount: 29.9,
            itemCode: SHIPPING_ITEM_CODE,
          }),
        ]),
      }),
    });
  });

  it.todo("Writes successful log if taxes calculated to Log Writer");

  it.todo("Writes error log if internal error occurs");
});
