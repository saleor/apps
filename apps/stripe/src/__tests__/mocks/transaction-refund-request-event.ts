import { TransactionRefundRequestedEventFragment } from "@/generated/graphql";

import { mockedSaleorChannelId } from "./constants";
import { mockedStripePaymentIntentId } from "./mocked-stripe-payment-intent-id";

export const getMockedTransactionRefundRequestedEvent =
  (): TransactionRefundRequestedEventFragment => ({
    action: {
      amount: 100,
      currency: "USD",
    },
    transaction: {
      pspReference: mockedStripePaymentIntentId,
      checkout: {
        channel: {
          id: mockedSaleorChannelId,
          slug: "channel-slug",
        },
      },
    },
  });
