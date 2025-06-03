import { mockedSaleorAppId, mockedSaleorChannelId } from "@/__tests__/mocks/constants";
import { TransactionChargeRequestedEventFragment } from "@/generated/graphql";
import { StripePaymentIntentId } from "@/modules/stripe/stripe-payment-intent-id";

export const transactionChargeRequestedFixture = (
  stripePaymentIntentId: StripePaymentIntentId,
): TransactionChargeRequestedEventFragment => {
  return {
    action: {
      amount: 123.33,
    },
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
