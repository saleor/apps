import { createAtobaraiShopOrderDate } from "@/modules/atobarai/atobarai-shop-order-date";

import { mockedTransactionInitializeSessionEvent } from "../saleor-events/mocked-transaction-initialize-session-event";

export const mockedAtobaraiShopOrderDate = createAtobaraiShopOrderDate(
  mockedTransactionInitializeSessionEvent.issuedAt,
);
