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
    shippingAddress: {
      country: {
        code: "JP",
      },
    },
  },
  recipient: {
    id: mockedSaleorAppId,
  },
  issuedAt: "2025-07-08T00:00:00Z",
} satisfies PaymentGatewayInitializeSessionEventFragment;
