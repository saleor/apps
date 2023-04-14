import { describe, expect, it } from "vitest";
import { OrderStatus } from "../../../../generated/graphql";
import {
  TaxJarOrderCreatedMapPayloadArgs,
  taxJarOrderCreatedMaps,
} from "./taxjar-order-created-map";

const MOCKED_ORDER: TaxJarOrderCreatedMapPayloadArgs = {
  order: {
    id: "T3JkZXI6OTU4MDA5YjQtNDUxZC00NmQ1LThhMWUtMTRkMWRmYjFhNzI5",
    created: "2023-04-11T11:03:09.304109+00:00",
    status: OrderStatus.Unfulfilled,
    user: {
      id: "VXNlcjo5ZjY3ZjY0Zi1iZjY5LTQ5ZjYtYjQ4Zi1iZjY3ZjY0ZjY0ZjY=",
      email: "tester@saleor.io",
    },
    channel: {
      id: "Q2hhbm5lbDoy",
      slug: "channel-pln",
    },
    shippingAddress: {
      streetAddress1: "123 Palm Grove Ln",
      streetAddress2: "",
      city: "LOS ANGELES",
      countryArea: "CA",
      postalCode: "90002",
      country: {
        code: "US",
      },
    },
    billingAddress: {
      streetAddress1: "123 Palm Grove Ln",
      streetAddress2: "",
      city: "LOS ANGELES",
      countryArea: "CA",
      postalCode: "90002",
      country: {
        code: "US",
      },
    },
    total: {
      net: {
        amount: 183.33,
      },
      tax: {
        amount: 12.83,
      },
      currency: "USD",
    },
    shippingPrice: {
      net: {
        amount: 48.33,
      },
    },
    lines: [
      {
        productSku: "328223581",
        productName: "Monospace Tee",
        quantity: 1,
        unitPrice: {
          net: {
            amount: 90,
          },
        },
        totalPrice: {
          tax: {
            amount: 8.55,
          },
        },
      },
      {
        productSku: "328223580",
        productName: "Monospace Tee",
        quantity: 1,
        unitPrice: {
          net: {
            amount: 45,
          },
        },
        totalPrice: {
          tax: {
            amount: 4.28,
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
};

describe("taxJarOrderCreatedMaps", () => {
  describe("mapPayload", () => {
    it.todo("calculation of fields");
    it.todo("formatting the fields");
    it.todo("rounding of numbers");
    it("returns the correct order amount", () => {
      const result = taxJarOrderCreatedMaps.mapPayload(MOCKED_ORDER);

      expect(result.params.amount).toBe(183.33);
    });
  });

  describe.todo("mapResponse", () => {
    it.todo("calculation of fields");
    it.todo("formatting the fields");
    it.todo("rounding of numbers");
  });

  describe("sumLines", () => {
    it("returns the sum of all line items when items quantity = 1", () => {
      const result = taxJarOrderCreatedMaps.sumLines([
        {
          quantity: 1,
          unit_price: 90.45,
          product_identifier: "328223581",
        },
        {
          quantity: 1,
          unit_price: 45.25,
          product_identifier: "328223580",
        },
      ]);

      expect(result).toBe(135.7);
    });
    it("returns the sum of all line items when items quantity > 1", () => {
      const result = taxJarOrderCreatedMaps.sumLines([
        {
          quantity: 3,
          unit_price: 90.45,
          product_identifier: "328223581",
        },
        {
          quantity: 2,
          unit_price: 45.25,
          product_identifier: "328223580",
        },
        {
          quantity: 1,
          unit_price: 50.25,
          product_identifier: "328223580",
        },
      ]);

      expect(result).toBe(412.1);
    });

    it("returns the rounded sum of all line items when line items n of decimals > 2", () => {
      const result = taxJarOrderCreatedMaps.sumLines([
        {
          quantity: 3,
          unit_price: 10.256,
          product_identifier: "328223581",
        },
        {
          quantity: 2,
          unit_price: 50.512,
          product_identifier: "328223580",
        },
      ]);

      expect(result).toBe(131.79);
    });
  });
});
