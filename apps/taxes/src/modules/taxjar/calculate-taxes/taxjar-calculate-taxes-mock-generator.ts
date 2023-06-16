import { TaxForOrderRes } from "taxjar/dist/types/returnTypes";
import { TaxBaseFragment } from "../../../../generated/graphql";
import { ChannelConfig } from "../../channel-configuration/channel-config";
import { TaxJarConfig } from "../taxjar-connection-schema";
import { TaxJarTaxCodeMatches } from "../tax-code/taxjar-tax-code-match-repository";

type TaxBase = TaxBaseFragment;

const taxIncludedTaxBase: TaxBase = {
  pricesEnteredWithTax: true,
  currency: "USD",
  channel: {
    slug: "default-channel",
  },
  discounts: [],
  address: {
    streetAddress1: "668 Route Six",
    streetAddress2: "",
    city: "MAHOPAC",
    countryArea: "NY",
    postalCode: "10541",
    country: {
      code: "US",
    },
  },
  shippingPrice: {
    amount: 59.17,
  },
  lines: [
    {
      sourceLine: {
        __typename: "OrderLine",
        id: "T3JkZXJMaW5lOmM5MTUxMDljLTBkMzEtNDg2Yy05OGFmLTQ5NDM0MWY4NTNjYw==",
        orderProductVariant: {
          id: "UHJvZHVjdFZhcmlhbnQ6MzQ4",
          product: {
            taxClass: {
              id: "VGF4Q2xhc3M6MjI=",
              name: "Clothing",
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
        id: "T3JkZXJMaW5lOjUxZDc2ZDY1LTFhYTgtNGEzMi1hNWJhLTJkZDMzNjVhZDhlZQ==",
        orderProductVariant: {
          id: "UHJvZHVjdFZhcmlhbnQ6MzQ5",
          product: {
            taxClass: {
              id: "UHJvZHVjdFZhcmlhbnQ6MzQ6",
              name: "Shoes",
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
        id: "T3JkZXJMaW5lOjlhMGJjZDhmLWFiMGQtNDJhOC04NTBhLTEyYjQ2YjJiNGIyZg==",
        orderProductVariant: {
          id: "UHJvZHVjdFZhcmlhbnQ6MzQw",
          product: {
            taxClass: {
              id: "UHJvZHVjdFZhcmlhbnQ6MzQ6",
              name: "Shoes",
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

const taxExcludedTaxBase: TaxBase = {
  pricesEnteredWithTax: false,
  currency: "USD",
  channel: {
    slug: "default-channel",
  },
  discounts: [],
  address: {
    streetAddress1: "668 Route Six",
    streetAddress2: "",
    city: "MAHOPAC",
    countryArea: "NY",
    postalCode: "10541",
    country: {
      code: "US",
    },
  },
  shippingPrice: {
    amount: 59.17,
  },
  lines: [
    {
      sourceLine: {
        __typename: "OrderLine",
        id: "T3JkZXJMaW5lOmM5MTUxMDljLTBkMzEtNDg2Yy05OGFmLTQ5NDM0MWY4NTNjYw==",
        orderProductVariant: {
          id: "UHJvZHVjdFZhcmlhbnQ6MzQ4",
          product: {
            taxClass: {
              id: "",
              name: "",
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
        id: "T3JkZXJMaW5lOjUxZDc2ZDY1LTFhYTgtNGEzMi1hNWJhLTJkZDMzNjVhZDhlZQ==",
        orderProductVariant: {
          id: "UHJvZHVjdFZhcmlhbnQ6MzQ5",
          product: {
            taxClass: {
              id: "",
              name: "",
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
        id: "T3JkZXJMaW5lOjlhMGJjZDhmLWFiMGQtNDJhOC04NTBhLTEyYjQ2YjJiNGIyZg==",
        orderProductVariant: {
          id: "UHJvZHVjdFZhcmlhbnQ6MzQw",
          product: {
            taxClass: {
              id: "",
              name: "",
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

const channelConfig: ChannelConfig = {
  id: "1",
  config: {
    providerConnectionId: "b8c29f49-7cae-4762-8458-e9a27eb83081",
    slug: "default-channel",
  },
};

const providerConfig: TaxJarConfig = {
  name: "taxjar-1",
  isSandbox: false,
  credentials: {
    apiKey: "test",
  },
  address: {
    country: "US",
    zip: "10118",
    state: "NY",
    city: "New York",
    street: "350 5th Avenue",
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

const withNexusTaxExcludedTaxForOrderMock: TaxForOrder = {
  tax: {
    exemption_type: "",
    amount_to_collect: 20.03,
    breakdown: {
      city_tax_collectable: 0,
      city_tax_rate: 0,
      city_taxable_amount: 0,
      combined_tax_rate: 0.08375,
      county_tax_collectable: 10.46,
      county_tax_rate: 0.04375,
      county_taxable_amount: 239.17,
      line_items: [
        {
          city_amount: 0,
          city_tax_rate: 0,
          city_taxable_amount: 0,
          combined_tax_rate: 0.08375,
          county_amount: 0.88,
          county_tax_rate: 0.04375,
          county_taxable_amount: 20,
          id: taxExcludedTaxBase.lines[0].sourceLine.id,
          special_district_amount: 0,
          special_district_taxable_amount: 0,
          special_tax_rate: 0,
          state_amount: 0.8,
          state_sales_tax_rate: 0.04,
          state_taxable_amount: 20,
          tax_collectable: 1.68,
          taxable_amount: 20,
        },
        {
          city_amount: 0,
          city_tax_rate: 0,
          city_taxable_amount: 0,
          combined_tax_rate: 0.08375,
          county_amount: 4.38,
          county_tax_rate: 0.04375,
          county_taxable_amount: 100,
          id: taxExcludedTaxBase.lines[1].sourceLine.id,
          special_district_amount: 0,
          special_district_taxable_amount: 0,
          special_tax_rate: 0,
          state_amount: 4,
          state_sales_tax_rate: 0.04,
          state_taxable_amount: 100,
          tax_collectable: 8.38,
          taxable_amount: 100,
        },
        {
          city_amount: 0,
          city_tax_rate: 0,
          city_taxable_amount: 0,
          combined_tax_rate: 0.08375,
          county_amount: 2.63,
          county_tax_rate: 0.04375,
          county_taxable_amount: 60,
          id: taxExcludedTaxBase.lines[2].sourceLine.id,
          special_district_amount: 0,
          special_district_taxable_amount: 0,
          special_tax_rate: 0,
          state_amount: 2.4,
          state_sales_tax_rate: 0.04,
          state_taxable_amount: 60,
          tax_collectable: 5.03,
          taxable_amount: 60,
        },
      ],
      shipping: {
        city_amount: 0,
        city_tax_rate: 0,
        city_taxable_amount: 0,
        combined_tax_rate: 0.08375,
        county_amount: 2.59,
        county_tax_rate: 0.04375,
        county_taxable_amount: 59.17,
        special_district_amount: 0,
        special_tax_rate: 0,
        special_taxable_amount: 0,
        state_amount: 2.37,
        state_sales_tax_rate: 0.04,
        state_taxable_amount: 59.17,
        tax_collectable: 4.96,
        taxable_amount: 59.17,
      },
      special_district_tax_collectable: 0,
      special_district_taxable_amount: 0,
      special_tax_rate: 0,
      state_tax_collectable: 9.57,
      state_tax_rate: 0.04,
      state_taxable_amount: 239.17,
      tax_collectable: 20.03,
      taxable_amount: 239.17,
    },
    freight_taxable: true,
    has_nexus: true,
    jurisdictions: {
      city: "MAHOPAC",
      country: "US",
      county: "PUTNAM",
      state: "NY",
    },
    order_total_amount: 239.17,
    rate: 0.08375,
    shipping: 59.17,
    tax_source: "destination",
    taxable_amount: 239.17,
  },
};

const withNexusTaxIncludedTaxForOrderMock: TaxForOrder = {
  tax: {
    exemption_type: "",
    amount_to_collect: 20.03,
    breakdown: {
      city_tax_collectable: 0,
      city_tax_rate: 0,
      city_taxable_amount: 0,
      combined_tax_rate: 0.08375,
      county_tax_collectable: 10.46,
      county_tax_rate: 0.04375,
      county_taxable_amount: 239.17,
      line_items: [
        {
          city_amount: 0,
          city_tax_rate: 0,
          city_taxable_amount: 0,
          combined_tax_rate: 0.08375,
          county_amount: 0.88,
          county_tax_rate: 0.04375,
          county_taxable_amount: 20,
          id: taxIncludedTaxBase.lines[0].sourceLine.id,
          special_district_amount: 0,
          special_district_taxable_amount: 0,
          special_tax_rate: 0,
          state_amount: 0.8,
          state_sales_tax_rate: 0.04,
          state_taxable_amount: 20,
          tax_collectable: 1.68,
          taxable_amount: 20,
        },
        {
          city_amount: 0,
          city_tax_rate: 0,
          city_taxable_amount: 0,
          combined_tax_rate: 0.08375,
          county_amount: 4.38,
          county_tax_rate: 0.04375,
          county_taxable_amount: 100,
          id: taxIncludedTaxBase.lines[1].sourceLine.id,
          special_district_amount: 0,
          special_district_taxable_amount: 0,
          special_tax_rate: 0,
          state_amount: 4,
          state_sales_tax_rate: 0.04,
          state_taxable_amount: 100,
          tax_collectable: 8.38,
          taxable_amount: 100,
        },
        {
          city_amount: 0,
          city_tax_rate: 0,
          city_taxable_amount: 0,
          combined_tax_rate: 0.08375,
          county_amount: 2.63,
          county_tax_rate: 0.04375,
          county_taxable_amount: 60,
          id: taxIncludedTaxBase.lines[2].sourceLine.id,
          special_district_amount: 0,
          special_district_taxable_amount: 0,
          special_tax_rate: 0,
          state_amount: 2.4,
          state_sales_tax_rate: 0.04,
          state_taxable_amount: 60,
          tax_collectable: 5.03,
          taxable_amount: 60,
        },
      ],
      shipping: {
        city_amount: 0,
        city_tax_rate: 0,
        city_taxable_amount: 0,
        combined_tax_rate: 0.08375,
        county_amount: 2.59,
        county_tax_rate: 0.04375,
        county_taxable_amount: 59.17,
        special_district_amount: 0,
        special_tax_rate: 0,
        special_taxable_amount: 0,
        state_amount: 2.37,
        state_sales_tax_rate: 0.04,
        state_taxable_amount: 59.17,
        tax_collectable: 4.96,
        taxable_amount: 59.17,
      },
      special_district_tax_collectable: 0,
      special_district_taxable_amount: 0,
      special_tax_rate: 0,
      state_tax_collectable: 9.57,
      state_tax_rate: 0.04,
      state_taxable_amount: 239.17,
      tax_collectable: 20.03,
      taxable_amount: 239.17,
    },
    freight_taxable: true,
    has_nexus: true,
    jurisdictions: {
      city: "MAHOPAC",
      country: "US",
      county: "PUTNAM",
      state: "NY",
    },
    order_total_amount: 239.17,
    rate: 0.08375,
    shipping: 59.17,
    tax_source: "destination",
    taxable_amount: 239.17,
  },
};

const defaultTaxCodeMatches: TaxJarTaxCodeMatches = [
  {
    data: {
      taxJarTaxCode: "P0000000",
      saleorTaxClassId: "VGF4Q2xhc3M6MjI=",
    },
    id: "VGF4Q29kZTox",
  },
];

// with/without tax
const testingScenariosMap = {
  with_no_nexus_tax_included: {
    taxBase: taxIncludedTaxBase,
    channelConfig,
    providerConfig,
    response: noNexusTaxForOrderMock,
    matches: defaultTaxCodeMatches,
  },
  with_no_nexus_tax_excluded: {
    taxBase: taxExcludedTaxBase,
    channelConfig,
    providerConfig,
    response: noNexusTaxForOrderMock,
    matches: defaultTaxCodeMatches,
  },
  with_nexus_tax_included: {
    taxBase: taxIncludedTaxBase,
    channelConfig,
    providerConfig,
    response: withNexusTaxIncludedTaxForOrderMock,
    matches: defaultTaxCodeMatches,
  },
  with_nexus_tax_excluded: {
    taxBase: taxExcludedTaxBase,
    channelConfig,
    providerConfig,
    response: withNexusTaxExcludedTaxForOrderMock,
    matches: defaultTaxCodeMatches,
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

  generateProviderConfig = (overrides: Partial<TaxJarConfig> = {}): TaxJarConfig =>
    structuredClone({
      ...testingScenariosMap[this.scenario].providerConfig,
      ...overrides,
    });

  generateResponse = (overrides: Partial<TaxForOrder> = {}): TaxForOrder =>
    structuredClone({
      ...testingScenariosMap[this.scenario].response,
      ...overrides,
    });

  generateTaxCodeMatches = (overrides: TaxJarTaxCodeMatches = []): TaxJarTaxCodeMatches =>
    structuredClone([...testingScenariosMap[this.scenario].matches, ...overrides]);
}
