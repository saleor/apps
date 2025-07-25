import { TransactionChargeRequestedEventFragment } from "@/generated/graphql";

import { mockedSaleorChannelId, mockedSaleorTransactionId } from "../constants";
import { mockedStripePaymentIntentId } from "../mocked-stripe-payment-intent-id";

export const getMockedTransactionChargeRequestedEvent =
  (): TransactionChargeRequestedEventFragment => ({
    action: {
      amount: 100,
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
