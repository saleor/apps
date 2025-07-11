import { createAtobaraiGoods } from "@/modules/atobarai/atobarai-goods";

import { mockedAppChannelConfig } from "../app-config/mocked-app-config";
import { mockedTransactionInitializeSessionEvent } from "../saleor-events/mocked-transaction-initialize-session-event";

export const mockedAtobaraiGoods = createAtobaraiGoods(
  mockedTransactionInitializeSessionEvent,
  mockedAppChannelConfig,
);
