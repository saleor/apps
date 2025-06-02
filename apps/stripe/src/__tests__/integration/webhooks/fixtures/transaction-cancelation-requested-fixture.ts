import { mockedSaleorAppId, mockedSaleorChannelId } from "@/__tests__/mocks/constants";
import { TransactionCancelationRequestedEventFragment } from "@/generated/graphql";
import { StripePaymentIntentId } from "@/modules/stripe/stripe-payment-intent-id";

export const transactionCancelationRequestedFixture = (
  stripePaymentIntentId: StripePaymentIntentId,
): TransactionCancelationRequestedEventFragment => {
  return {
    transaction: {
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
