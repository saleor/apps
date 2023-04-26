import { describe, expect, it } from "vitest";
import { OrderStatus } from "../../../../generated/graphql";
import {
  CreateTransactionMapPayloadArgs,
  avataxOrderCreatedMaps,
} from "./avatax-order-created-map";

const MOCKED_ARGS: CreateTransactionMapPayloadArgs = {
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
      gross: {
        amount: 48.33,
      },
      net: {
        amount: 43.74,
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
        productName: "Polyspace Tee",
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
    discounts: [
      {
        amount: {
          amount: 10,
        },
        id: "RGlzY291bnREaXNjb3VudDox",
      },
      {
        amount: {
          amount: 21.45,
        },
        id: "RGlzY291bnREaXNjb3VudDoy",
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
    isAutocommit: true,
    isSandbox: true,
    name: "Avatax-1",
    password: "user-password",
    username: "user-name",
    shippingTaxCode: "FR000000",
  },
};

describe("avataxOrderCreatedMaps", () => {
  describe.todo("mapResponse", () => {
    it.todo("calculation of fields");
    it.todo("formatting the fields");
    it.todo("rounding of numbers");
  });
  describe("mapPayload", () => {
    it("returns lines with discounted: true when there are discounts", () => {
      const payload = avataxOrderCreatedMaps.mapPayload(MOCKED_ARGS);

      const linesWithoutShipping = payload.model.lines.slice(0, -1);
      const check = linesWithoutShipping.every((line) => line.discounted === true);

      expect(check).toBeTruthy();
    });
    it.todo("calculation of fields");
    it.todo("formatting the fields");
    it.todo("rounding of numbers");
  });
  describe("mapLines", () => {
    const lines = avataxOrderCreatedMaps.mapLines(MOCKED_ARGS.order, MOCKED_ARGS.config);

    it("returns the correct number of lines", () => {
      expect(lines).toHaveLength(3);
    });

    it("includes shipping as a line", () => {
      expect(lines).toContainEqual({
        itemCode: avataxOrderCreatedMaps.consts.shippingItemCode,
        taxCode: MOCKED_ARGS.config.shippingTaxCode,
        quantity: 1,
        amount: 48.33,
      });
    });

    it("includes products as lines", () => {
      const [first, second] = lines;

      expect(first).toContain({
        itemCode: "328223581",
        description: "Monospace Tee",
        quantity: 1,
        amount: 90,
      });
      expect(second).toContain({
        itemCode: "328223580",
        description: "Polyspace Tee",
        quantity: 1,
        amount: 45,
      });
    });
  });
  describe("mapDiscounts", () => {
    it("sums up all discounts", () => {
      const discounts = avataxOrderCreatedMaps.mapDiscounts(MOCKED_ARGS.order.discounts);

      expect(discounts).toEqual(31.45);
    });

    it("returns 0 if there are no discounts", () => {
      const discounts = avataxOrderCreatedMaps.mapDiscounts([]);

      expect(discounts).toEqual(0);
    });
  });
});
