import { beforeEach, describe, expect, it, vi } from "vitest";
import { CalculateTaxesUseCase } from "./calculate-taxes.use-case";
import { CalculateTaxesPayload } from "../../modules/webhooks/calculate-taxes-payload";
import { AuthData } from "@saleor/app-sdk/APL";
import { AvataxCalculateTaxesResponse } from "../../modules/avatax/calculate-taxes/avatax-calculate-taxes-adapter";
import { WebhookAdapter } from "../../modules/taxes/tax-webhook-adapter";
import { ActiveConnectionServiceResolver } from "../../modules/taxes/get-active-connection-service";
import { GetAppConfig } from "../../modules/app/get-app-config";

const getBasePayload = (): CalculateTaxesPayload => {
  return {
    __typename: "CalculateTaxes",
    recipient: {
      privateMetadata: [
        {
          key: "app-config",
          value: "{}",
        },
      ],
    },
    taxBase: {
      channel: {
        slug: "default",
      },
      currency: "PLN",
      discounts: [],
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
const getAuthData = (): AuthData => ({
  saleorApiUrl: "https://example-store.saleor.cloud",
  appId: "12345",
  token: "12345",
});

describe("CalculateTaxesUseCase", () => {
  const mockedCalculateTaxesCall = vi.fn().mockImplementationOnce(
    async (payload): Promise<AvataxCalculateTaxesResponse> => ({
      lines: [
        {
          tax_rate: 0.23,
          total_net_amount: 10,
          total_gross_amount: 12.3,
        },
      ],
      shipping_price_gross_amount: 10,
      shipping_tax_rate: 10,
      shipping_price_net_amount: 9,
    }),
  );

  beforeEach(() => {
    class MockAvataxClientAdapter
      implements WebhookAdapter<CalculateTaxesPayload, AvataxCalculateTaxesResponse>
    {
      send = mockedCalculateTaxesCall;
    }

    /**
     * TODO Refactor towards dependency injection
     */
    vi.doMock("../../modules/avatax/calculate-taxes/avatax-calculate-taxes-adapter", () => {
      return {
        AvataxCalculateTaxesAdapter: MockAvataxClientAdapter,
      };
    });
  });

  it("Returns result from avatax client if payload is valid", async () => {
    const payload = getBasePayload();
    const authData = getAuthData();

    const getAppConfig: GetAppConfig = () => ({
      channels: [
        {
          config: {
            slug: "default",
            providerConnectionId: "1234",
          },
          id: "channel-config",
        },
      ],
      providerConnections: [
        {
          id: "1234",
          provider: "avatax",
          config: {
            name: "test",
            companyCode: "default",
            credentials: {
              username: "foo",
              password: "bar",
            },
            isAutocommit: false,
            isDocumentRecordingEnabled: false,
            isSandbox: true,
            shippingTaxCode: "ABC",
            address: {
              zip: "11111",
              street: "Some street 1",
              city: "New York",
              country: "United States",
              state: "NY",
            },
          },
        },
      ],
    });
    const resolver = new ActiveConnectionServiceResolver(getAppConfig);
    const useCase = new CalculateTaxesUseCase(resolver);

    const result = await useCase.calculateTaxes(payload, authData);

    console.log(result._unsafeUnwrapErr());

    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap()).toEqual({});
  });
});
