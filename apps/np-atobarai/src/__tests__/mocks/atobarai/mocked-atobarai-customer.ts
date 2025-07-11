import { AtobaraiCustomer } from "@/modules/atobarai/atobarai-customer";

import { mockedTransactionInitializeSessionEvent } from "../saleor-events/mocked-transaction-initialize-session-event";

export const mockedAtobaraiCustomer = AtobaraiCustomer.createFromEvent(
  mockedTransactionInitializeSessionEvent,
);
