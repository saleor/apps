import { mockedSaleorAppId, mockedSaleorChannelId } from "@/__tests__/mocks/constants";
import { PaymentGatewayInitializeSessionEventFragment } from "@/generated/graphql";

export const paymentGatewayInitializeFixture = () => {
  // TODO: Why we pass it directly, should subscription resolve to have event {} first? (todo check api response in logs)
  const eventPayload = {
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
  } satisfies PaymentGatewayInitializeSessionEventFragment;

  return eventPayload;
};
