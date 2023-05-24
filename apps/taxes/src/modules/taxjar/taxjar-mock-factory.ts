import { CreateOrderRes, TaxForOrderRes } from "taxjar/dist/types/returnTypes";
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

type TaxForOrder = TaxForOrderRes;

const noNexusTaxForOrderMock: TaxForOrder = {
  tax: {
    amount_to_collect: 0,
    freight_taxable: false,
    has_nexus: false,
    order_total_amount: 59.17,
    rate: 0,
    shipping: 59.17,
    tax_source: "",
    taxable_amount: 0,
    exemption_type: "",
    jurisdictions: {
      country: "",
    },
  },
};

const nexusTaxForOrderMock: TaxForOrder = {
  tax: {
    exemption_type: "",
    amount_to_collect: 1.71,
    breakdown: {
      city_tax_collectable: 0,
      city_tax_rate: 0,
      city_taxable_amount: 0,
      combined_tax_rate: 0.05711,
      county_tax_collectable: 1.31,
      county_tax_rate: 0.04375,
      county_taxable_amount: 29.95,
      line_items: [
        {
          city_amount: 0,
          city_tax_rate: 0,
          city_taxable_amount: 0,
          combined_tax_rate: 0.04375,
          county_amount: 0.87,
          county_tax_rate: 0.04375,
          county_taxable_amount: 19.95,
          id: "1",
          special_district_amount: 0,
          special_district_taxable_amount: 0,
          special_tax_rate: 0,
          state_amount: 0,
          state_sales_tax_rate: 0,
          state_taxable_amount: 0,
          tax_collectable: 0.87,
          taxable_amount: 19.95,
        },
      ],
      shipping: {
        city_amount: 0,
        city_tax_rate: 0,
        city_taxable_amount: 0,
        combined_tax_rate: 0.08375,
        county_amount: 0.44,
        county_tax_rate: 0.04375,
        county_taxable_amount: 10,
        special_district_amount: 0,
        special_tax_rate: 0,
        special_taxable_amount: 0,
        state_amount: 0.4,
        state_sales_tax_rate: 0.04,
        state_taxable_amount: 10,
        tax_collectable: 0.84,
        taxable_amount: 10,
      },
      special_district_tax_collectable: 0,
      special_district_taxable_amount: 0,
      special_tax_rate: 0,
      state_tax_collectable: 0.4,
      state_tax_rate: 0.04,
      state_taxable_amount: 10,
      tax_collectable: 1.71,
      taxable_amount: 29.95,
    },
    freight_taxable: true,
    has_nexus: true,
    jurisdictions: {
      city: "MAHOPAC",
      country: "US",
      county: "PUTNAM",
      state: "NY",
    },
    order_total_amount: 29.95,
    rate: 0.05711,
    shipping: 10,
    tax_source: "destination",
    taxable_amount: 29.95,
  },
};

const taxForOrderMockVariants = {
  with_no_nexus: noNexusTaxForOrderMock,
  with_nexus: nexusTaxForOrderMock,
};

type TaxForOrderMockVariant = keyof typeof taxForOrderMockVariants;

const createTaxForOrderMock = (
  variant: TaxForOrderMockVariant,
  overrides: Partial<TaxForOrder> = {}
): TaxForOrder => ({
  ...taxForOrderMockVariants[variant],
  ...overrides,
});

export const taxJarMockFactory = {
  createMockChannelConfig,
  createMockTaxJarOrder,
  createTaxForOrderMock,
};
