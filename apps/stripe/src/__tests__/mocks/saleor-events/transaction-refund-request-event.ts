import { TransactionRefundRequestedEventFragment } from "@/generated/graphql";

import { mockedSaleorChannelId, mockedSaleorTransactionId } from "../constants";
import { mockedStripePaymentIntentId } from "../mocked-stripe-payment-intent-id";

export const getMockedTransactionRefundRequestedEvent =
  (): TransactionRefundRequestedEventFragment => ({
    action: {
      amount: 100,
      currency: "USD",
    },
    transaction: {
      id: mockedSaleorTransactionId,
      pspReference: mockedStripePaymentIntentId,
      checkout: {
        id: "mock-channel-1",
        channel: {
          id: mockedSaleorChannelId,
          slug: "channel-slug",
        },
      },
    },
  });
