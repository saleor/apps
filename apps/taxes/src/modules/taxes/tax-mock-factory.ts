import { OrderFulfilledSubscriptionFragment, TaxBaseFragment } from "../../../generated/graphql";

type OrderFulfilled = OrderFulfilledSubscriptionFragment;

const defaultOrderFulfilled = {
  id: "T3JkZXI6OTU4MDA5YjQtNDUxZC00NmQ1LThhMWUtMTRkMWRmYjFhNzI5",
  created: "2023-04-11T11:03:09.304109+00:00",
  privateMetadata: [],
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
        net: {
          amount: 90,
        },
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
        net: {
          amount: 45,
        },
        tax: {
          amount: 4.28,
        },
      },
    },
  ],
};

const createOrderFulfilledMock = (overrides: Partial<OrderFulfilled> = {}): OrderFulfilled => ({
  ...defaultOrderFulfilled,
  ...overrides,
});

export const taxMockFactory = {
  createOrderFulfilledMock,
};
