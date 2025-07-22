import { createAtobaraiCancelTransactionPayload } from "@/modules/atobarai/api/atobarai-cancel-transaction-payload";

import { mockedAtobaraiTransactionId } from "../mocked-atobarai-transaction-id";

export const mockedAtobaraiCancelTransactionPayload = createAtobaraiCancelTransactionPayload({
  atobaraiTransactionId: mockedAtobaraiTransactionId,
});
