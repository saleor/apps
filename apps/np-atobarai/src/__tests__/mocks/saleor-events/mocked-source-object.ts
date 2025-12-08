import { SourceObjectFragment } from "@/generated/graphql";

import { mockedSaleorChannelId } from "../saleor/mocked-saleor-channel-id";

export const mockedSourceObject = {
  __typename: "Checkout",
  channel: {
    slug: "default-channel",
    id: mockedSaleorChannelId,
    currencyCode: "JPY",
  },
  id: "checkout-id",
  billingAddress: {
    firstName: "BillingFirstName",
    lastName: "BillingLastName",
    phone: "+81billingPhone",
    country: {
      code: "JP",
    },
    postalCode: "1000001",
    countryArea: "BillingCountryArea",
    streetAddress1: "BillingStreetAddress1",
    streetAddress2: "BillingStreetAddress2",
    companyName: "BillingCompanyName",
    city: "Tokyo",
    cityArea: "Shibuya",
  },
  shippingAddress: {
    firstName: "ShippingFirstName",
    lastName: "ShippingLastName",
    phone: "+81shippingPhone",
    country: {
      code: "JP",
    },
    postalCode: "1000001",
    countryArea: "ShippingCountryArea",
    streetAddress1: "ShippingStreetAddress1",
    streetAddress2: "ShippingStreetAddress2",
    companyName: "ShippingCompanyName",
    city: "Tokyo",
    cityArea: "Shibuya",
  },
  email: "source-object@email.com",
  totalPrice: {
    gross: {
      amount: 1_234,
    },
  },
  lines: [
    {
      id: "line-id-1",
      __typename: "CheckoutLine",
      quantity: 5,
      unitPrice: {
        gross: {
          amount: 1_234,
        },
      },
      checkoutVariant: {
        product: {
          name: "Product Name",
        },
        sku: "product-sku",
      },
    },
  ],
  discount: {
    amount: 78,
  },
  shippingPrice: {
    gross: {
      amount: 137,
    },
  },
} satisfies SourceObjectFragment;
