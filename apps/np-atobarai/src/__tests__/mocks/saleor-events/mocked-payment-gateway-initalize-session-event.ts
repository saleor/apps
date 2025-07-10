import { PaymentGatewayInitializeSessionEventFragment } from "@/generated/graphql";

import { mockedSaleorAppId } from "../saleor/mocked-saleor-app-id";
import { mockedSaleorChannelId } from "../saleor/mocked-saleor-channel-id";

export const mockedPaymentGatewayInitializeSessionEvent = {
  sourceObject: {
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
      postalCode: "BillingPostalCode",
      countryArea: "BillingCountryArea",
      streetAddress1: "BillingStreetAddress1",
      streetAddress2: "BillingStreetAddress2",
      companyName: "BillingCompanyName",
    },
    shippingAddress: {
      firstName: "ShippingFirstName",
      lastName: "ShippingLastName",
      phone: "+81shippingPhone",
      country: {
        code: "JP",
      },
      postalCode: "ShippingPostalCode",
      countryArea: "ShippingCountryArea",
      streetAddress1: "ShippingStreetAddress1",
      streetAddress2: "ShippingStreetAddress2",
      companyName: "ShippingCompanyName",
    },
    email: "payment-gateway-initialize-session@email.com",
  },
  recipient: {
    id: mockedSaleorAppId,
  },
  issuedAt: "2025-07-08T00:00:00Z",
} satisfies PaymentGatewayInitializeSessionEventFragment;
