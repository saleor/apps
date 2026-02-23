import { mockedSaleorAppId, mockedSaleorChannelId } from "@/__tests__/mocks/constants";
import { type TransactionProcessSessionEventFragment } from "@/generated/graphql";
import { type SaleorTransationFlow } from "@/modules/saleor/saleor-transaction-flow";
import { type StripePaymentIntentId } from "@/modules/stripe/stripe-payment-intent-id";

export const transactionProcessSessionFixture = (
  stripePaymentIntentId: StripePaymentIntentId,
  transactionFlow: SaleorTransationFlow,
): TransactionProcessSessionEventFragment => {
  return {
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
    action: {
      actionType: transactionFlow,
      amount: 123.3,
    },
    transaction: {
      pspReference: stripePaymentIntentId,
    },
  };
};
