import { CreateOrderRes } from "taxjar/dist/types/returnTypes";
import { ChannelConfig } from "../channels-configuration/channels-config";

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
  createMockChannelConfig,
  createMockTaxJarOrder,
};
