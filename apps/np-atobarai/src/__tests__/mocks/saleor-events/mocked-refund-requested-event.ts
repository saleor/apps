import { TransactionRefundRequestedEventFragment } from "@/generated/graphql";

import { mockedAtobaraiTransactionId } from "../atobarai/mocked-atobarai-transaction-id";
import { mockedSaleorChannelId } from "../saleor/mocked-saleor-channel-id";

export const mockedRefundRequestedEvent = {
  action: {
    amount: 3_334,
    currency: "JPY",
  },
  transaction: {
    pspReference: mockedAtobaraiTransactionId,
    token: "saleor-transaction-token",
    order: {
      __typename: "Order",
      id: "order-id",
      total: {
        gross: {
          amount: 3_334,
        },
      },
      lines: [],
      shippingPrice: {
        gross: {
          amount: 0,
        },
      },
      channel: {
        slug: "default-channel",
        id: mockedSaleorChannelId,
        currencyCode: "JPY",
      },
    },
  },
} satisfies TransactionRefundRequestedEventFragment;
