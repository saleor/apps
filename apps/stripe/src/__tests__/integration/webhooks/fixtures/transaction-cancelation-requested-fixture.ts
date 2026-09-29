import {
  mockedSaleorAppId,
  mockedSaleorChannelId,
  mockedSaleorTransactionId,
} from "@/__tests__/mocks/constants";
import { type TransactionCancelationRequestedEventFragment } from "@/generated/graphql";
import { RandomId } from "@/lib/random-id";
import { type StripePaymentIntentId } from "@/modules/stripe/stripe-payment-intent-id";

export const transactionCancelationRequestedFixture = (
  stripePaymentIntentId: StripePaymentIntentId,
): TransactionCancelationRequestedEventFragment => {
  return {
    idempotencyKey: new RandomId().generate(),
    transaction: {
      id: mockedSaleorTransactionId,
      pspReference: stripePaymentIntentId,
      checkout: {
        id: "checkout-id",
        channel: {
          slug: "default-channel",
          id: mockedSaleorChannelId,
        },
      },
    },
    recipient: {
      id: mockedSaleorAppId,
    },
  };
};
