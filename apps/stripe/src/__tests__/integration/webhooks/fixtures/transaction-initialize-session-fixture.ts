import {
  mockedSaleorAppId,
  mockedSaleorChannelId,
  mockedSaleorTransactionId,
} from "@/__tests__/mocks/constants";
import { parseTransactionInitializeSessionEventData } from "@/app/api/webhooks/saleor/transaction-initialize-session/event-data-parser";
import { TransactionInitializeSessionEventFragment } from "@/generated/graphql";

export const transactionInitializeSessionFixture =
  (): TransactionInitializeSessionEventFragment => {
    return {
      version: "3.22",
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
        id: mockedSaleorTransactionId,
      },
    };
  };
