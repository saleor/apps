import { TransactionProcessSessionEventFragment } from "@/generated/graphql";

import { mockedAtobaraiTransactionId } from "../atobarai/mocked-atobarai-transaction-id";
import { mockedSaleorAppId } from "../saleor/mocked-saleor-app-id";
import { mockedSaleorTransactionToken } from "../saleor/mocked-saleor-transaction-token";
import { mockedSourceObject } from "./mocked-source-object";

export const mockedTransactionProcessSessionEvent = {
  sourceObject: mockedSourceObject,
  recipient: {
    id: mockedSaleorAppId,
  },
  action: {
    amount: 6307,
    currency: "JPY",
  },
  transaction: {
    token: mockedSaleorTransactionToken,
    pspReference: mockedAtobaraiTransactionId,
  },
  issuedAt: "2025-07-08T00:00:00Z",
} satisfies TransactionProcessSessionEventFragment;
