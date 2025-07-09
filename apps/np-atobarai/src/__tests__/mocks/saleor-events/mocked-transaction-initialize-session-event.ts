import { TransactionInitializeSessionEventFragment } from "@/generated/graphql";

import { mockedSaleorAppId } from "../saleor/mocked-saleor-app-id";
import { mockedSaleorChannelId } from "../saleor/mocked-saleor-channel-id";
import { mockedSaleorTransactionToken } from "../saleor/mocked-saleor-transaction-token";

export const mockedTransactionInitializeSessionEvent = {
  sourceObject: {
    __typename: "Checkout",
    channel: {
      slug: "default-channel",
      id: mockedSaleorChannelId,
    },
    id: "checkout-id",
  },
  recipient: {
    id: mockedSaleorAppId,
  },
  action: {
    actionType: "CHARGE",
    amount: 123.3,
    currency: "JPY",
  },
  idempotencyKey: "123",
  transaction: {
    token: mockedSaleorTransactionToken,
  },
  issuedAt: "2025-07-08T00:00:00Z",
} satisfies TransactionInitializeSessionEventFragment;
