import { parseTransactionInitializeSessionEventData } from "@/app/api/webhooks/saleor/transaction-initialize-session/event-data-parser";
import { TransactionInitializeSessionEventFragment } from "@/generated/graphql";

import { mockedSaleorChannelId, mockedSaleorTransactionId } from "../constants";

export const getMockedTransactionInitializeSessionEvent = (args?: {
  actionType?: "CHARGE" | "AUTHORIZATION";
  data?: string;
}): TransactionInitializeSessionEventFragment => ({
  action: {
    amount: 100,
    currency: "USD",
    actionType: args?.actionType ?? "CHARGE",
  },
  transaction: {
    id: mockedSaleorTransactionId,
  },
  data:
    args?.data ??
    parseTransactionInitializeSessionEventData({
      paymentIntent: {
        paymentMethod: "card",
      },
    })._unsafeUnwrap(),
  sourceObject: {
    id: "mock-channel-1",
    __typename: "Checkout",
    channel: {
      id: mockedSaleorChannelId,
      slug: "channel-slug",
    },
    metadata: [],
  },
  idempotencyKey: "idempotency-key",
});
