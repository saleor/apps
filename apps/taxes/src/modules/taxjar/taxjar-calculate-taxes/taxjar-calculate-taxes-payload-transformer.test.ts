import { describe, expect, it } from "vitest";
import { TaxBaseFragment } from "../../../../generated/graphql";
import { ChannelConfig } from "../../channels-configuration/channels-config";
import { TaxJarCalculateTaxesPayloadTransformer } from "./taxjar-calculate-taxes-payload-transformer";

const MOCKED_TAX_BASE: TaxBaseFragment = {
  pricesEnteredWithTax: false,
  currency: "PLN",
  channel: {
    slug: "channel-pln",
  },
  sourceObject: {
    __typename: "Order",
    user: {
      id: "VXNlcjo5ZjY3ZjY0Zi1iZjY5LTQ5ZjYtYjQ4Zi1iZjY3ZjY0ZjY0ZjY=",
    },
  },
  discounts: [],
  address: {
    streetAddress1: "123 Palm Grove Ln",
    streetAddress2: "",
    city: "LOS ANGELES",
    country: {
      code: "US",
    },
    countryArea: "CA",
    postalCode: "90002",
  },
  shippingPrice: {
    amount: 48.33,
  },
  lines: [
    {
      quantity: 3,
      unitPrice: {
        amount: 84,
      },
      totalPrice: {
        amount: 252,
      },
      sourceLine: {
        __typename: "OrderLine",
        id: "T3JkZXJMaW5lOmY1NGQ1MWY2LTc1OTctNGY2OC1hNDk0LTFjYjZlYjRmOTlhMQ==",
        variant: {
          id: "UHJvZHVjdFZhcmlhbnQ6MzQ2",
          product: {
            metafield: null,
            productType: {
              metafield: null,
            },
          },
        },
      },
    },
    {
      quantity: 1,
      unitPrice: {
        amount: 5.99,
      },
      totalPrice: {
        amount: 5.99,
      },
      sourceLine: {
        __typename: "OrderLine",
        id: "T3JkZXJMaW5lOjU1NTFjNTFjLTM5MWQtNGI0Ny04MGU0LWVjY2Q5ZjU4MjQyNQ==",
        variant: {
          id: "UHJvZHVjdFZhcmlhbnQ6Mzg1",
          product: {
            metafield: null,
            productType: {
              metafield: null,
            },
          },
        },
      },
    },
  ],
};

const MOCKED_CHANNEL_CONFIG: ChannelConfig = {
  providerInstanceId: "b8c29f49-7cae-4762-8458-e9a27eb83081",
  enabled: false,
  address: {
    country: "US",
    zip: "92093",
    state: "CA",
    city: "La Jolla",
    street: "9500 Gilman Drive",
  },
};

/*
 * const MOCKED_TAXJAR_CONFIG = {
 *   apiKey: "5da2f821eee4035db4771edab942a4cc",
 *   isSandbox: true,
 *   name: "taxjar-1",
 * };
 */

describe("TaxJarCalculateTaxesPayloadTransformer", () => {
  it("should return payload containing line_items", () => {
    const transformer = new TaxJarCalculateTaxesPayloadTransformer();
    const transformedPayload = transformer.transform({
      taxBase: MOCKED_TAX_BASE,
      channelConfig: MOCKED_CHANNEL_CONFIG,
    });

    expect(transformedPayload).toEqual({
      params: {
        from_country: "US",
        from_zip: "92093",
        from_state: "CA",
        from_city: "La Jolla",
        from_street: "9500 Gilman Drive",
        to_country: "US",
        to_zip: "90002",
        to_state: "CA",
        to_city: "LOS ANGELES",
        to_street: "123 Palm Grove Ln",
        shipping: 48.33,
        line_items: [
          {
            id: "T3JkZXJMaW5lOmY1NGQ1MWY2LTc1OTctNGY2OC1hNDk0LTFjYjZlYjRmOTlhMQ==",
            quantity: 3,
            unitAmount: 84,
            totalAmount: 252,
            discount: 0,
            chargeTaxes: true,
            taxCode: "",
          },
          {
            id: "T3JkZXJMaW5lOjU1NTFjNTFjLTM5MWQtNGI0Ny04MGU0LWVjY2Q5ZjU4MjQyNQ==",
            quantity: 1,
            unitAmount: 5.99,
            totalAmount: 5.99,
            discount: 0,
            chargeTaxes: true,
            taxCode: "",
          },
        ],
      },
    });
  });
});
