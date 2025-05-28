import { mockedSaleorAppId, mockedSaleorChannelId } from "@/__tests__/mocks/constants";
import { PaymentGatewayInitializeSessionEventFragment } from "@/generated/graphql";

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
