import { OrderConfirmedSubscriptionFragment } from "../generated/graphql";

export const defaultOrder: OrderConfirmedSubscriptionFragment = {
  id: "T3JkZXI6ZTUzZTBlM2MtMjk5Yi00OWYxLWIyZDItY2Q4NWExYTgxYjY2",
  user: {
    id: "VXNlcjoyMDg0NTEwNDEw",
    email: "happy.customer@saleor.io",
  },
  number: "1234",
  avataxEntityCode: null,
  created: "2023-05-25T09:18:55.203440+00:00",
  status: "UNFULFILLED",
  channel: {
    id: "Q2hhbm5lbDox",
    slug: "default-channel",
    taxConfiguration: {
      pricesEnteredWithTax: true,
      taxCalculationStrategy: "TAX_APP",
    },
  },
  shippingAddress: {
    streetAddress1: "600 Montgomery St",
    streetAddress2: "",
    city: "SAN FRANCISCO",
    countryArea: "CA",
    postalCode: "94111",
    country: {
      code: "US",
    },
  },
  billingAddress: {
    streetAddress1: "600 Montgomery St",
    streetAddress2: "",
    city: "SAN FRANCISCO",
    countryArea: "CA",
    postalCode: "94111",
    country: {
      code: "US",
    },
  },
  total: {
    currency: "USD",
    net: {
      amount: 239.17,
    },
    tax: {
      amount: 15.54,
    },
  },
  shippingPrice: {
    gross: {
      amount: 59.17,
    },
    net: {
      amount: 50,
    },
  },
  lines: [
    {
      productSku: "328223580",
      productName: "Monospace Tee",
      quantity: 3,
      unitPrice: {
        net: {
          amount: 20,
        },
      },
      totalPrice: {
        net: {
          amount: 60,
        },
        tax: {
          amount: 5.18,
        },
        gross: {
          amount: 65.18,
        },
      },
    },
    {
      productName: "Monospace Tee",
      productVariantId: "dmFyaWFudC1pZA==",
      quantity: 1,
      unitPrice: {
        net: {
          amount: 20,
        },
      },
      totalPrice: {
        net: {
          amount: 20,
        },
        tax: {
          amount: 1.73,
        },
        gross: {
          amount: 21.73,
        },
      },
    },
    {
      productSku: "118223581",
      productName: "Paul's Balance 420",
      quantity: 2,
      unitPrice: {
        net: {
          amount: 50,
        },
      },
      totalPrice: {
        net: {
          amount: 100,
        },
        tax: {
          amount: 8.63,
        },
        gross: {
          amount: 108.63,
        },
      },
    },
  ],
};
