import { parseTransactionInitializeSessionEventData } from "@/app/api/saleor/transaction-initialize-session/event-data-parser";
import { TransactionInitializeSessionEventFragment } from "@/generated/graphql";

import { mockedSaleorChannelId } from "./constants";

export const getMockedTransactionInitializeSessionEvent =
  (): TransactionInitializeSessionEventFragment => ({
    action: {
      amount: 100,
      currency: "USD",
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
