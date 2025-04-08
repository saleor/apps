import { TransactionInitializeSessionEventFragment } from "@/generated/graphql";

export const mockedTransactionInitializeSessionEvent: TransactionInitializeSessionEventFragment = {
  sourceObject: {
    __typename: "Checkout",
    channel: {
      __typename: "Channel",
      id: "channel-id",
      slug: "channel-slug",
    },
  },
};
