import {
  OrderCreatedSubscriptionFragment,
  OrderFulfilledSubscriptionFragment,
  OrderStatus,
  TaxBaseFragment,
} from "../../../generated/graphql";

type OrderCreated = OrderCreatedSubscriptionFragment;
const defaultOrder: OrderCreated = {
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
      productName: "Monospace Tee",
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
  discounts: [
    {
      amount: {
        amount: 10,
      },
      id: "RGlzY291bnREaXNjb3VudDox",
    },
  ],
};

const createOrderCreatedMock = (overrides: Partial<OrderCreated> = {}): OrderCreated => ({
  ...defaultOrder,
  ...overrides,
});

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

type TaxBase = TaxBaseFragment;

const noDiscountsTaxBase: TaxBase = {
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

const mockTaxBaseVariants = {
  no_discounts: noDiscountsTaxBase,
};

type TaxBaseVariant = keyof typeof mockTaxBaseVariants;

const createMockTaxBase = (variant: TaxBaseVariant, overrides: Partial<TaxBase> = {}): TaxBase => ({
  ...mockTaxBaseVariants[variant],
  ...overrides,
});

export const taxMockFactory = {
  createOrderCreatedMock,
  createOrderFulfilledMock,
  createMockTaxBase,
};
