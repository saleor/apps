import { type TransactionCancelationRequestedEventFragment } from "@/generated/graphql";

import {
  mockedSaleorActionIdempotencyKey,
  mockedSaleorChannelId,
  mockedSaleorTransactionId,
} from "../constants";
import { mockedStripePaymentIntentId } from "../mocked-stripe-payment-intent-id";

export const getMockedTransactionCancelationRequestedEvent =
  (): TransactionCancelationRequestedEventFragment => ({
    idempotencyKey: mockedSaleorActionIdempotencyKey,
    transaction: {
      id: mockedSaleorTransactionId,
      pspReference: mockedStripePaymentIntentId,
      checkout: {
        id: "mock-channel-1",
        channel: {
          id: mockedSaleorChannelId,
          slug: "channel-slug",
        },
      },
    },
  });
