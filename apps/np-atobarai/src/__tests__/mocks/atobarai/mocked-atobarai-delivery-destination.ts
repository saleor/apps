import { createAtobaraiDeliveryDestination } from "@/modules/atobarai/atobarai-delivery-destination";

import { mockedTransactionInitializeSessionEvent } from "../saleor-events/mocked-transaction-initialize-session-event";

export const mockedAtobaraiDeliveryDestination = createAtobaraiDeliveryDestination(
  mockedTransactionInitializeSessionEvent,
);
