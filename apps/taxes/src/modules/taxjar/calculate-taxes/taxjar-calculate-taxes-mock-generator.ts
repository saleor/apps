import { TaxForOrderRes } from "taxjar/dist/types/returnTypes";
import { TaxBaseFragment } from "../../../../generated/graphql";
import { ChannelConfig } from "../../channels-configuration/channels-config";

type TaxBase = TaxBaseFragment;

const defaultTaxBase: TaxBase = {
  pricesEnteredWithTax: true,
  currency: "USD",
  channel: {
    slug: "default-channel",
  },
  discounts: [],
  address: {
    streetAddress1: "600 Montgomery St",
    streetAddress2: "",
    city: "SAN FRANCISCO",
    countryArea: "CA",
    postalCode: "94111",
    country: {
      code: "US",
    },
  },
  shippingPrice: {
    amount: 48.33,
  },
  lines: [
    {
      sourceLine: {
        __typename: "OrderLine",
        id: "T3JkZXJMaW5lOjNmMjYwZmMyLTZjN2UtNGM5Ni1iYTMwLTEyMjAyODMzOTUyZA==",
        variant: {
          id: "UHJvZHVjdFZhcmlhbnQ6MzQ5",
          product: {
            metafield: null,
            productType: {
              metafield: null,
            },
          },
        },
      },
      quantity: 3,
      unitPrice: {
        amount: 20,
      },
      totalPrice: {
        amount: 60,
      },
    },
    {
      sourceLine: {
        __typename: "OrderLine",
        id: "T3JkZXJMaW5lOjNlNGZjODdkLTIyMmEtNDZiYi1iYzIzLWJiYWVkODVlOTQ4Mg==",
        variant: {
          id: "UHJvZHVjdFZhcmlhbnQ6MzUw",
          product: {
            metafield: null,
            productType: {
              metafield: null,
            },
          },
        },
      },
      quantity: 1,
      unitPrice: {
        amount: 20,
      },
      totalPrice: {
        amount: 20,
      },
    },
    {
      sourceLine: {
        __typename: "OrderLine",
        id: "T3JkZXJMaW5lOmM2NTBhMzVkLWQ1YjQtNGRhNy1hMjNjLWEzODU4ZDE1MzI2Mw==",
        variant: {
          id: "UHJvZHVjdFZhcmlhbnQ6MzQw",
          product: {
            metafield: null,
            productType: {
              metafield: null,
            },
          },
        },
      },
      quantity: 2,
      unitPrice: {
        amount: 50,
      },
      totalPrice: {
        amount: 100,
      },
    },
  ],
  sourceObject: {
    user: {
      id: "VXNlcjoyMDg0NTEwNDEw",
    },
  },
};

