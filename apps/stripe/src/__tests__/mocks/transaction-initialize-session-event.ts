import { parseTransactionInitializeSessionEventData } from "@/app/api/saleor/transaction-initialize-session/event-data-parser";
import { TransactionInitializeSessionEventFragment } from "@/generated/graphql";

import { mockedSaleorChannelId } from "./constants";

export const getMockedTransactionInitializeSessionEvent = (args?: {
  actionType: "CHARGE" | "AUTHORIZATION";
}): TransactionInitializeSessionEventFragment => ({
  action: {
    amount: 100,
    currency: "USD",
    actionType: args?.actionType ?? "CHARGE",
  },
  data: parseTransactionInitializeSessionEventData({
    paymentIntent: {
      paymentMethod: "card",
    },
  })._unsafeUnwrap(),
  sourceObject: {
    channel: {
      id: mockedSaleorChannelId,
      slug: "channel-slug",
    },
  },
});
