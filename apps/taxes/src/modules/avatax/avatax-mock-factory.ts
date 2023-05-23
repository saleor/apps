import { TaxBaseFragment } from "../../../generated/graphql";
import { ChannelConfig } from "../channels-configuration/channels-config";
import { AvataxConfig } from "./avatax-config";

type TaxBase = TaxBaseFragment;

const defaultTaxBase: TaxBase = {
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

const createMockTaxBase = (overrides: Partial<TaxBase> = {}): TaxBase => ({
  ...defaultTaxBase,
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

const defaultAvataxConfig: AvataxConfig = {
  companyCode: "DEFAULT",
  isAutocommit: false,
  isSandbox: true,
  name: "Avatax-1",
  password: "password",
  username: "username",
  shippingTaxCode: "FR000000",
};

const createMockAvataxConfig = (overrides: Partial<AvataxConfig> = {}): AvataxConfig => ({
  ...defaultAvataxConfig,
  ...overrides,
});

// todo: add createTransactionModelMock

export const avataxMockFactory = {
  createMockTaxBase,
  createMockChannelConfig,
  createMockAvataxConfig,
};
