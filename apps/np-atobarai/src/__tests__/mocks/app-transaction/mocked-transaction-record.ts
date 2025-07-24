import { AtobaraiTransactionId } from "@/modules/atobarai/atobarai-transaction-id";
import { TransactionRecord } from "@/modules/transactions-recording/transaction-record";

import { mockedAtobaraiTransactionId } from "../atobarai/mocked-atobarai-transaction-id";

type Params = {
  atobaraiTransactionId?: AtobaraiTransactionId;
  saleorTrackingNumber?: string;
};

export const getMockedTransactionRecord = (params?: Params) => {
  const finalParams = {
    atobaraiTransactionId: mockedAtobaraiTransactionId,
    saleorTrackingNumber: "1234567890",
    ...(params ?? {}),
  } satisfies Params;

  return new TransactionRecord({
    atobaraiTransactionId: finalParams.atobaraiTransactionId,
    saleorTrackingNumber: finalParams.saleorTrackingNumber,
  });
};
