import { CreateOrderRes } from "taxjar/dist/types/returnTypes";
import { OrderCreatedSubscriptionFragment, OrderStatus } from "../../../generated/graphql";
import { ChannelConfig } from "../channels-configuration/channels-config";

type Order = OrderCreatedSubscriptionFragment;

const defaultOrder: Order = {
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

const createMockOrder = (overrides: Partial<Order> = {}): Order => ({
  ...defaultOrder,
  ...overrides,
});

const defaultChannelConfig: ChannelConfig = {
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

const createMockChannelConfig = (overrides: Partial<ChannelConfig> = {}): ChannelConfig => ({
  ...defaultChannelConfig,
  ...overrides,
});

type TaxJarOrder = CreateOrderRes;

const defaultTaxJarOrder: TaxJarOrder = {
  order: {
    transaction_id: "123",
    user_id: 10649,
    transaction_date: "2015-05-14T00:00:00Z",
    provider: "api",
    to_country: "US",
    to_zip: "90002",
    to_state: "CA",
    to_city: "LOS ANGELES",
    to_street: "123 Palm Grove Ln",
    amount: 16.5,
    shipping: 1.5,
    sales_tax: 0.95,
    transaction_reference_id: "123",
    exemption_type: "non_exempt",
    line_items: [
      {
        id: "1",
        quantity: 1,
        product_identifier: "12-34243-9",
        description: "Fuzzy Widget",
        unit_price: 15.0,
        discount: 0.0,
        sales_tax: 0.95,
      },
    ],
  },
};

const createMockTaxJarOrder = (overrides: Partial<TaxJarOrder> = {}): TaxJarOrder => ({
  ...defaultTaxJarOrder,
  ...overrides,
});

export const taxJarMockFactory = {
  createMockOrder,
  createMockChannelConfig,
  createMockTaxJarOrder,
};
