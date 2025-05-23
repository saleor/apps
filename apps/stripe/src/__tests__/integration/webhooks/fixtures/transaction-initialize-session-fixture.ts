import {
  mockedSaleorAppId,
  mockedSaleorChannelId,
  mockedSaleorTransactionIdBranded,
} from "@/__tests__/mocks/constants";
import { parseTransactionInitializeSessionEventData } from "@/app/api/webhooks/saleor/transaction-initialize-session/event-data-parser";
import { TransactionInitializeSessionEventFragment } from "@/generated/graphql";

export const transactionInitializeSessionFixture = () => {
  // TODO: Why we pass it directly, should subscription resolve to have event {} first? (todo check api response in logs)
  const eventPayload = {
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
    data: parseTransactionInitializeSessionEventData({
      paymentIntent: {
        paymentMethod: "card",
      },
    })._unsafeUnwrap(),
    action: {
      actionType: "CHARGE",
      amount: 123.3,
      currency: "USD",
    },
    idempotencyKey: "123",
    transaction: {
      id: mockedSaleorTransactionIdBranded,
    },
  } satisfies TransactionInitializeSessionEventFragment;

  return eventPayload;
};
