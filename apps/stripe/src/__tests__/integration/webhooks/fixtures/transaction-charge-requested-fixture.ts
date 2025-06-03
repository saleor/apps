import { mockedSaleorAppId, mockedSaleorChannelId } from "@/__tests__/mocks/constants";
import { TransactionChargeRequestedEventFragment } from "@/generated/graphql";
import { StripePaymentIntentId } from "@/modules/stripe/stripe-payment-intent-id";

export const transactionChargeRequestedFixture = (args: {
  stripePaymentIntentId: StripePaymentIntentId;
  amount: number;
}): TransactionChargeRequestedEventFragment => {
  return {
    action: {
      amount: args.amount,
    },
    transaction: {
      pspReference: args.stripePaymentIntentId,
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
