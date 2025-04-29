import { TransactionChargeRequestedEventFragment } from "@/generated/graphql";

import { mockedSaleorChannelId } from "./constants";
import { mockedStripePaymentIntentId } from "./mocked-stripe-payment-intent-id";

export const getMockedTransactionChargeRequestedEvent =
  (): TransactionChargeRequestedEventFragment => ({
    action: {
      amount: 100,
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
