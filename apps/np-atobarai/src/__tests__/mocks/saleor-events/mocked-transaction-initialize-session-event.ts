import { TransactionInitializeSessionEventFragment } from "@/generated/graphql";

import { mockedSaleorAppId } from "../saleor/mocked-saleor-app-id";
import { mockedSaleorChannelId } from "../saleor/mocked-saleor-channel-id";
import { mockedSaleorTransactionToken } from "../saleor/mocked-saleor-transaction-token";

export const mockedTransactionInitializeSessionEvent = {
  sourceObject: {
    __typename: "Checkout",
    channel: {
      slug: "default-channel",
      id: mockedSaleorChannelId,
      currencyCode: "JPY",
    },
    id: "checkout-id",
    billingAddress: {
      firstName: "John",
      lastName: "Doe",
      phone: "+81 03-1234-5678",
      country: {
        code: "JP",
      },
      postalCode: "102-0083",
      countryArea: "東京都",
      streetAddress1: "千代田区",
      streetAddress2: "麹町４－２－６",
      companyName: "",
    },
    shippingAddress: {
      firstName: "John",
      lastName: "Doe",
      phone: "+81 03-1234-5678",
      country: {
        code: "JP",
      },
      postalCode: "102-0083",
      countryArea: "東京都",
      streetAddress1: "千代田区",
      streetAddress2: "麹町４－２－６",
      companyName: "",
    },
    email: "ok@np-atobarai.saleor.io",
  },
  recipient: {
    id: mockedSaleorAppId,
  },
  action: {
    amount: 123.3,
    currency: "JPY",
  },
  idempotencyKey: "123",
  transaction: {
    token: mockedSaleorTransactionToken,
  },
  issuedAt: "2025-07-08T00:00:00Z",
} satisfies TransactionInitializeSessionEventFragment;
