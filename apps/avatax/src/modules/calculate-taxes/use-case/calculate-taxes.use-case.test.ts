import { AuthData } from "@saleor/app-sdk/APL";
import { err, ok, Result } from "neverthrow";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AvataxCalculateTaxesPayloadLinesTransformer } from "@/modules/avatax/calculate-taxes/avatax-calculate-taxes-payload-lines-transformer";
import { AvataxCalculateTaxesResponseTransformer } from "@/modules/avatax/calculate-taxes/avatax-calculate-taxes-response-transformer";
import { AvataxCalculateTaxesTaxCodeMatcher } from "@/modules/avatax/calculate-taxes/avatax-calculate-taxes-tax-code-matcher";
import { SHIPPING_ITEM_CODE } from "@/modules/avatax/calculate-taxes/avatax-shipping-line";
import { ILogWriter, NoopLogWriter } from "@/modules/client-logs/log-writer";
import {
  AvataxGetTaxSystemError,
  AvataxGetTaxWrongUserInputError,
} from "@/modules/taxes/tax-error";

import { BaseError } from "../../../error";
import { AppConfig } from "../../../lib/app-config";
import { AppConfigExtractor, IAppConfigExtractor } from "../../../lib/app-config-extractor";
import { AvataxClient } from "../../avatax/avatax-client";
import { AvataxSdkClientFactory } from "../../avatax/avatax-sdk-client-factory";
import { CalculateTaxesPayload } from "../../webhooks/payloads/calculate-taxes-payload";
import { CalculateTaxesUseCase } from "./calculate-taxes.use-case";

