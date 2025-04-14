import { parseTransactionInitalizeSessionRequestData } from "@/app/api/saleor/transaction-initialize-session/request-data-parser";
import { TransactionInitializeSessionEventFragment } from "@/generated/graphql";

import { mockedSaleorChannelId } from "./constants";

export const getMockedTransactionInitializeSessionEvent =
  (): TransactionInitializeSessionEventFragment => ({
    action: {
      amount: 100,
      currency: "USD",
    },
    data: parseTransactionInitalizeSessionRequestData({
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
