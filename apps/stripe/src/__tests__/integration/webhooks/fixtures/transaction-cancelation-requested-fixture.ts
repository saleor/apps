import {
  mockedSaleorAppId,
  mockedSaleorChannelId,
  mockedSaleorTransactionId,
} from "@/__tests__/mocks/constants";
import { type TransactionCancelationRequestedEventFragment } from "@/generated/graphql";
import { type StripePaymentIntentId } from "@/modules/stripe/stripe-payment-intent-id";

export const transactionCancelationRequestedFixture = (
  stripePaymentIntentId: StripePaymentIntentId,
): TransactionCancelationRequestedEventFragment => {
  return {
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