const mockGetAppConfig = vi.fn<() => Result<AppConfig, (typeof BaseError)["prototype"]>>();

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
        id: "channel-id",
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
              sku: "variantSku",
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockedAvataxClient: any;
  let logWriter: ILogWriter;

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

    logWriter = new NoopLogWriter();

    vi.spyOn(logWriter, "writeLog");

    instance = new CalculateTaxesUseCase({
      configExtractor: MockConfigExtractor,
      logWriterFactory: {
        createWriter(): ILogWriter {
          return logWriter;
        },
      },
      calculateTaxesResponseTransformer: new AvataxCalculateTaxesResponseTransformer(),
      payloadLinesTransformer: new AvataxCalculateTaxesPayloadLinesTransformer(
        new AvataxCalculateTaxesTaxCodeMatcher(),
      ),
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
    expect(error.errors![0]).toBeInstanceOf(BaseError);
  });

  it("Returns XXX error if taxes calculation fails", async () => {
    mockGetAppConfig.mockImplementationOnce(() => ok(getMockedAppConfig()));

    mockedAvataxClient.createTransaction.mockResolvedValueOnce(
      Promise.resolve(err(new Error("Failed to create transaction"))),
    );

    const payload = getBasePayload();

    const result = await instance.calculateTaxes(payload, getMockAuthData());

    const error = result._unsafeUnwrapErr();

    expect(error).toBeInstanceOf(CalculateTaxesUseCase.FailedCalculatingTaxesError);

    expect(error).toMatchInlineSnapshot(`
      [FailedCalculatingTaxesError: Failed to create transaction
      Failed to calculate taxes]
    `);
  });

  it("Calculates proper discount (extra field with sum of SUBTOTAL-type amounts) and properly reduces price of shipping line", async () => {
    mockGetAppConfig.mockImplementationOnce(() => ok(getMockedAppConfig()));

    mockedAvataxClient.createTransaction.mockResolvedValueOnce(Promise.resolve(ok({ lines: [] })));

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

  it("Writes successful log if taxes calculated to Log Writer", async () => {
    mockGetAppConfig.mockImplementationOnce(() => ok(getMockedAppConfig()));

    mockedAvataxClient.createTransaction.mockResolvedValueOnce(Promise.resolve(ok({ lines: [] })));

    const payload = getPayloadWithDiscounts();

    await instance.calculateTaxes(payload, getMockAuthData());

    expect(logWriter.writeLog).toHaveBeenCalledWith({
      log: expect.objectContaining({
        message: "Sucessfully calculated taxes",
      }),
    });
  });

  it("Writes error log if internal error occurs", async () => {
    mockGetAppConfig.mockImplementationOnce(() =>
      err(new AppConfigExtractor.MissingMetadataError("Missing metadata")),
    );

    await instance.calculateTaxes(getBasePayload(), getMockAuthData());

    expect(logWriter.writeLog).toHaveBeenCalledWith({
      log: expect.objectContaining({
        message: "Error during tax calculation",
      }),
    });
  });

  describe("User error handling", () => {
    it("Returns HTTP 400 when AvaTax API throws error caused by user", async () => {
      mockGetAppConfig.mockImplementationOnce(() => ok(getMockedAppConfig()));

      // Create AvataxUserInputError for InvalidZipForStateError
      const userInputError = new AvataxGetTaxWrongUserInputError("GetTaxError", {
        props: {
          faultSubCode: "InvalidZipForStateError",
          description:
            "The provided address contains a postal code and state combination that is not valid.",
          message: "Tax calculation cannot be determined. Zip is not valid for the state.",
        },
      });

      // Mock AvaTax API to throw user input error
      mockedAvataxClient.createTransaction.mockRejectedValueOnce(userInputError);

      const result = await instance.calculateTaxes(getBasePayload(), getMockAuthData());

      expect(result._unsafeUnwrapErr()).toBeInstanceOf(
        CalculateTaxesUseCase.ExpectedIncompletePayloadError,
      );

      expect(result._unsafeUnwrapErr()).toMatchInlineSnapshot(`
        [ExpectedIncompletePayloadError: AvataxGetTaxWrongInputError: GetTaxError
        Payload is incomplete and taxes cant be calculated. This is expected]
      `);
    });

    it("Returns HTTP 500 when AvaTax API throws other errors", async () => {
      mockGetAppConfig.mockImplementationOnce(() => ok(getMockedAppConfig()));

      // Create AvataxSystemError for unknown system fault
      const systemError = new AvataxGetTaxSystemError("GetTaxError", {
        props: {
          faultSubCode: "UnknownSystemError",
          description: "Some system error that is not user-caused",
          message: "System error that should return HTTP 500",
        },
      });

      // Mock AvaTax API to throw system error
      mockedAvataxClient.createTransaction.mockRejectedValueOnce(systemError);

      const result = await instance.calculateTaxes(getBasePayload(), getMockAuthData());

      expect(result._unsafeUnwrapErr()).toBeInstanceOf(
        CalculateTaxesUseCase.FailedCalculatingTaxesError,
      );

      expect(result._unsafeUnwrapErr()).toMatchInlineSnapshot(`
        [FailedCalculatingTaxesError: AvataxGetTaxSystemError: GetTaxError
        Failed to calculate taxes]
      `);
    });

    it("Does not log exceptions caused by user input errors as error or warning level", async () => {
      mockGetAppConfig.mockImplementationOnce(() => ok(getMockedAppConfig()));

      // Create AvataxUserInputError for InvalidZipForStateError
      const userInputError = new AvataxGetTaxWrongUserInputError("GetTaxError", {
        props: {
          faultSubCode: "InvalidZipForStateError",
          description:
            "The provided address contains a postal code and state combination that is not valid.",
          message: "Tax calculation cannot be determined. Zip is not valid for the state.",
        },
      });

      mockedAvataxClient.createTransaction.mockRejectedValueOnce(userInputError);

      const loggerErrorSpy = vi.spyOn(instance["logger"], "error");
      const loggerWarnSpy = vi.spyOn(instance["logger"], "warn");

      await instance.calculateTaxes(getBasePayload(), getMockAuthData());

      expect(loggerErrorSpy).not.toHaveBeenCalled();
      expect(loggerWarnSpy).not.toHaveBeenCalled();
    });
  });
});