const withNexusChannelConfig: ChannelConfig = {
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

const noNexusChannelConfig: ChannelConfig = {
  providerInstanceId: "aa5293e5-7f5d-4782-a619-222ead918e50",
  enabled: false,
  address: {
    country: "US",
    zip: "85297",
    state: "AZ",
    city: "Gilbert",
    street: "3301 S Greenfield Rd",
  },
};

type TaxForOrder = TaxForOrderRes;

const noNexusTaxForOrderMock: TaxForOrder = {
  tax: {
    amount_to_collect: 0,
    freight_taxable: false,
    has_nexus: false,
    order_total_amount: 0,
    rate: 0,
    shipping: 0,
    tax_source: "",
    taxable_amount: 0,
    exemption_type: "",
    jurisdictions: {
      country: "",
    },
  },
};

const withNexusTaxForOrderMock: TaxForOrder = {
  tax: {
    exemption_type: "",
    amount_to_collect: 15.53,
    breakdown: {
      city_tax_collectable: 0,
      city_tax_rate: 0,
      city_taxable_amount: 0,
      combined_tax_rate: 0.08625,
      county_tax_collectable: 1.8,
      county_tax_rate: 0.01,
      county_taxable_amount: 180,
      line_items: [
        {
          city_amount: 0,
          city_tax_rate: 0,
          city_taxable_amount: 0,
          combined_tax_rate: 0.08625,
          county_amount: 0.2,
          county_tax_rate: 0.01,
          county_taxable_amount: 20,
          id: "T3JkZXJMaW5lOjNlNGZjODdkLTIyMmEtNDZiYi1iYzIzLWJiYWVkODVlOTQ4Mg==",
          special_district_amount: 0.28,
          special_district_taxable_amount: 20,
          special_tax_rate: 0.01375,
          state_amount: 1.25,
          state_sales_tax_rate: 0.0625,
          state_taxable_amount: 20,
          tax_collectable: 1.73,
          taxable_amount: 20,
        },
        {
          city_amount: 0,
          city_tax_rate: 0,
          city_taxable_amount: 0,
          combined_tax_rate: 0.08625,
          county_amount: 0.6,
          county_tax_rate: 0.01,
          county_taxable_amount: 60,
          id: "T3JkZXJMaW5lOjNmMjYwZmMyLTZjN2UtNGM5Ni1iYTMwLTEyMjAyODMzOTUyZA==",
          special_district_amount: 0.83,
          special_district_taxable_amount: 60,
          special_tax_rate: 0.01375,
          state_amount: 3.75,
          state_sales_tax_rate: 0.0625,
          state_taxable_amount: 60,
          tax_collectable: 5.18,
          taxable_amount: 60,
        },
        {
          city_amount: 0,
          city_tax_rate: 0,
          city_taxable_amount: 0,
          combined_tax_rate: 0.08625,
          county_amount: 1,
          county_tax_rate: 0.01,
          county_taxable_amount: 100,
          id: "T3JkZXJMaW5lOmM2NTBhMzVkLWQ1YjQtNGRhNy1hMjNjLWEzODU4ZDE1MzI2Mw==",
          special_district_amount: 1.38,
          special_district_taxable_amount: 100,
          special_tax_rate: 0.01375,
          state_amount: 6.25,
          state_sales_tax_rate: 0.0625,
          state_taxable_amount: 100,
          tax_collectable: 8.63,
          taxable_amount: 100,
        },
      ],
      special_district_tax_collectable: 2.48,
      special_district_taxable_amount: 180,
      special_tax_rate: 0.01375,
      state_tax_collectable: 11.25,
      state_tax_rate: 0.0625,
      state_taxable_amount: 180,
      tax_collectable: 15.53,
      taxable_amount: 180,
      shipping: {
        city_amount: 0,
        city_tax_rate: 0,
        city_taxable_amount: 0,
        combined_tax_rate: 0.08375,
        county_amount: 2.11,
        county_tax_rate: 0.04375,
        county_taxable_amount: 48.33,
        special_district_amount: 0,
        special_tax_rate: 0,
        special_taxable_amount: 0,
        state_amount: 1.93,
        state_sales_tax_rate: 0.04,
        state_taxable_amount: 48.33,
        tax_collectable: 4.05,
        taxable_amount: 48.33,
      },
    },
    freight_taxable: true,
    has_nexus: true,
    jurisdictions: {
      city: "SAN FRANCISCO",
      country: "US",
      county: "SAN FRANCISCO COUNTY",
      state: "CA",
    },
    order_total_amount: 180,
    rate: 0.08625,
    tax_source: "destination",
    taxable_amount: 180,
    shipping: 48.33,
  },
};

// with/without tax
const testingScenariosMap = {
  with_no_nexus: {
    taxBase: defaultTaxBase,
    channelConfig: noNexusChannelConfig,
    response: noNexusTaxForOrderMock,
  },
  with_nexus: {
    taxBase: defaultTaxBase,
    channelConfig: withNexusChannelConfig,
    response: withNexusTaxForOrderMock,
  },
};

type TestingScenario = keyof typeof testingScenariosMap;

export class TaxJarCalculateTaxesMockGenerator {
  constructor(private scenario: TestingScenario) {}
  generateTaxBase = (overrides: Partial<TaxBase> = {}): TaxBase =>
    structuredClone({
      ...testingScenariosMap[this.scenario].taxBase,
      ...overrides,
    });

  generateChannelConfig = (overrides: Partial<ChannelConfig> = {}): ChannelConfig =>
    structuredClone({
      ...testingScenariosMap[this.scenario].channelConfig,
      ...overrides,
    });

  generateResponse = (overrides: Partial<TaxForOrder> = {}): TaxForOrder =>
    structuredClone({
      ...testingScenariosMap[this.scenario].response,
      ...overrides,
    });
}
