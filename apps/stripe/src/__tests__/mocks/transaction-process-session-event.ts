import { TransactionProcessSessionEventFragment } from "@/generated/graphql";

import { mockedSaleorChannelId } from "./constants";
import { mockedStripePaymentIntentId } from "./mocked-stripe-payment-intent-id";

export const getMockedTransactionProcessSessionEvent = (args?: {
  actionType: "CHARGE" | "AUTHORIZATION";
}): TransactionProcessSessionEventFragment => ({
  action: {
    amount: 100,
    actionType: args?.actionType ?? "CHARGE",
  },
  transaction: {
    pspReference: mockedStripePaymentIntentId,
  },
  sourceObject: {
    channel: {
      id: mockedSaleorChannelId,
      slug: "channel-slug",
    },
  },
});
