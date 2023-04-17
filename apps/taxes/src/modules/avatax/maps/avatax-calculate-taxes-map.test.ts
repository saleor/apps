import { describe, expect, it } from "vitest";
import {
  AvataxCalculateTaxesMapPayloadArgs,
  avataxCalculateTaxesMaps,
} from "./avatax-calculate-taxes-map";

// * Mocked payload data, channel config and avatax config
const MOCKED_CALCULATE_TAXES_ARGS: AvataxCalculateTaxesMapPayloadArgs = {
  taxBase: {
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
        chargeTaxes: true,
        quantity: 1,
        unitPrice: {
          amount: 84,
        },
        totalPrice: {
          amount: 84,
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
        chargeTaxes: true,
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
  },
  channel: {
    providerInstanceId: "b8c29f49-7cae-4762-8458-e9a27eb83081",
    enabled: false,
    address: {
      country: "US",
      zip: "92093",
      state: "CA",
      city: "La Jolla",
      street: "9500 Gilman Drive",
    },
  },
  config: {
    companyCode: "DEFAULT",
    isAutocommit: false,
    isSandbox: true,
    name: "Avatax-1",
    password: "password",
    username: "username",
  },
};

describe("avataxCalculateTaxesMaps", () => {
  describe.todo("mapResponse", () => {
    it.todo("calculation of fields");
    it.todo("formatting the fields");
    it.todo("rounding of numbers");
  });
  describe.todo("mapPayload", () => {
    it.todo("calculation of fields");
    it.todo("formatting the fields");
    it.todo("rounding of numbers");
  });
  describe("mapLines", () => {
    it("includes shipping as a line", () => {
      const lines = avataxCalculateTaxesMaps.mapLines(MOCKED_CALCULATE_TAXES_ARGS.taxBase);

      expect(lines).toContainEqual({
        itemCode: avataxCalculateTaxesMaps.shippingItemCode,
        quantity: 1,
        amount: 48.33,
      });
    });
  });
});
