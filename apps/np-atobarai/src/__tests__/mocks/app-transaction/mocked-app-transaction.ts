import { AppTransaction } from "@/modules/app-transaction/app-transaction";
import { AtobaraiTransactionId } from "@/modules/atobarai/atobarai-transaction-id";

import { mockedAtobaraiTransactionId } from "../atobarai/mocked-atobarai-transaction-id";

type Params = {
  atobaraiTransactionId?: AtobaraiTransactionId;
  saleorTrackingNumber?: string;
};

export const getMockedAppTransaction = (params?: Params) => {
  const finalParams = {
    atobaraiTransactionId: mockedAtobaraiTransactionId,
    saleorTrackingNumber: "1234567890",
    ...(params ?? {}),
  } satisfies Params;

  return new AppTransaction({
    atobaraiTransactionId: finalParams.atobaraiTransactionId,
    saleorTrackingNumber: finalParams.saleorTrackingNumber,
  });
};
