import { parseTransactionInitalizeSessionEventData } from "@/app/api/saleor/transaction-initialize-session/event-data-parser";
import { TransactionInitializeSessionEventFragment } from "@/generated/graphql";

import { mockedSaleorChannelId } from "./constants";

export const getMockedTransactionInitializeSessionEvent =
  (): TransactionInitializeSessionEventFragment => ({
    action: {
      amount: 100,
      currency: "USD",
    },
    data: parseTransactionInitalizeSessionEventData({
      paymentIntent: {
        paymentMethod: "card",
      },
    })._unsafeUnwrap(),
    sourceObject: {
      __typename: "Checkout",
      channel: {
        __typename: "Channel",
        id: mockedSaleorChannelId,
        slug: "channel-slug",
      },
    },
  });
