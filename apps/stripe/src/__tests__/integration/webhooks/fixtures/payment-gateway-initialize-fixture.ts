import { mockedSaleorAppId, mockedSaleorChannelId } from "@/__tests__/mocks/constants";
import { type PaymentGatewayInitializeSessionEventFragment } from "@/generated/graphql";

export const paymentGatewayInitializeFixture = (): PaymentGatewayInitializeSessionEventFragment => {
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
  };
};
