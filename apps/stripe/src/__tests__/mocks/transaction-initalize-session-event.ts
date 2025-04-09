import { TransactionInitializeSessionEventFragment } from "@/generated/graphql";

import { mockedSaleorChannelId } from "./constants";

export const getMockedTransactionInitializeSessionEvent =
  (): TransactionInitializeSessionEventFragment => ({
    action: {
      amount: 100,
      currency: "USD",
    },
    sourceObject: {
      __typename: "Checkout",
      channel: {
        __typename: "Channel",
        id: mockedSaleorChannelId,
        slug: "channel-slug",
      },
    },
  });
