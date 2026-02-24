import {
  mockedSaleorAppId,
  mockedSaleorChannelId,
  mockedSaleorTransactionId,
} from "@/__tests__/mocks/constants";
import { parseTransactionInitializeSessionEventData } from "@/app/api/webhooks/saleor/transaction-initialize-session/event-data-parser";
import { type TransactionInitializeSessionEventFragment } from "@/generated/graphql";
import { RandomId } from "@/lib/random-id";

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
      idempotencyKey: new RandomId().generate(),
      transaction: {
        id: mockedSaleorTransactionId,
      },
    };
  };
