import { AtobaraiShippingCompanyCode } from "@/modules/atobarai/atobarai-shipping-company-code";
import { AtobaraiTransactionId } from "@/modules/atobarai/atobarai-transaction-id";
import { TransactionRecord } from "@/modules/transactions-recording/transaction-record";

import { mockedAtobaraiShippingCompanyCode } from "../atobarai/mocked-atobarai-shipping-company-code";
import { mockedAtobaraiTransactionId } from "../atobarai/mocked-atobarai-transaction-id";

type Params = {
  atobaraiTransactionId?: AtobaraiTransactionId;
  saleorTrackingNumber?: string | null;
  fulfillmentMetadataShippingCompanyCode?: AtobaraiShippingCompanyCode | null;
};

export const getMockedTransactionRecord = (params?: Params) => {
  const finalParams = {
    atobaraiTransactionId: mockedAtobaraiTransactionId,
    saleorTrackingNumber: "1234567890",
    fulfillmentMetadataShippingCompanyCode: mockedAtobaraiShippingCompanyCode,
    ...(params ?? {}),
  } satisfies Params;

  return new TransactionRecord({
    atobaraiTransactionId: finalParams.atobaraiTransactionId,
    saleorTrackingNumber: finalParams.saleorTrackingNumber,
    fulfillmentMetadataShippingCompanyCode: finalParams.fulfillmentMetadataShippingCompanyCode,
  });
};
