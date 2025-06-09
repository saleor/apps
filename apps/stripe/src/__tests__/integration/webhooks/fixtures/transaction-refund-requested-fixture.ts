import { mockedSaleorAppId, mockedSaleorChannelId } from "@/__tests__/mocks/constants";
import { TransactionRefundRequestedEventFragment } from "@/generated/graphql";
import { StripePaymentIntentId } from "@/modules/stripe/stripe-payment-intent-id";

export const transactionRefundRequestedFixture = (
  stripePaymentIntentId: StripePaymentIntentId,
): TransactionRefundRequestedEventFragment => {
  return {
    recipient: {
      id: mockedSaleorAppId,
    },
    action: {
      amount: 123.3,
      currency: "USD",
    },
    transaction: {
      pspReference: stripePaymentIntentId,
      checkout: {
        channel: {
          slug: "default-channel",
          id: mockedSaleorChannelId,
        },
        id: "checkout-id",
      },
    },
  };
};
