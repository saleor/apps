import { FulfillmentTrackingNumberUpdatedEventFragment } from "@/generated/graphql";

import { mockedAtobaraiTransactionId } from "../atobarai/mocked-atobarai-transaction-id";
import { mockedSaleorAppId } from "../saleor/mocked-saleor-app-id";
import { mockedSaleorChannelId } from "../saleor/mocked-saleor-channel-id";

export const mockedFulfillmentTrackingNumberUpdatedEvent = {
  issuedAt: "2025-07-08T00:00:00Z",
  fulfillment: {
    trackingNumber: "TN123456789",
  },
  order: {
    id: "order-123",
    channel: {
      id: mockedSaleorChannelId,
      slug: "default-channel",
      currencyCode: "JPY",
    },
    transactions: [
      {
        pspReference: mockedAtobaraiTransactionId,
        createdBy: {
          __typename: "App",
          id: mockedSaleorAppId,
        },
      },
    ],
  },
  recipient: {
    id: mockedSaleorAppId,
  },
} satisfies FulfillmentTrackingNumberUpdatedEventFragment;
